"use client";

import { useChat } from "ai/react";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

export function ChatMetrics() {
  const { messages } = useChat();
  const [metrics, setMetrics] = useState({
    totalTokens: 0,
    tokensPerSecond: 0,
    estimatedCompletionTime: 0,
  });

  useEffect(() => {
    const calculateMetrics = () => {
      const totalTokens = messages.reduce(
        (acc, message) => acc + message.content.length / 4,
        0
      );
      const tokensPerSecond = totalTokens / (messages.length * 0.5); // Assuming 0.5 seconds per message on average
      const estimatedCompletionTime = totalTokens / tokensPerSecond;

      setMetrics({ totalTokens, tokensPerSecond, estimatedCompletionTime });
    };

    calculateMetrics();
  }, [messages]);

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Tokens/sec
          </div>
          <div className="text-xl font-bold">
            {metrics.tokensPerSecond.toFixed(1)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Total Tokens
          </div>
          <div className="text-xl font-bold">
            {Math.round(metrics.totalTokens)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="text-sm font-medium text-muted-foreground">
            Est. Time
          </div>
          <div className="text-xl font-bold">
            {metrics.estimatedCompletionTime.toFixed(1)}s
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
