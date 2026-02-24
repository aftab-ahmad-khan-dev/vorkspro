import React, { useState } from "react";
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
import { toast } from "sonner";
import { DatePicker } from "@/components/DatePicker";
import { apiPost } from "@/interceptor/interceptor";

function CreateDialog({ transactionType = [], onSuccess }) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    transactionType: "",
    description: "",
    amount: "",
    date: null,
    category: "",
    notes: "",
    paymentMethod: "",
    invoiceId: "",
  });

  const filteredCategories = transactionType.filter(
    (item) => item?.type === form.transactionType
  );

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const requiredFields = [
    "transactionType",
    "amount",
    "date",
    "category",
    "paymentMethod",
  ];

  const validateForm = () => {
    const missing = requiredFields.filter((f) => !form[f]);
    if (missing.length > 0) {
      toast.error("Please fill all required fields");
      return false;
    }
    return true;
  };

  const baseUrl = import.meta.env.VITE_APP_BASE_URL + "transaction";
  const token = localStorage.getItem("token");

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const payload = {
      ...form,
      amount: Number(form.amount),
    };

    try {
      setLoading(true);
      const data = await apiPost("transaction/create", payload);
      setLoading(false);

      if (data.isSuccess) {
        toast.success("Transaction added successfully!");
        onSuccess?.();
      } else {
        toast.error(data.message || "Failed to add transaction");
      }
    } catch (err) {
      setLoading(false);
      toast.error("Network error. Please try again.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Transaction Type */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Transaction Type <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.transactionType}
          onValueChange={(value) => {
            handleChange("transactionType", value);
            handleChange("category", "");
          }}
        >
          <SelectTrigger className="w-full border border-border rounded-md p-2 text-foreground">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Description </label>
        <Input
          value={form.description}
          onChange={(e) => handleChange("description", e.target.value)}
          placeholder="e.g., Project Payment - Tech Corp"
          className="w-full"
        />
      </div>

      {/* Amount + Date */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Amount <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <Input
              type="number"
              value={form.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="12500"
              className="w-full pr-10 no-spinner"
            />

            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              $
            </span>
          </div>
        </div>
        <div className="space-y-2 ">
          <label className="text-sm font-medium text-foreground">Date <span className="text-red-500">*</span></label>
          {/* <Input
            type="date"
            value={form.date}
            onChange={(e) => handleChange("date", e.target.value)}
            className="w-full"
          /> */}
          <DatePicker placeholder="Pick a date" simpleCalendar={true} date={form.date} setDate={(date) => handleChange("date", date)}></DatePicker>
        </div>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Category <span className="text-red-500">*</span></label>

        <Select
          value={form.category}
          onValueChange={(value) => handleChange("category", value)}
          disabled={!form.transactionType}
        >
          <SelectTrigger className="w-full border border-border rounded-md p-2 text-foreground">
            <SelectValue placeholder="Select category" />
          </SelectTrigger>

          <SelectContent>
            {filteredCategories.length === 0 ? (
              <div className="px-3 py-2 text-foreground text-sm">
                Select a transaction type first
              </div>
            ) : (
              filteredCategories.map((item) => (
                <SelectItem key={item._id} value={item._id}>
                  {item.name}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Payment Method  <span className="text-red-500">*</span>
        </label>
        <Select
          value={form.paymentMethod}
          onValueChange={(value) => handleChange("paymentMethod", value)}
        >
          <SelectTrigger className="w-full border border-border rounded-md p-2 text-foreground">
            <SelectValue placeholder="Select method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bank transfer">Bank Transfer</SelectItem>
            <SelectItem value="check">Check</SelectItem>
            <SelectItem value="credit card">Credit Card</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Invoice/Reference */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Reference/Invoice Number (Optional)
        </label>
        <Input
          value={form.invoiceId}
          onChange={(e) => handleChange("invoiceId", e.target.value)}
          placeholder="INV-2025-001"
          className="w-full"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Notes</label>
        <Textarea
          value={form.notes}
          onChange={(e) => handleChange("notes", e.target.value)}
          placeholder="Additional details..."
          className="w-full h-24"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Add Transaction"}
        </Button>
      </div>
    </div>
  );
}

export default CreateDialog;
