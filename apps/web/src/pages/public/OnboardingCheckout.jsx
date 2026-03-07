import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Check } from "lucide-react";
import { toast } from "sonner";

import { authApi } from "@/api/auth.js";

const PLANS = [
  { id: "pro", name: "Pro", price: "$29", desc: "For small teams", features: ["All modules", "Email support"] },
  { id: "business", name: "Business", price: "$79", desc: "Recommended", features: ["All modules", "Priority support"], highlight: true },
];

export default function OnboardingCheckout() {
  const navigate = useNavigate();
  const [draft, setDraft] = useState(null);
  const [planId, setPlanId] = useState("business");
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242");
  const [expiry, setExpiry] = useState("12/28");
  const [cvc, setCvc] = useState("123");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("onboardingDraft");
    if (!raw) {
      toast.error("Please complete the registration form first.");
      navigate("/onboarding", { replace: true });
      return;
    }
    try {
      setDraft(JSON.parse(raw));
    } catch {
      navigate("/onboarding", { replace: true });
    }
  }, [navigate]);

  const handlePay = async () => {
    if (!draft) return;
    setLoading(true);
    try {
      const data = await authApi.register({
        orgName: draft.orgName,
        slug: draft.slug,
        adminEmail: draft.adminEmail,
        adminPassword: draft.adminPassword,
        firstName: draft.firstName || "Admin",
        lastName: draft.lastName || "User",
        phone: draft.phone || undefined,
        address: draft.address || undefined,
        website: draft.website || undefined,
        industry: draft.industry || undefined,
      });
      if (data?.isSuccess) {
        sessionStorage.removeItem("onboardingDraft");
        setSuccess(true);
        setTimeout(() => {
          navigate(`/onboarding/success?orgSlug=${encodeURIComponent(data.orgSlug || draft.slug)}`, { replace: true });
        }, 1500);
      } else {
        toast.error(data?.message || "Registration failed.");
        setLoading(false);
      }
    } catch (e) {
      toast.error("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!draft && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0a1f] text-gray-400">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0f0a1f] text-gray-100">
      <div className="w-full max-w-md">
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          <ArrowLeft size={16} /> Back to form
        </Link>
        <h1 className="text-2xl font-bold mb-1">Checkout</h1>
        <p className="text-sm text-gray-400 mb-6">
          Dummy payment. Use the card below — we’ll create your organization and database.
        </p>

        {success ? (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 text-green-400 mb-3">
              <Check size={24} />
            </div>
            <p className="font-semibold text-green-400">Subscription successful!</p>
            <p className="text-sm text-gray-400 mt-1">Redirecting to your receipt…</p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-white/5 border border-white/10 p-4 mb-6">
              <p className="text-xs text-gray-500 mb-1">Organization</p>
              <p className="font-medium">{draft?.orgName}</p>
              <p className="text-sm text-gray-400">{draft?.adminEmail}</p>
            </div>
            <div className="space-y-2 mb-6">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setPlanId(plan.id)}
                  className={`w-full text-left rounded-lg border p-4 transition ${
                    planId === plan.id
                      ? "border-[#a855f7] bg-[#a855f7]/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{plan.name}</span>
                    <span className="text-[#a855f7]">{plan.price}/mo</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{plan.desc}</p>
                </button>
              ))}
            </div>
            <div className="space-y-3 mb-6">
              <label className="block text-xs font-medium text-gray-400">Card number (dummy)</label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-500" />
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#a855f7] outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#a855f7] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">CVC</label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-[#a855f7] outline-none"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#a855f7] hover:bg-[#9333ea] text-white font-medium disabled:opacity-50"
            >
              {loading ? "Creating your workspace…" : "Pay & create workspace"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
