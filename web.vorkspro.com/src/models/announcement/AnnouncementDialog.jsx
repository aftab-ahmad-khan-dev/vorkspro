import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { apiGet, apiPost, apiPut } from "@/interceptor/interceptor";

export default function AnnouncementDialog({ announcement, onSuccess, onClose }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    department: "",
    priority: "medium",
    isPinned: false,
    sendNotifications: false,
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDepts, setLoadingDepts] = useState(true);

  useEffect(() => {
    fetchDepartments();
    if (announcement) {
      setFormData({
        title: announcement.title || "",
        content: announcement.content || "",
        department: announcement.department?._id || "",
        priority: announcement.priority || "medium",
        isPinned: announcement.isPinned || false,
        sendNotifications: announcement.sendNotifications || false,
      });
    }
  }, [announcement]);

  const fetchDepartments = async () => {
    setLoadingDepts(true);
    try {
      const data = await apiGet("department/get-all");
      setDepartments(data.filteredData.departments || []);
    } catch (error) {
      toast.error("Failed to load departments");
    } finally {
      setLoadingDepts(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!formData.content.trim()) {
      toast.error("Content is required");
      return;
    }
    if (!formData.department) {
      toast.error("Department is required");
      return;
    }

    setLoading(true);
    try {
      if (announcement) {
        await apiPut(`announcement/update/${announcement._id}`, formData);
        toast.success("Announcement updated successfully");
      } else {
        await apiPost("announcement/create", formData);
        toast.success("Announcement created successfully");
      }
      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to save announcement");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter announcement title"
          required
        />
      </div>

      <div>
        <Label htmlFor="content">Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter announcement content"
          rows={5}
          required
        />
      </div>

      <div>
        <Label htmlFor="department">Department *</Label>
        <Select
          value={formData.department}
          onValueChange={(value) => setFormData({ ...formData, department: value })}
          disabled={loadingDepts}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingDepts ? "Loading departments..." : "Select department"} />
          </SelectTrigger>
          <SelectContent>
            {departments
              .filter((dept) => dept.isActive)
              .map((dept) => (
                <SelectItem key={dept._id} value={dept._id}>
                  {dept.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={formData.priority}
          onValueChange={(value) => setFormData({ ...formData, priority: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="isPinned">Pin Announcement</Label>
        <Switch
          id="isPinned"
          checked={formData.isPinned}
          onCheckedChange={(checked) => setFormData({ ...formData, isPinned: checked })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label htmlFor="sendNotifications">Send Notifications</Label>
        <Switch
          id="sendNotifications"
          checked={formData.sendNotifications}
          onCheckedChange={(checked) => setFormData({ ...formData, sendNotifications: checked })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : announcement ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  );
}
