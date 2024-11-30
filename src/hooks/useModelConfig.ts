import { ModelContext } from "@/contexts/modelContext";
import { useContext } from "react";

export function useModelConfig() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModelConfig must be used within a ModelProvider");
  }

  const { config, setConfig } = context;

  return {
    setConfig,
    config,
  };
}
