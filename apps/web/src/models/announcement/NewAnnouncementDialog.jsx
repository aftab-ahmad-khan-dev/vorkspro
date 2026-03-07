import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { apiPost, apiPatch } from "@/interceptor/interceptor";
import { toast } from "sonner";
import { Label } from '@/components/ui/label';
function NewAnnouncementDialog({ departments = [], onSuccess, onClose, announcement }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    department: '',
    subDepartment: '',
    priority: '',
    isPinned: false,
    sendEmail: false
  });
  const [loading, setLoading] = useState(false);
  const [subDepartments, setSubDepartments] = useState([]);
  const updateSubDepartments = (departmentId, selectedSubDepId = '') => {
    const selectedDept = departments.find(d => d._id === departmentId);
    const subs = selectedDept?.subDepartments || [];
    setSubDepartments(subs);
    setFormData(prev => ({
      ...prev,
      department: departmentId,
      subDepartment: selectedSubDepId
    }));
  };
  useEffect(() => {
    if (announcement && departments.length) {
      updateSubDepartments(
        announcement.department?._id || '',
        announcement.subDepartment?._id || ''
      );
      setFormData(prev => ({
        ...prev,
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || '',
        isPinned: announcement.isPinned || false,
        sendEmail: true
      }));
    }
  }, [announcement, departments]);
  const handleDepartmentChange = (value) => {
    updateSubDepartments(value);
  };
  const handleSubmit = async () => {
    if (!formData.title || !formData.content || !formData.priority) {
      toast.error('Please fill in all required fields');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: formData.title,
        content: formData.content,
        department: formData.department || undefined,
        subDepartment: formData.subDepartment || undefined,
        priority: formData.priority,
        isPinned: formData.isPinned,
        sendEmail: formData.sendEmail
      };
      if (announcement) {
        await apiPatch(`announcement/update/${announcement._id}`, payload);
        toast.success('Announcement updated successfully');
        onSuccess?.({ _id: announcement._id, ...payload });
      } else {
        const response = await apiPost('announcement/create', payload);
        toast.success('Announcement created successfully');
        onSuccess?.(response.announcement || payload);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save announcement');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Announcement Title
        </label>
        <Input
          placeholder="e.g., Q4 Company All-Hands Meeting"
          value={formData.title}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, title: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Content
        </label>
        <Textarea
          placeholder="Write your announcement..."
          className="h-24"
          value={formData.content}
          onChange={(e) =>
            setFormData(prev => ({ ...prev, content: e.target.value }))
          }
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Target Department
        </label>
        <Select value={formData.department} onValueChange={handleDepartmentChange}>
          <SelectTrigger className='w-full'>
            <SelectValue placeholder="Select department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map(dep => (
              <SelectItem key={dep._id} value={dep._id}>
                {dep.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {formData.department && subDepartments.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-text">
            Target Sub-Department
          </label>
          <Select
            value={formData.subDepartment}
            onValueChange={(value) =>
              setFormData(prev => ({ ...prev, subDepartment: value }))
            }
          >
            <SelectTrigger className='w-full'>
              <SelectValue placeholder="Select sub-department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem >None</SelectItem>
              {subDepartments.map(sub => (
                <SelectItem key={sub._id} value={sub._id}>
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text">
          Priority
        </label>
        <Select
          value={formData.priority}
          onValueChange={(value) =>
            setFormData(prev => ({ ...prev, priority: value }))
          }
        >
          <SelectTrigger className='w-full'>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label className="flex items-center space-x-2">
          <Checkbox
            checked={formData.isPinned}
            className="hover:cursor-pointer"
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, isPinned: checked }))
            }
          />
          <p className="text-sm cursor-pointer">Pin this announcement</p>
        </Label>
        <Label className="flex items-center space-x-2">
          <Checkbox
            checked={formData.sendEmail}
            className="hover:cursor-pointer"
            onCheckedChange={(checked) =>
              setFormData(prev => ({ ...prev, sendEmail: checked }))
            }
          />
          <p className="text-sm cursor-pointer">Send email notification</p>
        </Label>
      </div>
      <div className="flex justify-end gap-3">
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading
            ? announcement ? 'Updating...' : 'Posting...'
            : announcement ? 'Update Announcement' : 'Post Announcement'}
        </Button>
      </div>
    </div>
  );
}
export default NewAnnouncementDialog;