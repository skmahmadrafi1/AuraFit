import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export const pageTransition = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
};

export const staggerWrap = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0 },
};

/** Full-page container — uses the app dark theme */
export const PageSurface = ({ children, className = "" }) => (
  <div className={cn("relative min-h-screen bg-background text-foreground", className)}>
    {/* Ambient blobs */}
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-24 left-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute right-0 top-48 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
    </div>
    <div className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-28 md:px-8">
      {children}
    </div>
  </div>
);

/** Hero section at the top of every page */
export const PageHero = ({ badge, title, description, actions, className = "" }) => (
  <motion.section {...pageTransition} className={cn("mb-12 space-y-4", className)}>
    {badge && (
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
        {badge}
      </span>
    )}
    <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight text-foreground md:text-5xl">
      {title}
    </h1>
    <p className="max-w-2xl text-base text-muted-foreground md:text-lg">{description}</p>
    {actions && <div className="flex flex-wrap gap-3 pt-2">{actions}</div>}
  </motion.section>
);

/** Glass card — dark themed */
export const SurfaceCard = ({ children, className = "", highlight = false }) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.01 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "rounded-2xl border border-border bg-card p-5 shadow-lg backdrop-blur-sm",
      highlight && "border-primary/40 bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.15)]",
      className
    )}
  >
    {children}
  </motion.div>
);

/** Skeleton grid for loading states */
export const LoadingGrid = ({ cards = 3 }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
    {Array.from({ length: cards }).map((_, idx) => (
      <div key={`skeleton-${idx}`} className="rounded-2xl border border-border bg-card p-5">
        <Skeleton className="h-5 w-1/3 bg-muted" />
        <Skeleton className="mt-4 h-4 w-full bg-muted" />
        <Skeleton className="mt-2 h-4 w-3/4 bg-muted" />
        <Skeleton className="mt-6 h-24 w-full bg-muted" />
      </div>
    ))}
  </div>
);

/** Empty / error state */
export const EmptyState = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-border bg-card/50 p-10 text-center">
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{description}</p>
  </div>
);

/** Stat chip for dashboard-style numbers */
export const StatChip = ({ label, value, sub, color = "primary" }) => (
  <div className={cn(
    "rounded-xl border bg-card p-4 text-center",
    color === "primary" ? "border-primary/20" :
    color === "success" ? "border-green-500/20" :
    color === "warning" ? "border-yellow-500/20" :
    "border-border"
  )}>
    <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
    <p className={cn(
      "mt-1 text-3xl font-bold",
      color === "primary" ? "text-primary" :
      color === "success" ? "text-green-400" :
      color === "warning" ? "text-yellow-400" :
      "text-foreground"
    )}>{value}</p>
    {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
  </div>
);
