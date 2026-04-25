import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import api, { handleApiError } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { Check, Loader2, Sparkles, Zap, Star } from "lucide-react";
import {
  EmptyState, LoadingGrid, PageHero, PageSurface, SurfaceCard, staggerItem, staggerWrap,
} from "@/components/saas/SaaSPrimitives";

const DEFAULT_TIERS = [
  {
    name: "Basic",
    price: 9,
    desc: "Perfect for beginners starting their fitness journey.",
    features: ["Full workout library", "Basic nutrition tracker", "Progress snapshots", "Community access"],
  },
  {
    name: "Pro",
    price: 19,
    desc: "Built for serious athletes who demand results.",
    features: ["Everything in Basic", "Smart planner + tracker", "AI meal guidance", "Advanced analytics", "Priority support"],
    featured: true,
  },
  {
    name: "Premium",
    price: 39,
    desc: "High-performance coaching for peak athletes.",
    features: ["Everything in Pro", "1-on-1 coaching sessions", "Custom AI workout plans", "Biometric tracking", "Dedicated account manager"],
  },
];

const FEATURE_ROWS = [
  { name: "Workout plans", availability: [true, true, true] },
  { name: "Nutrition guidance", availability: [true, true, true] },
  { name: "Community access", availability: [true, true, true] },
  { name: "Advanced analytics", availability: [false, true, true] },
  { name: "AI meal plans", availability: [false, true, true] },
  { name: "Priority support", availability: [false, false, true] },
  { name: "1-on-1 coaching", availability: [false, false, true] },
];

const PLAN_COLORS = [
  { border: "border-border", glow: "", badge: "bg-muted/50 text-muted-foreground", btn: "" },
  { border: "border-primary/50", glow: "shadow-[0_0_32px_hsl(var(--primary)/0.2)]", badge: "bg-primary/20 text-primary", btn: "bg-primary hover:bg-primary/90 text-primary-foreground" },
  { border: "border-secondary/50", glow: "shadow-[0_0_32px_hsl(var(--secondary)/0.15)]", badge: "bg-secondary/20 text-secondary", btn: "" },
];

const Pricing = () => {
  const [tiers, setTiers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPricing = async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get("/pricing");
        setTiers(Array.isArray(data) ? data : []);
      } catch (err) {
        const message = handleApiError(err);
        const isBlocked = err?.code === "ERR_BLOCKED_BY_CLIENT";
        setError(isBlocked ? "Backend connection blocked." : message);
      } finally { setIsLoading(false); }
    };
    fetchPricing();
  }, []);

  const decoratedTiers = useMemo(
    () => (tiers.length ? tiers : DEFAULT_TIERS).map((t, i) => ({ ...t, featured: i === 1 || t.featured })),
    [tiers],
  );

  return (
    <PageSurface>
      <PageHero
        badge="Plans & Billing"
        title="Simple, transparent pricing for every fitness level."
        description="Choose a plan that fits your goals. Upgrade anytime — no hidden fees, no commitments."
      />

      {/* Annual billing badge */}
      <div className="mb-8 flex items-center gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Save 20% with annual billing
        </span>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      {error && <EmptyState title="Unable to load pricing" description={error} />}

      {isLoading ? (
        <LoadingGrid cards={3} />
      ) : (
        <motion.div variants={staggerWrap} initial="hidden" animate="show" className="grid gap-6 md:grid-cols-3">
          {decoratedTiers.map((tier, i) => {
            const colors = PLAN_COLORS[i] || PLAN_COLORS[0];
            return (
              <motion.div key={tier.name || `tier-${i}`} variants={staggerItem} className="relative">
                {tier.featured && (
                  <div className="absolute -top-4 left-1/2 z-10 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1 text-xs font-bold text-primary-foreground shadow-lg">
                      <Star className="h-3 w-3 fill-current" /> Most Popular
                    </span>
                  </div>
                )}
                <div className={`h-full rounded-2xl border p-6 flex flex-col transition-all
                  bg-card backdrop-blur-sm ${colors.border} ${colors.glow}
                  ${tier.featured ? "scale-[1.03]" : ""}
                `}>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{tier.name}</p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className="text-5xl font-extrabold text-foreground">
                      ${typeof tier.price === "number" ? tier.price : 0}
                    </span>
                    <span className="mb-1.5 text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{tier.desc}</p>

                  <ul className="mt-6 flex-1 space-y-3">
                    {(tier.features || []).map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-foreground">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <Button className={`mt-6 w-full font-semibold ${colors.btn}`}>
                    {tier.cta || `Get ${tier.name}`}
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Feature comparison table */}
      <SurfaceCard className="mt-12">
        <h3 className="text-lg font-bold text-foreground">Feature Comparison</h3>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="py-3 pr-6 text-left text-muted-foreground font-medium">Feature</th>
                {decoratedTiers.map((t) => (
                  <th key={t.name} className="py-3 pr-6 text-left font-semibold text-foreground">{t.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_ROWS.map((row) => (
                <tr key={row.name} className="border-b border-border/50 hover:bg-muted/10 transition-colors">
                  <td className="py-3 pr-6 text-muted-foreground">{row.name}</td>
                  {decoratedTiers.map((t, idx) => (
                    <td key={`${row.name}-${t.name}`} className="py-3 pr-6">
                      {row.availability[idx]
                        ? <Check className="h-4 w-4 text-green-400" />
                        : <span className="text-muted-foreground/40">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {/* Bottom CTA */}
      <div className="mt-12 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
        <Zap className="mx-auto mb-3 h-8 w-8 text-primary" />
        <h3 className="text-xl font-bold text-foreground">Not sure which plan?</h3>
        <p className="mt-2 text-muted-foreground">Start free for 14 days. No credit card required.</p>
        <Button className="mt-4 px-8" size="lg">Start Free Trial</Button>
      </div>
    </PageSurface>
  );
};

export default Pricing;
