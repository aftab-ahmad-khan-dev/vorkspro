import React, { useState, useEffect, useCallback, memo } from "react";
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

const DEFAULT_ORG = { name: "VorksPro", email: "", phone: "", address: "" };

export function InvoiceDialog() {
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [invoiceTitle, setInvoiceTitle] = useState("");
  const [invoiceDate, setInvoiceDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [dueDate, setDueDate] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );
  const [currency, setCurrency] = useState("$");

  const [rows, setRows] = useState([
    { id: crypto.randomUUID(), milestone: "", pricing: 0 },
  ]);

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
        if (clientsRes?.isSuccess && clientsRes?.filteredData?.clients)
          setClients(clientsRes.filteredData.clients);
        if (projectsRes?.isSuccess && projectsRes?.filteredData?.projects)
          setProjects(projectsRes.filteredData.projects);
      } catch {
        toast.error("Failed to load clients or projects");
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) {
      setRows([{ id: crypto.randomUUID(), milestone: "", pricing: 0 }]);
      return;
    }

    setLoading(true);
    apiGet(`milestone/get-by-project/${selectedProjectId}`)
      .then((data) => {
        const list = data?.milestones || [];
        setRows(
          list.length
            ? list.map((m) => ({
                id: crypto.randomUUID(),
                milestone: [m.name, m.description].filter(Boolean).join(" – ") || "",
                pricing: Number(m.cost) || 0,
              }))
            : [{ id: crypto.randomUUID(), milestone: "", pricing: 0 }],
        );
      })
      .catch(() => {
        setRows([{ id: crypto.randomUUID(), milestone: "", pricing: 0 }]);
      })
      .finally(() => setLoading(false));
  }, [selectedProjectId]);

  const selectedClient = clients.find((c) => c._id === selectedClientId);
  const selectedProject = projects.find((p) => p._id === selectedProjectId);

  const onLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/"))
      return toast.error("Please select an image file");

    const reader = new FileReader();
    reader.onload = () => setLogoDataUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const updateRow = useCallback((id, field, value) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              [field]: field === "pricing" ? Number(value) || 0 : value,
            }
          : r,
      ),
    );
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [
      ...prev,
      { id: crypto.randomUUID(), milestone: "", pricing: 0 },
    ]);
  }, []);

  const removeRow = useCallback((id) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const subtotal = rows.reduce((sum, r) => sum + (r.pricing || 0), 0);

  const MemoRow = memo(function MemoRow({
    row,
    index,
    updateRow,
    removeRow,
    rowsLength,
  }) {
    return (
      <tr className='border-b border-[var(--border)]/60 last:border-0'>
        <td className='py-2 px-3 text-[var(--muted-foreground)] text-xs'>
          {index + 1}
        </td>
        <td className='py-2 px-3'>
          <Input
            value={row.milestone}
            onChange={(e) => updateRow(row.id, "milestone", e.target.value)}
            placeholder='Describe this milestone'
            className='h-8 text-sm'
          />
        </td>
        <td className='py-2 px-3'>
          <Input
            type='number'
            min={0}
            step={0.01}
            value={row.pricing || ""}
            onChange={(e) => updateRow(row.id, "pricing", e.target.value)}
            placeholder='0.00'
            className='h-8 text-sm text-right w-full'
          />
        </td>
        <td className='py-2 px-2'>
          <Button
            type='button'
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-[var(--muted-foreground)] hover:text-red-500'
            onClick={() => removeRow(row.id)}
            disabled={rowsLength <= 1}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </td>
      </tr>
    );
  });

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
        doc
          .setFontSize(16)
          .setTextColor(...theme.blue)
          .text(org.name || "VorksPro", 18, y + 8);
      }
      y += 20;
    } else {
      doc
        .setFontSize(16)
        .setFont("helvetica", "bold")
        .setTextColor(...theme.blue);
      doc.text(org.name || "VorksPro", 18, y + 6);
      y += 14;
    }

    doc
      .setFontSize(9)
      .setFont("helvetica", "normal")
      .setTextColor(...theme.gray);
    if (org.email) {
      doc.text(org.email, 18, y);
      y += 5;
    }
    if (org.phone) {
      doc.text(org.phone, 18, y);
      y += 5;
    }
    if (org.address) {
      doc.text(org.address, 18, y);
      y += 6;
    }
    y += 6;

    doc
      .setFontSize(14)
      .setFont("helvetica", "bold")
      .setTextColor(...theme.black);
    doc.text("INVOICE", pageW - 18, 22, { align: "right" });

    doc
      .setFontSize(9)
      .setFont("helvetica", "normal")
      .setTextColor(...theme.gray);
    doc.text(
      `Invoice ID: INV-${Date.now().toString(36).toUpperCase()}`,
      pageW - 18,
      28,
      { align: "right" },
    );
    y = Math.max(y, 36);

    doc
      .setFontSize(10)
      .setFont("helvetica", "bold")
      .setTextColor(...theme.black);
    doc.text("Bill To", 18, y);
    y += 6;
    doc.setFont("helvetica", "normal").setTextColor(...theme.gray);

    if (selectedClient) {
      if (selectedClient.name) {
        doc.text(selectedClient.name, 18, y);
        y += 5;
      }
      if (selectedClient.contactName) {
        doc.text(selectedClient.contactName, 18, y);
        y += 5;
      }
      if (selectedClient.email) {
        doc.text(selectedClient.email, 18, y);
        y += 5;
      }
      if (selectedClient.phone) {
        doc.text(selectedClient.phone, 18, y);
        y += 5;
      }
      const addr = selectedClient.address;
      if (addr) {
        const addrStr = [addr.street, addr.city, addr.state, addr.country]
          .filter(Boolean)
          .join(", ");
        if (addrStr) {
          doc.text(addrStr, 18, y);
          y += 5;
        }
      }
    } else {
      doc.text("—", 18, y);
      y += 6;
    }
    y += 6;

    doc.setFont("helvetica", "bold").setTextColor(...theme.black);
    doc.text("Project / Invoice Details", 18, y);
    y += 6;
    doc.setFont("helvetica", "normal").setTextColor(...theme.gray);
    doc.text(`Title: ${invoiceTitle || selectedProject?.name || "—"}`, 18, y);
    y += 5;
    doc.text(`Date: ${invoiceDate}`, 18, y);
    y += 5;
    doc.text(`Due: ${dueDate}`, 18, y);
    y += 8;

    doc.setFillColor(...theme.lightGray);
    doc.rect(18, y, pageW - 36, 8);
    doc
      .setFontSize(10)
      .setFont("helvetica", "bold")
      .setTextColor(...theme.black);
    doc.text("#", 22, y + 5.5);
    doc.text("Milestone", 28, y + 5.5);
    doc.text(`Pricing (${currency})`, pageW - 35, y + 5.5, { align: "right" });
    y += 10;

    doc.setFont("helvetica", "normal").setTextColor(...theme.black);
    rows.forEach((r, i) => {
      if (y > 270) {
        doc.addPage();
        y = 18;
      }
      const price = `${currency}${(r.pricing || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
      doc.text(String(i + 1), 22, y + 4);
      doc.text(
        doc.splitTextToSize(r.milestone || "—", pageW - 70)[0] || "—",
        28,
        y + 4,
      );
      doc.text(price, pageW - 22, y + 4, { align: "right" });
      y += 7;
    });
    y += 6;

    doc.setFont("helvetica", "bold").setTextColor(...theme.green);
    doc.text(
      `Subtotal: ${currency}${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      pageW - 22,
      y,
      { align: "right" },
    );
    y += 7;
    doc.setFontSize(11).setTextColor(...theme.blue);
    doc.text(
      `Total: ${currency}${subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      pageW - 22,
      y,
      { align: "right" },
    );
    y += 12;

    if (terms) {
      if (y > 250) {
        doc.addPage();
        y = 18;
      }
      doc
        .setFontSize(9)
        .setFont("helvetica", "bold")
        .setTextColor(...theme.black);
      doc.text("Terms and Conditions", 18, y);
      y += 5;
      doc.setFont("helvetica", "normal").setTextColor(...theme.gray);
      const termLines = doc.splitTextToSize(terms, pageW - 36);
      doc.text(termLines, 18, y);
      y += termLines.length * 5 + 4;
    }

    if (note) {
      if (y > 250) {
        doc.addPage();
        y = 18;
      }
      doc
        .setFontSize(9)
        .setFont("helvetica", "bold")
        .setTextColor(...theme.black);
      doc.text("Note", 18, y);
      y += 5;
      doc.setFont("helvetica", "normal").setTextColor(...theme.gray);
      doc.text(doc.splitTextToSize(note, pageW - 36), 18, y);
    }

    doc.setFontSize(8).setTextColor(...theme.gray);
    doc.text(
      "This invoice was generated by VorksPro.",
      pageW / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    );

    doc.save(`VorksPro-Invoice-${invoiceDate}.pdf`);
    toast.success("Invoice PDF downloaded");
  };

  const Section = ({ step, title, subtitle, children }) => (
    <div className='rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden'>
      <div className='flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--muted)]/30'>
        <span className='flex items-center justify-center h-6 w-6 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] text-xs font-bold shrink-0'>
          {step}
        </span>
        <div className='flex-1 min-w-0'>
          <p className='text-sm font-semibold text-[var(--foreground)] leading-tight'>
            {title}
          </p>
          {subtitle && (
            <p className='text-[11px] text-[var(--muted-foreground)] truncate'>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      <div className='p-5'>{children}</div>
    </div>
  );

  return (
    <div className='space-y-5 py-2 text-[var(--foreground)]'>
      <Section
        step='1'
        title='Organisation branding'
        subtitle='Shown at the top of every generated PDF'
      >
        <div className='flex flex-col sm:flex-row gap-5'>
          <div className='shrink-0 space-y-2'>
            <Label className='text-xs text-[var(--muted-foreground)]'>Logo</Label>
            <label className='cursor-pointer flex flex-col items-center justify-center gap-2 w-28 h-28 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)]/40 transition-colors text-center text-xs text-[var(--muted-foreground)]'>
              {logoDataUrl ? (
                <img
                  src={logoDataUrl}
                  alt='Logo'
                  className='h-24 w-24 object-contain rounded-lg'
                />
              ) : (
                <>
                  <Upload className='h-5 w-5 mb-1 mx-auto' /> Upload image
                </>
              )}
              <input
                type='file'
                accept='image/*'
                className='hidden'
                onChange={onLogoChange}
              />
            </label>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1'>
            <div>
              <Label className='text-xs'>Company name</Label>
              <Input
                value={org.name}
                onChange={(e) => setOrg((o) => ({ ...o, name: e.target.value }))}
                placeholder='VorksPro'
                className='mt-1'
              />
            </div>
            <div>
              <Label className='text-xs'>Email</Label>
              <Input
                type='email'
                value={org.email}
                onChange={(e) => setOrg((o) => ({ ...o, email: e.target.value }))}
                placeholder='info@vorkspro.com'
                className='mt-1'
              />
            </div>
            <div>
              <Label className='text-xs'>Phone</Label>
              <Input
                value={org.phone}
                onChange={(e) => setOrg((o) => ({ ...o, phone: e.target.value }))}
                placeholder='+1 234 567 8900'
                className='mt-1'
              />
            </div>
            <div>
              <Label className='text-xs'>Address</Label>
              <Input
                value={org.address}
                onChange={(e) => setOrg((o) => ({ ...o, address: e.target.value }))}
                placeholder='City, Country'
                className='mt-1'
              />
            </div>
          </div>
        </div>
      </Section>

      <Section
        step='2'
        title='Client & project'
        subtitle={
          selectedClient && selectedProject
            ? `${selectedClient.name} · ${selectedProject.name}`
            : "Link this invoice to a client and project"
        }
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <Label className='text-xs'>Client *</Label>
            <Select value={selectedClientId} onValueChange={setSelectedClientId}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Select a client' />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name || c.contactName || c._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className='text-xs'>Project</Label>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className='mt-1'>
                <SelectValue placeholder='Select a project' />
              </SelectTrigger>
              <SelectContent>
                {projects.map((p) => (
                  <SelectItem key={p._id} value={p._id}>
                    {p.name || p._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section
        step='3'
        title='Invoice details'
        subtitle='Title, dates, and currency'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div className='sm:col-span-2'>
            <Label className='text-xs'>Invoice title *</Label>
            <Input
              value={invoiceTitle}
              onChange={(e) => setInvoiceTitle(e.target.value)}
              placeholder='e.g. Project Alpha – Phase 1'
              className='mt-1'
            />
          </div>

          <div>
            <Label className='text-xs'>Invoice date</Label>
            <Input
              type='date'
              value={invoiceDate}
              onChange={(e) => setInvoiceDate(e.target.value)}
              className='mt-1'
            />
          </div>
          <div>
            <Label className='text-xs'>Due date</Label>
            <Input
              type='date'
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className='mt-1'
            />
          </div>

          <div>
            <Label className='text-xs'>Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className='mt-1 w-36'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='$'>USD – $</SelectItem>
                <SelectItem value='€'>EUR – €</SelectItem>
                <SelectItem value='£'>GBP – £</SelectItem>
                <SelectItem value='PKR'>PKR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section
        step='4'
        title='Milestones & pricing'
        subtitle={
          loading
            ? "Loading milestones…"
            : `${rows.length} line item${rows.length !== 1 ? "s" : ""}`
        }
      >
        <div className='rounded-xl border border-[var(--border)] overflow-hidden'>
          <table className='w-full text-sm'>
            <thead>
              <tr className='bg-[var(--muted)]/50 border-b border-[var(--border)]'>
                <th className='text-left py-2 px-3 text-xs font-medium text-[var(--muted-foreground)] w-10'>
                  #
                </th>
                <th className='text-left py-2 px-3 text-xs font-medium text-[var(--muted-foreground)]'>
                  Milestone / description
                </th>
                <th className='text-right py-2 px-3 text-xs font-medium text-[var(--muted-foreground)] w-36'>
                  Amount ({currency})
                </th>
                <th className='w-10' />
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <MemoRow
                  key={row.id}
                  row={row}
                  index={index}
                  updateRow={updateRow}
                  removeRow={removeRow}
                  rowsLength={rows.length}
                />
              ))}
            </tbody>
          </table>

          <div className='flex items-center justify-between px-3 py-2 border-t border-[var(--border)] bg-[var(--muted)]/20'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={addRow}
              className='text-xs h-7'
            >
              <Plus className='h-3.5 w-3.5 mr-1' /> Add row
            </Button>
            <div className='flex items-center gap-6 text-sm pr-1'>
              <span className='text-[var(--muted-foreground)]'>
                Subtotal:{" "}
                <span className='font-medium text-[var(--foreground)]'>
                  {currency}
                  {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </span>
              <span className='font-bold text-[var(--primary)]'>
                Total: {currency}
                {subtotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Section>

      <Section
        step='5'
        title='Terms & notes'
        subtitle='Optional — appended at the bottom of the PDF'
      >
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <div>
            <Label className='text-xs'>Terms and conditions</Label>
            <Textarea
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder='e.g. Payment due within 30 days of invoice date.'
              className='mt-1 min-h-[90px] text-sm resize-none'
            />
          </div>
          <div>
            <Label className='text-xs'>Invoice note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder='e.g. Thank you for your business!'
              className='mt-1 min-h-[90px] text-sm resize-none'
            />
          </div>
        </div>
      </Section>

      <div className='flex justify-end pt-2'>
        <Button
          onClick={generatePdf}
          size='lg'
          className='bg-[var(--button)] text-[var(--primary-foreground)] gap-2'
        >
          <FileDown className='h-4 w-4' /> Generate invoice PDF
        </Button>
      </div>
    </div>
  );
}
