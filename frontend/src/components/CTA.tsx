import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import img2 from "@/assets/2image.jpg";

export const CTA = () => {
  const navigate = useNavigate();
  
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Hero animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-transparent to-black/30 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/12 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: text and CTAs */}
          <div className="space-y-6 max-w-xl">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm">
              <Sparkles className="w-5 h-5 text-primary animate-glow" />
              <span className="text-muted-foreground font-semibold">AuraFit — AI Personal Coach</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-display font-bold leading-tight">
              Meet AuraFit
              <br />
              <span className="text-gradient">Your 24/7 AI Fitness Ally</span>
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed">
              Smart workouts, meal plans, and real-time form feedback that adapt to your body.
              Tell AuraFit your height, weight and goal — then watch it craft the perfect plan.
            </p>

            <div className="flex flex-wrap gap-4 mt-4">
              <Button size="lg" variant="hero" className="group px-8" onClick={() => navigate("/login")}>
                Start Free
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button size="lg" variant="outline" className="px-6" onClick={() => navigate("/features")}>
                Learn More
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-6 mt-8">
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-gradient">Tailored</div>
                <p className="text-sm text-muted-foreground">Plans for every goal</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-gradient">Real-Time</div>
                <p className="text-sm text-muted-foreground">Form feedback & coaching</p>
              </div>
              <div className="space-y-1">
                <div className="text-2xl font-display font-bold text-gradient">Community</div>
                <p className="text-sm text-muted-foreground">Motivation & challenges</p>
              </div>
            </div>
          </div>

          {/* Right: Feature Image */}
          <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-card neon-border group">
            <img src={img2} alt="AuraFit Professional" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
};
