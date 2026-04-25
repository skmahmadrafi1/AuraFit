import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import api, { handleApiError } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Flame, Leaf, Dumbbell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  EmptyState, LoadingGrid, PageHero, PageSurface, SurfaceCard, staggerItem, staggerWrap,
} from "@/components/saas/SaaSPrimitives";

const GOALS = [
  {
    key: "muscle-gain",
    title: "Muscle Gain",
    description: "High-protein plans with smart calorie surplus.",
    icon: Dumbbell,
    color: "text-primary border-primary/30 bg-primary/10",
    activeColor: "border-primary bg-primary/15 shadow-[0_0_20px_hsl(var(--primary)/0.2)]",
  },
  {
    key: "fat-loss",
    title: "Fat Loss",
    description: "Balanced deficits with nutrient-dense meals.",
    icon: Flame,
    color: "text-orange-400 border-orange-500/30 bg-orange-500/10",
    activeColor: "border-orange-400 bg-orange-500/15 shadow-[0_0_20px_rgba(251,146,60,0.2)]",
  },
  {
    key: "wellness",
    title: "Wellness",
    description: "Clean eating with flexible lifestyle choices.",
    icon: Leaf,
    color: "text-green-400 border-green-500/30 bg-green-500/10",
    activeColor: "border-green-400 bg-green-500/15 shadow-[0_0_20px_rgba(74,222,128,0.2)]",
  },
];

const MacroBar = ({ label, value, max, color }) => (
  <div>
    <div className="mb-1.5 flex justify-between text-xs">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="text-foreground font-bold">{value}{label !== "Calories" ? "g" : ""}</span>
    </div>
    <div className="h-2 rounded-full bg-muted/40">
      <div
        className={`h-2 rounded-full ${color} transition-all duration-700`}
        style={{ width: `${Math.min(100, (value / max) * 100)}%` }}
      />
    </div>
  </div>
);

const Nutrition = () => {
  const { user } = useAuth();
  const [selectedGoal, setSelectedGoal] = useState(GOALS[0].key);
  const [isLoading, setIsLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [nutritionPlan, setNutritionPlan] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [aiMealPlanEnabled, setAiMealPlanEnabled] = useState(false);
  const [calories, setCalories] = useState(2000);
  const [aiMealPlan, setAiMealPlan] = useState(null);
  const [isGeneratingMealPlan, setIsGeneratingMealPlan] = useState(false);

  const selectedGoalMeta = useMemo(() => GOALS.find((g) => g.key === selectedGoal), [selectedGoal]);

  const fetchNutrition = useCallback(async (goal) => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const { data } = await api.get(`/nutrition/goal/${goal}`);
      if (data.success && data.meals) {
        setNutritionPlan(data);
        setItems(data.items || []);
      } else {
        setItems(data?.items ?? []);
        setNutritionPlan(null);
      }
    } catch (err) {
      const message = handleApiError(err);
      const isBlocked = err?.code === "ERR_BLOCKED_BY_CLIENT";
      setItems([]);
      setNutritionPlan(null);
      setErrorMessage(isBlocked ? "Backend connection blocked." : message);
      if (!isBlocked) toast({ title: "Unable to load meals", description: message, variant: "destructive" });
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchNutrition(selectedGoal); setAiMealPlan(null); }, [fetchNutrition, selectedGoal]);

  useEffect(() => {
    if (user && user.weight && user.height && user.age) {
      // Calculate BMR (Mifflin-St Jeor)
      const bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + (user.gender === 'Female' ? -161 : 5);
      let tdee = bmr * 1.55; // Moderate activity
      if (selectedGoal === 'muscle-gain') tdee += 500;
      else if (selectedGoal === 'fat-loss') tdee -= 500;
      setCalories(Math.round(tdee));
    }
  }, [user, selectedGoal]);

  const generateMealPlan = async () => {
    if (!user?._id) {
      toast({ title: "Login required", description: "Please log in to generate meal plans.", variant: "destructive" });
      return;
    }
    setIsGeneratingMealPlan(true);
    try {
      const goalTitle = GOALS.find((g) => g.key === selectedGoal)?.title || "General Fitness";
      const { data } = await api.post("/nutrition/ai-meal-plan", {
        userId: user._id, goalType: goalTitle, calories: parseInt(calories), dietPreference: "Balanced"
      });
      if (data.success) {
        setAiMealPlan(data);
        toast({ title: "Meal plan ready! 🎉", description: "Your personalized daily plan is here." });
      }
    } catch (err) {
      toast({ title: "Generation failed", description: handleApiError(err), variant: "destructive" });
    } finally { setIsGeneratingMealPlan(false); }
  };

  return (
    <PageSurface>
      <PageHero
        badge="Nutrition Lab"
        title="Fuel smarter with goal-based nutrition plans."
        description="Choose your goal, view macro breakdowns, and generate AI-powered 7-day meal plans in seconds."
      />

      {/* Goal selector */}
      <motion.div variants={staggerWrap} initial="hidden" animate="show" className="grid gap-4 md:grid-cols-3">
        {GOALS.map((goal) => {
          const Icon = goal.icon;
          const isActive = selectedGoal === goal.key;
          return (
            <motion.button
              variants={staggerItem}
              key={goal.key}
              type="button"
              onClick={() => setSelectedGoal(goal.key)}
              className={`rounded-2xl border p-5 text-left transition-all duration-200
                ${isActive ? goal.activeColor : "border-border bg-card hover:border-border/80"}
              `}
            >
              <div className={`mb-3 inline-flex rounded-xl p-2.5 ${isActive ? goal.color : "bg-muted/40 text-muted-foreground"}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-foreground">{goal.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{goal.description}</p>
            </motion.button>
          );
        })}
      </motion.div>

      {/* AI Generator + Macro Summary */}
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <SurfaceCard>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-foreground flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" /> AI Meal Generator
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">Generate a personalized 7-day plan.</p>
            </div>
            <Switch id="ai-toggle" checked={aiMealPlanEnabled} onCheckedChange={setAiMealPlanEnabled} />
          </div>
          {aiMealPlanEnabled && (
            <div className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-foreground text-sm">Daily Calorie Target</Label>
                <Input
                  type="number" value={calories} onChange={(e) => setCalories(e.target.value)}
                  min={1200} max={4000}
                  className="border-border bg-muted/30 text-foreground"
                />
              </div>
              <Button onClick={generateMealPlan} disabled={isGeneratingMealPlan} className="w-full">
                {isGeneratingMealPlan
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...</>
                  : <><Sparkles className="mr-2 h-4 w-4" /> Generate Plan</>}
              </Button>
            </div>
          )}
        </SurfaceCard>

        <SurfaceCard>
          <h3 className="font-bold text-foreground">{selectedGoalMeta?.title} — Daily Macros</h3>
          <p className="mb-4 text-sm text-muted-foreground">Target macros for your selected goal.</p>
          {nutritionPlan?.macros ? (
            <div className="space-y-4">
              <MacroBar label="Calories" value={nutritionPlan.macros.calories} max={3500} color="bg-primary" />
              <MacroBar label="Protein" value={nutritionPlan.macros.protein} max={250} color="bg-blue-400" />
              <MacroBar label="Carbs" value={nutritionPlan.macros.carbs} max={400} color="bg-orange-400" />
              <MacroBar label="Fat" value={nutritionPlan.macros.fat} max={120} color="bg-yellow-400" />
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Calories", value: "2,200", color: "text-primary" },
                { label: "Protein", value: "180g", color: "text-blue-400" },
                { label: "Carbs", value: "240g", color: "text-orange-400" },
                { label: "Fat", value: "65g", color: "text-yellow-400" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl border border-border bg-muted/20 p-3 text-center">
                  <p className="text-xs text-muted-foreground">{m.label}</p>
                  <p className={`mt-1 text-lg font-bold ${m.color}`}>{m.value}</p>
                </div>
              ))}
            </div>
          )}
        </SurfaceCard>
      </div>

      {/* Meal cards */}
      <div className="mt-8">
        <h3 className="mb-4 text-lg font-bold text-foreground">
          {selectedGoalMeta?.title} Meal Plan
        </h3>
        {isLoading ? (
          <LoadingGrid cards={4} />
        ) : errorMessage ? (
          <EmptyState title="Unable to load nutrition data" description={errorMessage} />
        ) : nutritionPlan?.meals?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {nutritionPlan.meals.map((meal, idx) => (
              <div key={`${meal.mealType}-${idx}`} className="rounded-2xl border border-border bg-card p-4 hover:border-primary/30 transition-colors">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-bold text-foreground">{meal.mealType}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                    {meal.calories} kcal
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {meal.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : items.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <div key={item._id || item.name} className="rounded-2xl border border-border bg-card p-5 hover:border-primary/30 transition-colors">
                <h4 className="text-base font-bold text-foreground">{item.name || item.title || "Meal"}</h4>
                {item.description && <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>}
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {typeof item.calories === "number" && (
                    <div className="rounded-lg bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="font-bold text-primary">{item.calories}</p>
                    </div>
                  )}
                  {typeof item.protein === "number" && (
                    <div className="rounded-lg bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Protein</p>
                      <p className="font-bold text-blue-400">{item.protein}g</p>
                    </div>
                  )}
                  {typeof item.carbs === "number" && (
                    <div className="rounded-lg bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Carbs</p>
                      <p className="font-bold text-orange-400">{item.carbs}g</p>
                    </div>
                  )}
                  {typeof item.fat === "number" && (
                    <div className="rounded-lg bg-muted/30 px-3 py-2">
                      <p className="text-xs text-muted-foreground">Fat</p>
                      <p className="font-bold text-yellow-400">{item.fat}g</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No meals available" description="Try another goal or generate a custom AI meal plan above." />
        )}
      </div>

      {/* AI Plan output */}
      {aiMealPlan && aiMealPlan.meals && (
        <SurfaceCard className="mt-8" highlight>
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" /> Your AI-Generated Daily Plan
            </h3>
            <span className="rounded-full bg-primary/20 px-3 py-1 text-sm font-semibold text-primary">
              {aiMealPlan.targetCalories} kcal Target
            </span>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
             <MacroBar label="Total Calories" value={aiMealPlan.macros?.totalCalories || 0} max={3500} color="bg-primary" />
             <MacroBar label="Total Protein" value={aiMealPlan.macros?.totalProtein || 0} max={250} color="bg-blue-400" />
             <MacroBar label="Total Carbs" value={aiMealPlan.macros?.totalCarbs || 0} max={400} color="bg-orange-400" />
             <MacroBar label="Total Fat" value={aiMealPlan.macros?.totalFat || 0} max={120} color="bg-yellow-400" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {aiMealPlan.meals.map((meal, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition-colors">
                <div className="mb-3 flex items-center justify-between border-b border-border pb-3">
                  <h4 className="font-bold text-foreground text-lg">{meal.meal}</h4>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    {meal.calories} kcal
                  </span>
                </div>
                <ul className="mb-4 space-y-2">
                  {meal.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto grid grid-cols-3 gap-2 border-t border-border pt-3">
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Pro</p>
                    <p className="font-semibold text-blue-400 text-sm">{meal.protein}g</p>
                  </div>
                  <div className="text-center border-l border-r border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Carb</p>
                    <p className="font-semibold text-orange-400 text-sm">{meal.carbs}g</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fat</p>
                    <p className="font-semibold text-yellow-400 text-sm">{meal.fat}g</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>
      )}
    </PageSurface>
  );
};

export default Nutrition;
