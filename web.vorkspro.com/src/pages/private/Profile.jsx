import React, { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { jwtDecode } from "jwt-decode";
import { apiGet } from "@/interceptor/interceptor";

function Profile() {
  const [activeTab, setActiveTab] = useState("personalInfo");
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [employee, setEmployee] = useState(null);
  const [originalEmployee, setOriginalEmployee] = useState(null);

  const baseUrl = import.meta.env.VITE_APP_BASE_URL;
  let token = localStorage.getItem("token");

  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: "",
      lastName: "",
      personalEmail: "",
      companyEmail: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: "",
      languageSpoken: "",
    },
    employment: {
      employeeId: "",
      joinDate: "",
      department: "",
      subDepartment: "",
      jobTitle: "",
      employmentType: "",
      workLocation: "",
      reportingManager: "",
      probationPeriodInMonths: "",
      noticePeriod: "",
    },
    compensation: {
      baseSalary: "",
    },
    educationSkills: {
      skills: "",
      certifications: "",
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const applyEmployeeToState = (emp) => {
    if (!emp) return;
    setEmployee(emp);
    setOriginalEmployee(emp);
    setFormData({
      personalInfo: {
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        personalEmail: (emp.email || "").replace(/[<>]/g, ""),
        companyEmail: (emp.companyEmail || "").replace(/[<>]/g, ""),
        phoneNumber: emp.phone || "",
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.split("T")[0] : "",
        gender: emp.gender || "",
        languageSpoken: Array.isArray(emp.languageSpoken)
          ? emp.languageSpoken.join(", ")
          : "",
      },
      employment: {
        employeeId: emp.employeeId || "",
        joinDate: emp.joinDate ? emp.joinDate.split("T")[0] : "",
        department: emp.department?.name || emp.department || "",
        subDepartment: emp.subDepartment?.name || emp.subDepartment || "",
        jobTitle: emp.jobTitle || "",
        employmentType: emp.employmentType || "",
        workLocation: emp.workLocation || "",
        reportingManager: emp.reportingManager || "None",
        probationPeriodInMonths: emp.probationPeriodInMonths?.toString() || "",
        noticePeriod: emp.noticePeriod?.toString() || "",
      },
      compensation: {
        baseSalary: emp.baseSalary?.toString() || "",
      },
      educationSkills: {
        skills: Array.isArray(emp.education?.skills)
          ? emp.education.skills.join(", ")
          : "",
        certifications: Array.isArray(emp.education?.certifications)
          ? emp.education.certifications.join(", ")
          : "",
      },
    });
  };

  const loadEmployeeFromToken = async () => {
    if (!token) {
      toast.error("No authentication token found. Please log in again.");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      let emp = decoded.employee;

      // Fallback: always hit /user/me so we can inspect both user & employee
      const response = await apiGet("user/me");
      const payload = response?.data || {};

      if (!emp && payload.employee) {
        emp = payload.employee;
      }

      // If still no employee but we have a user, build a minimal profile
      if (!emp && payload.user) {
        const u = payload.user;
        emp = {
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          email: u.email || "",
          phone: u.phone || "",
        };
        toast.info(
          "Showing basic user profile. This account is not yet linked to an employee record."
        );
      }

      if (!emp) {
        toast.error(
          "Employee information not found. Please ensure your account is linked to an employee record, or contact your admin."
        );
        return;
      }

      applyEmployeeToState(emp);
    } catch (error) {
      console.error("Invalid token or profile fetch:", error);
      toast.error("Session expired or invalid. Please log in again.");
    }
  };

  useEffect(() => {
    loadEmployeeFromToken();

    const activeRoute = window.location.pathname;
    localStorage.setItem("activeRoute", activeRoute);
  }, []);

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleCancel = () => {
    setIsEditing(false);
    loadEmployeeFromToken(); // Reset to original token data
  };

  const handleSave = async () => {
    if (!token) {
      toast.error("Employee information not found in session. Please log in again.");
      return;
    }

    setIsSaving(true);

    try {
      const updatePayload = {
        firstName: formData.personalInfo.firstName.trim(),
        lastName: formData.personalInfo.lastName.trim(),
        phone: formData.personalInfo.phoneNumber.trim(),
        dateOfBirth: formData.personalInfo.dateOfBirth
          ? new Date(formData.personalInfo.dateOfBirth).toISOString()
          : employee?.dateOfBirth,
        gender: formData.personalInfo.gender.toLowerCase(),
        languageSpoken: formData.personalInfo.languageSpoken
          .split(",")
          .map((l) => l.trim())
          .filter(Boolean),
        education: {
          skills: formData.educationSkills.skills
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          certifications: formData.educationSkills.certifications
            .split(",")
            .map((c) => c.trim())
            .filter(Boolean),
        },
      };

      const response = await fetch(`${baseUrl}employee/update-profile`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatePayload),
      });

      const result = await response.json();

      if (!response.ok || !result.isSuccess) {
        throw new Error(result.message || "Failed to update profile");
      }

      // If backend returns a new token, update it
      if (result.token) {
        localStorage.setItem("token", result.token);
        token = result.token;
        toast.success("Profile updated and session refreshed!");
      } else {
        toast.success("Profile updated successfully");
      }

      // Reload data from the new/current token
      loadEmployeeFromToken();

      setIsEditing(false);
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full text-[var(--foreground)] pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold">My Profile</h1>
          <p className="mt-1 text-sm sm:text-base text-[var(--muted-foreground)]">
            View and edit your personal information
          </p>
        </div>

        <div className="flex justify-center sm:justify-end w-full sm:w-auto">
          {isEditing ? (
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button onClick={handleCancel} disabled={isSaving} variant="outline">
                Cancel
              </Button>
            </div>
          ) : (
            <Button onClick={handleEditToggle}>Edit Profile</Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="hidden sm:flex mb-6 rounded-2xl bg-[var(--foreground)]/10">
          <TabsTrigger value="personalInfo">Personal Info</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="compensation">Compensation</TabsTrigger>
          <TabsTrigger value="educationSkills">Education & Skills</TabsTrigger>
        </TabsList>

        <div className="sm:hidden mb-4">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger>
              <SelectValue placeholder="Select section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="personalInfo">Personal Info</SelectItem>
              <SelectItem value="employment">Employment</SelectItem>
              <SelectItem value="compensation">Compensation</SelectItem>
              <SelectItem value="educationSkills">Education & Skills</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="personalInfo">
          <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-1 block">First Name</label>
                {isEditing ? (
                  <Input
                    value={formData.personalInfo.firstName}
                    onChange={(e) => handleInputChange("personalInfo", "firstName", e.target.value)}
                  />
                ) : (
                  <p className="text-[var(--muted-foreground)]">{formData.personalInfo.firstName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Last Name</label>
                {isEditing ? (
                  <Input
                    value={formData.personalInfo.lastName}
                    onChange={(e) => handleInputChange("personalInfo", "lastName", e.target.value)}
                  />
                ) : (
                  <p className="text-[var(--muted-foreground)]">{formData.personalInfo.lastName}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Personal Email</label>
                <p className="text-[var(--muted-foreground)]">{formData.personalInfo.personalEmail}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Company Email</label>
                <p className="text-[var(--muted-foreground)]">{formData.personalInfo.companyEmail}</p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Phone Number</label>
                {isEditing ? (
                  <Input
                    value={formData.personalInfo.phoneNumber}
                    onChange={(e) => handleInputChange("personalInfo", "phoneNumber", e.target.value)}
                    placeholder="+923001234567"
                  />
                ) : (
                  <p className="text-[var(--muted-foreground)]">{formData.personalInfo.phoneNumber || "-"}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Date of Birth</label>
                {isEditing ? (
                  <Input
                    type="date"
                    value={formData.personalInfo.dateOfBirth}
                    onChange={(e) => handleInputChange("personalInfo", "dateOfBirth", e.target.value)}
                  />
                ) : (
                  <p className="text-[var(--muted-foreground)]">{formatDate(employee.dateOfBirth)}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Gender</label>
                {isEditing ? (
                  <Select
                    value={formData.personalInfo.gender}
                    onValueChange={(val) => handleInputChange("personalInfo", "gender", val)}
                  >
                    <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-[var(--muted-foreground)] capitalize">{formData.personalInfo.gender || "-"}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Languages Spoken</label>
                {isEditing ? (
                  <Input
                    value={formData.personalInfo.languageSpoken}
                    onChange={(e) => handleInputChange("personalInfo", "languageSpoken", e.target.value)}
                    placeholder="English, Urdu, Arabic"
                  />
                ) : (
                  <p className="text-[var(--muted-foreground)]">{formData.personalInfo.languageSpoken || "None"}</p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="employment">
          <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Employment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium">Employee ID</label>
                <p>{formData.employment.employeeId}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Join Date</label>
                <p>{formatDate(employee.joinDate)}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Department</label>
                <p>{formData.employment.department}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Sub Department</label>
                <p>{formData.employment.subDepartment}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <p>{formData.employment.jobTitle}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Employment Type</label>
                <p className="capitalize">{formData.employment.employmentType}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Work Location</label>
                <p className="capitalize">{formData.employment.workLocation}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Reporting Manager</label>
                <p>{formData.employment.reportingManager}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Probation Period</label>
                <p>{formData.employment.probationPeriodInMonths} months</p>
              </div>
              <div>
                <label className="text-sm font-medium">Notice Period</label>
                <p>{formData.employment.noticePeriod} days</p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compensation">
          <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Salary & Compensation</h2>
            <div className="bg-[var(--background)] border p-6 rounded-lg">
              <p className="text-sm font-medium text-[var(--muted-foreground)]">Current Base Salary</p>
              <p className="text-4xl font-bold mt-2">
                ${employee.baseSalary?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="educationSkills">
          <div className="border border-[var(--border)] rounded-lg p-6 space-y-6">
            <h2 className="text-xl font-semibold">Education & Skills</h2>
            <div>
              <label className="text-sm font-medium mb-2 block">Skills</label>
              {isEditing ? (
                <Input
                  value={formData.educationSkills.skills}
                  onChange={(e) => handleInputChange("educationSkills", "skills", e.target.value)}
                  placeholder="React, Node.js, TypeScript"
                />
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  {formData.educationSkills.skills || "No skills listed"}
                </p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Certifications</label>
              {isEditing ? (
                <Input
                  value={formData.educationSkills.certifications}
                  onChange={(e) => handleInputChange("educationSkills", "certifications", e.target.value)}
                  placeholder="AWS Certified, PMP"
                />
              ) : (
                <p className="text-[var(--muted-foreground)]">
                  {formData.educationSkills.certifications || "No certifications listed"}
                </p>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Profile;