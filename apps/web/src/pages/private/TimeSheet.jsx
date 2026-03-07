import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Check, Cross, Download, Eye, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GlobalDialog from '@/models/GlobalDialog';
import CreateDialog from '@/models/timesheet/CreateDialog';

const TimeSheet = () => {
  const timesheets = [
    { id: 'sj', employee: 'Sarah Johnson', weekPeriod: 'Oct 7 - Oct 13', regularHours: '40h', overtime: '2.5h', totalHours: '42.5h', submitted: '2025-10-11', status: 'Pending' },
    { id: 'mc', employee: 'Mike Chen', weekPeriod: 'Oct 7 - Oct 13', regularHours: '40h', overtime: '', totalHours: '40h', submitted: '2025-10-10', status: 'Approved' },
    { id: 'ew', employee: 'Emma Wilson', weekPeriod: 'Oct 7 - Oct 13', regularHours: '40h', overtime: '5h', totalHours: '45h', submitted: '2025-10-11', status: 'Approved' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'text-red-600 bg-red-100';
      case 'Approved': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const [openDialog, setOpenDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  const handleCreate = () => {
    setOpenDialog(true);
  };

  const filterTimesheets = (status) => {
    return timesheets.filter(ts => ts.status === status || status === 'all');
  };

  return (
    <div className="min-h-screen p-8 bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Timesheet Management</h1>
          <p className="text-gray-500 mt-1">Track work hours and approve timesheets</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="border-button"><Download></Download> Export</Button>
          <Button className="bg-black text-white hover:bg-gray-800 flex items-center gap-2" onClick={handleCreate}>Add Work Log</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[
          {
            label: "Pending Approval",
            value: "23",
            color: "text-red-500",
            sub: "Awaiting review",
          },
          {
            label: "This Week's Hours",
            value: "9,845",
            color: "text-blue-600",
            sub: "Total logged hours",
          },
          {
            label: "Overtime Hours",
            value: "245",
            color: "text-green-600",
            sub: "Extra hours worked",
          },
          {
            label: "Avg. Utilization",
            value: "94%",
            color: "text-yellow-600",
            sub: "Team efficiency",
          },
        ].map((stat, i) => (
          <div
            key={i}
            className="p-6 rounded-xl border border-[var(--border)] hover:shadow-md transition-shadow duration-300"
          >
            <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-sm text-gray-400">{stat.sub}</p>
          </div>
        ))}
      </div>


      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
          <TabsTrigger
            value="pending"
            className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
          >
            Pending Approval
          </TabsTrigger>
          <TabsTrigger
            value="approved"
            className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
          >
            Approved
          </TabsTrigger>
          <TabsTrigger
            value="rejected"
            className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
          >
            Rejected
          </TabsTrigger>
          <TabsTrigger
            value="daily"
            className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
          >
            Daily Logs
          </TabsTrigger>
          <TabsTrigger
            value="weekly"
            className="rounded-2xl py-2 text-sm font-medium data-[state=active]:text-[var(--foreground)] transition-colors duration-300 ease-in-out"
          >
            Weekly Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="transition-opacity duration-300 ease-in-out">
          <div className="p-0 border border-[var(--border)] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Week Period</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Regular Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Overtime</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Total Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Submitted</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-[var(--card-foreground)]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filterTimesheets('Pending').map((timesheet) => (
                    <tr key={timesheet.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm text-[var(--foreground)] bg-[var(--border)]`}>
                            {timesheet.employee.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-[var(--card-foreground)]">{timesheet.employee}</p>
                            <p className="text-xs text-[var(--muted-foreground)]">{timesheet.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{timesheet.weekPeriod}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{timesheet.regularHours}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{timesheet.overtime}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{timesheet.totalHours}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-[var(--muted-foreground)]">{timesheet.submitted}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-0 justify-center">
                          <Button className="text-[var(--button)] bg-transparent hover:bg-[var(--button)]/20" size="sm" onClick={() => handleView(timesheet.id)}>
                            <Eye size={16} />
                          </Button>
                          <Button className="text-green-500 bg-transparent hover:bg-green-500/20" size="sm" onClick={() => handleApprove(timesheet.id)}>
                            <Check size={16} />
                          </Button>
                          <Button className="text-red-500 bg-transparent hover:bg-red-500/20" size="sm" onClick={() => handleReject(timesheet.id)}>
                            <X size={16} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filterTimesheets('Pending').length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-lg">No pending timesheets found.</p>
                <p className="text-[var(--muted-foreground)] mt-2">Try adjusting your filters to find pending timesheets.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="approved" className="transition-opacity duration-300 ease-in-out">
          <div className="p-0 border border-[var(--border)] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Week Period</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Total Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Approved By</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Approved Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filterTimesheets('Approved').map((timesheet) => (
                    <tr key={timesheet.id} className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.employee}</td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.weekPeriod}</td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.regularHours}</td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.overtime ? timesheet.overtime : '-'}</td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.totalHours}</td>
                      <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">{timesheet.submitted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filterTimesheets('Approved').length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-lg">No approved timesheets found.</p>
                <p className="text-[var(--muted-foreground)] mt-2">Try adjusting your filters to find approved timesheets.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ─── Rejected Timesheets ─── */}
        <TabsContent value="rejected" className="transition-opacity duration-300 ease-in-out">
          <div className="p-0 border border-[var(--border)] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Week Period</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Total Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Reason</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Rejected Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Ali Khan</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 14–18, 2025</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">38h</td>
                    <td className="px-6 py-4 text-sm text-red-500">Late Submission</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 22, 2025</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">Rejected</td>
                  </tr>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Sara Ahmed</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 14–18, 2025</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">35h</td>
                    <td className="px-6 py-4 text-sm text-red-500">Incorrect Task Log</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 23, 2025</td>
                    <td className="px-6 py-4 text-sm text-red-600 font-medium">Rejected</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* {filterTimesheets('Rejected').length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-lg">No rejected timesheets found.</p>
                <p className="text-[var(--muted-foreground)] mt-2">Try adjusting your filters to find rejected timesheets.</p>
              </div>
            )} */}
          </div>
        </TabsContent>

        {/* ─── Daily Logs ─── */}
        <TabsContent value="daily" className="transition-opacity duration-300 ease-in-out">
          <div className="p-0 border border-[var(--border)] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Date</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Project</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Task</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 22, 2025</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Website Redesign</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">UI Fixes</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">6h</td>
                    <td className="px-6 py-4 text-sm text-green-600">Completed</td>
                  </tr>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 23, 2025</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Mobile App</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">API Integration</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">7h</td>
                    <td className="px-6 py-4 text-sm text-yellow-600">In Progress</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* {dailyLogs.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-lg">No daily logs found.</p>
                <p className="text-[var(--muted-foreground)] mt-2">Try adjusting your filters to find daily logs.</p>
              </div>
            )} */}
          </div>
        </TabsContent>

        {/* ─── Weekly Summary ─── */}
        <TabsContent value="weekly" className="transition-opacity duration-300 ease-in-out">
          <div className="p-0 border border-[var(--border)] rounded-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--border)]">
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Employee</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Weekly Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Target Hours</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Overtime</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Progress</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-[var(--card-foreground)]">Efficiency</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Fatima Noor</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">39h</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">40.5h</td>
                    <td className="px-6 py-4 text-sm text-blue-600">1.5h</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 14–18, 2025</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">97%</td>
                  </tr>
                  <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--border)] transition-all duration-300">
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Usman Tariq</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">42h</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">44h</td>
                    <td className="px-6 py-4 text-sm text-blue-600">2h</td>
                    <td className="px-6 py-4 text-sm text-[var(--muted-foreground)]">Oct 14–18, 2025</td>
                    <td className="px-6 py-4 text-sm text-green-600 font-medium">95%</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* {weeklySummaries.length === 0 && (
              <div className="px-6 py-12 text-center">
                <p className="text-[var(--muted-foreground)] text-lg">No weekly summaries found.</p>
                <p className="text-[var(--muted-foreground)] mt-2">Try adjusting your filters to find weekly summaries.</p>
              </div>
            )} */}
          </div>
        </TabsContent>


      </Tabs>

      <GlobalDialog open={openDialog} onClose={() => setOpenDialog(false)} label="Add work logs">
        <CreateDialog />
      </GlobalDialog>
    </div>
  );
};

export default TimeSheet;