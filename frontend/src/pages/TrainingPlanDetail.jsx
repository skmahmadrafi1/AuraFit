import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Clock, Calendar, Zap, Dumbbell } from "lucide-react";
import api from "@/api/client";
import { Button } from "@/components/ui/button";
import { PageSurface, EmptyState, LoadingGrid } from "@/components/saas/SaaSPrimitives";

const TrainingPlanDetail = () => {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlan = async () => {
      try {
        const { data } = await api.get(`/training-plans/${id}`);
        setPlan(data.plan || data);
      } catch (err) {
        setError("Failed to load training plan details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  if (isLoading) return <PageSurface><LoadingGrid cards={1} /></PageSurface>;
  if (error || !plan) return <PageSurface><EmptyState title="Plan Not Found" description={error || "This training plan might have been removed."} action={<Link to="/training-plans"><Button>Back to Plans</Button></Link>} /></PageSurface>;

  return (
    <PageSurface>
      <Link to="/training-plans" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Training Plans
      </Link>
      
      <div className="relative rounded-3xl border border-border bg-card overflow-hidden mb-8" style={{ background: plan.imageColor || "#1e1e2e" }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent pointer-events-none" />
        <div className="relative p-8 md:p-12 lg:p-16">
          <div className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary mb-4 uppercase tracking-widest">
            {plan.level || "Base"} Plan
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-foreground mb-4">{plan.name}</h1>
          {plan.subtitle && <p className="text-xl font-bold uppercase tracking-widest text-primary mb-6">{plan.subtitle}</p>}
          <p className="text-lg text-muted-foreground max-w-2xl">{plan.description || "A comprehensive training plan to push your limits."}</p>
          
          <div className="flex flex-wrap gap-6 mt-8">
            <div className="flex items-center gap-2 text-foreground font-medium"><Calendar className="h-5 w-5 text-primary" /> {plan.daysPerWeek || 5} days/week</div>
            <div className="flex items-center gap-2 text-foreground font-medium"><Clock className="h-5 w-5 text-primary" /> {plan.duration || "30 days"}</div>
            <div className="flex items-center gap-2 text-foreground font-medium"><Dumbbell className="h-5 w-5 text-primary" /> {plan.equipment || "No equipment"}</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Workouts in this Plan</h2>
        {plan.workouts && plan.workouts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plan.workouts.map((workout, idx) => (
              <div key={idx} className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-lg text-foreground">{workout.title || `Workout Day ${idx + 1}`}</h3>
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mb-4">{workout.type || "Mixed Training"}</p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="mr-1.5 h-3.5 w-3.5" /> {workout.durationMin || 30} mins
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No workouts found" description="There are currently no workouts assigned to this plan." />
        )}
      </div>
    </PageSurface>
  );
};

export default TrainingPlanDetail;
