import React from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, Download, LogIn } from "lucide-react";

export default function OnboardingSuccess() {
  const [searchParams] = useSearchParams();
  const orgSlug = searchParams.get("orgSlug") || "";

  const handleDownloadReceipt = () => {
    const receipt = `
VorksPro – Subscription Receipt
================================

Thank you for subscribing.

Organization: ${orgSlug || "Your workspace"}
Date: ${new Date().toISOString().slice(0, 10)}
Plan: Business (or selected plan)

Your workspace and database have been created.
Sign in at: Use your organization slug "${orgSlug}" and admin email on the login page.

================================
VorksPro – Projects, CRM, HR in one platform.
    `.trim();
    const blob = new Blob([receipt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `vorkspro-receipt-${orgSlug || "workspace"}-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f0a1f] text-gray-100">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 text-green-400 mb-6">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-2xl font-bold mb-2">Subscription successful</h1>
        <p className="text-gray-400 mb-6">
          Your organization and database are ready. You can sign in with your org slug and admin email.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-white/20 text-gray-300 hover:bg-white/5"
          >
            <Download size={18} /> Download receipt
          </button>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-medium"
          >
            <LogIn size={18} /> Go to login
          </Link>
        </div>
        {orgSlug && (
          <p className="text-sm text-gray-500 mt-6">
            Use <strong className="text-gray-400">{orgSlug}</strong> as your organization slug when logging in.
          </p>
        )}
      </div>
    </div>
  );
}
