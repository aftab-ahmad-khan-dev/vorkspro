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
import { UploadCloud } from "lucide-react";
import SearchableSelect from "@/components/SearchableSelect";
import TagInput from "@/components/TagInput";
import { toast } from "sonner";
import { apiPatch, apiPost } from "@/interceptor/interceptor";

function AddDocument({
  departments = [],
  categories = [],
  document = null, // for edit mode
  onSuccess,
}) {
  const isEditMode = !!document;

  const [form, setForm] = useState({
    title: "",
    category: "",         // single category _id
    description: "",
    file: null,
    departments: [],      // array of department IDs
    author: "",
    version: 1,
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");

  const token = localStorage.getItem("token");
  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "knowledge";

  // Extract filename from URL
  const getFileNameFromUrl = (url) => (url ? url.split("/").pop().split("?")[0] : "");

  // Populate form on edit
  useEffect(() => {
    setTimeout(() => {
      if (document) {
        setForm({
          title: document.title || "",
          description: document.description || "",
          file: null,
          departments: document.departments || [],
          author: document.author || "",
          version: document.version || 1,
          category: document.category?._id || "",
          tags: document.tags || [],
        });
        setFileName(getFileNameFromUrl(document.fileUrl));
      }
    }, 0)
  }, [document]);

  useEffect(() => {
console.log("Form",form);
  }, [form]);


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, file }));
      setFileName(file.name);
    }
  };

  const validateForm = () => {
    if (!form.title.trim()) return toast.error("Document title is required"), false;
    if (!form.category) return toast.error("Please select a category"), false;
    if (!isEditMode && !form.file) return toast.error("Please upload a document"), false;
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("description", form.description || "");
    formData.append("category", form.category);
    formData.append("author", form.author || "Unknown");
    formData.append("version", form.version || 1);
    formData.append("tags", form.tags.join(","));

    form.departments.forEach((dep) => formData.append("departments", dep));
    if (form.file) formData.append("files", form.file);
    try {
      setLoading(true);

      let data = null;
      if(isEditMode) {
        data = await apiPatch(`knowledge/update/${document._id}`, formData);
      } else if (!isEditMode) {
        data = await apiPost(`knowledge/upload`, formData);
      }

      if (data.isSuccess) {
        toast.success(isEditMode ? "Document updated!" : "Document uploaded!");
        onSuccess?.();
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Document Title <span className="text-red-500">*</span>
        </label>
        <Input
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g., Employee Onboarding Guide"
          required
        />
      </div>

      {/* Category – FIXED: Removed custom SelectValue content */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Category <span className="text-red-500">*</span>
        </label>
        {categories.length > 0 && (
          <Select
            value={form.category}
            onValueChange={(value) => setForm({ ...form, category: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat._id} value={cat._id.toString()}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description</label>
        <Textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Brief description..."
          className="h-28 resize-none"
        />
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Document File{" "}
          {isEditMode ? "(optional)" : <span className="text-red-500">*</span>}
        </label>

        <label
          htmlFor="file-upload"
          className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-all ${fileName ? "border-green-500 bg-green-500/15" : "border-gray-300 "
            } `}
        >
          {fileName ? (
            <div className="text-center">
              <UploadCloud className="w-10 h-10 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text--foreground">{fileName}</p>
              <p className="text-xs text-gray-500">Click to replace</p>
            </div>
          ) : (
            <>
              <UploadCloud className="w-10 h-10 text-gray-400 mb-2" />
              <p className="font-medium">Click to upload</p>
              <p className="text-xs text-gray-500">PDF, DOCX, MD (max 20MB)</p>
            </>
          )}
        </label>

        <input
          id="file-upload"
          type="file"
          accept=".pdf,.doc,.docx,.md"
          onChange={handleFileChange}
          className="hidden"
          {...(!isEditMode && { required: true })}
        />

        {isEditMode && fileName && !form.file && (
          <p className="text-xs text-amber-600 mt-1">
            Current file: {fileName} (kept if no new file chosen)
          </p>
        )}
      </div>

      {/* Departments */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Departments</label>
        <SearchableSelect
          items={departments}
          value={form.departments}
          onValueChange={(val) => setForm({ ...form, departments: val })}
          placeholder="Select department(s)"
          multi
        />
      </div>

      {/* Author & Version */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Author</label>
          <Input
            value={form.author}
            onChange={(e) => setForm({ ...form, author: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Version</label>
          <Input
            type="number"
            step="0.1"
            min="0.1"
            value={form.version}
            onChange={(e) =>
              setForm({ ...form, version: Number(e.target.value) || 1 })
            }
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Tags</label>
        <TagInput
          value={form.tags}
          onChange={(tags) => setForm({ ...form, tags })}
          placeholder="Add tags..."
        />
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-3 pt-6 border-t border-t-[var(--border)]">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditMode
              ? "Updating..."
              : "Uploading..."
            : isEditMode
              ? "Update Document"
              : "Upload Document"}
        </Button>
      </div>
    </form>
  );
}

export default AddDocument;