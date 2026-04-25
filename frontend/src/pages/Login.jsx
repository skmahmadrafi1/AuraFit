import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import api, { handleApiError } from "@/api/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, LogIn, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      login(data.token, data.user);
      toast({ title: "Welcome back! 👋", description: "You're connected — let's get moving." });
      navigate("/dashboard");
    } catch (err) {
      const message = handleApiError(err);
      setError(message);
      toast({ title: "Login Failed", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full opacity-[0.07] blur-3xl"
          style={{ background: "hsl(258 80% 68%)" }} />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full opacity-[0.06] blur-3xl"
          style={{ background: "hsl(192 100% 50%)" }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / brand */}
        <div className="mb-8 text-center">
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
            style={{ background: "linear-gradient(135deg, hsl(258 80% 68%), hsl(192 100% 50%))" }}
          >
            <LogIn className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground">Welcome back</h1>
          <p className="mt-1 text-muted-foreground text-sm">Log in to continue your journey</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 shadow-[0_0_40px_hsl(258_80%_68%/0.06)]">
          {error && (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-semibold text-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="h-11 rounded-xl border-border bg-muted/20 text-foreground placeholder:text-muted-foreground focus:bg-muted/20 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-semibold text-foreground">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-border bg-muted/20 text-foreground placeholder:text-muted-foreground pr-10 focus:bg-muted/20 focus:border-primary/50 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 rounded-xl font-bold text-white"
              style={{ background: "linear-gradient(90deg, hsl(258 80% 68%), hsl(192 100% 50%))" }}
            >
              {loading
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</>
                : "Sign In"
              }
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-semibold text-primary hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
