import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useTabs } from '@/context/TabsContext';

function ProcessPayrollDialog() {

  return (
    <div className="space-y-4">
      {/* Warning Text */}
      <p className="text-sm text-[var(--text)] flex items-start border p-2 rounded-lg border-[var(--border)]">
        <span className="mr-2 mt-0.5">ⓘ</span> This will process salary payments for all employees. Please review the details carefully.
      </p>

      {/* Pay Month and Payment Date */}
      <div className="flex space-x-4">
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Pay Month</label>
          <Input
            type="text"
            placeholder="November 2025"
            className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]"
          />
        </div>
        <div className="space-y-2 w-1/2">
          <label className="text-sm font-medium text-[var(--text)]">Payment Date</label>
          <Input
            type="text"
            placeholder="11/01/2025"
            className="w-full border border-[var(--border)] rounded-md p-2 text-[var(--text)]"
          />
        </div>
      </div>

      {/* Payroll Summary */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Payroll Summary</label>
        <div className="p-4 border border-[var(--border)] rounded-md bg-[var(--background)]">
          <div className="flex justify-between">
            <span className="text-sm text-[var(--text)]">Total Employees</span>
            <span className="text-sm text-[var(--text)]">Total Amount</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>247</span>
            <span>$1,920,000</span>
          </div>
          <div className="flex justify-between mt-2">
            <div className="text-sm text-[var(--text)]">
              <p>Base Salaries</p>
              <p>Deductions</p>
            </div>
            <div className="text-sm text-[var(--text)] text-right">
              <p>$1,680,000</p>
              <p>-$95,000</p>
            </div>
            <div className="text-sm text-[var(--text)]">
              <p>Bonuses</p>
              <p>Overtime</p>
            </div>
            <div className="text-sm text-[var(--text)] text-right">
              <p>+$145,000</p>
              <p>+$95,000</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-[var(--text)]">Payment Method</label>
        <div className="flex space-x-4">
          <Button className="border-button">
            Bank Transfer
          </Button>
          <Button className="border-button">
            Check
          </Button>
          <Button className="border-button">
            Direct Deposit
          </Button>
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Checkbox id="email-notifications" defaultChecked />
          <label htmlFor="email-notifications" className="text-sm text-[var(--text)]">
            Send email notifications to employees
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox id="auto-generate" defaultChecked />
          <label htmlFor="auto-generate" className="text-sm text-[var(--text)]">
            Auto-generate payslips
          </label>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end">
        <Button>
          Process Payroll
        </Button>
      </div>
    </div>
  );
}

export default ProcessPayrollDialog;