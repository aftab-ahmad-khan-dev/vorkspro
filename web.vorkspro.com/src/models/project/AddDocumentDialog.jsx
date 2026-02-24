import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Plus } from "lucide-react";
import { toast } from "sonner";

function AddDocumentDialog({ projectId, onSuccess }) {
  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  const token = localStorage.getItem("token");

  const [documents, setDocuments] = useState([{ name: "", file: null }]);
  const [loading, setLoading] = useState(false);

  // Add empty doc
  const addDocument = () => {
    setDocuments((prev) => [...prev, { name: "", file: null }]);
  };

  const updateDocName = (idx, value) => {
    const arr = [...documents];
    arr[idx].name = value;
    setDocuments(arr);
  };

  const updateDocFile = (idx, file) => {
    const arr = [...documents];
    arr[idx].file = file;
    setDocuments(arr);
  };

  const removeDocument = (idx) => {
    setDocuments((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (documents.length === 0) {
      toast.error("Add at least one document");
      return;
    }

    for (const doc of documents) {
      if (!doc.name) return toast.error("Document name is required");
      if (!doc.file) return toast.error("Select a file");
    }

    setLoading(true);
    const form = new FormData();

    documents.forEach((doc, i) => {
      form.append(`documents[${i}][name]`, doc.name);
      form.append(`documents[${i}][file]`, doc.file);
    });

    try {
      const res = await fetch(`${baseUrl}project/upload-documents/${projectId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      const data = await res.json();
      if (!data.isSuccess) throw new Error(data.message);

      toast.success("Documents uploaded successfully");
      onSuccess?.();
    } catch (e) {
      toast.error(e.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-end items-center">
        {/* <h2 className="text-base font-semibold">Upload Documents</h2> */}
        <Button onClick={addDocument} className=" border-button p-0 h-6 w-5 rounded-full">
          <Plus className="" />
        </Button>
      </div>

      {/* Empty State */}
      {/* {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 text-center border border-dashed border-[var(--border)] rounded-lg bg-[var(--background)]/40">
          <span className="text-base font-semibold text-[var(--text)]">
            No Documents Added
          </span>
          <span className="text-sm text-[var(--muted-foreground)]">
            Upload and attach multiple files.
          </span>

          <Button onClick={addDocument} className="mt-4 border-button">
            <Plus size={16} className="mr-2" /> Add Document
          </Button>
        </div>
      )} */}

      {/* New Docs UI */}
      {documents.map((doc, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg border border-[var(--border)] bg-[var(--background-secondary)]"
        >
          <Input
            placeholder="Document Name"
            value={doc.name}
            onChange={(e) => updateDocName(i, e.target.value)}
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
              onChange={(e) => updateDocFile(i, e.target.files?.[0])}
            />
          </label>

          {console.log(documents.length)}
          {/* {documents.length == 2} { */}
          {documents.length == 2 && (
            <button
              onClick={() => removeDocument(i)}
              className="text-red-500 hover:text-red-600"
            >
              <X size={18} />
            </button>
          )}
        </div>
      ))}

      {/* Submit Button */}
      <div className="flex justify-end pt-3">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Uploading..." : "Upload Documents"}
        </Button>
      </div>
    </div>
  );
}

export default AddDocumentDialog;
