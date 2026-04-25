import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Loader2, Layers, ChevronRight, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/client";
import { Link } from "react-router-dom";
import {
  EmptyState, LoadingGrid, PageHero, PageSurface, staggerItem, staggerWrap,
} from "@/components/saas/SaaSPrimitives";

const TYPES = ["all", "body-part", "goal", "lifestyle", "sport", "misc"];

const TYPE_LABELS = {
  "body-part": "Body Part",
  goal: "Goal",
  lifestyle: "Lifestyle",
  sport: "Sport",
  misc: "Misc",
};

const TYPE_COLORS = {
  "body-part": "text-primary border-primary/30 bg-primary/10",
  goal: "text-green-400 border-green-500/30 bg-green-500/10",
  lifestyle: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  sport: "text-orange-400 border-orange-500/30 bg-orange-500/10",
  misc: "text-muted-foreground border-border bg-muted/20",
};

// Card gradients per row cycle
const CARD_GRADIENTS = [
  "from-violet-900/50 to-indigo-900/30",
  "from-blue-900/50 to-cyan-900/30",
  "from-emerald-900/50 to-teal-900/30",
  "from-rose-900/50 to-pink-900/30",
  "from-amber-900/50 to-orange-900/30",
  "from-fuchsia-900/50 to-purple-900/30",
];

// Silhouette emoji / icon per collection type
const TYPE_EMOJIS = {
  "body-part": "💪",
  goal: "🎯",
  lifestyle: "🌿",
  sport: "🏅",
  misc: "📦",
};

const CollectionCard = ({ col, index }) => (
  <motion.div variants={staggerItem}>
    <Link to={`/collections/${col.slug}`} className="group block">
      <div className={`relative h-52 rounded-2xl border border-border overflow-hidden
        bg-gradient-to-br ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}
        transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1`}
      >
        {/* Big watermark text */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none select-none">
          <span className="text-7xl font-black uppercase text-foreground text-center leading-tight px-2 line-clamp-2">
            {col.name}
          </span>
        </div>

        {/* Content */}
        <div className="relative flex h-full flex-col justify-between p-5">
          <div>
            <span className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_COLORS[col.type] || TYPE_COLORS.misc}`}>
              {TYPE_LABELS[col.type] || col.type}
            </span>
          </div>

          <div>
            <div className="flex items-end justify-between gap-2">
              <div>
                <h3 className="text-2xl font-black lowercase tracking-tight text-foreground leading-tight group-hover:text-primary transition-colors">
                  {col.name}
                </h3>
                <div className="mt-1 flex items-center gap-1.5">
                  <div className="h-px flex-1 max-w-[80px] bg-primary/40" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    collection
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-background/50 px-2.5 py-1.5 text-xs text-muted-foreground shrink-0">
                <Layers className="h-3 w-3" />
                <span>{col.workoutCount}</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 right-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/20 group-hover:bg-primary group-hover:border-primary transition-all duration-200">
              <ChevronRight className="h-3.5 w-3.5 text-primary group-hover:text-primary-foreground transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [colType, setColType] = useState("all");
  const [query, setQuery] = useState("");
  const [inputVal, setInputVal] = useState("");

  const fetchCollections = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (colType !== "all") params.set("type", colType);
      if (query) params.set("q", query);
      const { data } = await api.get(`/collections?${params}`);
      setCollections(data.collections || []);
      setTotal(data.total || 0);
    } catch {
      setCollections([]);
    } finally { setIsLoading(false); }
  };

  useEffect(() => { fetchCollections(); }, [colType, query]);

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(inputVal);
  };

  return (
    <PageSurface>
      <PageHero
        badge="Collections"
        title="Curated workout collections for every goal."
        description={`${total} collections in the library — body parts, goals, lifestyles, and sports. Explore and find your focus.`}
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
              placeholder="Search collections..."
              className="pl-9 border-border bg-card text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <Button type="submit" variant="outline" className="border-border">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        {/* Type filter pill row */}
        <div className="flex flex-wrap gap-2 items-center">
          <Filter className="h-4 w-4 text-muted-foreground" />
          {TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setColType(t)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-all ${
                colType === t
                  ? TYPE_COLORS[t] || "border-primary bg-primary/15 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "all" ? "Show All" : (TYPE_LABELS[t] || t)}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="mb-5 text-sm text-muted-foreground">
        <span className="font-bold text-foreground">{collections.length}</span>{" "}
        {query || colType !== "all" ? "collections matched" : `collections in the database`}
      </p>

      {/* Grid */}
      {isLoading ? (
        <LoadingGrid cards={6} />
      ) : collections.length === 0 ? (
        <EmptyState title="No collections found" description="Try a different filter or search term." />
      ) : (
        <motion.div
          variants={staggerWrap} initial="hidden" animate="show"
          className="grid gap-5 md:grid-cols-2 xl:grid-cols-3"
        >
          {collections.map((col, i) => (
            <CollectionCard key={col._id} col={col} index={i} />
          ))}
        </motion.div>
      )}
    </PageSurface>
  );
};

export default Collections;
