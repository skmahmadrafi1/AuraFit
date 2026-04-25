import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Activity, Flame, Zap, BarChart3, Calendar, Users,
  Dumbbell, Apple, Target, TrendingUp, ChevronRight,
  Trophy, Brain, Loader2, LogIn, Star, Clock
} from "lucide-react";
import api from "@/api/client";

/* ── tiny helpers ─────────────────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color = "primary", gradient }) => (
  <div
    className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 flex flex-col gap-3
                hover:border-primary/30 hover:shadow-[0_0_20px_hsl(var(--primary)/0.12)] transition-all duration-300"
  >
    {/* background glow blob */}
    <div
      className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-10 blur-2xl"
      style={{ background: gradient }}
    />
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-xl"
        style={{ background: gradient, opacity: 0.85 }}
      >
        <Icon className="h-4 w-4 text-white" />
      </span>
    </div>
    <div>
      <p className="text-3xl font-bold text-foreground">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
    </div>
  </div>
);

const QuickAction = ({ icon: Icon, label, desc, to, gradient, navigate }) => (
  <button
    onClick={() => navigate(to)}
    className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4
               hover:border-primary/30 hover:bg-card/80 hover:shadow-[0_0_16px_hsl(var(--primary)/0.10)]
               transition-all duration-300 text-left w-full"
  >
    <span
      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      style={{ background: gradient }}
    >
      <Icon className="h-5 w-5 text-white" />
    </span>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-foreground text-sm">{label}</p>
      <p className="text-xs text-muted-foreground truncate">{desc}</p>
    </div>
    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
  </button>
);

/* ── bar chart for weekly calories ──────── */
const WeeklyBar = ({ day, cals, maxCals }) => {
  const pct = maxCals > 0 ? Math.round((cals / maxCals) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[10px] font-bold text-muted-foreground">{cals > 0 ? cals : ""}</span>
      <div className="relative flex h-24 w-7 items-end rounded-lg overflow-hidden bg-muted/30">
        <div
          className="w-full rounded-lg transition-all duration-700"
          style={{
            height: `${Math.max(pct, cals > 0 ? 6 : 0)}%`,
            background: "linear-gradient(180deg, hsl(258 80% 68%), hsl(192 100% 50%))",
          }}
        />
      </div>
      <span className="text-[10px] text-muted-foreground font-medium">{day}</span>
    </div>
  );
};

/* ══════════════════════════════════════════ */
const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const uid = user?._id || user?.id;
    if (!uid) { setIsLoading(false); return; }
    (async () => {
      try {
        const { data } = await api.get(`/progress/${uid}/detailed`);
        if (data.success) setProgressData(data);
      } catch { /* silent */ }
      finally { setIsLoading(false); }
    })();
  }, [user]);

  /* ── Not logged in ── */
  if (!user) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ background: "linear-gradient(135deg, hsl(258 80% 68%), hsl(192 100% 50%))" }}>
          <LogIn className="h-9 w-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome to AuraFit</h1>
        <p className="text-muted-foreground mb-6">Log in to access your personalized fitness dashboard.</p>
        <Button
          onClick={() => navigate("/login")}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-2.5 rounded-xl"
        >
          Log In
        </Button>
        <Button variant="ghost" onClick={() => navigate("/signup")} className="w-full mt-2 text-muted-foreground hover:text-foreground">
          Create Account
        </Button>
      </div>
    </div>
  );

  /* ── Loading ── */
  if (isLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">Loading your dashboard…</p>
      </div>
    </div>
  );

  /* ── Stats ── */
  const totalWorkouts = progressData?.totalWorkouts ?? 0;
  const totalCals = progressData?.totalCaloriesBurned ?? 0;
  const streak = progressData?.streakDays ?? 0;
  const avgProtein = progressData?.avgProteinIntake ?? 0;
  const weeklyWorkouts = progressData?.weeklyStats?.workouts ?? 0;
  const weeklyCalsBurned = progressData?.weeklyStats?.caloriesBurned ?? 0;

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const weekGraph = progressData?.weeklyGraph ?? [];
  const maxCals = Math.max(...weekGraph.map(d => d.caloriesOut || 0), 1);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero header ─────────────────────── */}
      <div
        className="relative pt-28 pb-10 px-4 md:px-8 overflow-hidden"
        style={{ background: "linear-gradient(180deg, hsl(252 50% 5%), hsl(252 40% 4%))" }}
      >
        {/* decorative blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-10 h-72 w-72 rounded-full opacity-[0.06] blur-3xl"
            style={{ background: "hsl(258 80% 68%)" }} />
          <div className="absolute -right-10 bottom-0 h-60 w-60 rounded-full opacity-[0.06] blur-3xl"
            style={{ background: "hsl(192 100% 50%)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ background: "linear-gradient(135deg, hsl(258 80% 68%), hsl(192 100% 50%))" }}>
              {(user.name || user.email || "?")[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-0.5">Welcome back</p>
              <h1 className="text-3xl md:text-4xl font-extrabold bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(90deg, hsl(258 80% 75%), hsl(192 100% 60%))" }}>
                {user.name || user.email}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                {streak > 0
                  ? `🔥 ${streak}-day streak — keep it up!`
                  : "Start logging workouts to build your streak!"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main content ───────────────────── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ── Stat cards row ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Your Lifetime Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={Dumbbell} label="Workouts" value={totalWorkouts}
              sub="all time" gradient="linear-gradient(135deg,#7c3aed,#a78bfa)"
            />
            <StatCard
              icon={Flame} label="Kcal Burned" value={totalCals.toLocaleString()}
              sub="all time" gradient="linear-gradient(135deg,#ea580c,#fb923c)"
            />
            <StatCard
              icon={Zap} label="Day Streak" value={`${streak}d`}
              sub="keep going!" gradient="linear-gradient(135deg,#0891b2,#22d3ee)"
            />
            <StatCard
              icon={Apple} label="Avg Protein" value={`${avgProtein}g`}
              sub="per day" gradient="linear-gradient(135deg,#16a34a,#4ade80)"
            />
          </div>
        </section>

        {/* ── Weekly summary + graph ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly bar chart */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-foreground">Weekly Activity</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Calories burned per day</p>
              </div>
              <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-1">
                <TrendingUp className="h-3 w-3 text-primary" />
                <span className="text-xs font-semibold text-primary">{weeklyCalsBurned} kcal</span>
              </div>
            </div>
            <div className="flex items-end justify-between gap-1">
              {weekGraph.length > 0
                ? weekGraph.map((d, i) => {
                    const date = new Date(d.date);
                    return (
                      <WeeklyBar
                        key={i}
                        day={DAYS[date.getDay()]}
                        cals={d.caloriesOut || 0}
                        maxCals={maxCals}
                      />
                    );
                  })
                : DAYS.map(day => <WeeklyBar key={day} day={day} cals={0} maxCals={1} />)
              }
            </div>
          </div>

          {/* Weekly summary */}
          <div className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-foreground mb-1">This Week</h3>
              <p className="text-xs text-muted-foreground mb-5">Your 7-day performance summary</p>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Workouts completed</span>
                    <span className="font-bold text-foreground">{weeklyWorkouts} / 7</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-muted/30">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((weeklyWorkouts / 7) * 100, 100)}%`,
                        background: "linear-gradient(90deg, hsl(258 80% 68%), hsl(192 100% 50%))"
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-muted-foreground">Calorie goal (3500 kcal)</span>
                    <span className="font-bold text-foreground">{weeklyCalsBurned}</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-muted/30">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${Math.min((weeklyCalsBurned / 3500) * 100, 100)}%`,
                        background: "linear-gradient(90deg, hsl(4 85% 70%), hsl(38 92% 65%))"
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <Button
              onClick={() => navigate("/progress")}
              className="mt-6 w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold rounded-xl"
            >
              <BarChart3 className="mr-2 h-4 w-4" /> View Full Progress
            </Button>
          </div>
        </section>

        {/* ── Quick Actions ── */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <QuickAction
              icon={Dumbbell} label="Log Workout" desc="Record today's training session"
              to="/dashboard/workouts" gradient="linear-gradient(135deg,#7c3aed,#a78bfa)" navigate={navigate}
            />
            <QuickAction
              icon={Apple} label="Log Meal" desc="Track your nutrition intake"
              to="/dashboard/diet" gradient="linear-gradient(135deg,#16a34a,#4ade80)" navigate={navigate}
            />
            <QuickAction
              icon={Calendar} label="Workout Planner" desc="Plan your upcoming sessions"
              to="/planner" gradient="linear-gradient(135deg,#0891b2,#22d3ee)" navigate={navigate}
            />
            <QuickAction
              icon={Target} label="Training Plans" desc="Browse structured programs"
              to="/training-plans" gradient="linear-gradient(135deg,#ea580c,#fb923c)" navigate={navigate}
            />
            <QuickAction
              icon={Brain} label="Mind & Wellness" desc="Meditation & sleep resources"
              to="/mind" gradient="linear-gradient(135deg,#7c3aed,#ec4899)" navigate={navigate}
            />
            <QuickAction
              icon={Users} label="Community" desc="Share and connect with others"
              to="/community" gradient="linear-gradient(135deg,#0f766e,#34d399)" navigate={navigate}
            />
            <QuickAction
              icon={Trophy} label="Challenges" desc="Join active fitness challenges"
              to="/challenges" gradient="linear-gradient(135deg,#b45309,#fbbf24)" navigate={navigate}
            />
            <QuickAction
              icon={Star} label="Collections" desc="Workout collections by body part"
              to="/collections" gradient="linear-gradient(135deg,#be185d,#f472b6)" navigate={navigate}
            />
            <QuickAction
              icon={Clock} label="Pose Detection" desc="AI-powered form checker"
              to="/pose-detection" gradient="linear-gradient(135deg,#1e40af,#60a5fa)" navigate={navigate}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
