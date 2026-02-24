// src/components/project/tabs/TeamTab.jsx
import EmptyState from "@/components/EmptyState";
import SearchableSelect from "@/components/SearchableSelect";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiGet, apiPatch, apiPost } from "@/interceptor/interceptor";
import Confirmation from "@/models/Confirmation";
import GlobalDialog from "@/models/GlobalDialog";
import { Users, Badge, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeamTab({ project, refresh }) {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [teamMember, setTeamMember] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function getEmployees() {
    const response = await apiGet("employee/get-active-employees");
    setEmployees(response.filteredData.employees);
  }

  useEffect(() => {
    if (employees.length > 0) {
      const existingMemberIds = project.teamMembers?.map(member => member._id) || [];
      const filtered = employees.filter(emp => !existingMemberIds.includes(emp._id));
      setAvailableEmployees(filtered);
    }
  }, [employees, project.teamMembers]);

  async function handleAddTeamMembers(e) {
    e.preventDefault();
    if (!teamMember || teamMember.length === 0) return;

    setIsSubmitting(true);
    try {
      await apiPatch(`project/add-team-members/${project._id}`, {
        teamMembers: teamMember.map(member => member)
      });
      setTeamDialogOpen(false);
      setTeamMember(null);
      if (refresh) {
        refresh();
      }
    } catch (error) {
      console.error('Error adding team members:', error);
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    getEmployees();
  }, [])

  return (
    <div className="p-8 border border-[var(--border)] rounded-2xl ">
      <div className="flex items-center justify-between gap-3 mb-8">
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex justify-center items-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-2xl text-[var(--foreground)] font-bold">Team Members</h3>
        </div>
        <Button onClick={() => setTeamDialogOpen(true)}><Plus /> Add More</Button>
      </div>

      {project.teamMembers?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {project.teamMembers.map((member) => (
            <div
              key={member._id}
              onClick={() => navigate(`/employees/employee-detail/${member._id}`)}
              className="flex items-center justify-between p-5 border border-[var(--border)] rounded-xl hover:shadow-lg transition cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex-center text-white font-bold text-xl flex justify-center items-center">
                  {member.firstName?.[0]?.toUpperCase()}{member.lastName?.[0]?.toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)] text-lg">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{member.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {member.subDepartment?.name || "No department"}
                  </p>
                </div>
              </div>
              {member._id === project.projectManager?._id && (
                <Badge className="fill-emerald-500/15 text-emerald-700">Manager</Badge>
              )}
            </div>
          ))}
        </div>
      ) : (
        // <div className="text-center py-20 text-muted-foreground">
        //   <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        //   <p className="text-lg font-medium">No team members assigned</p>
        // </div>
        <EmptyState
          icon={Users}
          title="No team members found"
          subtitle="Start by adding your first team member to get started"
        />


      )}

      <GlobalDialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} label={'Add Team Member'}>
        <form>
          <Label className='mb-2' >Employees<span className="text-red-500">*</span></Label>
          <SearchableSelect placeholder="Select employees" items={availableEmployees} multi={true} value={teamMember} onValueChange={setTeamMember}></SearchableSelect>
          <div className="flex justify-end mt-5">
            <Button onClick={handleAddTeamMembers} type="button" disabled={isSubmitting || !teamMember || teamMember.length === 0}>
              <Plus /> {isSubmitting ? 'Adding...' : 'Add'}
            </Button>
          </div>
        </form>
      </GlobalDialog>
    </div>
  );
}