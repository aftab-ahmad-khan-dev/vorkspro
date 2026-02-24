import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DraftingCompass, Eye, EyeOff, Plus, Save, Trash2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { DatePicker } from "@/components/DatePicker";
import { apiPatch, apiPost } from "@/interceptor/interceptor";
import CustomTooltip from "@/components/Tooltip";

function CreateDialog({
  roles,
  employee,
  onSuccess,
  departments,
  allEmployees,
  totalEmployees,
  leaves,
}) {
  const isEditMode = !!employee;
  const [formData, setFormData] = useState({});
  const [subDepartments, setSubDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Load draft data if not in edit mode and no employee data
    const draftData = !isEditMode && !employee ? JSON.parse(localStorage.getItem('employeeDraft') || '{}') : {};

    setFormData({
      userName: employee?.username || draftData.userName || "",
      password: draftData.password || "",
      confirmPassword: draftData.confirmPassword || "",
      role: employee?.user?.role || draftData.role || "",
      firstName: employee?.firstName || draftData.firstName || "",
      lastName: employee?.lastName || draftData.lastName || "",
      companyEmail: employee?.companyEmail || draftData.companyEmail || "",
      email: employee?.email || draftData.email || "",
      phone: employee?.phone || draftData.phone || "",
      dateOfBirth: employee?.dateOfBirth
        ? new Date(employee.dateOfBirth)
        : draftData.dateOfBirth ? new Date(draftData.dateOfBirth) : null,
      gender: employee?.gender || draftData.gender || "",
      employeeId:
        employee?.employeeId || draftData.employeeId ||
        String(totalEmployees + 1 || 1).padStart(5, "0"),
      joinDate: employee?.joinDate ? new Date(employee.joinDate) : draftData.joinDate ? new Date(draftData.joinDate) : null,
      department: employee?.department?._id || draftData.department || "",
      subDepartment: employee?.subDepartment?._id || draftData.subDepartment || "",
      jobTitle: employee?.jobTitle || draftData.jobTitle || "",
      employmentType: employee?.employmentType || draftData.employmentType || "",
      workLocation: employee?.workLocation || draftData.workLocation || "",
      reportingManager: employee?.reportingManager || draftData.reportingManager || "",

      probationPeriodInMonths: isEditMode
        ? (employee?.probationPeriodInMonths ?? draftData.probationPeriodInMonths ?? 0)
        : (employee?.probationPeriodInMonths || draftData.probationPeriodInMonths || ""),

      noticePeriod: isEditMode
        ? (employee?.noticePeriod ?? draftData.noticePeriod ?? 0)
        : (employee?.noticePeriod || draftData.noticePeriod || ""),

      baseSalary: isEditMode
        ? (employee?.baseSalary ?? draftData.baseSalary ?? 0)
        : (employee?.baseSalary || draftData.baseSalary || ""),

      allowances: employee?.allowances || draftData.allowances || [],
      leaveAllocation: employee?.leaveAllocation || draftData.leaveAllocation || [],
      notes: employee?.notes || draftData.notes || "",
    });

    const currentDept = departments?.find(
      (d) => d._id === (employee?.department?._id || draftData.department)
    );
    if (currentDept?.subDepartments) {
      setSubDepartments(currentDept.subDepartments);
    }
  }, [employee, departments, totalEmployees, isEditMode]);

  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "employee";
  const token = localStorage.getItem("token");

  const requiredFields = [
    "email",
    "joinDate",
    "department",
    "subDepartment",
    "jobTitle",
    "employmentType",
    "workLocation",
    "probationPeriodInMonths",
    "noticePeriod",
    "gender"
  ];

  if (!isEditMode) {
    requiredFields.push("password");
    requiredFields.push("confirmPassword");
    requiredFields.push("baseSalary");
  }

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "department") {
      const selectedDept = departments.find((d) => d._id === value);
      const subs = selectedDept?.subDepartments || [];
      setSubDepartments(subs);
      const subStillValid = subs.some(
        (sub) => sub._id === formData.subDepartment
      );
      if (!subStillValid) {
        setFormData((prev) => ({ ...prev, subDepartment: "" }));
      }
    }
  };

  const validateForm = () => {
    const missing = requiredFields.filter((field) => {
      // ✅ Skip validation for probation & notice if 0 or less
      if (
        (field === "probationPeriodInMonths" || field === "noticePeriod") &&
        Number(formData[field]) <= 0
      ) {
        return false;
      }

      return !formData[field];
    });

    if (missing.length > 0) {
      toast.error("Please fill all required fields");
      console.log(missing)
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const addLeaveFields = () => {
    setFormData((prev) => ({
      ...prev,
      leaveAllocation: [
        ...(prev?.leaveAllocation || []),
        { leaveType: "", totalDays: "", remainingDays: "", utilizedDays: "" },
      ],
    }));
  };

  const deleteLeaveField = (index) => {
    setFormData((prev) => ({
      ...prev,
      leaveAllocation: prev.leaveAllocation.filter((_, i) => i !== index),
    }));
  };

  const handleLeaveChange = (index, key, value) => {
    const updated = [...formData.leaveAllocation];
    updated[index][key] = value;
    setFormData((prev) => ({ ...prev, leaveAllocation: updated }));
  };

  const handleDraft = () => {
    const draftPayload = { ...formData };
    draftPayload.dateOfBirth = formData.dateOfBirth ? formData.dateOfBirth.toISOString() : null;
    draftPayload.joinDate = formData.joinDate ? formData.joinDate.toISOString() : null;

    localStorage.setItem('employeeDraft', JSON.stringify(draftPayload));
    toast.success("Draft saved successfully!");
  };

  async function handleSubmit() {
    if (!validateForm()) return;

    const payload = { ...formData };
    payload.dateOfBirth = formData.dateOfBirth
      ? formData.dateOfBirth.toISOString()
      : "";
    payload.joinDate = formData.joinDate ? formData.joinDate.toISOString() : "";

    if (isEditMode && !payload.password) {
      delete payload.password;
      delete payload.confirmPassword;
    }

    if (!payload.reportingManager) {
      delete payload.reportingManager;
    }

    const url = isEditMode
      ? `update/${employee._id}`
      : `create`;
    const method = isEditMode ? "PATCH" : "POST";

    try {
      setLoading(true);
      let data = {};
      if (method === "PATCH") {
        data = await apiPatch('employee/' + url, payload);
      } else if (method === "POST") {
        data = await apiPost('employee/' + url, payload);
      }

      if (data.isSuccess) {
        setLoading(false);
        // Clear draft on successful creation
        if (!isEditMode) {
          localStorage.removeItem('employeeDraft');
        }
        toast.success(
          isEditMode
            ? "Employee updated successfully!"
            : "Employee created successfully!"
        );
        onSuccess?.();
      } else {
        toast.error(data.message || "Operation failed");
        setLoading(false);
      }
    } catch (error) {
      console.log(error)
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  }

  function subHeading(title, icons = false) {
    return (
      <div className="col-span-2">
        <div className="border-b border-b-[var(--border)] py-1 font-semibold text-[var(--text)]">
          <div className="flex justify-between">
            {title}
            {icons && (
              <Button onClick={addLeaveFields} className="border-button">
                <Plus className="text-[var(--button)]" />
                Add Leave
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {!isEditMode && (
          <>
            {subHeading("Portal Login Credentials")}
            <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-[var(--text)]">
                Personal Email <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter personal email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
              <div className={`flex flex-col space-y-2 col-span-2 sm:col-span-1 ${isEditMode ? 'sm:col-span-2' : ''}`}>
          <label className="text-sm font-medium text-[var(--text)]">
            User Role <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange("role", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select user role" />
            </SelectTrigger>
            <SelectContent>
              {roles?.length > 0 ? (
                roles.map((role) => (
                  <SelectItem key={role._id} value={role._id}>
                    {role.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem disabled value="none">
                  No roles available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
            <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-[var(--text)]">
                Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-[var(--text)]">
                Confirm Password <span className="text-red-500">*</span>
              </label>

              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="pr-10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowConfirmPassword((prev) => !prev)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

          </>
        )}

      

        {subHeading("Personal Information")}
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            First Name
          </label>
          <Input
            placeholder="Enter first name"
            value={formData.firstName}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Last Name
          </label>
          <Input
            placeholder="Enter last name"
            value={formData.lastName}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Company Email
          </label>
          <Input
            type="email"
            placeholder="Enter company email"
            value={formData.companyEmail}
            onChange={(e) => handleChange("companyEmail", e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Phone Number
          </label>
          <Input
            placeholder="Enter phone number"
            value={formData.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
          />
        </div>
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Date of Birth
          </label>
          <DatePicker
            date={formData?.dateOfBirth}
            maxDate={new Date()}
            setDate={(date) => handleChange("dateOfBirth", date)}
            placeholder="Select date of birth"
          />
        </div>
        <div className="flex flex-col space-y-2 col-span-2 sm:col-span-1">
          <label className="text-sm font-medium text-[var(--text)]">
            Gender <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.gender}
            onValueChange={(value) => handleChange("gender", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {subHeading("Leave Allocation", true)}
        {formData.leaveAllocation?.map((field, index) => (
          <div
            key={index}
            className="col-span-2 relative grid grid-cols-1 md:grid-cols-2 gap-4 border border-[var(--border)] rounded-xl p-3"
          >
            <div className="flex flex-col gap-4 col-span-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">Leave Type</label>
                <Select
                  value={field.leaveType?._id || field.leaveType}
                  onValueChange={(value) =>
                    handleLeaveChange(index, "leaveType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select leave type" />
                  </SelectTrigger>
                  <SelectContent>
                    {leaves
                      ?.filter(
                        (leave) =>
                          leave._id === field.leaveType ||
                          !formData.leaveAllocation
                            .map((l) => l.leaveType)
                            .includes(leave._id)
                      )
                      .map((leave) => (
                        <SelectItem key={leave._id} value={leave._id}>
                          {leave.name} ({leave.daysAllowed} days)
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium">No. of Days</label>
                <Input
                  type="number"
                  placeholder="Enter days"
                  value={field.totalDays}
                  onChange={(e) =>
                    handleLeaveChange(index, "totalDays", e.target.value)
                  }
                />
              </div>
            </div>
            <div className="text-sm">
              Remaining days:{" "}
              <span className="text-green-500 font-semibold">
                {field.totalDays - (field.utilizedDays || 0)}
              </span>
            </div>
            <div className="text-sm">
              Utilized days:{" "}
              <span className="text-red-500 font-semibold">
                {field.utilizedDays || 0}
              </span>
            </div>
            <Button
              size="icon"
              className="bg-transparent text-[var(--button)] hover:bg-[var(--button)]/20 absolute top-0 right-2 rounded-full"
              onClick={() => deleteLeaveField(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {(!formData.leaveAllocation ||
          <div className="col-span-2 flex flex-col items-center justify-center py-10 text-center border border-dashed rounded-lg">
            <span className="text-base font-medium">{formData.leaveAllocation.length > 0 ? "" : " No leave allocation added yet!"}</span>
            <span className="text-sm opacity-80">
              {formData.leaveAllocation.length > 0 ? " Add more leave allocation " : " No leave allocation added yet!"}

            </span>
            <Button onClick={addLeaveFields} className="mt-3">
              Add Leave Allocation
            </Button>
          </div>
        )}

        {subHeading("Employment Details")}
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Employee ID
          </label>
          <Input
            placeholder="Enter employee ID"
            disabled={true}
            value={formData.employeeId}
            onChange={(e) => handleChange("employeeId", e.target.value)}
          />
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Join Date <span className="text-red-500">*</span>
          </label>
          <DatePicker
            date={formData.joinDate}
            simpleCalendar={true}
            maxDate={new Date()}
            setDate={(date) => handleChange("joinDate", date)}
            placeholder="Select join date"
          />
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Department <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departments?.map(
                (d) =>
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Sub Department <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.subDepartment}
            onValueChange={(v) =>
              handleChange("subDepartment", v === "none" ? "" : v)
            }
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select sub-department" />
            </SelectTrigger>
            <SelectContent>
              {subDepartments.length === 0 ? (
                <SelectItem value="none" disabled>
                  {formData.department
                    ? "No sub-departments"
                    : "Select department first"}
                </SelectItem>
              ) : (
                subDepartments.map((sub) => (
                  <SelectItem key={sub._id} value={sub._id}>
                    {sub.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Job Title <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter job title"
            value={formData.jobTitle}
            onChange={(e) => handleChange("jobTitle", e.target.value)}
          />
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.employmentType}
            onValueChange={(value) => handleChange("employmentType", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full time">Full-Time</SelectItem>
              <SelectItem value="part time">Part-Time</SelectItem>
              <SelectItem value="contract">Contract</SelectItem>
              <SelectItem value="intern">Intern</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Work Location <span className="text-red-500">*</span>
          </label>
          <Select
            value={formData.workLocation}
            onValueChange={(value) => handleChange("workLocation", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue placeholder="Select location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="remote">Remote</SelectItem>
              <SelectItem value="onsite">Onsite</SelectItem>
              <SelectItem value="hybrid">Hybrid</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Reporting Manager
          </label>
          <Select
            value={formData.reportingManager}
            onValueChange={(value) => handleChange("reportingManager", value)}
          >
            <SelectTrigger className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem>None</SelectItem>
              {allEmployees?.map((emp) => (
                <SelectItem key={emp._id} value={emp._id}>
                  {emp.firstName} {emp.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Probation Period (months) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 3"
            value={formData.probationPeriodInMonths}
            onChange={(e) =>
              handleChange("probationPeriodInMonths", e.target.value)
            }
          />
        </div>
        <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
          <label className="text-sm font-medium text-[var(--text)]">
            Notice Period (days) <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="e.g. 30"
            value={formData.noticePeriod}
            onChange={(e) => handleChange("noticePeriod", e.target.value)}
          />
        </div>

        {!isEditMode && (
          <div className="flex flex-col col-span-2 sm:col-span-1 space-y-2">
            <label className="text-sm font-medium text-[var(--text)]">
              Base Salary <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              placeholder="Enter base salary"
              value={formData.baseSalary}
              onChange={(e) => handleChange("baseSalary", e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        {!isEditMode && (
          <CustomTooltip tooltipContent="Save as Draft">
            <Button
              onClick={handleDraft}
              variant="outline"
              className="border-button"
            >
              <Save></Save>
            </Button>
          </CustomTooltip>
        )}
        <Button
          onClick={handleSubmit}
          className="bg-[var(--button)] text-white"
          disabled={loading}
        >
          {isEditMode && loading
            ? "Updating..."
            : isEditMode
              ? "Update Employee"
              : loading
                ? "Creating..."
                : "Create Employee"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
