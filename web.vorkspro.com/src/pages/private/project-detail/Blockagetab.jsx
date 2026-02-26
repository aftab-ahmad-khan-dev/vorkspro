import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Clock, CheckCircle, AlertCircle, Users, ExternalLink, Code, User, Plus, Edit, Construction } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTabs } from "@/context/TabsContext";
const baseUrl = import.meta.env.VITE_APP_BASE_URL;
const token = localStorage.getItem("token");
import SearchableSelect from "@/components/SearchableSelect";
import { apiGet, apiPatch, apiPost } from "@/interceptor/interceptor";
import { toast } from "sonner";
import Chip from "@/components/Chip";
import EmptyState from "@/components/EmptyState";

// Stats Component
const BlockageStats = ({ blockages }) => {
    const total = blockages.length;
    const inProgress = blockages.filter((b) => b.status === "in-progress").length;
    const resolved = blockages.filter((b) => b.status === "resolved").length;
    const critical = blockages.filter((b) => b.severity === "critical").length;
    const clientBlocked = blockages.filter((b) => b.type === "clientside").length;

    const stats = [
        { label: "Total Blockages", value: total, icon: AlertTriangle, color: "text-blue-500", bg: "bg-blue-500/20" },
        { label: "In Progress", value: inProgress, icon: Clock, color: "text-orange-500", bg: "bg-orange-500/20" },
        { label: "Resolved", value: resolved, icon: CheckCircle, color: "text-green-500", bg: "bg-green-500/20" },
        { label: "Critical", value: critical, icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/20" },
        { label: "Client Blocked", value: clientBlocked, icon: Users, color: "text-purple-500", bg: "bg-purple-500/20" },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div key={index} className="p-6 border border-border rounded-2xl bg-gradient-to-br from-background to-background/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                                <p className="text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                            <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center", stat.bg)}>
                                <Icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const BlockageTable = ({ blockages, search, typeFilter, severityFilter, statusFilter, onUpdate, refresh }) => {
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [newStatus, setNewStatus] = useState("in-progress");
    const [loadingResolve, setLoadingResolve] = useState(null);
    const [loadingUpdate, setLoadingUpdate] = useState(false);
    const { actions } = useTabs();
    const isSuperAdmin = actions?.isSuperAdmin ?? false;

    const filteredBlockages = blockages.filter((blockage) => {
        const matchesSearch =
            blockage.title.toLowerCase().includes(search.toLowerCase()) ||
            blockage.description.toLowerCase().includes(search.toLowerCase()) ||
            (blockage.assignedTo && blockage.assignedTo.toLowerCase().includes(search.toLowerCase())) ||
            (blockage.project && blockage.project.toLowerCase().includes(search.toLowerCase()));
        const matchesType = typeFilter === "all" || blockage.type === typeFilter;
        const matchesSeverity = severityFilter === "all" || blockage.severity === severityFilter;
        const matchesStatus = statusFilter === "all" || blockage.status === statusFilter;
        return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    }).sort((a, b) => {
        const statusOrder = { "in-progress": 1, "closed": 2, "resolved": 3 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
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
    const getSeverityColor = (severity) => {
        switch (severity) {
            case "critical":
                return "bg-red-100 text-red-600 border-red-200";
            case "high":
                return "bg-orange-100 text-orange-600 border-orange-200";
            default:
                return "bg-gray-100 text-gray-600 border-gray-200";
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "resolved":
                return "bg-green-100 text-green-700 border-green-200";
            case "in-progress":
                return "bg-blue-100 text-blue-700 border-blue-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const calculateDaysBlocked = (dateString) => {
        if (!dateString) return "0 days";
        const reportedDate = new Date(dateString);
        const today = new Date();
        const diffTime = Math.abs(today - reportedDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 0 ? "Today" : `${diffDays} ${diffDays === 1 ? "day" : "days"}`;
    };

    const handleMarkResolved = async (blockage) => {
        setLoadingResolve(blockage.id);
        try {
            const data = await apiPatch(`project/blockage/update`, { _id: blockage.id, status: "resolved" });
            if (data.isSuccess) {
                toast.success("Blockage marked as resolved");
                const updatedBlockage = {
                    ...blockage,
                    status: "resolved",
                    resolvedDate: new Date().toISOString().split("T")[0],
                    updatedAt: new Date().toISOString().split("T")[0],
                };
                onUpdate(updatedBlockage);
                refresh()
            } else {
                toast.error(data.message || "Failed to update blockage");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating blockage");
        } finally {
            setLoadingResolve(null);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedId || !newStatus) return;
        const blockage = blockages.find((b) => b.id === selectedId);
        if (!blockage) return;

        setLoadingUpdate(true);
        try {
            const data = await apiPatch(`project/blockage/update`, { _id: selectedId, status: newStatus });
            if (data.isSuccess) {
                toast.success("Blockage status updated");
                const updatedBlockage = { ...blockage, status: newStatus, updatedAt: new Date().toISOString().split("T")[0] };
                onUpdate(updatedBlockage);
                setModalOpen(false);
                refresh();
            } else {
                toast.error(data.message || "Failed to update blockage");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error updating blockage");
        } finally {
            setLoadingUpdate(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                {filteredBlockages.map((blockage) => (
                    <div key={blockage.id} className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
                        {/* Header Row */}
                        <div className="p-4 flex items-center justify-between border-b border-border">
                            <div className="flex items-center gap-3">
                                {/* <ExternalLink className="w-5 h-5 text-gray-400" /> */}
                                <h3 className="text-lg font-semibold text-foreground">{blockage.title}</h3>
                            </div>
                            <div className="flex gap-2">
                                {/* <span className={cn("px-3 py-0.5 rounded-full text-xs font-medium border", getStatusColor(blockage.status))}>
                                    {blockage.status}
                                </span>
                                <span className={cn("px-3 py-0.5 rounded-full text-xs font-medium border", getSeverityColor(blockage.severity))}>
                                    {blockage.severity}
                                </span> */}
                                <Chip status={blockage.status}></Chip>
                                <Chip status={blockage.severity}></Chip>
                            </div>
                        </div>
                        <div className="px-6 py-2">
                            <p className="text-sm text-foreground">{blockage.description}</p>
                        </div>
                        {/* Metadata Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 p-6 mx-4 rounded-md bg-border/30">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium  tracking-wider">Project</p>
                                    <p className="text-sm font-bold text-foreground">{blockage.project}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium  tracking-wider">Milestone</p>
                                    <p className="text-sm font-semibold text-foreground">
                                        {blockage.milestone?.name || blockage.milestone || "N/A"}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium  tracking-wider">Blocked By</p>
                                    <span className="inline-block mt-1 px-2 py-0.5 text-orange-700 bg-orange-500/10 rounded text-xs font-semibold">
                                        {blockage.blockedBy}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400 font-medium  tracking-wider">Assigned To</p>
                                    <p className="text-sm font-bold text-foreground">{blockage.assignedTo}</p>
                                </div>
                            </div>
                            <div className="space-y-4 md:text-right">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium  tracking-wider">Reported Date</p>
                                    <p className="text-sm font-semibold text-foreground">{blockage.createdAt}</p>
                                </div>
                                {blockage.resolvedDate ?
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium  tracking-wider">Resolved Date</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-background text-foreground rounded-full text-xs font-bold">
                                            {blockage.resolvedDate}
                                        </span>
                                    </div>
                                    :
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium  tracking-wider">Days Blocked</p>
                                        <span className="inline-block mt-1 px-2 py-0.5 bg-background text-foreground rounded-full text-xs font-bold">
                                            {calculateDaysBlocked(blockage.createdAt)}
                                        </span>
                                    </div>}
                            </div>
                        </div>
                        {/* Impact Section */}
                        <div className="p-4 border-l-4 border-l-orange-500 bg-border/30 m-4 rounded-r-lg">
                            <p className="text-xs font-bold text-orange-800 ">Impact</p>
                            <p className="text-sm text-orange-900 mt-1">{blockage.impact || "No impact defined"}</p>
                        </div>
                        {/* Notes Section */}
                        <div className="p-4 bg-background flex justify-between items-start">
                            <div>
                                <p className="text-xs font-bold text-blue-800 ">Notes</p>
                                <p className="text-sm text-blue-900 mt-1">{blockage.notes || "No notes available"}</p>
                            </div>
                            {hasPermission("Blockages", "Create Records") && (
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        className="bg-none border-button"
                                        onClick={() => {
                                            setSelectedId(blockage.id);
                                            setNewStatus(blockage.status);
                                            setModalOpen(true);
                                        }}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        Update Status
                                    </Button>
                                    <Button
                                        size="sm"
                                        className={`bg-green-600 ${blockage.status === "resolved"
                                            ? "cursor-not-allowed opacity-60"
                                            : ""
                                            }`}
                                        onClick={() => handleMarkResolved(blockage)}
                                        disabled={blockage.status === "resolved" || loadingResolve === blockage.id}
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {loadingResolve === blockage.id ? "Resolving..." : `${blockage.status === "resolved" ? "Mark Resolved" : "Mark resolve"}`}
                                    </Button>
                                </div>)}
                        </div>
                    </div>
                ))}
            </div>

            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
                <DialogContent className="sm:max-w-[425px] text-foreground border-none">
                    <DialogHeader>
                        <DialogTitle>Update Blockage Status</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <Label>Status</Label>
                        <Select value={newStatus} onValueChange={setNewStatus} >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="in-progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        {/* <Button type="button" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button> */}
                        <Button onClick={handleUpdateStatus} disabled={loadingUpdate}>
                            {loadingUpdate ? "Updating..." : "Confirm"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

const CreateBlockageDialog = ({ onAdd, project, employees, refresh }) => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        milestone: "",
        type: "",
        severity: "",
        assignedTo: "",
        blockedBy: "",
        description: "",
        impact: "",
        notes: "",
    });

    const projectMilestones = project?.milestones?.map((m) => ({ _id: m._id, name: m.name })) || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (
            !formData.title ||
            !formData.type ||
            !formData.severity ||
            !formData.assignedTo ||
            !formData.blockedBy
        ) {
            toast.error("Please fill in all required fields");
            return;
        }

        const newBlockage = {
            title: formData.title,
            project: project._id,
            milestone: formData.milestone || null,
            type: formData.type,
            severity: formData.severity,
            assignedTo: formData.assignedTo,
            blockedBy: formData.blockedBy,
            description: formData.description,
            impact: formData.impact,
            notes: formData.notes,
            status: "in-progress",
            createdBy: localStorage.getItem("userId") || null,
        };

        setLoading(true);
        try {
            const data = await apiPost(`project/blockage/create`, newBlockage);
            if (data.isSuccess) {
                toast.success("Blockage created successfully");
                // Add blockage to table using backend response
                const displayBlockage = {
                    id: data.blockage._id,
                    title: data.blockage.title,
                    project: project.name,
                    milestone: data.blockage.milestone,
                    type: data.blockage.type,
                    severity: data.blockage.severity,
                    status: data.blockage.status,
                    assignedTo: employees.find((emp) => emp._id === data.blockage.assignedTo)?.name || data.blockage.assignedTo,
                    blockedBy: data.blockage.blockedBy,
                    description: data.blockage.description,
                    impact: data.blockage.impact,
                    notes: data.blockage.notes,
                    createdAt: data.blockage.createdAt?.split("T")[0],
                    updatedAt: data.blockage.updatedAt?.split("T")[0],
                };
                onAdd(displayBlockage);
                setFormData({
                    title: "",
                    milestone: "",
                    type: "",
                    severity: "",
                    assignedTo: "",
                    blockedBy: "",
                    description: "",
                    impact: "",
                    notes: "",
                });
                setOpen(false);
                refresh();
            } else {
                toast.error(data.message || "Failed to create blockage");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error creating blockage");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {open && <div className="fixed inset-0 z-40 w-screen h-screen bg-black/60 backdrop-blur-sm" style={{ width: "100vw", height: "100vh" }} />}
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button className="w-full sm:w-auto">
                        <Plus className="w-4 h-4 mr-2" /> Create Blockage
                    </Button>
                </DialogTrigger>
                <DialogContent className="text-foreground border-none sm:max-w-[650px] max-h-[90vh] overflow-y-auto z-50">
                    <DialogHeader>
                        <DialogTitle>Create New Blockage</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label>Title <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Enter blockage title"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Project</Label>
                            <Input value={project?.name || ""} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Milestone (Optional)</Label>
                            <SearchableSelect
                                key={formData.milestone}
                                placeholder="Search or select milestone..."
                                items={projectMilestones}
                                value={formData.milestone}
                                onValueChange={(v) => setFormData({ ...formData, milestone: v })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Type <span className="text-red-500">*</span></Label>
                                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="clientside">Client Side</SelectItem>
                                        <SelectItem value="external/thirdparty">External / Third Party</SelectItem>
                                        <SelectItem value="internal">Internal</SelectItem>
                                        <SelectItem value="technical issue">Technical Issue</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Severity <span className="text-red-500">*</span></Label>
                                <Select value={formData.severity} onValueChange={(v) => setFormData({ ...formData, severity: v })}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select severity" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="critical">Critical</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="low">Low</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Assign To <span className="text-red-500">*</span></Label>
                            <SearchableSelect
                                key={formData.assignedTo}
                                placeholder="Search employee..."
                                items={employees}
                                value={formData.assignedTo}
                                onValueChange={(v) => setFormData({ ...formData, assignedTo: v })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Blocked By <span className="text-red-500">*</span></Label>
                            <Input
                                value={formData.blockedBy}
                                onChange={(e) => setFormData({ ...formData, blockedBy: e.target.value })}
                                placeholder="Enter name, team, client, or third-party"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the blockage in detail..."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Impact</Label>
                            <Textarea
                                value={formData.impact}
                                onChange={(e) => setFormData({ ...formData, impact: e.target.value })}
                                placeholder="Impact the blockage in detail..."
                                rows={4}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes</Label>
                            <Textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Notes the blockage in detail..."
                                rows={4}
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            {/* <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                                Cancel
                            </Button> */}
                            <Button type="submit" disabled={loading}>
                                {loading ? "Creating..." : "Create Blockage"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
};

// Skeleton Component
const BlockageSkeleton = () => {
    return (
        <div className="space-y-8">
            {/* Stats Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="p-6 border border-border rounded-2xl bg-gradient-to-br from-background to-background/50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-3">
                                <div className="h-8 w-12 bg-border rounded animate-pulse"></div>
                                <div className="h-4 w-20 bg-border rounded animate-pulse"></div>
                            </div>
                            <div className="w-12 h-12 bg-border rounded-lg animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="h-10 flex-1 bg-border rounded animate-pulse"></div>
                <div className="h-10 w-48 bg-border rounded animate-pulse"></div>
                <div className="h-10 w-48 bg-border rounded animate-pulse"></div>
                <div className="h-10 w-40 bg-border rounded animate-pulse"></div>
            </div>

            {/* Blockage Cards Skeleton */}
            <div className="space-y-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 bg-border rounded animate-pulse"></div>
                                    <div className="h-6 w-48 bg-border rounded animate-pulse"></div>
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-6 w-20 bg-border rounded-full animate-pulse"></div>
                                    <div className="h-6 w-16 bg-border rounded-full animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-2">
                            <div className="h-4 w-full bg-border rounded animate-pulse"></div>
                        </div>
                        <div className="p-6 bg-background border-y border-border">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
                                {[...Array(3)].map((_, j) => (
                                    <div key={j} className="space-y-4">
                                        <div className="h-3 w-16 bg-border rounded animate-pulse"></div>
                                        <div className="h-4 w-24 bg-border rounded animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 m-4">
                            <div className="h-4 w-full bg-border rounded animate-pulse"></div>
                        </div>
                        <div className="p-4 border-t border-border flex justify-between items-start">
                            <div className="flex-1">
                                <div className="h-4 w-full bg-border rounded animate-pulse"></div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-8 w-24 bg-border rounded animate-pulse"></div>
                                <div className="h-8 w-28 bg-border rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Main Component
export default function BlockageTab({ project, refresh }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [severityFilter, setSeverityFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [blockages, setBlockages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
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

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`${baseUrl}employee/get-active-employees`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.isSuccess) setEmployees(data.filteredData?.employees || []);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchBlockages = async () => {
        try {
            const data = await apiGet(`project/blockage/get?projectId=${project._id}`);
            if (data.isSuccess) {
                const formatted = data.blockages.map((b) => ({
                    id: b._id,
                    title: b.title,
                    project: project.name,
                    milestone: b.milestone ? { _id: b.milestone._id, name: b.milestone.name } : null,
                    type: b.type,
                    severity: b.severity,
                    status: b.status,
                    resolvedDate: b.resolvedDate ? b.resolvedDate.split("T")[0] : null,
                    assignedTo: b.assignedTo?.firstName ? `${b.assignedTo.firstName} ${b.assignedTo.lastName}` : b.assignedTo,
                    blockedBy: b.blockedBy,
                    description: b.description,
                    impact: b.impact,
                    notes: b.notes,
                    createdAt: b.createdAt?.split("T")[0],
                    updatedAt: b.updatedAt?.split("T")[0],
                }));
                setBlockages(formatted);
            }
        } catch (err) {
            console.error("Error fetching blockages:", err);
        }
    };

    useEffect(() => {
        const fetchEmployeesAndBlockages = async () => {
            setLoading(true);
            await fetchEmployees();
            await fetchBlockages();
            setLoading(false);
        };
        fetchEmployeesAndBlockages();
    }, [project]);

    const formattedEmployees = employees.map((emp) => ({
        _id: emp._id,
        name: `${emp.firstName} ${emp.lastName}`.trim(),
    }));

    const handleAddBlockage = (newBlockage) => {
        setBlockages([...blockages, newBlockage]);
    };

    const handleUpdateBlockage = (updatedBlockage) => {
        setBlockages(blockages.map((b) => (b.id === updatedBlockage.id ? updatedBlockage : b)));
    };

    if (loading) {
        return <BlockageSkeleton />;
    }

    return (
        <div className="space-y-8">
            <BlockageStats blockages={blockages} />
            <div className="flex flex-col sm:flex-row gap-4">
                <Input
                    placeholder="Search blockages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 text-foreground"
                />
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-full sm:w-48 text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-48 text-foreground">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                </Select>
                {project.status !== "completed" &&
                    hasPermission("Blockages", "Create Records") && (
                        <CreateBlockageDialog onAdd={handleAddBlockage} project={project} employees={formattedEmployees} refresh={refresh} />
                    )}
            </div>
            <BlockageTable
                blockages={blockages}
                search={searchTerm}
                typeFilter={typeFilter}
                severityFilter={severityFilter}
                statusFilter={statusFilter}
                refresh={refresh}
                onUpdate={handleUpdateBlockage}
            />
            {blockages.length === 0 && !loading && (
                <EmptyState icon={Construction} title="No blockages found" subtitle="Create a new blockage to get started"></EmptyState>
            )}
            <div className="p-6 border text-foreground border-border rounded-2xl border-l-4 border-l-primary">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-5 h-5 text-orange-500" /> Blockage Management Best Practices
                </h3>
                <div className="grid sm:grid-cols-3 gap-6 text-sm">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                            <strong>Early Identification</strong>
                            <p className="text-muted-foreground text-xs mt-1">Report blockages as soon as identified</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                            <Users className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                            <strong>Clear Assignment</strong>
                            <p className="text-muted-foreground text-xs mt-1">Assign responsible team members</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-purple-500" />
                        </div>
                        <div>
                            <strong>Regular Updates</strong>
                            <p className="text-muted-foreground text-xs mt-1">Track progress and resolution</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}