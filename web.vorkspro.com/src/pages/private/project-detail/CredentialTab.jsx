// src/components/project/tabs/credential/CredentialsTab.jsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Shield, Lock, User2 } from "lucide-react";
import CredentialsStats from "./CredentialsStats";
import CredentialsTable from "./CredentialTable";
import { useTabs } from "@/context/TabsContext";
import { useLocation } from "react-router-dom";

export default function CredentialsTab({ credentials, onAdd, onEdit, onView, onDelete,onRefresh }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [envFilter, setEnvFilter] = useState("all");
  const { actions } = useTabs();
  const isSuperAdmin = actions?.isSuperAdmin ?? false;
  const path = useLocation().pathname;
  const id = path.split("/")[3]; // Assuming URL structure is /projects/:id/...


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


    <div className="space-y-8">
      <CredentialsStats credentials={credentials} />

      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search credentials..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Select className="text-foreground" value={envFilter} onValueChange={setEnvFilter}>
          <SelectTrigger className="w-full sm:w-48 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Environments</SelectItem>
            <SelectItem value="Live">Live</SelectItem>
            <SelectItem value="Testing">Testing</SelectItem>
            <SelectItem value="Staging">Staging</SelectItem>
            <SelectItem value="Development">Development</SelectItem>
          </SelectContent>
        </Select>
        {hasPermission('Projects', 'Create Records') && (
          <Button onClick={onAdd} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Credential
          </Button>
        )}
      </div>

      <CredentialsTable
        credentials={credentials}
        search={searchTerm}
        filter={envFilter}
        onEdit={onEdit}
        onView={onView}
        onDelete={onDelete}
        projectId={id}
        onRefresh={onRefresh}
      />

      <div className="p-6 border text-foreground border-border rounded-2xl border-l-4 border-l-primary">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
          <Shield className="w-5 h-5 text-green-500" /> Security Best Practices
        </h3>
        <div className="grid sm:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center"><Lock className="w-5 h-5 text-green-500" /></div>
            <div>
              <strong>Encrypted Storage</strong>
              <p className="text-muted-foreground text-xs mt-1">AES-256 encryption at rest</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center"><User2 className="w-5 h-5 text-blue-500" /></div>
            <div>
              <strong>Role-Based Access</strong>
              <p className="text-muted-foreground text-xs mt-1">Only authorized users can view</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-purple-500" /></div>
            <div>
              <strong>Activity Logging</strong>
              <p className="text-muted-foreground text-xs mt-1">All access is audited</p>
            </div>
          </div>
        </div>

        {/* Tab Content Skeleton (Credential Tab as example - most complex) */}
        <div className="mt-6 space-y-6">
          {/* Stat Cards */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-6 border border-[var(--border)] rounded-2xl bg-gradient-to-br from-[var(--background)] to-[var(--background-secondary)]"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-3">
                    <div className="h-10 w-16 bg-[var(--border)] rounded-xl"></div>
                    <div className="h-5 w-32 bg-[var(--border)] rounded"></div>
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[var(--border)]/30"></div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Search + Filter Bar */}
          {/* <div className="p-5 border border-[var(--border)] rounded-2xl bg-gradient-to-br from-[var(--background)] to-[var(--background-secondary)]">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="h-12 flex-1 bg-[var(--border)] rounded-lg"></div>
              <div className="h-12 w-full sm:w-48 bg-[var(--border)] rounded-lg"></div>
            </div>
          </div> */}

          {/* Table Skeleton (Desktop) */}
          {/* <div className="hidden lg:block rounded-2xl border border-[var(--border)] bg-[var(--background)] overflow-hidden">
            <table className="w-full">
              <thead>
                <tr>
                  {[
                    "Name",
                    "Environment",
                    "Key Type",
                    "Key Value",
                    "Actions",
                  ].map((header) => (
                    <th key={header} className="p-4 text-left">
                      <div className="h-5 w-24 bg-[var(--border)] rounded"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4].map((i) => (
                  <tr key={i} className="border-t border-[var(--border)]">
                    <td className="p-4">
                      <div className="space-y-2">
                        <div className="h-5 w-40 bg-[var(--border)] rounded"></div>
                        <div className="h-4 w-32 bg-[var(--border)] rounded"></div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="h-8 w-20 bg-[var(--border)] rounded-full"></div>
                    </td>
                    <td className="p-4">
                      <div className="h-5 w-28 bg-[var(--border)] rounded"></div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-48 bg-[var(--border)] rounded"></div>
                        <div className="h-8 w-8 bg-[var(--border)] rounded"></div>
                        <div className="h-8 w-8 bg-[var(--border)] rounded"></div>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-3">
                        <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                        <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                        <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div> */}

          {/* Mobile Cards Skeleton */}
          {/* <div className="lg:hidden space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-5 border border-[var(--border)] rounded-xl bg-[var(--background)]"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-2">
                    <div className="h-6 w-48 bg-[var(--border)] rounded"></div>
                    <div className="h-8 w-24 bg-[var(--border)] rounded-full"></div>
                  </div>
                </div>
                <div className="flex items-center gap-3 my-4">
                  <div className="h-6 w-32 bg-[var(--border)] rounded"></div>
                  <div className="h-8 w-8 bg-[var(--border)] rounded"></div>
                  <div className="h-8 w-8 bg-[var(--border)] rounded"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 w-32 bg-[var(--border)] rounded"></div>
                  <div className="flex gap-2">
                    <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                    <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                    <div className="h-9 w-9 bg-[var(--border)] rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div> */}

          {/* Security Best Practices Card */}
          {/* <div className="p-5 rounded-2xl border-t border-r border-b border-l-[4px] border-t-[var(--border)] border-r-[var(--border)] border-b-[var(--border)] border-l-[var(--button)] bg-[var(--background)]">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-[var(--border)] rounded"></div>
              <div className="h-7 w-64 bg-[var(--border)] rounded-xl"></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-9 h-9 rounded-md bg-[var(--border)]/30"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-[var(--border)] rounded"></div>
                    <div className="space-y-1">
                      <div className="h-4 w-full bg-[var(--border)] rounded"></div>
                      <div className="h-4 w-11/12 bg-[var(--border)] rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}