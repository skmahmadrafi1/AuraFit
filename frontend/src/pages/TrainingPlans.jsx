import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Dumbbell, Clock, Calendar, Filter, ChevronRight, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/client";
import { Link } from "react-router-dom";
import {
  EmptyState, LoadingGrid, PageHero, PageSurface, staggerItem, staggerWrap,
} from "@/components/saas/SaaSPrimitives";

const CATEGORIES = ["all", "strength", "cardio", "hiit", "yoga"];
const LEVELS = ["all", "base", "intermediate", "advanced"];

const LEVEL_STYLES = {
  base: "bg-green-500/15 text-green-400 border-green-500/25",
  intermediate: "bg-primary/15 text-primary border-primary/25",
  advanced: "bg-red-500/15 text-red-400 border-red-500/25",
};

const CATEGORY_ICONS = {
  strength: "🏋️",
  cardio: "🏃",
  hiit: "⚡",
  yoga: "🧘",
};

// Gradient palettes for plan cards
const GRADIENTS = [
  "from-violet-900/60 via-purple-900/40 to-background",
  "from-blue-900/60 via-indigo-900/40 to-background",
  "from-emerald-900/50 via-teal-900/40 to-background",
  "from-slate-800/70 via-slate-900/50 to-background",
  "from-orange-900/50 via-red-900/40 to-background",
  "from-cyan-900/50 via-blue-900/40 to-background",
  "from-fuchsia-900/50 via-pink-900/40 to-background",
  "from-amber-900/50 via-orange-900/40 to-background",
];

const PlanCard = ({ plan, index }) => (
  <motion.div variants={staggerItem}>
    <Link to={`/training-plans/${plan._id}`} className="group block h-full">
      <div className={`relative h-64 rounded-2xl border border-border overflow-hidden
        bg-gradient-to-br ${GRADIENTS[index % GRADIENTS.length]}
        transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1`}
      >
        {/* Big background number */}
        <div className="absolute inset-0 flex items-center justify-end pr-6 opacity-5 select-none pointer-events-none">
          <span className="text-[120px] font-black text-foreground leading-none">
            {(index + 1).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${LEVEL_STYLES[plan.level]}`}>
                {plan.level} Plan
              </span>
              <span className="text-xl">{CATEGORY_ICONS[plan.category] || "💪"}</span>
            </div>

            <h3 className="text-3xl font-black uppercase tracking-tight text-foreground leading-tight">
              {plan.name}
            </h3>
            {plan.subtitle && (
              <p className="mt-1 text-sm font-bold uppercase tracking-widest text-primary">
                {plan.subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span><span className="font-bold text-foreground">{plan.daysPerWeek}</span> days a week</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span>{plan.duration || "30 days"}</span>
              </div>
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 border border-primary/30 group-hover:bg-primary group-hover:border-primary transition-all duration-200">
              <ChevronRight className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const TrainingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState("all");
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");

  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (level !== "all") params.set("level", level);
      if (query) params.set("q", query);
      const { data } = await api.get(`/training-plans?${params}`);
      setPlans(data.plans || []);
      setTotal(data.total || 0);
    } catch {
      setPlans([]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchPlans(); }, [category, level, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputVal);
  };

  return (
    <PageSurface>
      <PageHero
        badge="Training Plans"
        title="Structured programs for every level and goal."
        description={`${total} programs in the library — from base plans to advanced splits. Find yours and commit.`}
      />

      {/* Controls */}
      <div className="mb-8 flex flex-wrap gap-4 items-start">
        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[240px] max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Search programs..."
              className="pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" variant="outline" className="border-border">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Filter className="h-4 w-4 mt-2 text-muted-foreground" />
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                category === c
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:border-border/80 hover:text-foreground"
              }`}
            >
              {CATEGORY_ICONS[c] && `${CATEGORY_ICONS[c]} `}{c}
            </button>
          ))}
        </div>

        {/* Level filter */}
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                level === l
                  ? LEVEL_STYLES[l] || "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Zap className="h-4 w-4 text-primary" />
        <span><span className="font-bold text-foreground">{plans.length}</span> programs {query || category !== "all" || level !== "all" ? "matched" : "available"}</span>
      </div>

      {/* Grid */}
      {isLoading ? (
        <LoadingGrid cards={6} />
      ) : plans.length === 0 ? (
        <EmptyState
          title="No programs found"
          description="Try adjusting your filters or search term."
        />
      ) : (
        <motion.div
          variants={staggerWrap} initial="hidden" animate="show"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {plans.map((plan, i) => (
            <PlanCard key={plan._id} plan={plan} index={i} />
          ))}
        </motion.div>
      )}

      {/* Info strip */}
      <div className="mt-12 rounded-2xl border border-primary/15 bg-primary/5 p-6 flex flex-wrap gap-6 items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-primary" /> Not sure where to start?
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Base plans are great for everyone. Start simple, build habits, then level up.
          </p>
        </div>
        <Button
          onClick={() => { setCategory("all"); setLevel("base"); setQuery(""); setInputVal(""); }}
          className="shrink-0"
        >
          Show Base Plans
        </Button>
      </div>
    </PageSurface>
  );
};

export default TrainingPlans;
