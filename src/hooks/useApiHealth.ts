
import { useState, useEffect } from "react";
import { checkApiHealth } from "@/services/semanticSearchApi";
import { toast } from "@/hooks/use-toast";

export function useApiHealth() {
  const [isSemanticEnabled, setIsSemanticEnabled] = useState(false);

  useEffect(() => {
    const checkApiStatus = async () => {
      const isHealthy = await checkApiHealth();
      setIsSemanticEnabled(isHealthy);
      if (!isHealthy) {
        toast({
          title: "API Connection Error",
          description: "Could not connect to the semantic search API",
          variant: "destructive"
        });
      }
    };
    
    checkApiStatus();
  }, []);

  return isSemanticEnabled;
}
