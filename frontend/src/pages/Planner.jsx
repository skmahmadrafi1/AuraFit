import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import api, { handleApiError } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import {
  CalendarDays, Check, Loader2, PlusCircle, Trash2, Sparkles, Activity,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Tracker from "@/components/Tracker";
import {
  EmptyState, PageHero, PageSurface, SurfaceCard, staggerItem, staggerWrap,
} from "@/components/saas/SaaSPrimitives";

const Planner = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultTab = searchParams.get("tab") || "planner";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);
  const [isLoadingWorkouts, setIsLoadingWorkouts] = useState(false);
  const [plans, setPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [suggestedPlans, setSuggestedPlans] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [viewPeriod, setViewPeriod] = useState("weekly");
  const [formState, setFormState] = useState({ workoutId: "", date: "", notes: "", durationMin: "" });

  const sortedPlans = useMemo(
    () => [...plans].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [plans],
  );

  const fetchWorkouts = async () => {
    setIsLoadingWorkouts(true);
    try {
      const { data } = await api.get("/workouts");
      setWorkouts(Array.isArray(data) ? data : data?.workouts || []);
    } catch (err) {
      toast({ title: "Unable to load workouts", description: handleApiError(err), variant: "destructive" });
    } finally { setIsLoadingWorkouts(false); }
  };

  const fetchPlans = async () => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setIsLoadingPlans(true);
    try {
      const { data } = await api.get(`/planner/${userId}`);
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      toast({ title: "Unable to load plans", description: handleApiError(err), variant: "destructive" });
    } finally { setIsLoadingPlans(false); }
  };

  const fetchSuggestedPlans = async () => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setIsLoadingSuggestions(true);
    try {
      const { data } = await api.get(`/planner/suggest/${userId}?period=${viewPeriod}`);
      if (data.success) setSuggestedPlans(data.suggestedPlans || []);
    } catch { /* silent */ } finally { setIsLoadingSuggestions(false); }
  };

  useEffect(() => { fetchWorkouts(); }, []);
  useEffect(() => {
    const uid = user?._id || user?.id;
    if (uid) { fetchPlans(); fetchSuggestedPlans(); }
    else { setPlans([]); setSuggestedPlans([]); }
  }, [user?._id, user?.id, viewPeriod]);

  const addSuggestedPlan = async (s) => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setIsSubmitting(true);
    try {
      await api.post("/planner", {
        userId, workoutId: s.workoutId,
        date: new Date(s.date).toISOString().split("T")[0],
        notes: s.notes, durationMin: s.suggestedDuration,
      });
      toast({ title: "Plan added!", description: `${s.workout.title} scheduled.` });
      fetchPlans();
    } catch (err) {
      toast({ title: "Unable to add plan", description: handleApiError(err), variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?._id || user?.id;
    if (!userId) { toast({ title: "Login required", variant: "destructive" }); return; }
    if (!formState.workoutId || !formState.date) {
      toast({ title: "Missing fields", description: "Choose a workout and a date.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post("/planner", {
        userId, workoutId: formState.workoutId, date: formState.date,
        notes: formState.notes,
        durationMin: formState.durationMin ? Number(formState.durationMin) : undefined,
      });
      toast({ title: "Workout scheduled!" });
      setFormState({ workoutId: "", date: "", notes: "", durationMin: "" });
      fetchPlans();
    } catch (err) {
      toast({ title: "Unable to schedule", description: handleApiError(err), variant: "destructive" });
    } finally { setIsSubmitting(false); }
  };

  const markCompleted = async (planId) => {
    try {
      await api.patch(`/planner/${planId}/complete`, { status: "completed" });
      toast({ title: "Workout complete! 🎉" });
      fetchPlans();
    } catch (err) {
      toast({ title: "Unable to update", description: handleApiError(err), variant: "destructive" });
    }
  };

  const deletePlan = async (planId) => {
    try {
      await api.delete(`/planner/${planId}`);
      toast({ title: "Plan removed" });
      fetchPlans();
    } catch (err) {
      toast({ title: "Unable to delete", description: handleApiError(err), variant: "destructive" });
    }
  };

  return (
    <PageSurface>
      <PageHero
        badge="Productivity Hub"
        title="Plan workouts. Track execution. Stay consistent."
        description="Schedule sessions, get AI-powered suggestions, and monitor completion — all in one workflow."
      />

      {user ? (
        <Tabs defaultValue={defaultTab} className="w-full" onValueChange={(v) => setSearchParams({ tab: v })}>
          {/* Tab bar */}
          <TabsList className="mb-8 inline-flex rounded-xl border border-border bg-card p-1 gap-1">
            <TabsTrigger
              value="planner"
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
            >
              <CalendarDays className="h-4 w-4" /> Planner
            </TabsTrigger>
            <TabsTrigger
              value="tracker"
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-medium text-muted-foreground transition
                data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow"
            >
              <Activity className="h-4 w-4" /> Tracker
            </TabsTrigger>
          </TabsList>

          {/* ── Planner tab ── */}
          <TabsContent value="planner" className="space-y-8">

            {/* Suggested Plans */}
            <SurfaceCard>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> AI Suggested Plans
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Personalized for {user.fitnessGoal || "your current goal"}.
                  </p>
                </div>
                <Select value={viewPeriod} onValueChange={setViewPeriod}>
                  <SelectTrigger className="w-32 border-border bg-muted/30 text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border-border">
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {isLoadingSuggestions ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : suggestedPlans.length === 0 ? (
                <EmptyState
                  title="No suggested plans yet"
                  description="Update your fitness goal in your profile to unlock tailored sessions."
                />
              ) : (
                <motion.div variants={staggerWrap} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {suggestedPlans.map((s, i) => (
                    <motion.div key={`${s.workoutId}-${i}`} variants={staggerItem}>
                      <div className="rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/40 transition-colors">
                        <p className="text-[11px] font-semibold uppercase tracking-widest text-primary">
                          {s.workout?.type || "Workout"}
                        </p>
                        <h4 className="mt-1.5 text-base font-bold text-foreground">{s.workout?.title}</h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
                            {new Date(s.date).toLocaleDateString()}
                          </span>
                          <span className="rounded-full bg-muted/60 px-2.5 py-0.5 text-xs text-muted-foreground">
                            {s.suggestedDuration} min
                          </span>
                        </div>
                        {s.notes && <p className="mt-2 text-xs text-muted-foreground">{s.notes}</p>}
                        <Button onClick={() => addSuggestedPlan(s)} disabled={isSubmitting} size="sm" className="mt-3 w-full">
                          <PlusCircle className="mr-1.5 h-3.5 w-3.5" /> Add to Planner
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </SurfaceCard>

            {/* Create Task + Planned Tasks */}
            <div className="grid gap-6 xl:grid-cols-[1fr_1.1fr]">
              {/* Form */}
              <SurfaceCard>
                <h3 className="mb-1 text-lg font-bold text-foreground">Schedule a Session</h3>
                <p className="mb-5 text-sm text-muted-foreground">Add a workout to your plan with date and duration.</p>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Workout</Label>
                    <select
                      name="workoutId"
                      value={formState.workoutId}
                      onChange={handleChange}
                      disabled={isLoadingWorkouts || workouts.length === 0}
                      className="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary transition"
                    >
                      <option value="">Select a workout...</option>
                      {workouts.map((w) => (
                        <option key={w._id} value={w._id}>
                          {w.title} — {w.durationMin || 30} min
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground">Date</Label>
                      <Input
                        name="date" type="date" value={formState.date} onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        className="border-border bg-muted/30 text-foreground [color-scheme:dark]"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground">Duration (min)</Label>
                      <Input
                        name="durationMin" type="number" min={10} step={5}
                        value={formState.durationMin} onChange={handleChange}
                        placeholder="45"
                        className="border-border bg-muted/30 text-foreground"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground">Notes</Label>
                    <Textarea
                      name="notes" value={formState.notes} onChange={handleChange}
                      placeholder="Intensity, rest time, focus area..."
                      rows={3}
                      className="border-border bg-muted/30 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>
                  <Button type="submit" disabled={isSubmitting || isLoadingWorkouts} className="w-full">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
                    {isSubmitting ? "Scheduling..." : "Add to Plan"}
                  </Button>
                </form>
              </SurfaceCard>

              {/* Planned Tasks */}
              <SurfaceCard>
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">Planned Sessions</h3>
                    <p className="text-sm text-muted-foreground">Sorted by date with quick status actions.</p>
                  </div>
                  {isLoadingPlans && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
                </div>
                <div className="space-y-3">
                  {!isLoadingPlans && sortedPlans.length === 0 ? (
                    <EmptyState title="Nothing planned yet" description="Add your first session to get started." />
                  ) : (
                    sortedPlans.map((plan) => {
                      const title = plan.workoutId?.title || workouts.find((w) => w._id === plan.workoutId)?.title || "Workout";
                      const status = plan.status || "planned";
                      return (
                        <div key={plan._id} className="rounded-xl border border-border bg-muted/20 p-4 hover:border-primary/30 transition-colors">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-foreground">{title}</h4>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {new Date(plan.date).toLocaleString()}
                              </p>
                              {plan.notes && <p className="mt-1 text-sm text-muted-foreground">{plan.notes}</p>}
                            </div>
                            <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              status === "completed"
                                ? "bg-green-500/15 text-green-400"
                                : "bg-yellow-500/15 text-yellow-400"
                            }`}>
                              {status}
                            </span>
                          </div>
                          <div className="mt-3 flex gap-2">
                            <Button
                              variant="outline" size="sm"
                              className="border-border text-foreground hover:bg-green-500/10 hover:text-green-400 hover:border-green-500/30"
                              onClick={() => markCompleted(plan._id)}
                              disabled={status === "completed"}
                            >
                              <Check className="mr-1 h-3.5 w-3.5" /> Complete
                            </Button>
                            <Button
                              variant="outline" size="sm"
                              className="border-border text-foreground hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
                              onClick={() => deletePlan(plan._id)}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" /> Delete
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </SurfaceCard>
            </div>
          </TabsContent>

          {/* ── Tracker tab ── */}
          <TabsContent value="tracker">
            <Tracker />
          </TabsContent>
        </Tabs>
      ) : (
        <SurfaceCard className="max-w-lg">
          <EmptyState
            title="Login required"
            description="Please log in to access your planner and tracker."
          />
          <div className="mt-6">
            <Button asChild className="w-full">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </SurfaceCard>
      )}
    </PageSurface>
  );
};

export default Planner;
