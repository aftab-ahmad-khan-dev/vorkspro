import React, { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Upload, FileDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiGet } from "@/interceptor/interceptor";
import { toast } from "sonner";
import { jsPDF } from "jspdf";

const DEFAULT_ORG = {
  name: "VorksPro",
  email: "",
  phone: "",
  address: "",
};

export function InvoiceDialog() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [currency, setCurrency] = useState("$");
  const [rows, setRows] = useState([{ milestone: "", pricing: 0 }]);
  const [terms, setTerms] = useState("");
  const [note, setNote] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [org, setOrg] = useState(DEFAULT_ORG);

  useEffect(() => {
    (async () => {
      try {
        const [clientsRes, projectsRes] = await Promise.all([
          apiGet("client/get-active-client"),
          apiGet("project/get-all"),
        ]);
        if (clientsRes?.isSuccess && clientsRes?.filteredData?.clients) setClients(clientsRes.filteredData.clients);
        if (projectsRes?.isSuccess && projectsRes?.filteredData?.projects)
          setProjects(projectsRes.filteredData.projects);
      } catch (e) {
        toast.error("Failed to load clients or projects");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setRows([{ milestone: "", pricing: 0 }]);
      return;
    }
    setLoading(true);
    apiGet(`milestone/get-by-project/${selectedProjectId}`)
      .then((data) => {
        const list = data?.milestones || [];
        if (list.length) {
          setRows(
            list.map((m) => {
              const label = [m.name, m.description].filter(Boolean).join(" – ");
              return { milestone: label || "", pricing: Number(m.cost) || 0 };
            })
          );
        } else {
          setRows([{ milestone: "", pricing: 0 }]);
        }
      })
      .catch(() => setRows([{ milestone: "", pricing: 0 }]))
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const selectedClient = clients.find((c) => c._id === selectedClientId);
  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const updateRow = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: field === "pricing" ? Number(value) || 0 : value };
      return next;
    });
  };

  const addRow = () => setRows((prev) => [...prev, { milestone: "", pricing: 0 }]);
  const removeRow = (index) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = rows.reduce((sum, r) => sum + (Number(r.pricing) || 0), 0);

  const generatePdf = () => {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 18;

    const theme = {
      black: [0.09, 0.09, 0.11],
      gray: [0.45, 0.45, 0.5],
      blue: [0.2, 0.4, 0.8],
      green: [0.2, 0.6, 0.4],
      lightGray: [0.96, 0.96, 0.97],
    };

    if (logoDataUrl) {
      try {
        doc.addImage(logoDataUrl, "PNG", 18, y, 28, 14);
      } catch {
        doc.setFontSize(16).setTextColor(...theme.blue);
        doc.text(org.name || "VorksPro", 18, y + 8);
      }
      y += 20;
    } else {
      doc.setFontSize(16).setFont(undefined, "bold").setTextColor(...theme.blue);
      doc.text(org.name || "VorksPro", 18, y + 6);
      y += 14;
    }

    doc.setFontSize(9).setFont(undefined, "normal").setTextColor(...theme.gray);
    if (org.email) doc.text(org.email, 18, y), (y += 5);
    if (org.phone) doc.text(org.phone, 18, y), (y += 5);
    if (org.address) doc.text(org.address, 18, y), (y += 6);
    y += 6;

    doc.setFontSize(14).setFont(undefined, "bold").setTextColor(...theme.black);
    doc.text("INVOICE", pageW - 18, 22, { align: "right" });
    doc.setFontSize(9).setFont(undefined, "normal").setTextColor(...theme.gray);
    doc.text(`Invoice ID: INV-${Date.now().toString(36).toUpperCase()}`, pageW - 18, 28, { align: "right" });
    y = Math.max(y, 36);

    doc.setFontSize(10).setFont(undefined, "bold").setTextColor(...theme.black);
    doc.text("Bill To", 18, y);
    y += 6;
    doc.setFont(undefined, "normal").setTextColor(...theme.gray);
    if (selectedClient) {
      doc.text(selectedClient.name || "—", 18, y);
      y += 5;
      if (selectedClient.contactName) doc.text(selectedClient.contactName, 18, y), (y += 5);
      if (selectedClient.email) doc.text(selectedClient.email, 18, y), (y += 5);
      if (selectedClient.phone) doc.text(selectedClient.phone, 18, y), (y += 5);
      const addr = selectedClient.address;
      if (addr && (addr.street || addr.city)) {
        const addrStr = [addr.street, addr.city, addr.state, addr.country].filter(Boolean).join(", ");
        if (addrStr) doc.text(addrStr, 18, y), (y += 5);
      }
    } else {
      doc.text("—", 18, y);
      y += 6;
    }
    y += 6;

    doc.setFont(undefined, "bold").setTextColor(...theme.black);
    doc.text("Project / Invoice Details", 18, y);
    y += 6;
    doc.setFont(undefined, "normal").setTextColor(...theme.gray);
    doc.text(`Title: ${invoiceTitle || (selectedProject?.name || "—")}`, 18, y);
    y += 5;
    doc.text(`Date: ${invoiceDate}`, 18, y);
    y += 5;
    doc.text(`Due: ${dueDate}`, 18, y);
    y += 8;

    doc.setFillColor(...theme.lightGray);
    doc.rect(18, y, pageW - 36, 8);
    doc.setFontSize(10).setFont(undefined, "bold").setTextColor(...theme.black);
    doc.text("#", 22, y + 5.5);
    doc.text("Milestone", 28, y + 5.5);
    doc.text(`Pricing (${currency})`, pageW - 35, y + 5.5, { align: "right" });
    y += 10;

    doc.setFont(undefined, "normal").setTextColor(...theme.black);
    rows.forEach((r, i) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      const line = `${r.milestone || "—"}`;
      const price = `${currency}${(Number(r.pricing) || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
      doc.text(String(i + 1), 22, y + 4);
      doc.text(doc.splitTextToSize(line, pageW - 70)[0] || "—", 28, y + 4);
      doc.text(price, pageW - 22, y + 4, { align: "right" });
      y += 7;
    });
    y += 6;

    doc.setFont(undefined, "bold").setTextColor(...theme.green);
    doc.text(`Subtotal: ${currency}${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, pageW - 22, y, { align: "right" });
    y += 7;
    doc.setFontSize(11).setTextColor(...theme.blue);
    doc.text(`Total: ${currency}${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, pageW - 22, y, { align: "right" });
    y += 12;

    if (terms) {
      if (y > 250) doc.addPage(), (y = 18);
      doc.setFontSize(9).setFont(undefined, "bold").setTextColor(...theme.black);
      doc.text("Terms and Conditions", 18, y);
      y += 5;
      doc.setFont(undefined, "normal").setTextColor(...theme.gray);
      doc.text(doc.splitTextToSize(terms, pageW - 36), 18, y);
      y += doc.splitTextToSize(terms, pageW - 36).length * 5 + 4;
    }
    if (note) {
      if (y > 250) doc.addPage(), (y = 18);
      doc.setFont(undefined, "bold").setTextColor(...theme.black);
      doc.text("Note", 18, y);
      y += 5;
      doc.setFont(undefined, "normal").setTextColor(...theme.gray);
      doc.text(doc.splitTextToSize(note, pageW - 36), 18, y);
      y += 8;
    }

    doc.setFontSize(8).setTextColor(...theme.gray);
    doc.text("This invoice was generated by VorksPro.", pageW / 2, doc.internal.pageSize.getHeight() - 10, { align: "center" });

    doc.save(`VorksPro-Invoice-${invoiceDate}.pdf`);
    toast.success("Invoice PDF downloaded");
  };

  return (
    <div className="space-y-6 py-2 text-[var(--foreground)]">
      <p className="text-sm text-[var(--muted-foreground)]">
        Client, project, and milestones from the platform. Add your branding and generate a PDF invoice.
      </p>

      {/* Branding */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]/50 p-4 space-y-3">
        <h3 className="text-sm font-semibold">Organization branding (VorksPro)</h3>
        <div className="flex flex-wrap gap-4 items-start">
          <div>
            <Label className="text-xs text-[var(--muted-foreground)]">Logo (optional)</Label>
            <div className="mt-1 flex items-center gap-2">
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)]/50 text-sm">
                <Upload className="h-4 w-4" /> Upload image
                <input type="file" accept="image/*" className="hidden" onChange={onLogoChange} />
              </label>
              {logoDataUrl && (
                <img src={logoDataUrl} alt="Logo" className="h-10 object-contain rounded border border-[var(--border)]" />
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 min-w-[200px]">
            <div>
              <Label className="text-xs">Company name</Label>
              <Input
                value={org.name}
                onChange={(e) => setOrg((o) => ({ ...o, name: e.target.value }))}
                placeholder="VorksPro"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={org.email}
                onChange={(e) => setOrg((o) => ({ ...o, email: e.target.value }))}
                placeholder="info@vorkspro.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Phone</Label>
              <Input
                value={org.phone}
                onChange={(e) => setOrg((o) => ({ ...o, phone: e.target.value }))}
                placeholder="+1 234 567 8900"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">Address</Label>
              <Input
                value={org.address}
                onChange={(e) => setOrg((o) => ({ ...o, address: e.target.value }))}
                placeholder="Address"
                className="mt-1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Client, Project, Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Client *</Label>
          <Select value={selectedClientId} onValueChange={setSelectedClientId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((c) => (
                <SelectItem key={c._id} value={c._id}>{c.name || c.contactName || c._id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Project</Label>
          <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p._id} value={p._id}>{p.name || p._id}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="sm:col-span-2">
          <Label>Invoice title / Project info *</Label>
          <Input
            value={invoiceTitle}
            onChange={(e) => setInvoiceTitle(e.target.value)}
            placeholder="e.g. Project Alpha – Phase 1"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Invoice date</Label>
          <Input type="date" value={invoiceDate} onChange={(e) => setInvoiceDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Due date</Label>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1" />
        </div>
        <div>
          <Label>Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger className="mt-1 w-24">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$">$</SelectItem>
              <SelectItem value="€">€</SelectItem>
              <SelectItem value="£">£</SelectItem>
              <SelectItem value="PKR">PKR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Milestone & Pricing table */}
      <div className="rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="bg-[var(--muted)]/50 px-4 py-2 border-b border-[var(--border)]">
          <span className="text-sm font-medium">Milestones & pricing</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 px-4 w-10">#</th>
                <th className="text-left py-2 px-4">Milestone</th>
                <th className="text-right py-2 px-4 w-32">Pricing</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[var(--border)]/70">
                  <td className="py-1.5 px-4 text-[var(--muted-foreground)]">{i + 1}</td>
                  <td className="py-1.5 px-4">
                    <Input
                      value={row.milestone}
                      onChange={(e) => updateRow(i, "milestone", e.target.value)}
                      placeholder="Milestone name or description"
                      className="h-8 text-sm border-[var(--border)]"
                    />
                  </td>
                  <td className="py-1.5 px-4 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={row.pricing || ""}
                      onChange={(e) => updateRow(i, "pricing", e.target.value)}
                      placeholder="0"
                      className="h-8 text-sm text-right border-[var(--border)] w-28"
                    />
                  </td>
                  <td className="py-1.5">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-[var(--muted-foreground)]"
                      onClick={() => removeRow(i)}
                      disabled={rows.length <= 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t border-[var(--border)]">
          <Button type="button" variant="outline" size="sm" onClick={addRow} className="border-[var(--border)]">
            <Plus className="h-4 w-4 mr-2" /> Add row
          </Button>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)] flex justify-end gap-6 text-sm">
          <span className="text-[var(--muted-foreground)]">Subtotal: <strong className="text-[var(--foreground)]">{currency}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
          <span className="font-semibold text-[var(--primary)]">Total: {currency}{subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Terms and conditions (optional)</Label>
          <Textarea value={terms} onChange={(e) => setTerms(e.target.value)} placeholder="Payment terms, etc." className="mt-1 min-h-[80px]" />
        </div>
        <div>
          <Label>Invoice note (optional)</Label>
          <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Thank you message or notes" className="mt-1 min-h-[80px]" />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button onClick={generatePdf} className="bg-[var(--button)] text-[var(--primary-foreground)]">
          <FileDown className="mr-2 h-4 w-4" /> Generate invoice PDF
        </Button>
      </div>
    </div>
  );
}
