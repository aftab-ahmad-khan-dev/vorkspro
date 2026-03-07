import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Upload, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { apiPatch, apiPost } from "@/interceptor/interceptor";

function CreateDialog({ client, industries, projects, onSuccess }) {
  const isEdit = !!client;
  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const filesUrl = import.meta.env.VITE_APP_FILE_URL;
  const navigate = useNavigate();

  function subHeading(title, icons = false, onAdd = null) {
    return (
      <div className="col-span-2">
        <div className="border-b border-b-[var(--border)] py-1 font-semibold text-[var(--text)]">
          <div className="flex justify-between items-center">
            {title}{" "}
            {icons && (
              <Button onClick={onAdd} className="bg-transparent p-0 h-auto">
                <Plus className="text-[var(--button)]" />
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const [formData, setFormData] = useState({
    name: "",
    type: "company",
    industry: "",
    companySize: "0",
    website: "",
    description: "",
    contactName: "",
    email: "",
    phone: "",
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    // projects: [],
    newDocuments: [],
    existingDocuments: [],
    deletedDocumentIds: [],
    tags: "",
    notes: "",
    status: "lead",
  });

  const [loading, setLoading] = useState(false);

  /* --------------------------------------------------------------- */
  /* Initialize Form                                                 */
  /* --------------------------------------------------------------- */
  useEffect(() => {
    if (isEdit && client) {
      setFormData({
        name: client.name || "",
        type: client.type || "company",
        industry: client.industry?._id || client.industry || "",
        companySize: client.companySize || "0",
        website: client.website || "",
        description: client.description || "",
        contactName: client.contactName || "",
        email: client.email || "",
        phone: client.phone || "",
        address: {
          street: client.address?.street || "",
          city: client.address?.city || "",
          state: client.address?.state || "",
          country: client.address?.country || "",
          postalCode: client.address?.postalCode || "",
        },
        // projects: client.projects?.map((p) => p._id || p) || [],
        newDocuments: [],
        existingDocuments: (client.documents || []).map((d) => ({
          id: d._id || d.id,
          name: d.name || "",
          url: d.url || "",
        })),
        deletedDocumentIds: [],
        tags: Array.isArray(client.tags) ? client.tags.join(", ") : "",
        notes: client.notes || "",
        status: client.status || "lead",
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        address: {
          street: "",
          city: "",
          state: "",
          country: "",
          postalCode: "",
        },
        newDocuments: [],
        existingDocuments: [],
        deletedDocumentIds: [],
      }));
    }
  }, [isEdit, client]);

  /* --------------------------------------------------------------- */
  /* Document Handlers                                               */
  /* --------------------------------------------------------------- */
  const addNewDocument = () => {
    setFormData((s) => ({
      ...s,
      newDocuments: [...s.newDocuments, { name: "", url: "" }],
    }));
  };

  const handleDocumentName = (i, value, list) => {
    setFormData((s) => {
      const arr = [...s[list]];
      arr[i] = { ...arr[i], name: value };
      return { ...s, [list]: arr };
    });
  };

  const handleDocumentFile = (i, file) => {
    setFormData((s) => {
      const arr = [...s.newDocuments];
      arr[i] = {
        ...arr[i],
        file,
        url: file ? URL.createObjectURL(file) : "",
      };
      return { ...s, newDocuments: arr };
    });
  };

  const removeNewDocument = (i) => {
    setFormData((s) => ({
      ...s,
      newDocuments: s.newDocuments.filter((_, idx) => idx !== i),
    }));
  };

  const removeExistingDocument = (i) => {
    const doc = formData.existingDocuments[i];
    setFormData((s) => ({
      ...s,
      existingDocuments: s.existingDocuments.filter((_, idx) => idx !== i),
      deletedDocumentIds: doc.id
        ? [...s.deletedDocumentIds, doc.id]
        : s.deletedDocumentIds,
    }));
  };

  /* --------------------------------------------------------------- */
  /* Submit Form                                                     */
  /* --------------------------------------------------------------- */
  const handleSubmit = async () => {
    const required = ["name"];
    for (const field of required) {
      if (field.includes(".")) {
        const [obj, key] = field.split(".");
        if (!formData[obj]?.[key]) {
          toast.error(`${key} is required`);
          return;
        }
      } else if (!formData[field]) {
        toast.error(`${field} is required`);
        return;
      }
    }

    setLoading(true);
    const form = new FormData();

    // Scalar fields
    const fields = [
      "name",
      "type",
      "industry",
      "companySize",
      "website",
      "description",
      "contactName",
      "email",
      "phone",
      "tags",
      "notes",
      "status",
    ];
    fields.forEach((k) => form.append(k, formData[k]));

    // Address
    Object.entries(formData.address).forEach(([k, v]) => {
      form.append(`address[${k}]`, v);
    });

    // Projects
    // formData.projects.forEach((id) => form.append("projects[]", id));

    // NEW DOCUMENTS
    formData.newDocuments.forEach((doc, i) => {
      form.append(`newDocuments[${i}][name]`, doc.name);
      if (doc.file) form.append(`newDocuments[${i}][file]`, doc.file);
    });

    // EXISTING DOCUMENTS (keep)
    formData.existingDocuments.forEach((doc, i) => {
      if (doc.id) form.append(`existingDocuments[${i}][id]`, doc.id);
      form.append(`existingDocuments[${i}][name]`, doc.name);
      if (doc.url) form.append(`existingDocuments[${i}][url]`, doc.url); // ← preserve old URL
    });

    // DELETED DOCUMENT IDS
    formData.deletedDocumentIds.forEach((id) => {
      form.append("deletedDocumentIds[]", id);
    });

    try {
      // const url = isEdit
      //   ? `client/${client._id}`
      //   : `client`;

      // const res = await fetch(url, {
      //   method: isEdit ? "PATCH" : "POST",
      //   headers: { Authorization: `Bearer ${token}` },
      //   body: form,
      // });

      let data = null;
      if (isEdit) {
        data = await apiPatch(`client/${client._id}`, form);
      } else if (!isEdit) {
        data = await apiPost("client", form);
      }
      if (!data.isSuccess) throw new Error(data.message);

      toast.success(isEdit ? "Client updated" : "Client created");
      onSuccess?.();
    } catch (e) {
      toast.error(e.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  /* --------------------------------------------------------------- */
  /* UI                                                              */
  /* --------------------------------------------------------------- */
  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Basic Details */}
      {subHeading("Basic Details")}
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
        <Input
          placeholder="Enter client name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Type</label>
        <Select
          value={formData.type}
          onValueChange={(v) => setFormData({ ...formData, type: v })}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className={`space-y-2 col-span-2 sm:col-span-1 ${formData.type === "individual" ? "col-span-2" : ""}`}>
        <label className="text-sm font-medium">Industry </label>
        <Select
          value={formData.industry}
          onValueChange={(v) => setFormData({ ...formData, industry: v })}
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {industries?.map((i) => (
              <SelectItem key={i._id} value={i._id}>
                {i.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {
        formData.type === "company" && (
          <div className="space-y-2 col-span-2 sm:col-span-1">
            <label className="text-sm font-medium">Company Size</label>
            <Select
              value={formData.companySize || "0"}
              onValueChange={(v) => setFormData({ ...formData, companySize: v || "0" })}
            >
              <SelectTrigger className={"w-full"}>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {["1-10", "11-50", "51-200", "201-500", "501-1000", "1001+"].map(
                  (s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>
        )
      }

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Website</label>
        <Input
          placeholder="https://example.com"
          value={formData.website}
          onChange={(e) =>
            setFormData({ ...formData, website: e.target.value })
          }
        />
      </div>

      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Description</label>
        <Textarea
          placeholder="Write short details about the client..."
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
        />
      </div>

      {/* Contact Details */}
      {subHeading("Contact Details")}
      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Contact Name</label>
        <Input
          placeholder="Enter contact person name"
          value={formData.contactName}
          onChange={(e) =>
            setFormData({ ...formData, contactName: e.target.value })
          }
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Email</label>
        <Input
          placeholder="example@mail.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Phone</label>
        <Input
          placeholder="+92 300 0000000"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      {/* Location */}
      {subHeading("Location")}
      <div className="space-y-2 col-span-2">
        <label className="text-sm font-medium">Street</label>
        <Input
          placeholder="123 Main St"
          value={formData.address.street}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address, street: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">City</label>
        <Input
          placeholder="New York"
          value={formData.address.city}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address, city: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">State</label>
        <Input
          placeholder="NY"
          value={formData.address.state}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address, state: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Country </label>
        <Input
          placeholder="United States"
          value={formData.address.country}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address, country: e.target.value },
            })
          }
        />
      </div>

      <div className="space-y-2 col-span-2 sm:col-span-1">
        <label className="text-sm font-medium">Postal Code</label>
        <Input
          placeholder="10001"
          value={formData.address.postalCode}
          onChange={(e) =>
            setFormData({
              ...formData,
              address: { ...formData.address, postalCode: e.target.value },
            })
          }
        />
      </div>

      {/* Projects */}
      {/* {subHeading("Projects")}
      <div className="space-y-2 col-span-2">
        <Select
          onValueChange={(v) =>
            setFormData({ ...formData, projects: [...formData.projects, v] })
          }
        >
          <SelectTrigger className={"w-full"}>
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            {projects?.map((p) => (
              <SelectItem key={p._id} value={p._id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex flex-wrap gap-2 mt-2">
          {formData.projects.map((id, i) => {
            const proj = projects.find((p) => p._id === id);
            return (
              <span
                key={i}
                className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex gap-1 items-center"
              >
                {proj?.name}
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      projects: formData.projects.filter((_, idx) => idx !== i),
                    })
                  }
                >
                  <X size={12} />
                </button>
              </span>
            );
          })}
        </div>
      </div> */}

      {/* Documents */}
      <div className="col-span-2 space-y-3">
        {subHeading("Documents", true, addNewDocument)}

        {formData.newDocuments.length === 0 &&
          formData.existingDocuments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[var(--border)] rounded-lg bg-[var(--background)]/40">
              <span className="text-base font-semibold text-[var(--text)]">
                No Documents Added
              </span>
              <span className="text-sm text-[var(--muted-foreground)]">
                Upload and attach files for this client.
              </span>
              <Button onClick={addNewDocument} className="mt-4 border-button">
                <Plus size={16} className="mr-2" /> Add Document
              </Button>
            </div>
          )}

        {/* Existing Documents */}
        {formData.existingDocuments.map((doc, i) => {
          const fileUrl = doc.url?.startsWith("http")
            ? doc.url
            : filesUrl + doc.url;
          return (
            <div
              key={`existing-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]"
            >
              <Input
                placeholder="Document Name"
                value={doc.name}
                onChange={(e) =>
                  handleDocumentName(i, e.target.value, "existingDocuments")
                }
                className="flex-1"
              />
              <div
                className="flex-1 h-[42px] flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--hover)] transition px-2 cursor-pointer"
                onClick={() => fileUrl && window.open(fileUrl, "_blank")}
              >
                <span className="font-medium text-[var(--text)] truncate max-w-[160px]">
                  {doc.url?.split("/").pop() || "No file"}
                </span>
              </div>
              <button
                onClick={() => removeExistingDocument(i)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}

        {/* New Documents */}
        {formData.newDocuments.map((doc, i) => {
          const fileUrl = doc.file ? URL.createObjectURL(doc.file) : "";
          return (
            <div
              key={`new-${i}`}
              className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]"
            >
              <Input
                placeholder="Document Name"
                value={doc.name}
                onChange={(e) =>
                  handleDocumentName(i, e.target.value, "newDocuments")
                }
                className="flex-1"
              />
              <label className="flex-1 cursor-pointer">
                <div className="flex h-[42px] items-center justify-center rounded-lg border border-dashed border-[var(--border)] text-xs text-[var(--text-secondary)] hover:bg-[var(--hover)] transition px-2">
                  {doc.file ? (
                    <span className="font-medium text-[var(--text)] truncate max-w-[160px]">
                      {doc.file.name}
                    </span>
                  ) : (
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <Upload size={16} />
                      <span>Select File</span>
                    </div>
                  )}
                </div>
                <Input
                  type="file"
                  className="hidden"
                  onChange={(e) =>
                    handleDocumentFile(i, e.target.files?.[0] || null)
                  }
                />
              </label>
              <button
                onClick={() => removeNewDocument(i)}
                className="text-red-500 hover:text-red-600"
              >
                <X size={18} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Submit */}
      <div className="col-span-2 flex justify-end">
        <Button disabled={loading} onClick={handleSubmit}>
          {loading ? "Saving..." : isEdit ? "Update Client" : "Add Client"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
