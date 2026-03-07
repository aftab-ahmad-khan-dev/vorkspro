// src/components/project/tabs/DocumentsTab.jsx
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import GlobalDialog from "@/models/GlobalDialog";
import AddDocumentDialog from "@/models/project/AddDocumentDialog";
import { useState } from "react";
import { useTabs } from "@/context/TabsContext";
import EmptyState from "@/components/EmptyState";

const fileUrl = import.meta.env.VITE_APP_FILE_URL;

// export default "http://localhost:5000/";

export default function DocumentsTab({ project, refresh }) {
  const [open, setOpen] = useState(false);
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;

  const hasPermission = (moduleName, requiredAction) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.actions.includes(requiredAction)
        }
      }
    );
  };

  return (
    <>
      <div className="p-8 border border-[var(--border)] rounded-2xl ">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex justify-center items-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-2xl text-foreground font-bold">
              Client Requirements & Documents
            </h3>
          </div>

          {project.documents?.length > 0 && (
            <Button className={`${!hasPermission('Projects', 'Create Records') ? 'hidden' : ''}`} onClick={() => setOpen(true)}>
              <FileText className="w-4 h-4 mr-2" /> Add Document
            </Button>
          )}
        </div>

        {project.documents?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {project.documents.map((doc, i) => (
              <div
                key={i}
                className="border border-[var(--border)] rounded-xl  p-6 group hover:shadow-lg transition"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/15 flex-center  transition flex justify-center items-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-[var(--foreground)] font-medium text-lg truncate">
                    {doc.name || `Document ${i + 1}`}
                  </p>
                </div>
                <a
                  href={`${fileUrl}${doc.url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-button w-full text-center px-4 py-3 rounded-lg text-sm font-medium inline-block"
                >
                  View Document
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            {/* <div className="w-20 h-20 bg-border rounded-xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-11 h-11 mx-auto text-foreground" />
            </div>
            <p className="text-lg font-medium text-muted-foreground">
              No documents uploaded
            </p> */}

              <EmptyState noPadding={false} icon={FileText} title="No documents uploaded" subtitle="Upload documents to share them with your team" ></EmptyState>

            {hasPermission('Projects', 'Create Records') && (
              <Button className="mt-4" onClick={() => setOpen(true)}>
                + Upload First Document
              </Button>
            )}
          </div>
        )}
      </div>

      <GlobalDialog
        open={open}
        label="Upload Document"
        onClose={() => setOpen(false)}
      >
        <AddDocumentDialog
          projectId={project._id}
          onSuccess={() => {
            refresh();
            setOpen(false);
          }}
          onClose={() => setOpen(false)}
        />
      </GlobalDialog>
    </>
  );
}
