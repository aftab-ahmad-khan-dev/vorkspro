import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";
import ProfilePicture from "@/components/ProfilePicture";
import { useTabs } from "@/context/TabsContext";
import { Building, Mail, Phone, MapPin, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const formatDate = (d) => d ? new Date(d).toLocaleDateString() : "N/A";

export default function OverviewTab({ project }) {
  const navigate = useNavigate();
  const { actions } = useTabs()

  return (
    <div className="space-y-8">
      {/* Client Card */}
      {/* <div className="p-8 border border-[var(--border)] rounded-2xl ">
        <h3 className="text-xl font-bold flex text-[var(--foreground)] items-center gap-3 mb-6">
          <Building className="w-6 h-6 text-indigo-500" /> Client Information
        </h3>
        {project.client ? (
          <div  className="cursor-pointer p-6 border border-[var(--border)] rounded-xl transition">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-border flex-center text-2xl font-bold text-muted-foreground flex justify-center items-center">
                <Building></Building>
              </div>
              <div>
                <h4 className="text-lg text-[var(--foreground)] font-semibold">{project.client.name}</h4>
                <p className="text-sm text-muted-foreground">Company</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-6 mt-6 text-sm">
              <InfoItem icon={<Mail size={18} />} color={'text-blue-500 bg-blue-500/15'} label="Email" value={project.client.email} />
              <InfoItem icon={<Phone size={18} />} color={'text-green-500 bg-green-500/15'} label="Phone" value={project.client.phone} />
              <InfoItem icon={<MapPin size={18} />} label="Address" color={'text-purple-500 bg-purple-500/15'} value={[project.client.address?.city, project.client.address?.country].filter(Boolean).join(", ") || "N/A"} />
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">No client assigned</div>
        )}
      </div> */}

      {/* Project Details + Team + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Details */}
        <div className="lg:col-span-2 border border-[var(--border)] rounded-2xl p-6 ">
          <h3 className="text-xl text-[var(--foreground)] font-bold mb-6">Project Details</h3>
          <div className="grid grid-cols-2 gap-8">
            <Detail onClick={() => navigate(`/clients/client-detail/${project.client._id}`)} label="Client" value={project.client?.name || "N/A"} />
            <Detail label="Deadline" value={formatDate(project.endDate)} />
            <Detail label="Project Manager" value={`${project.projectManager?.firstName || ""} ${project.projectManager?.lastName || ""}`.trim() || "N/A"} />
            <Detail label="Start Date" value={formatDate(project.startDate)} />
            {actions.cost &&
              <Detail label="cost" value={project.cost ? `$ ${project.cost.toLocaleString()}` : "N/A"} />}
            {/* <Detail label="Status" value={project.status || "N/A"} /> */}
            <div className="flex flex-col gap-2">
              <p className="text-sm text-muted-foreground">Status</p>
              <Chip status={project.status || "N/A"} />
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div className="border border-[var(--border)] rounded-2xl p-6 max-h-80 overflow-scroll">
          <h3 className="text-lg text-[var(--foreground)] font-bold mb-4">Team Members</h3>
          {project.teamMembers?.map((m) => (
            <div key={m._id} className="flex items-center gap-3 mb-4 p-3 border border-[var(--border)] rounded-lg">
              <ProfilePicture name={m?.firstName}></ProfilePicture>
              {/* <div className="w-10 h-10 rounded-full flex-center text-lg font-bold">
                {m.firstName.charAt(0)}
              </div> */}
              <div>
                <p className="font-medium text-[var(--foreground)]">{m.firstName} {m.lastName}</p>
                <p className="text-xs text-muted-foreground">{m.subDepartment?.name || "N/A"}</p>
              </div>
            </div>
          ))}
          {project.teamMembers.length === 0 && (
            <EmptyState
              icon={Users}
              title="No employees found"
              subtitle="Start by adding your first team member to get started"
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Calendar /> Project created on <span className="font-medium text-foreground">{formatDate(project.createdAt)}</span>
      </div>

    </div>
  );
}


const InfoItem = ({ icon, label, value, color }) => (
  <div className="flex items-center gap-3">
    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium text-[var(--foreground)] truncate">{value || "N/A"}</p>
    </div>
  </div>
);

const Detail = ({ label, value, onClick }) => (
  <div onClick={onClick} className={`${label == 'Client' ? 'cursor-pointer' : ''}`}>
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className="font-medium text-[var(--foreground)] mt-1">{value}</p>
  </div>
);