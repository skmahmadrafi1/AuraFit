import { useEffect, useState } from "react";
import { AlertCircle, WifiOff } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import api from "@/api/client";

export const BackendStatus = () => {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected" | "blocked">("checking");
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const checkBackend = async () => {
      try {
        await api.get("/health", { timeout: 8000 });
        if (mounted) {
          setStatus("connected");
          setTimeout(() => setShowAlert(false), 5000);
        }
      } catch (error: any) {
        if (!mounted) return;
        
        const isBlocked = error?.code === "ERR_BLOCKED_BY_CLIENT" || 
                         error?.message?.includes("ERR_BLOCKED_BY_CLIENT");
        
        if (isBlocked) {
          setStatus("blocked");
        } else {
          setStatus("disconnected");
        }
      }
    };

    const timeout = setTimeout(checkBackend, 500);
    const interval = setInterval(checkBackend, 30000);
    
    return () => {
      mounted = false;
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  if (!showAlert || status === "connected") return null;

  return (
    <Alert 
      variant={status === "blocked" ? "destructive" : "default"}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-2xl mx-4 shadow-lg"
    >
      {status === "blocked" ? (
        <>
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Backend Connection Blocked</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Your browser or ad blocker is blocking API requests to the backend.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAlert(false)}
              >
                Dismiss
              </Button>
            </div>
            <p className="text-xs mt-2">
              <strong>To fix:</strong> Disable ad blockers for this site and reload.
            </p>
          </AlertDescription>
        </>
      ) : (
        <>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Backend Server Not Connected</AlertTitle>
          <AlertDescription className="space-y-2">
            <p>Unable to connect to the backend API. Some features may not work.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => window.location.reload()}
              >
                Retry Connection
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setShowAlert(false)}
              >
                Dismiss
              </Button>
            </div>
            <p className="text-xs mt-2">
              <strong>Backend:</strong> <code className="bg-muted px-1 rounded">https://aurafit-backend-oary.onrender.com</code>
            </p>
          </AlertDescription>
        </>
      )}
    </Alert>
  );
};