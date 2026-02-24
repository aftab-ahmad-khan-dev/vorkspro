import StatCard from "@/components/Stats";
import { useTabs } from "@/context/TabsContext";
import { Clock, Calendar, DollarSign, User, DollarSignIcon } from "lucide-react";

const formatDate = (date) => date ? new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A";

const daysUntil = (date) => {
  const diff = new Date(date) - new Date();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

export default function ProjectStatsGrid({ project }) {
  // Calculate progress based on milestone completion
  const calculateMilestoneProgress = () => {
    if (!project?.milestones || project.milestones.length === 0) {
      return Number(project?.progress) || 0;
    }
    
    const completedMilestones = project.milestones.filter(m => m.status === 'completed').length;
    return Math.round((completedMilestones / project.milestones.length) * 100);
  };

  const progress = Math.max(0, Math.min(100, calculateMilestoneProgress()));
  const { actions } = useTabs()

  const remainingDays = project?.endDate ? daysUntil(project?.endDate) : null;
  const teamCount = project?.teamMembers?.length ?? 0;
  const budget = Number(project?.cost) || 0;

  const progressState =
    progress >= 80 ? "On track" : progress >= 40 ? "In progress" : "Starting";

  const remainingState =
    remainingDays == null
      ? "No deadline"
      : remainingDays < 0
        ? "Overdue"
        : remainingDays <= 7
          ? "At risk"
          : "Healthy";
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${actions.cost ? "xl:grid-cols-5" : "xl:grid-cols-4"} gap-4 xl:gap-5 mt-4`}>
      {/* Progress */}
      <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/12 flex items-center justify-center">
              <Clock className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[14px] font-medium capitalize tracking-[0.14em] text-foreground">
                Progress
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Overall completion
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${progress >= 80
              ? "border-emerald-500/40 text-emerald-500 bg-emerald-500/15"
              : progress >= 40
                ? "border-amber-500/40 text-amber-500 bg-amber-500/15"
                : "border-slate-500/30 text-slate-500 bg-slate-500/15"
              }`}
          >
            {progressState}
          </span>
        </div>

        <div className="space-y-2">
          <p className="text-2xl font-semibold text-[var(--foreground)] leading-none">
            {Math.round(progress)}%
          </p>
          <div className="w-full bg-[var(--border)]/80 rounded-full h-2.5 overflow-hidden">
            <div
              className=" bg-[var(--button)] h-2.5 rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/12 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-[14px] font-medium capitalize tracking-[0.14em] text-foreground">
              Timeline
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Start & end dates
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-sm font-semibold text-[var(--foreground)]">
            {formatDate(project.startDate)} –{" "}
            {formatDate(project.endDate)}
          </p>
          <p className="text-xs mt-1 text-[var(--muted-foreground)]">
            {project.startDate &&
              `Started ${formatDate(project.startDate)}`}
          </p>
        </div>
      </div>

      {/* Remaining Days */}
      <div
        className={`relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between ${remainingDays != null && remainingDays < 0
          ? "bg-red-500/4"
          : "bg-[var(--background)]/90"
          }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/12 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[14px] font-medium capitalize tracking-[0.14em] text-foreground">
                Remaining
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Until project deadline
              </p>
            </div>
          </div>

          {remainingDays != null && (
            <span
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium border whitespace-nowrap ${remainingDays < 0
                ? "border-rose-500/40 text-rose-500 bg-rose-500/15"
                : remainingDays <= 7
                  ? "border-amber-500/40 text-amber-500 bg-amber-500/15"
                  : "border-emerald-500/40 text-emerald-500 bg-emerald-500/15"
                }`}
            >
              {remainingState}
            </span>
          )}
        </div>

        <div className="mt-4">
          <p className="text-md font-semibold text-[var(--foreground)] leading-none">
            {remainingDays == null
              ? "—"
              : remainingDays < 0
                ? `${Math.abs(remainingDays)}d overdue`
                : `${remainingDays} Days Left`}
          </p>
          {remainingDays != null && (
            <p className="text-xs mt-1 text-[var(--muted-foreground)]">
              {remainingDays < 0
                ? "Extend or update the deadline"
                : "Track workload against time"}
            </p>
          )}
        </div>
      </div>

      {/* Budget */}
      {actions.cost &&
        <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/12 flex items-center justify-center">
              <DollarSignIcon className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[14px] font-medium capitalize tracking-[0.14em] text-foreground">
                Cost
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Allocated amount
              </p>
            </div>
          </div>

          <div className="mt-4">
            {budget > 0 ? (
              <>
                <p className="text-md font-semibold text-[var(--foreground)] leading-none">
                  PKR {budget.toLocaleString()}
                </p>
                <p className="text-xs mt-1 text-[var(--muted-foreground)]">
                  Update from project settings
                </p>
              </>
            ) : (
              <p className="text-sm font-semibold text-[var(--muted-foreground)]">
                Not set
              </p>
            )}
          </div>
        </div>}

      {/* Team */}
      <div className="relative h-full p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/12 flex items-center justify-center">
            <User className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-[14px] font-medium capitalize tracking-[0.14em] text-foreground">
              Team
            </p>
            <p className="text-xs text-[var(--muted-foreground)]">
              Assigned members
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="text-md font-semibold text-[var(--foreground)] leading-none">
            {teamCount} {teamCount === 1 ? "Member" : "Members"}
          </p>
          <p className="text-xs mt-1 text-[var(--muted-foreground)]">
            Manage access from the Team tab
          </p>
        </div>
      </div>
    </div>
  );
}

// const StatCard = ({ icon, title, value, progress, status }) => (
//   <div className="p-5 border border-[var(--border)] rounded-2xl bg-card hover:shadow-md transition-shadow">
//     <div className="flex items-center justify-between mb-3">
//       <div className="flex items-center gap-3">
//         <div className="w-10 h-10 rounded-xl bg-muted flex-center">{icon}</div>
//         <div className="text-sm text-muted-foreground">{title}</div>
//       </div>
//       {status && (
//         <span className={`text-xs px-2 py-1 rounded-full ${status === "On track" ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"}`}>
//           {status}
//         </span>
//       )}
//     </div>
//     <div className="text-2xl font-bold">{value}</div>
//     {progress !== undefined && (
//       <div className="mt-3 w-full bg-muted rounded-full h-2">
//         <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
//       </div>
//     )}
//   </div>
// );