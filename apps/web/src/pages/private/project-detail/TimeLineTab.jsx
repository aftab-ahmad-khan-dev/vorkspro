// src/components/project/tabs/TimelineTab.jsx
import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import { useProjectDetail } from "@/context/ProjectDetailContext";
import { CheckCircle2, Clock, Projector, Target } from "lucide-react";

const milestones = [
  { id: 1, title: "Project Kickoff", date: "2024-10-01", status: "completed" },
  { id: 2, title: "Design Phase", date: "2024-10-15", status: "completed" },
  { id: 3, title: "Development Sprint 1", date: "2024-11-01", status: "completed" },
  { id: 4, title: "Development Sprint 2", date: "2024-11-15", status: "in-progress" },
  { id: 5, title: "Testing & QA", date: "2024-12-01", status: "pending" },
  { id: 6, title: "Deployment", date: "2024-12-15", status: "pending" },
];

const getStatusStyle = (status) => {
  switch (status) {
    case "completed": return "bg-emerald-500/20 text-emerald-600 border-emerald-500";
    case "in-progress": return "bg-blue-500/20 text-blue-600 border-blue-500";
    default: return "bg-gray-500/20 text-muted-foreground border-gray-400";
  }
};

const getIcon = (status) => {
  switch (status) {
    case "completed": return <CheckCircle2 className="w-5 h-5" />;
    case "in-progress": return <Clock className="w-5 h-5" />;
    default: return <Target className="w-5 h-5" />;
  }
};

export default function TimelineTab({ timeline }) {
  const { timeline: newTimeLine } = useProjectDetail();
  const mergedTimeline = [...timeline, ...newTimeLine];

  return (
    <div className="border border-[var(--border)] rounded-2xl  p-8">
      <h3 className="text-xl font-bold text-[var(--foreground)] mb-6">Project Activity</h3>

      {
        mergedTimeline.length === 0 && (
          // <div className="text-center py-12 text-muted-foreground">No timeline found</div>
          <EmptyState icon={Clock} title="No activity found" subtitle="This project has no activity yet"></EmptyState>
        )
      }

      <div className="space-y-8">
        {mergedTimeline.map((m, i) => {
          const isLast = i === mergedTimeline.length - 1;
          return (
            <div key={m.id} className="flex gap-5">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full border-2 flex justify-center items-center ${getStatusStyle(m.status)}`}>
                  {getIcon(m.status)}
                </div>
                {!isLast && (
                  <div className="mt-4 -mb-5 h-10 w-px bg-[var(--border)]"></div>
                )}
                {i < timeline.length - 1 && <div className="w-8 bg-border mt-2" />}
              </div>
              <div className="flex-1 pb-10">
                <h4 className="font-semibold text-[var(--foreground)]">{m.key ?? "N/A"} : {m.value ?? "N/A"}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Due: {new Date(m.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  By: &nbsp; {m?.user?.email ? m?.user?.email : m?.user ?? "N/A"}
                </p>
                {/* <Chip className={'float-end -mt-10'} status={m?.status}></Chip> */}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}