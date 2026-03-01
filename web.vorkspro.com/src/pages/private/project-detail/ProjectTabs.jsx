// src/components/project/ProjectTabs.jsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewTab from "./OverviewTab";
import TeamTab from "./TeamTab";
import TimelineTab from "./TimeLineTab";
import MilestonesTab from "./MilestoneTab";
import DocumentsTab from "./DocumentsTab";
import CredentialsTab from "./CredentialTab";
import BudgetTab from "./BudgetTab";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import Blockagetab from "./Blockagetab";
import { useTabs } from "@/context/TabsContext";


export default function ProjectTabs({
  project,
  credentials,
  refresh,
  onEditCredential,
  onViewCredential,
  onDeleteCredential,
  onAddCredential,
  timeline,
  onMilestonesUpdate,
  activeTab: controlledActiveTab,
  onTabChange,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState("");
  const activeTab = controlledActiveTab ?? internalActiveTab;
  const setActiveTab = onTabChange ?? setInternalActiveTab;
  const { tabs: modules, actions } = useTabs()
  const isSuperAdmin = modules?.length == 0 || modules == undefined

  const availableTabs = [];
  useEffect(() => {
    actions?.modulePermissions?.forEach((modules) => {
      if (modules.module == "Projects") {
        // DetailTabsLength = modules.detailTabs.length

        // Build available tabs array based on permissions
        if (modules.detailTabs.includes("Overview")) {
          availableTabs.push("overview");
        }
        if (modules.detailTabs.includes("Team")) {
          availableTabs.push("team");
        }
        if (modules.detailTabs.includes("Activity")) {
          availableTabs.push("activity");
        }
        if (modules.detailTabs.includes("Milestones")) {
          availableTabs.push("milestones");
        }
        if (modules.detailTabs.includes("Documents")) {
          availableTabs.push("documents");
        }
        if (modules.detailTabs.includes("Blockages")) {
          availableTabs.push("blockage");
        }
        if (modules.detailTabs.includes("Credentials&Keys")) {
          availableTabs.push("credential");
        }
        if (modules.detailTabs.includes("Budget Breakdown")) {
          availableTabs.push("Budget Breakdown");
        }

        // Set first available tab as default if not already set (only when uncontrolled)
        if (controlledActiveTab == null && availableTabs.length > 0 && !internalActiveTab) {
          setInternalActiveTab(availableTabs[0]);
        }
      }
    });
  }, [actions?.modulePermissions, controlledActiveTab, internalActiveTab]);

  const hasDetailTabsPermission = (moduleName, requiredTabs) => {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.detailTabs.includes(requiredTabs)
        }
      }
    );
  };

  const detailTabsCount = [
    hasDetailTabsPermission("Projects", "Overview"),
    hasDetailTabsPermission("Projects", "Team"),
    hasDetailTabsPermission("Projects", "Activity"),
    hasDetailTabsPermission("Projects", "Milestones"),
    hasDetailTabsPermission("Projects", "Documents"),
    hasDetailTabsPermission("Projects", "Blockages"),
    hasDetailTabsPermission("Projects", "Credentials&Keys"),
    hasDetailTabsPermission("Projects", "Budget Breakdown"),
  ].filter(Boolean).length;

  function hasPermission(moduleName, requiredAction) {
    if (isSuperAdmin) return true;

    return actions?.modulePermissions?.some(
      (modules) => {
        const currentModule = modules.module == moduleName
        if (currentModule == true) {
          return modules.actions.includes(requiredAction)
        }
      }
    );
  }

  const allTabs = [
    "overview",
    "team",
    "activity",
    "milestones",
    "documents",
    "blockage",
    "credential",
    "Budget Breakdown",
  ];

  const bigTabs = [
    "Overview",
    "Team",
    "Activity",
    "Milestones",
    "Documents",
    "Blockages",
    "Credentials&Keys",
    "Budget Breakdown",
  ];

  const tabs = allTabs.filter(tab =>
    tab !== "milestones" || hasPermission("Milestones", "View Records")
  );

  // Calculate missing credentials count
  const missingCredentialsCount = project?.credentials?.filter(
    (credit) => !credit?.keyValue || credit?.keyValue === ""
  )?.length || 0;

  const inProgressBlocages = project?.blockages?.filter((blockage) => {
    console.log(blockage)
    return blockage?.status === "in-progress";
  })

  console.log("inProgressBlocages: ", inProgressBlocages)
  
  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full"
    >
      {/* Desktop tabs */}
      {detailTabsCount > 1 && (
        <TabsList className="hidden md:flex gap-2 rounded-2xl bg-border/50 p-1 mb-6 overflow-x-auto">
          {hasDetailTabsPermission("Projects", "Overview") && (
            <TabsTrigger
              value="overview"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Overview
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Team") && (
            <TabsTrigger
              value="team"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Team
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Activity") && (
            <TabsTrigger
              value="activity"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Activity
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Milestones") && (
            <TabsTrigger
              value="milestones"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Milestones
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Documents") && (
            <TabsTrigger
              value="documents"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Documents
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Blockages") && (
            <TabsTrigger
              value="blockage"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Blockages
              {inProgressBlocages?.length > 0 && (
                <span className=" bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full ml-1">
                  {inProgressBlocages.length}
                </span>
              )}
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Credentials&Keys") && (
            <TabsTrigger
              value="credential"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize relative"
            >
              Credentials & Keys
              {missingCredentialsCount > 0 && (
                <span className=" bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full">
                  {missingCredentialsCount}
                </span>
              )}
            </TabsTrigger>
          )}
          
          {hasDetailTabsPermission("Projects", "Budget Breakdown") && (
            <TabsTrigger
              value="Budget Breakdown"
              className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize"
            >
              Budget Breakdown
            </TabsTrigger>
          )}
        </TabsList>
      )}

      {/* Mobile select */}
      {detailTabsCount > 1 && (
        <div className="md:hidden text-[var(--foreground)] mb-3">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full border rounded-lg px-3 py-2 text-sm">
              <SelectValue
                placeholder="Select tab..."
              />
            </SelectTrigger>

            <SelectContent>
              {hasDetailTabsPermission("Projects", "Overview") && (
                <SelectItem value="overview" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Overview
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Team") && (
                <SelectItem value="team" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Team
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Activity") && (
                <SelectItem value="activity" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Activity
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Milestones") && (
                <SelectItem value="milestones" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Milestones
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Documents") && (
                <SelectItem value="documents" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Documents
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Blockages") && (
                <SelectItem value="blockage" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Blockages
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Credentials&Keys") && (
                <SelectItem value="credential" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Credentials & Keys
                  {missingCredentialsCount > 0 && (
                    <span className=" bg-red-500/10 text-red-500 text-xs px-2 py-0.5 rounded-full">
                      {missingCredentialsCount}
                    </span>
                  )}
                </SelectItem>
              )}
              
              {hasDetailTabsPermission("Projects", "Budget Breakdown") && (
                <SelectItem value="Budget Breakdown" className="rounded-xl px-5 py-2.5 text-sm font-medium capitalize">
                  Budget Breakdown
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      <TabsContent value="overview">
        <OverviewTab project={project} />
      </TabsContent>

      <TabsContent value="team">
        <TeamTab project={project} refresh={refresh} />
      </TabsContent>
      <TabsContent value="Budget Breakdown">
        <BudgetTab project={project} refresh={refresh} />
      </TabsContent>

      <TabsContent value="activity">
        <TimelineTab project={project} timeline={timeline} />
      </TabsContent>

      {hasPermission("Milestones", "View Records") && (
        <TabsContent value="milestones">
          <MilestonesTab project={project} refresh={refresh} onMilestonesUpdate={onMilestonesUpdate} />
        </TabsContent>
      )}

      <TabsContent value="documents">
        <DocumentsTab project={project} refresh={refresh} />
      </TabsContent>
      <TabsContent value="blockage">
        <Blockagetab project={project} refresh={refresh} />
      </TabsContent>

      <TabsContent value="credential">
        <CredentialsTab
          credentials={credentials}
          onAdd={onAddCredential}
          onEdit={onEditCredential}
          onView={onViewCredential}
          onDelete={onDeleteCredential}
          onRefresh={refresh}
        />
      </TabsContent>
    </Tabs>
  );
}
