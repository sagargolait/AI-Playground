import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useModelConfig } from "@/hooks/useModelConfig";
import { X } from "lucide-react";
import { useState, useEffect } from "react";

export default function RightSidebar() {
  const { setConfig, config } = useModelConfig();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleReset = () => {
    setConfig({
      model: "gpt-3.5-turbo",
      temperature: 1,
      maxTokens: 2048,
      structuredOutput: false,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    });
  };

  const handleExport = () => {
    // Create configuration object without usage stats
    const exportConfig = {
      model: config.model,
      temperature: config.temperature,
      maxTokens: config.maxTokens,
      structuredOutput: config.structuredOutput,
      topP: config.topP,
      frequencyPenalty: config.frequencyPenalty,
      presencePenalty: config.presencePenalty,
    };

    // Create and trigger download
    const blob = new Blob([JSON.stringify(exportConfig, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model-config.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="fixed right-4 top-4 lg:hidden z-20 bg-[#1a1a1a]"
      >
        Settings
      </Button>

      <div
        className={`
        fixed inset-y-0 right-0 z-30 lg:relative lg:w-[20%]
        transform bg-[#1a1a1a] transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        border-l w-[80%] sm:w-[60%] md:w-[40%] lg:w-[20%]
      `}
      >
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-medium">Run settings</h3>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleExport}>
              Export Config
            </Button>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <ScrollArea className="h-[calc(100vh-57px)]">
          <div className="p-4 space-y-6">
            <div>
              <label className="text-sm mb-2 block">Model</label>
              <Select
                onValueChange={(value) =>
                  setConfig({ ...config, model: value })
                }
                value={config.model}
              >
                <SelectTrigger className="w-full  ">
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-sm">
                <label className="text-sm mb-2 block">Total Tokens</label>
                {config?.usage?.totalTokens || 0}
              </span>
              <span className="text-sm">
                <label className="text-sm mb-2 block">Prompt Tokens</label>
                {config?.usage?.promptTokens || 0}
              </span>
              <span className="text-sm">
                <label className="text-sm mb-2 block">Completion Tokens</label>
                {config?.usage?.completionTokens || 0}
              </span>
            </div>
            <div>
              <label className="text-sm mb-2 block">Temperature</label>
              <div className="flex items-center gap-2">
                <Slider
                  value={[config.temperature]}
                  onValueChange={(value) =>
                    setConfig({ ...config, temperature: value[0] })
                  }
                  max={2}
                  step={0.1}
                  className="flex-1"
                />
                <div className="w-8 h-8 flex items-center justify-center border  rounded-md ">
                  {config.temperature}
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-8">
                <div>
                  <label className="text-sm mb-2 block">Top P</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.topP]}
                      onValueChange={(value) =>
                        setConfig({ ...config, topP: value[0] })
                      }
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="w-8 h-8 flex items-center justify-center border  rounded-md ">
                      {config.topP}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-2 block">
                    Frequency Penalty
                  </label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.frequencyPenalty]}
                      onValueChange={(value) =>
                        setConfig({ ...config, frequencyPenalty: value[0] })
                      }
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="w-8 h-8 flex items-center justify-center border  rounded-md ">
                      {config.frequencyPenalty}
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-sm mb-2 block">Presence Penalty</label>
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[config.presencePenalty]}
                      onValueChange={(value) =>
                        setConfig({ ...config, presencePenalty: value[0] })
                      }
                      max={2}
                      step={0.1}
                      className="flex-1"
                    />
                    <div className="w-8 h-8 flex items-center justify-center border  rounded-md ">
                      {config.presencePenalty}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
