import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PageHero, PageSurface, SurfaceCard, staggerWrap, staggerItem } from "@/components/saas/SaaSPrimitives";
import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";

const MindCard = ({ title, description, type, defaultTime = 30 }) => {
  const [timeLeft, setTimeLeft] = useState(defaultTime);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(defaultTime);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <motion.div variants={staggerItem} className="h-full">
      <SurfaceCard className="h-full flex flex-col justify-between group hover:border-primary/40 transition-all duration-300 p-0 overflow-hidden">
        <div>
          {/* Image Section */}
          <div className="relative h-48 w-full bg-muted/20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent z-10" />
            <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-md rounded-full px-3 py-1 border border-border font-mono text-sm font-bold text-foreground z-20">
              {formatTime(timeLeft)}
            </div>
            
            <motion.img 
              src={`/images/mind/${type}.png`} 
              alt={title}
              className="absolute inset-0 w-full h-full object-cover"
              animate={isActive ? { scale: [1, 1.05, 1], filter: ["brightness(1)", "brightness(1.2)", "brightness(1)"] } : { scale: 1, filter: "brightness(1)" }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="p-5 pb-2">
            <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
            <p className="text-sm text-muted-foreground h-10">{description}</p>
          </div>
        </div>

        <div className="flex gap-3 p-5 pt-4">
          <Button 
            onClick={toggleTimer} 
            className={`flex-1 ${isActive ? "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20" : ""}`}
            variant={isActive ? "outline" : "default"}
          >
            {isActive ? <><Square className="w-4 h-4 mr-2" /> Stop</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
          </Button>
          <Button onClick={resetTimer} variant="outline" size="icon" title="Reset">
            <RotateCcw className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </SurfaceCard>
    </motion.div>
  );
};

const Mind = () => {
  const techniques = [
    {
      id: "box",
      title: "Box Breathing",
      description: "Inhale 4s, Hold 4s, Exhale 4s, Hold 4s. Enhances focus and calm.",
      type: "box",
      defaultTime: 60
    },
    {
      id: "478",
      title: "4-7-8 Relaxation",
      description: "Inhale 4s, Hold 7s, Exhale 8s. Natural tranquilizer for the nervous system.",
      type: "478",
      defaultTime: 60
    },
    {
      id: "belly",
      title: "Deep Belly Breathing",
      description: "Breathe deeply into your diaphragm. Reduces stress and lowers heart rate.",
      type: "belly",
      defaultTime: 60
    },
    {
      id: "grounding",
      title: "5-4-3-2-1 Grounding",
      description: "Focus on 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.",
      type: "grounding",
      defaultTime: 60
    },
    {
      id: "focus",
      title: "Single Point Focus",
      description: "Stare at the center point. Let your peripheral vision soften to build concentration.",
      type: "focus",
      defaultTime: 30
    },
    {
      id: "scan",
      title: "30-Second Body Scan",
      description: "Mentally scan from head to toe, releasing tension as you pass each area.",
      type: "scan",
      defaultTime: 30
    }
  ];

  return (
    <PageSurface>
      <PageHero
        badge="Mind Lab"
        title="Find your focus and center your mind."
        description="Guided meditation and breathing exercises with premium visual aids. Start a session to reduce stress and improve mental clarity."
      />

      <motion.div 
        variants={staggerWrap} 
        initial="hidden" 
        animate="show"
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 mt-8"
      >
        {techniques.map(tech => (
          <MindCard key={tech.id} {...tech} />
        ))}
      </motion.div>
    </PageSurface>
  );
};

export default Mind;
