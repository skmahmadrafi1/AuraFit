import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dumbbell, Zap, Activity, Flame, Heart, Wind, Loader2,
  AlertCircle, Search, X, SlidersHorizontal, Timer, Play,
  Pause, RotateCcw, Bookmark, BookmarkCheck, ChevronDown,
  Star, Clock, Bolt, Filter, TrendingUp, Award
} from "lucide-react";
import api from "@/api/client";

// ─── Constants ───────────────────────────────────────────────────────────────
const TYPE_META = {
  strength:     { icon: Dumbbell,  color: "#3b82f6", bg: "rgba(59,130,246,0.12)",  label: "Strength",    emoji: "💪" },
  hiit:         { icon: Zap,       color: "#eab308", bg: "rgba(234,179,8,0.12)",    label: "HIIT",        emoji: "⚡" },
  mobility:     { icon: Activity,  color: "#22c55e", bg: "rgba(34,197,94,0.12)",    label: "Mobility",    emoji: "🧘" },
  cardio:       { icon: Heart,     color: "#ef4444", bg: "rgba(239,68,68,0.12)",    label: "Cardio",      emoji: "❤️" },
  yoga:         { icon: Wind,      color: "#a855f7", bg: "rgba(168,85,247,0.12)",   label: "Yoga",        emoji: "🌿" },
  warmup:       { icon: Flame,     color: "#f97316", bg: "rgba(249,115,22,0.12)",   label: "Warmup",      emoji: "🔥" },
  crossfit:     { icon: Award,     color: "#06b6d4", bg: "rgba(6,182,212,0.12)",    label: "CrossFit",    emoji: "🏋️" },
  calisthenics: { icon: TrendingUp,color: "#10b981", bg: "rgba(16,185,129,0.12)",   label: "Calisthenics",emoji: "🤸" },
  pilates:      { icon: Star,      color: "#ec4899", bg: "rgba(236,72,153,0.12)",   label: "Pilates",     emoji: "🎯" },
};

const DIFFICULTY_COLORS = {
  easy:   { text: "#22c55e", bg: "rgba(34,197,94,0.15)",   label: "Easy" },
  medium: { text: "#eab308", bg: "rgba(234,179,8,0.15)",   label: "Medium" },
  hard:   { text: "#ef4444", bg: "rgba(239,68,68,0.15)",   label: "Hard" },
};

const TABS = [
  { id: "all", label: "All" },
  { id: "strength", label: "Strength" },
  { id: "hiit", label: "HIIT" },
  { id: "cardio", label: "Cardio" },
  { id: "yoga", label: "Yoga" },
  { id: "mobility", label: "Mobility" },
  { id: "crossfit", label: "CrossFit" },
  { id: "calisthenics", label: "Calisthenics" },
  { id: "pilates", label: "Pilates" },
  { id: "warmup", label: "Warmup" },
];

const EQUIPMENT_OPTIONS = ["all","bodyweight","dumbbells","barbell","kettlebells","resistance-bands","cable","machine","none"];
const DIFFICULTY_OPTIONS = ["all","easy","medium","hard"];
const BODY_PART_OPTIONS  = ["all","fullbody","chest","back","arms","legs","glutes","shoulders","abs","cardio"];
const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "duration",   label: "Duration" },
  { value: "difficulty", label: "Difficulty" },
  { value: "calories",   label: "Calories" },
];
const DIFF_ORDER = { easy: 0, medium: 1, hard: 2 };

const LOCAL_FAV_KEY = "aurafit_fav_workouts";

// ─── Timer Modal ─────────────────────────────────────────────────────────────
const TimerModal = ({ workout, onClose }) => {
  const [secs, setSecs] = useState((workout?.durationMin || 20) * 60);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const total = (workout?.durationMin || 20) * 60;
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSecs(s => {
          if (s <= 1) { setRunning(false); clearInterval(intervalRef.current); return 0; }
          return s - 1;
        });
        setElapsed(e => e + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const pct = ((total - secs) / total) * 100;
  const r = 88;
  const circ = 2 * Math.PI * r;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
        <button style={styles.modalClose} onClick={onClose}><X size={20}/></button>
        <div style={styles.modalTitle}>{workout?.title}</div>
        <div style={styles.modalSubtitle}>Session Timer</div>

        <div style={styles.timerRing}>
          <svg width={200} height={200} style={{ transform:"rotate(-90deg)" }}>
            <circle cx={100} cy={100} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={10}/>
            <circle
              cx={100} cy={100} r={r} fill="none"
              stroke={secs === 0 ? "#22c55e" : "#a855f7"}
              strokeWidth={10}
              strokeDasharray={circ}
              strokeDashoffset={circ - (circ * pct / 100)}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <div style={styles.timerText}>
            <span style={styles.timerBig}>{fmt(secs)}</span>
            <span style={styles.timerLabel}>{secs === 0 ? "Done! 🎉" : "remaining"}</span>
          </div>
        </div>

        <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:24 }}>
          <button style={styles.timerBtn} onClick={() => setRunning(r => !r)}>
            {running ? <Pause size={20}/> : <Play size={20}/>}
            {running ? "Pause" : "Start"}
          </button>
          <button style={{ ...styles.timerBtn, background:"rgba(255,255,255,0.08)" }}
            onClick={() => { setRunning(false); setSecs(total); setElapsed(0); }}>
            <RotateCcw size={18}/> Reset
          </button>
        </div>

        {workout?.exercises?.length > 0 && (
          <div style={styles.timerExList}>
            <div style={styles.timerExHead}>Exercises</div>
            {workout.exercises.map((ex, i) => (
              <div key={i} style={styles.timerExItem}>
                <span>{ex.name}</span>
                <span style={{ color:"rgba(255,255,255,0.45)" }}>
                  {ex.sets && `${ex.sets} sets`}{ex.reps && ` × ${ex.reps}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Workout Card ─────────────────────────────────────────────────────────────
const WorkoutCard = ({ workout, idx, onStartSession, isFav, onToggleFav }) => {
  const type   = (workout.type || "strength").toLowerCase();
  const meta   = TYPE_META[type] || TYPE_META.strength;
  const diff   = DIFFICULTY_COLORS[workout.difficulty] || DIFFICULTY_COLORS.medium;
  const Icon   = meta.icon;
  const cals   = workout.caloriesPerMin
    ? Math.round(workout.caloriesPerMin * (workout.durationMin || 30))
    : null;

  return (
    <div
      style={{
        ...styles.card,
        animationDelay: `${60 * idx}ms`,
        borderColor: `${meta.color}25`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-6px) scale(1.01)";
        e.currentTarget.style.borderColor = `${meta.color}60`;
        e.currentTarget.style.boxShadow = `0 24px 60px ${meta.color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        e.currentTarget.style.borderColor = `${meta.color}25`;
        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)";
      }}
    >
      {/* Glow */}
      <div style={{ ...styles.cardGlow, background: meta.bg }} />

      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={{ ...styles.cardIconWrap, background: meta.bg, color: meta.color }}>
          <Icon size={26} strokeWidth={1.8}/>
        </div>
        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <div style={{ ...styles.typeBadge, background: meta.bg, color: meta.color }}>
            {meta.emoji} {meta.label}
          </div>
          <div style={{ ...styles.diffBadge, background: diff.bg, color: diff.text }}>
            {diff.label}
          </div>
        </div>
      </div>

      {/* Title */}
      <h3 style={styles.cardTitle}>{workout.title}</h3>

      {/* Stats row */}
      <div style={styles.statsRow}>
        {workout.durationMin && (
          <div style={styles.statChip}>
            <Clock size={13}/> {workout.durationMin}m
          </div>
        )}
        {cals && (
          <div style={styles.statChip}>
            <Bolt size={13}/> ~{cals} kcal
          </div>
        )}
        {workout.exercises?.length > 0 && (
          <div style={styles.statChip}>
            <Activity size={13}/> {workout.exercises.length} exercises
          </div>
        )}
        {workout.equipment && workout.equipment !== "none" && (
          <div style={{ ...styles.statChip, background:"rgba(168,85,247,0.12)", color:"#c084fc" }}>
            🏋 {workout.equipment}
          </div>
        )}
      </div>

      {/* Body parts */}
      {workout.bodyParts?.length > 0 && (
        <div style={styles.bodyPartRow}>
          {workout.bodyParts.slice(0,4).map(bp => (
            <span key={bp} style={styles.bodyPartChip}>{bp}</span>
          ))}
        </div>
      )}

      {/* Exercises preview */}
      {workout.exercises?.length > 0 && (
        <div style={styles.exPreview}>
          {workout.exercises.slice(0,4).map((ex, i) => (
            <div key={i} style={styles.exRow}>
              <span style={styles.exName}>{ex.name}</span>
              <span style={styles.exSets}>
                {ex.sets ? `${ex.sets}×` : ""}{ex.reps ? ex.reps : ""}
              </span>
            </div>
          ))}
          {workout.exercises.length > 4 && (
            <div style={{ color:"rgba(255,255,255,0.3)", fontSize:12, textAlign:"center", paddingTop:4 }}>
              +{workout.exercises.length - 4} more
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div style={styles.cardActions}>
        <button style={styles.startBtn} onClick={() => onStartSession(workout)}>
          <Play size={15}/> Start Session
        </button>
        <button
          style={{ ...styles.favBtn, color: isFav ? "#f97316" : "rgba(255,255,255,0.3)" }}
          onClick={() => onToggleFav(workout._id || workout.id)}
          title={isFav ? "Remove Bookmark" : "Bookmark"}
        >
          {isFav ? <BookmarkCheck size={20}/> : <Bookmark size={20}/>}
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const Workouts = () => {
  const navigate = useNavigate();
  const [workouts, setWorkouts]     = useState([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState("");
  const [search, setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [activeTab, setActiveTab]   = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [equipment, setEquipment]   = useState("all");
  const [bodyPart, setBodyPart]     = useState("all");
  const [sortBy, setSortBy]         = useState("default");
  const [timerWorkout, setTimerWorkout] = useState(null);
  const [favIds, setFavIds]         = useState(() => {
    try { return JSON.parse(localStorage.getItem(LOCAL_FAV_KEY)) || []; }
    catch { return []; }
  });
  const [showFavsOnly, setShowFavsOnly] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const debounceRef = useRef(null);

  // Debounce search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  // Fetch
  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      setError("");
      try {
        const { data } = await api.get("/workouts");
        const list   = data?.workouts || data || [];
        const count  = data?.total   ?? list.length;
        setWorkouts(Array.isArray(list) ? list : []);
        setTotal(count);
      } catch (err) {
        setError(err?.message || "Failed to load workouts.");
        setWorkouts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  // Save favs
  const toggleFav = useCallback((id) => {
    setFavIds(prev => {
      const next = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(LOCAL_FAV_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  // Active filter count
  const activeFilterCount = [
    activeTab !== "all", difficulty !== "all", equipment !== "all",
    bodyPart !== "all", debouncedSearch !== "", showFavsOnly,
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch(""); setDebouncedSearch(""); setActiveTab("all");
    setDifficulty("all"); setEquipment("all"); setBodyPart("all");
    setShowFavsOnly(false); setSortBy("default");
  };

  // Client-side filter + sort
  const filtered = useMemo(() => {
    let list = [...workouts];
    if (activeTab !== "all") list = list.filter(w => (w.type||"").toLowerCase() === activeTab);
    if (difficulty !== "all") list = list.filter(w => w.difficulty === difficulty);
    if (equipment !== "all") list = list.filter(w => w.equipment === equipment);
    if (bodyPart !== "all") list = list.filter(w => (w.bodyParts || []).includes(bodyPart));
    if (debouncedSearch) list = list.filter(w => w.title?.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (showFavsOnly) list = list.filter(w => favIds.includes(w._id || w.id));
    if (sortBy === "duration")   list.sort((a, b) => a.durationMin - b.durationMin);
    if (sortBy === "difficulty") list.sort((a, b) => (DIFF_ORDER[a.difficulty]||1) - (DIFF_ORDER[b.difficulty]||1));
    if (sortBy === "calories")   list.sort((a, b) => (b.caloriesPerMin||0) - (a.caloriesPerMin||0));
    return list;
  }, [workouts, activeTab, difficulty, equipment, bodyPart, debouncedSearch, showFavsOnly, sortBy, favIds]);

  return (
    <div style={styles.page}>
      {/* Hero */}
      <div style={styles.hero}>
        <div style={styles.heroBadge}>🏆 {total} workouts in the database</div>
        <h1 style={styles.heroTitle}>Workout Library</h1>
        <p style={styles.heroSub}>
          Search, filter and start any workout — strength, HIIT, yoga, and more.
        </p>
      </div>

      {/* Search bar */}
      <div style={styles.searchWrap}>
        <div style={styles.searchBox}>
          <Search size={18} style={{ color:"rgba(255,255,255,0.4)", flexShrink:0 }}/>
          <input
            style={styles.searchInput}
            placeholder="Search workouts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <button style={styles.clearBtn} onClick={() => setSearch("")}>
              <X size={15}/>
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={styles.selectWrap}>
          <select
            style={styles.select}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          <ChevronDown size={14} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", pointerEvents:"none", color:"rgba(255,255,255,0.4)" }}/>
        </div>

        {/* Favorites toggle */}
        <button
          style={{ ...styles.chipBtn, background: showFavsOnly ? "rgba(249,115,22,0.2)" : "rgba(255,255,255,0.05)", color: showFavsOnly ? "#f97316" : "rgba(255,255,255,0.5)", border:`1px solid ${showFavsOnly ? "#f97316" : "rgba(255,255,255,0.1)"}` }}
          onClick={() => setShowFavsOnly(v => !v)}
        >
          <BookmarkCheck size={15}/> Bookmarks {favIds.length > 0 && `(${favIds.length})`}
        </button>

        {/* Filter toggle (mobile) */}
        <button
          style={{ ...styles.chipBtn, position:"relative", background: activeFilterCount > 0 ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.05)", color: activeFilterCount > 0 ? "#a855f7" : "rgba(255,255,255,0.5)", border:`1px solid ${activeFilterCount > 0 ? "#a855f7" : "rgba(255,255,255,0.1)"}` }}
          onClick={() => setSidebarOpen(o => !o)}
        >
          <Filter size={15}/> Filters
          {activeFilterCount > 0 && (
            <span style={styles.filterBadge}>{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Category tabs */}
      <div style={styles.tabsWrap}>
        {TABS.map(t => (
          <button
            key={t.id}
            style={{
              ...styles.tab,
              background: activeTab === t.id ? (TYPE_META[t.id]?.bg || "rgba(168,85,247,0.2)") : "rgba(255,255,255,0.04)",
              color: activeTab === t.id ? (TYPE_META[t.id]?.color || "#a855f7") : "rgba(255,255,255,0.45)",
              border: `1px solid ${activeTab === t.id ? (TYPE_META[t.id]?.color || "#a855f7") + "50" : "rgba(255,255,255,0.08)"}`,
              fontWeight: activeTab === t.id ? 600 : 400,
            }}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div style={styles.layout}>
        {/* Sidebar */}
        <aside style={{ ...styles.sidebar, display: sidebarOpen ? "flex" : undefined }}>
          <div style={styles.sidebarTop}>
            <span style={styles.sidebarTitle}><SlidersHorizontal size={15}/> Filters</span>
            {activeFilterCount > 0 && (
              <button style={styles.clearLink} onClick={clearFilters}>Clear all</button>
            )}
          </div>
          <FilterGroup label="Type" value={activeTab} onChange={setActiveTab}
            options={TABS.map(t => ({ value: t.id, label: t.label }))} />
          <FilterGroup label="Difficulty" value={difficulty} onChange={setDifficulty}
            options={DIFFICULTY_OPTIONS.map(d => ({ value: d, label: d === "all" ? "Show all" : d.charAt(0).toUpperCase()+d.slice(1) }))} />
          <FilterGroup label="Equipment" value={equipment} onChange={setEquipment}
            options={EQUIPMENT_OPTIONS.map(e => ({ value: e, label: e === "all" ? "Show all" : e }))} />
          <FilterGroup label="Body Part" value={bodyPart} onChange={setBodyPart}
            options={BODY_PART_OPTIONS.map(b => ({ value: b, label: b === "all" ? "Show all" : b }))} />
        </aside>

        {/* Content */}
        <main style={styles.main}>
          {/* Results bar */}
          <div style={styles.resultsBar}>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:14 }}>
              {isLoading ? "Loading..." : `${filtered.length} ${filtered.length === 1 ? "workout" : "workouts"} found`}
            </span>
            {/* Active filter chips */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {activeTab !== "all" && <FilterChip label={`Type: ${activeTab}`} onRemove={() => setActiveTab("all")}/>}
              {difficulty !== "all" && <FilterChip label={`Difficulty: ${difficulty}`} onRemove={() => setDifficulty("all")}/>}
              {equipment !== "all" && <FilterChip label={`Equipment: ${equipment}`} onRemove={() => setEquipment("all")}/>}
              {bodyPart !== "all" && <FilterChip label={`Body: ${bodyPart}`} onRemove={() => setBodyPart("all")}/>}
              {debouncedSearch && <FilterChip label={`"${debouncedSearch}"`} onRemove={() => setSearch("")}/>}
              {showFavsOnly && <FilterChip label="Bookmarks only" onRemove={() => setShowFavsOnly(false)}/>}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <AlertCircle size={18} style={{ color:"#f87171", flexShrink:0 }}/>
              <div>
                <div style={{ fontWeight:600, color:"#fca5a5", marginBottom:4 }}>Unable to Load Workouts</div>
                <div style={{ fontSize:13, color:"rgba(252,165,165,0.8)" }}>{error}</div>
              </div>
            </div>
          )}

          {/* Loading */}
          {isLoading && (
            <div style={styles.loadingWrap}>
              <Loader2 size={36} style={{ color:"#a855f7", animation:"spin 1s linear infinite" }}/>
              <span style={{ color:"rgba(255,255,255,0.4)", marginTop:12 }}>Loading workout library…</span>
            </div>
          )}

          {/* Empty state */}
          {!isLoading && !error && filtered.length === 0 && (
            <div style={styles.emptyState}>
              <div style={{ fontSize:56, marginBottom:16 }}>🔍</div>
              <h3 style={{ color:"#fff", fontSize:20, fontWeight:600, marginBottom:8 }}>No workouts found</h3>
              <p style={{ color:"rgba(255,255,255,0.4)", fontSize:14, marginBottom:20 }}>
                {workouts.length === 0
                  ? "No workouts are seeded yet. Run the seed script."
                  : "Try adjusting or clearing your filters."}
              </p>
              {activeFilterCount > 0 && (
                <button style={styles.clearFiltersBtn} onClick={clearFilters}>Clear all filters</button>
              )}
            </div>
          )}

          {/* Cards grid */}
          {!isLoading && filtered.length > 0 && (
            <div style={styles.grid}>
              {filtered.map((w, i) => (
                <WorkoutCard
                  key={w._id || w.id || i}
                  workout={w}
                  idx={i}
                  onStartSession={setTimerWorkout}
                  isFav={favIds.includes(w._id || w.id)}
                  onToggleFav={toggleFav}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Timer modal */}
      {timerWorkout && (
        <TimerModal workout={timerWorkout} onClose={() => setTimerWorkout(null)} />
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes cardIn { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        select option { background: #1a1a2e; color: #fff; }
      `}</style>
    </div>
  );
};

// ─── Small filter components ──────────────────────────────────────────────────
const FilterGroup = ({ label, value, onChange, options }) => (
  <div style={{ marginBottom:20 }}>
    <div style={styles.filterLabel}>{label}</div>
    <div style={styles.filterOpts}>
      {options.map(o => (
        <button
          key={o.value}
          style={{
            ...styles.filterOpt,
            background: value === o.value ? "rgba(168,85,247,0.2)" : "rgba(255,255,255,0.04)",
            color: value === o.value ? "#c084fc" : "rgba(255,255,255,0.5)",
            border: `1px solid ${value === o.value ? "#a855f760" : "rgba(255,255,255,0.08)"}`,
          }}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  </div>
);

const FilterChip = ({ label, onRemove }) => (
  <span style={styles.filterChip}>
    {label}
    <button style={styles.filterChipX} onClick={onRemove}><X size={12}/></button>
  </span>
);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0a0a14 0%, #0f0f1e 50%, #0a0a14 100%)",
    color: "#fff",
    fontFamily: "'Inter', system-ui, sans-serif",
    paddingTop: 80,
    paddingBottom: 60,
  },
  hero: {
    textAlign: "center",
    padding: "48px 24px 40px",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(168,85,247,0.15)",
    border: "1px solid rgba(168,85,247,0.3)",
    borderRadius: 100,
    padding: "6px 18px",
    fontSize: 13,
    color: "#c084fc",
    marginBottom: 20,
    fontWeight: 500,
  },
  heroTitle: {
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 800,
    background: "linear-gradient(135deg, #fff 0%, #a855f7 60%, #6366f1 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    margin: "0 0 14px",
    letterSpacing: "-0.5px",
  },
  heroSub: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 16,
    maxWidth: 520,
    margin: "0 auto",
    lineHeight: 1.6,
  },
  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    maxWidth: 1200,
    margin: "0 auto 28px",
    padding: "0 24px",
    flexWrap: "wrap",
  },
  searchBox: {
    flex: 1,
    minWidth: 220,
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 14px",
    transition: "border-color 0.2s",
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "#fff",
    fontSize: 14,
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.35)",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  selectWrap: {
    position: "relative",
    flexShrink: 0,
  },
  select: {
    background: "rgba(255,255,255,0.055)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: "10px 32px 10px 14px",
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    cursor: "pointer",
    outline: "none",
    appearance: "none",
    WebkitAppearance: "none",
  },
  chipBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "9px 14px",
    borderRadius: 12,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500,
    transition: "all 0.2s",
    position: "relative",
    whiteSpace: "nowrap",
  },
  filterBadge: {
    position: "absolute",
    top: -6, right: -6,
    background: "#a855f7",
    color: "#fff",
    borderRadius: "50%",
    width: 16, height: 16,
    fontSize: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },
  tabsWrap: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    padding: "0 24px 20px",
    maxWidth: 1200,
    margin: "0 auto",
    scrollbarWidth: "none",
  },
  tab: {
    flexShrink: 0,
    padding: "8px 16px",
    borderRadius: 100,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.2s",
    whiteSpace: "nowrap",
  },
  layout: {
    display: "flex",
    gap: 24,
    maxWidth: 1200,
    margin: "0 auto",
    padding: "0 24px",
    alignItems: "flex-start",
  },
  sidebar: {
    width: 220,
    flexShrink: 0,
    background: "rgba(255,255,255,0.035)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 16,
    padding: 20,
    position: "sticky",
    top: 90,
    display: "flex",
    flexDirection: "column",
  },
  sidebarTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sidebarTitle: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontWeight: 600,
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
  },
  clearLink: {
    background: "none",
    border: "none",
    color: "#a855f7",
    fontSize: 12,
    cursor: "pointer",
    fontWeight: 500,
  },
  filterLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.35)",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  filterOpts: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  filterOpt: {
    padding: "7px 10px",
    borderRadius: 8,
    fontSize: 12,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.15s",
    fontWeight: 500,
  },
  main: {
    flex: 1,
    minWidth: 0,
  },
  resultsBar: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "rgba(168,85,247,0.15)",
    border: "1px solid rgba(168,85,247,0.3)",
    borderRadius: 100,
    padding: "4px 10px",
    fontSize: 12,
    color: "#c084fc",
  },
  filterChipX: {
    background: "none",
    border: "none",
    color: "#c084fc",
    cursor: "pointer",
    padding: 0,
    display: "flex",
    alignItems: "center",
  },
  errorBox: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    borderRadius: 12,
    padding: "16px 18px",
    marginBottom: 20,
  },
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 300,
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 24px",
  },
  clearFiltersBtn: {
    background: "rgba(168,85,247,0.2)",
    border: "1px solid rgba(168,85,247,0.4)",
    borderRadius: 10,
    padding: "10px 22px",
    color: "#c084fc",
    fontSize: 14,
    cursor: "pointer",
    fontWeight: 500,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
    gap: 20,
  },
  // Card styles
  card: {
    position: "relative",
    overflow: "hidden",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid",
    borderRadius: 18,
    padding: 22,
    transition: "transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    animation: "cardIn 0.4s ease both",
    display: "flex",
    flexDirection: "column",
    gap: 14,
  },
  cardGlow: {
    position: "absolute",
    inset: 0,
    opacity: 0.4,
    pointerEvents: "none",
    borderRadius: 18,
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
    zIndex: 1,
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  typeBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 100,
    letterSpacing: "0.04em",
  },
  diffBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: "3px 10px",
    borderRadius: 100,
    textAlign: "center",
  },
  cardTitle: {
    margin: 0,
    fontSize: 17,
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.25,
    position: "relative",
    zIndex: 1,
  },
  statsRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    position: "relative",
    zIndex: 1,
  },
  statChip: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 8,
    background: "rgba(255,255,255,0.07)",
    color: "rgba(255,255,255,0.65)",
    fontWeight: 500,
  },
  bodyPartRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 5,
    position: "relative",
    zIndex: 1,
  },
  bodyPartChip: {
    fontSize: 11,
    padding: "3px 9px",
    borderRadius: 6,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.45)",
    textTransform: "capitalize",
  },
  exPreview: {
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 7,
    position: "relative",
    zIndex: 1,
  },
  exRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  exName: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: 500,
  },
  exSets: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
    fontVariantNumeric: "tabular-nums",
  },
  cardActions: {
    display: "flex",
    gap: 8,
    marginTop: "auto",
    position: "relative",
    zIndex: 1,
  },
  startBtn: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    borderRadius: 10,
    padding: "10px 16px",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "opacity 0.2s, transform 0.1s",
  },
  favBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 10,
    padding: "10px 12px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  // Modal
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.75)",
    backdropFilter: "blur(8px)",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    background: "linear-gradient(145deg, #1a1a2e, #16213e)",
    border: "1px solid rgba(168,85,247,0.3)",
    borderRadius: 24,
    padding: 36,
    width: "100%",
    maxWidth: 440,
    maxHeight: "90vh",
    overflowY: "auto",
    position: "relative",
  },
  modalClose: {
    position: "absolute",
    top: 16, right: 16,
    background: "rgba(255,255,255,0.07)",
    border: "none",
    borderRadius: 8,
    color: "rgba(255,255,255,0.5)",
    cursor: "pointer",
    padding: 6,
    display: "flex",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: "#fff",
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 28,
  },
  timerRing: {
    position: "relative",
    width: 200,
    height: 200,
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  timerText: {
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  timerBig: {
    fontSize: 40,
    fontWeight: 800,
    color: "#fff",
    letterSpacing: "-1px",
    fontVariantNumeric: "tabular-nums",
  },
  timerLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.35)",
  },
  timerBtn: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none",
    borderRadius: 12,
    padding: "11px 22px",
    color: "#fff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  timerExList: {
    marginTop: 24,
    background: "rgba(255,255,255,0.04)",
    borderRadius: 12,
    padding: 16,
  },
  timerExHead: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    marginBottom: 10,
  },
  timerExItem: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    paddingBottom: 7,
    marginBottom: 7,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
};

export default Workouts;
