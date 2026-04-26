import { Facebook, Twitter, Instagram, Youtube, Mail, Github, Linkedin, Phone } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-name";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";

export const Footer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    if (user) {
      setShowSubscribeDialog(true);
      toast({ title: "Subscribed!", description: "You'll receive updates in your dashboard." });
    } else {
      toast({ title: "Subscribed!", description: "Check your email for updates." });
    }
    setEmail("");
  };

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-12">

        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-12">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <img src={logo} alt="AuraFit" className="w-10 h-10 object-contain" />
              <span className="text-2xl font-display font-bold text-gradient">AuraFit</span>
            </div>
            <p className="text-muted-foreground max-w-xs">
              Train Smarter. Glow Stronger. AI-powered fitness platform for the next generation of athletes.
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <span key={i} className="w-10 h-10 rounded-lg bg-muted hover:bg-primary/20 flex items-center justify-center transition-colors cursor-pointer">
                  <Icon className="w-5 h-5 text-muted-foreground" />
                </span>
              ))}
            </div>
          </div>

          {[
            { title: "Product", links: [{ name: "Features", href: "/features" }, { name: "Pricing", href: "/pricing" }, { name: "Workouts", href: "/workouts" }, { name: "Training Plans", href: "/training-plans" }] },
            { title: "Explore", links: [{ name: "Collections", href: "/collections" }, { name: "Nutrition", href: "/nutrition" }, { name: "Community", href: "/community" }, { name: "Planner", href: "/planner" }] },
            { title: "Resources", links: [{ name: "Mind & Wellness", href: "/mind" }, { name: "AI Generator", href: "/ai-generator" }, { name: "Pose Detection", href: "/pose-detection" }, { name: "Challenges", href: "/challenges" }] },
            { title: "Legal", links: [{ name: "Privacy Policy", href: "/legal/privacy" }, { name: "Terms of Service", href: "/legal/terms" }, { name: "Cookie Policy", href: "/legal/cookies" }, { name: "GDPR", href: "/legal/gdpr" }] },
          ].map((section, i) => (
            <div key={i} className="space-y-4">
              <h4 className="font-display font-bold text-foreground">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link, j) => (
                  <li key={j}>
                    <span onClick={() => navigate(link.href)} className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      {link.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="py-8 border-t border-border">
          <div className="max-w-md mx-auto text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <h4 className="font-display font-bold">Stay Updated</h4>
            </div>
            <p className="text-sm text-muted-foreground">Get the latest fitness tips, product updates, and exclusive offers.</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-muted border border-border focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
              <button type="submit" className="px-6 py-2 rounded-lg bg-gradient-primary text-foreground font-semibold hover:scale-105 transition-transform">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="py-8 border-t border-border">
          <div className="text-center space-y-4">
            <h4 className="font-display font-bold text-foreground">Developer</h4>
            <p className="text-white font-semibold text-lg">Sk Mahmad Rafi</p>
            <div className="flex flex-wrap justify-center gap-6">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                +91 7989116813
              </span>
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                skmahmadrafi1@gmail.com
              </span>
              <span onClick={() => window.open("https://github.com/skmahmadrafi1", "_blank")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Github className="w-4 h-4 text-primary" />
                github.com/skmahmadrafi1
              </span>
              <span onClick={() => window.open("https://www.linkedin.com/in/mahmad-rafi-sk-20286b2b5/", "_blank")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                <Linkedin className="w-4 h-4 text-primary" />
                linkedin.com/in/mahmad-rafi-sk
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} AuraFit. All rights reserved.</p>
          <p className="text-sm text-muted-foreground">Built with 💜 by <span className="text-primary font-semibold">Sk Mahmad Rafi</span></p>
        </div>
      </div>

      <Dialog open={showSubscribeDialog} onOpenChange={setShowSubscribeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome to AuraFit Updates!</DialogTitle>
            <DialogDescription>You're now subscribed to receive the latest fitness tips, product updates, and exclusive offers.</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowSubscribeDialog(false)}>Close</Button>
            <Button onClick={() => { setShowSubscribeDialog(false); navigate("/dashboard/progress"); }}>Go to Dashboard</Button>
          </div>
        </DialogContent>
      </Dialog>
    </footer>
  );
};