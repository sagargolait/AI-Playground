import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import {
  Bot,
  FileJson,
  Info,
  Loader2Icon,
  Mail,
  PenLine,
  ShieldQuestion,
  User,
} from "lucide-react";

import { CodeBlock } from "./CodeBlock";
import { useModelConfig } from "@/hooks/useModelConfig";
import { useState } from "react";
import { useChatStorage } from "@/hooks/use-chat-storage";

export default function MainContent() {
  const { config, setConfig } = useModelConfig();
  const [isStreaming, setIsStreaming] = useState(false);
  // const { saveMessages } = useChatStorage();
  const [messageCompletionTimes, setMessageCompletionTimes] = useState<
    Record<string, number>
  >({});
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      body: {
        config: {
          model: config?.model || "default-model",
          temperature: Number(config?.temperature) || 0.7,
          topP: Number(config?.topP) || 1,
          frequencyPenalty: Number(config?.frequencyPenalty) || 0,
          presencePenalty: Number(config?.presencePenalty) || 0,
        },
      },
      onResponse: (response) => {
        setIsStreaming(true);
      },
      onFinish: (message, options) => {
        setIsStreaming(false);
        setConfig({
          ...config,
          usage: options.usage,
        });
        // saveMessages([message]);
        // Calculate and store completion time only for the new message
        if (message.createdAt) {
          const completionTime =
            (Date.now() - new Date(message.createdAt).getTime()) / 1000;
          setMessageCompletionTimes((prev) => ({
            ...prev,
            [message.id]: completionTime,
          }));
        }
      },
    });

  const samplePrompts = [
    {
      icon: <FileJson className="h-6 w-6 text-blue-400" />,
      title: "Listing recipes using JSON schema",
      description: "Create JSON based on specified schema.",
    },
    {
      icon: <Mail className="h-6 w-6 text-blue-400" />,
      title: "Santa's Mailbox",
      description:
        "Capture a handwritten letter to Santa and write back as him.",
    },
    {
      icon: <ShieldQuestion className="h-6 w-6 text-blue-400" />,
      title: "Barista Bot",
      description: "Order common coffee drinks from this virtual barista.",
    },
  ];

  return (
    <div className="flex w-full lg:w-[60%] flex-col flex-1">
      <div className="flex items-center justify-between p-4 border-b ">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Untitled Prompt"
            className="border-0 p-2 bg-transparent"
          />
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
        {/* <div className="flex items-center gap-2">
          <Button variant="ghost">Compare</Button>
          <Button variant="ghost">Get code</Button>
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
        </div> */}
      </div>
      <div className="flex flex-1 p-6 overflow-auto custom-scrollbar">
        {messages.length !== 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col p-2 ${
                  m.role === "user"
                    ? ""
                    : "border border-transparent rounded-md hover:border-white hover:bg-[#0c0e11] transition-colors"
                }`}
              >
                {m.role === "user" ? (
                  <span className="inline-flex gap-2 text-blue-400">
                    <span className="inline-flex border-none px-2 py-1 text-sm rounded-full bg-green-500  font-bold text-white gap-1 items-center">
                      <User className="h-4 w-4" />
                      User
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2 text-green-400">
                    <span className="inline-flex border border-none px-2 py-1 text-sm rounded-full bg-blue-500 items-center font-bold text-white gap-1">
                      <Bot className="h-4 w-4" />
                      Model
                    </span>
                    {messageCompletionTimes[m.id] && (
                      <span className="text-xs text-gray-400">
                        {messageCompletionTimes[m.id].toFixed(2)}s
                      </span>
                    )}
                    {isLoading &&
                      m.id === messages[messages.length - 1]?.id && (
                        <Loader2Icon className="h-4 w-4 animate-spin" />
                      )}
                  </span>
                )}
                <CodeBlock code={m.content} isLoading={isLoading} />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col justify-center">
            <h2 className="text-2xl md:text-3xl mb-4">Get started</h2>
            <p className="text-gray-400 mb-8">
              Try a sample prompt or add your own input below
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {samplePrompts.map((prompt, index) => (
                <Card
                  key={index}
                  className="p-8 cursor-pointer hover:bg-[#1a1a1a] hover:border-white hover:shadow-lg hover:shadow-white/10 hover:text-white transition-colors"
                  onClick={() => {
                    handleInputChange({
                      target: { value: prompt.description },
                    } as any);
                    handleSubmit(new Event("submit") as any);
                  }}
                >
                  <div className="flex items-start gap-3">
                    {prompt.icon}
                    <div>
                      <h3 className="font-medium mb-1">{prompt.title}</h3>
                      <p className="text-sm text-gray-400">
                        {prompt.description}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-2 md:p-4 border-t">
        <form
          className="flex gap-2 items-center w-full max-w-3xl mx-auto"
          onSubmit={handleSubmit}
        >
          <Input
            className="flex-1 "
            placeholder="Type something"
            value={input}
            onChange={handleInputChange}
          />
          <Button variant="ghost" size="icon">
            <Info className="h-4 w-4" />
          </Button>
          {isStreaming ? (
            <Button onClick={stop} variant="destructive">
              Stop
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={input.length === 0}>
              Run
            </Button>
          )}
        </form>
      </div>
    </div>
  );
}
