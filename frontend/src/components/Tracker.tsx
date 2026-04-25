import { useCallback, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadialBarChart, RadialBar, Legend,
} from "recharts";
import api, { handleApiError } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { Flame, Footprints, Loader2, TrendingUp, Activity } from "lucide-react";
import { EmptyState, SurfaceCard } from "@/components/saas/SaaSPrimitives";

const Tracker = () => {
  const { user } = useAuth();
  const [trackerData, setTrackerData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState("total");

  const fetchTrackerData = useCallback(async () => {
    const userId = user?._id || user?.id;
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data } = await api.get(`/tracker/${userId}?period=${period}`);
      if (data.success) setTrackerData(data);
    } catch (err) {
      toast({ title: "Unable to load tracker", description: handleApiError(err), variant: "destructive" });
    } finally { setIsLoading(false); }
  }, [period, user?._id, user?.id]);

  useEffect(() => {
    if (user?._id || user?.id) fetchTrackerData();
  }, [fetchTrackerData, user?._id, user?.id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-border bg-card py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!trackerData) {
    return (
      <EmptyState
        title="No tracker data yet"
        description="Complete workouts to unlock your personalized analytics dashboard."
      />
    );
  }

  const chartData = trackerData.bodyPartStats.map((s) => ({
    name: s.displayName,
    workouts: s.workouts,
    duration: s.totalDuration,
    calories: s.totalCalories,
  }));

  const STAT_CARDS = [
    { label: "Total Workouts", value: trackerData.totalWorkouts, icon: TrendingUp, color: "text-primary bg-primary/15" },
    { label: "Minutes Trained", value: trackerData.summary.totalDuration, icon: Footprints, color: "text-secondary bg-secondary/15" },
    { label: "Calories Burned", value: trackerData.summary.totalCalories, icon: Flame, color: "text-orange-400 bg-orange-400/15" },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: "10px",
    color: "hsl(var(--foreground))",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
            <Activity className="h-5 w-5 text-primary" /> Performance Dashboard
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Track steps, calories, workouts, and body-part progress.
          </p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36 border-border bg-muted/30 text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border-border">
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="total">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {STAT_CARDS.map((item) => {
          const Icon = item.icon;
          return (
            <SurfaceCard key={item.label}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="mt-1.5 text-4xl font-extrabold text-foreground">
                    {item.value?.toLocaleString() ?? "—"}
                  </p>
                </div>
                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </SurfaceCard>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 xl:grid-cols-2">
        <SurfaceCard>
          <h3 className="mb-1 text-base font-bold text-foreground">Workout Distribution</h3>
          <p className="mb-4 text-sm text-muted-foreground">Sessions completed by body part.</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <YAxis stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="workouts" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="mb-1 text-base font-bold text-foreground">Training Split</h3>
          <p className="mb-4 text-sm text-muted-foreground">Current balance across training categories.</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadialBarChart
              cx="50%" cy="50%"
              innerRadius="25%" outerRadius="85%"
              data={trackerData.bodyPartStats.map((s, i) => ({
                name: s.displayName,
                value: s.progressPercentage,
                fill: `hsl(${258 + i * 25} 70% 65%)`,
              }))}
            >
              <RadialBar dataKey="value" cornerRadius={8} />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: "hsl(var(--muted-foreground))" }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </SurfaceCard>
      </div>

      {/* Body part cards */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {trackerData.bodyPartStats.map((stat) => (
          <SurfaceCard key={stat.name} className="space-y-3">
            <h4 className="font-bold text-foreground">{stat.displayName}</h4>
            <div className="space-y-1.5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Workouts</span>
                <span className="font-semibold text-foreground">{stat.workouts}</span>
              </div>
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-foreground">{stat.totalDuration} min</span>
              </div>
              <div className="flex justify-between">
                <span>Calories</span>
                <span className="font-semibold text-orange-400">{stat.totalCalories}</span>
              </div>
            </div>
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-primary">{stat.progressPercentage}%</span>
              </div>
              <Progress value={stat.progressPercentage} className="h-2 bg-muted/40" />
            </div>
            {stat.lastWorkout && (
              <p className="text-xs text-muted-foreground">
                Last: {new Date(stat.lastWorkout).toLocaleDateString()}
              </p>
            )}
          </SurfaceCard>
        ))}
      </motion.div>
    </div>
  );
};

export default Tracker;
