import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import GlobalDialog from "@/models/GlobalDialog";
import AddCredentialDialog from "@/models/project/AddCredentialDialog";
import CredentialDetailDialog from "@/models/project/CredentialDetailDialog";
import CreateDialog from "@/models/project/CreateDialog";
import Confirmation from "@/models/Confirmation";
import ProjectHeader from "./project-detail/ProjectHeader";
import ProjectStatsGrid from "./project-detail/ProjectStatsGrid";
import ProjectTabs from "./project-detail/ProjectTabs";
import { apiDelete, apiGet } from "@/interceptor/interceptor";
import { useTabs } from "@/context/TabsContext";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const token = localStorage.getItem("token");

const VALID_TABS = ["overview", "milestones", "blockages", "team", "credentials", "canvas"];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [project, setProject] = useState(null);
  const [localMilestones, setLocalMilestones] = useState([]);
  const [timeline, setTimeline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [credentials, setCredentials] = useState([]);
  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedApiKey, setSelectedApiKey] = useState(null);
  const [showAddCredential, setShowAddCredential] = useState(false);
  const [showEditCredential, setShowEditCredential] = useState(false);
  const [showCredentialDetail, setShowCredentialDetail] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditProject, setShowEditProject] = useState(false);
  const [activeTab, setActiveTabState] = useState(
    tabFromUrl && VALID_TABS.includes(tabFromUrl) ? tabFromUrl : "overview"
  );

  const setActiveTab = (tab) => {
    setActiveTabState(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === "overview") next.delete("tab");
      else next.set("tab", tab);
      return next;
    });
  };

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.includes(tabFromUrl) && tabFromUrl !== activeTab) {
      setActiveTabState(tabFromUrl);
    }
  }, [tabFromUrl]);

  const fetchProjectDetail = async () => {
    setLoading(true);
    try {
      const data = await apiGet(`project/get-by-id/${id}`);
      if (data.isSuccess && data.project) {
        setProject(data.project);
        setLocalMilestones(data.project.milestones || []);
        setTimeline(data.timeLines);
        setCredentials(data.project.credentials || []);
      }
    } catch (e) {
      console.error("Error fetching project:", e);
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const data = await apiGet("client/get-active-client");
      if (data.isSuccess) setClients(data.filteredData?.clients || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await apiGet("employee/get-active-employees");
      if (data.isSuccess) setEmployees(data.filteredData?.employees || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
    fetchClients();
    fetchEmployees();
  }, [id]);

  const handleMilestonesUpdate = (updatedMilestones) => {
    setLocalMilestones(updatedMilestones);
  };

  // Create project with updated milestones for progress calculation
  const projectWithUpdatedMilestones = project ? {
    ...project,
    milestones: localMilestones
  } : null;

  const handleDelete = async () => {
    try {
      const data = await apiDelete(`credential/delete/${selectedApiKey._id}`);
      if (data.isSuccess) {
        toast.success("Credential deleted");
        fetchProjectDetail();
        setShowDeleteDialog(false);
      }
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return <ProjectDetailSkeleton />;
  }

  if (!project) {
    return <div className="p-8 text-center">Project not found.</div>;
  }

  return (
    <>
      <div className="min-h-screen space-y-8">
        <ProjectHeader
          project={projectWithUpdatedMilestones}
          onBack={() => navigate(-1)}
          clients={clients}
          employees={employees}
          onEditProject={() => setShowEditProject(true)}
          refresh={fetchProjectDetail}
          onNavigateToTab={setActiveTab}
        />
        {/* <ProjectStatsGrid project={project} /> */}
        <ProjectTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          timeline={timeline}
          project={project}
          credentials={credentials}
          refresh={fetchProjectDetail}
          onMilestonesUpdate={handleMilestonesUpdate}
          onEditCredential={(cred) => {
            setSelectedApiKey(cred);
            setShowEditCredential(true);
          }}
          onViewCredential={(cred) => {
            setSelectedApiKey(cred);
            setShowCredentialDetail(true);
          }}
          onDeleteCredential={(cred) => {
            setSelectedApiKey(cred);
            setShowDeleteDialog(true);
          }}
          onAddCredential={() => setShowAddCredential(true)}
        />
      </div>

      {/* Dialogs */}
      <GlobalDialog open={showEditProject} label="Edit Project" onClose={() => setShowEditProject(false)}>
        <CreateDialog
          clients={clients}
          employees={employees}
          selectedProject={project}
          onSuccess={() => {
            setShowEditProject(false);
            fetchProjectDetail();
            toast.success("Project updated");
          }}
        />
      </GlobalDialog>

      <GlobalDialog open={showAddCredential} label="Add Credential" onClose={() => setShowAddCredential(false)}>
        <AddCredentialDialog
          projectId={id}
          onSuccess={() => {
            setShowAddCredential(false);
            fetchProjectDetail();
            toast.success("Credential added");
          }}
          onClose={() => setShowAddCredential(false)}
        />
      </GlobalDialog>

      <GlobalDialog open={showEditCredential} label="Edit Credential" onClose={() => setShowEditCredential(false)}>
        <AddCredentialDialog
          projectId={id}
          selectedApiKey={selectedApiKey}
          onSuccess={() => {
            setShowEditCredential(false);
            fetchProjectDetail();
            toast.success("Credential updated");
          }}
          onClose={() => setShowEditCredential(false)}
        />
      </GlobalDialog>

      <GlobalDialog open={showCredentialDetail} label="Credential Details" onClose={() => setShowCredentialDetail(false)}>
        <CredentialDetailDialog {...selectedApiKey} />
      </GlobalDialog>

      <Confirmation
        open={showDeleteDialog}
        name="this credential"
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
      />
    </>
  );
}

// Skeleton Component
// Skeleton Component
function ProjectDetailSkeleton() {
  return (
    <div className="rounded-lg space-y-6 animate-pulse">
      {/* Main Project Card */}

      <div className="p-6 sm:p-8 border border-[var(--border)] rounded-2xl bg-gradient-to-br from-[var(--background)] to-[var(--background-secondary)] animate-pulse">
        {/* Top section: title, description, badges */}
        <div className="flex items-start gap-6">
          <div className="flex-1 min-w-0 space-y-6">
            {/* Title */}
            <div className="h-8 w-3/4 sm:w-2/3 lg:w-1/2 bg-[var(--border)] rounded-xl" />

            {/* Description */}
            <div className="space-y-2">
              <div className="h-4 w-full max-w-2xl bg-[var(--border)] rounded-lg" />
              <div className="h-4 w-full max-w-xl bg-[var(--border)] rounded-lg" />
              <div className="h-4 w-3/4 bg-[var(--border)] rounded-lg" />
            </div>

            {/* Status & Priority badges */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="h-8 w-24 bg-[var(--border)] rounded-full" />
              <div className="h-8 w-28 bg-[var(--border)] rounded-full" />
            </div>
          </div>
        </div>

        {/* Stats grid – matches real layout: 1 / 2 / 5 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 xl:gap-5 mt-8">
          {/* Card 1 – Progress (special with bar) */}
          <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--border)]/60" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-[var(--border)] rounded" />
                  <div className="h-3 w-24 bg-[var(--border)] rounded" />
                </div>
              </div>
              <div className="h-6 w-20 bg-[var(--border)] rounded-full" />
            </div>

            <div className="space-y-3">
              <div className="h-7 w-14 bg-[var(--border)] rounded-md" />
              <div className="w-full bg-[var(--border)]/70 rounded-full h-2.5 overflow-hidden">
                <div className="h-2.5 w-3/4 bg-[var(--border)] rounded-full" />
              </div>
            </div>
          </div>

          {/* Card 2 – Timeline */}
          <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--border)]/60" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-[var(--border)] rounded" />
                <div className="h-3 w-24 bg-[var(--border)] rounded" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-32 bg-[var(--border)] rounded" />
              <div className="h-3 w-28 bg-[var(--border)] rounded" />
            </div>
          </div>

          {/* Card 3 – Remaining Days */}
          <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--border)]/60" />
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-[var(--border)] rounded" />
                  <div className="h-3 w-28 bg-[var(--border)] rounded" />
                </div>
              </div>
              <div className="h-6 w-24 bg-[var(--border)] rounded-full" />
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-28 bg-[var(--border)] rounded" />
              <div className="h-3 w-32 bg-[var(--border)] rounded" />
            </div>
          </div>

          {/* Card 4 – Budget */}
          <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--border)]/60" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-[var(--border)] rounded" />
                <div className="h-3 w-24 bg-[var(--border)] rounded" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-24 bg-[var(--border)] rounded" />
              <div className="h-3 w-32 bg-[var(--border)] rounded" />
            </div>
          </div>

          {/* Card 5 – Team */}
          <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--border)]/60" />
              <div className="space-y-2">
                <div className="h-3 w-16 bg-[var(--border)] rounded" />
                <div className="h-3 w-24 bg-[var(--border)] rounded" />
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-4 w-20 bg-[var(--border)] rounded" />
              <div className="h-3 w-32 bg-[var(--border)] rounded" />
            </div>
          </div>
        </div>
      </div>
      {/* Tabs Skeleton */}
      <div>
        {/* Tab Headers */}
        <div className="hidden sm:flex gap-2 my-5 rounded-2xl bg-[var(--foreground)]/10 p-1 overflow-x-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-10 w-32 bg-[var(--border)] rounded-xl"
            ></div>
          ))}
        </div>

        {/* Mobile Select */}
        <div className="sm:hidden">
          <div className="h-12 w-full bg-[var(--border)] rounded-lg"></div>
        </div>


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

          <div className="space-y-8 animate-pulse">
            {/* Client Card Skeleton */}
            <div className="p-8 border border-[var(--border)] rounded-2xl">
              <div className="h-6 w-48 bg-border rounded mb-6"></div>

              <div className="p-6 border border-[var(--border)] rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-border"></div>

                  <div className="space-y-2">
                    <div className="h-4 w-40 bg-border rounded"></div>
                    <div className="h-3 w-24 bg-border rounded"></div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6 mt-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-20 bg-border rounded"></div>
                      <div className="h-4 w-32 bg-border rounded"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Details + Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Project Details Section */}
              <div className="lg:col-span-2 border border-[var(--border)] rounded-2xl p-6">
                <div className="h-6 w-40 bg-border rounded mb-6"></div>

                <div className="grid grid-cols-2 gap-8">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="space-y-2">
                      <div className="h-3 w-24 bg-border rounded"></div>
                      <div className="h-4 w-36 bg-border rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team Members */}
              <div className="border border-[var(--border)] rounded-2xl p-6">
                <div className="h-5 w-32 bg-border rounded mb-4"></div>

                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 mb-4 p-3 border border-[var(--border)] rounded-lg"
                  >
                    <div className="w-10 h-10 rounded-full bg-border"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-border rounded"></div>
                      <div className="h-3 w-20 bg-border rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Row */}
            <div className="flex items-center gap-2 text-sm mt-4">
              <div className="h-4 w-4 bg-border rounded"></div>
              <div className="h-4 w-40 bg-border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
