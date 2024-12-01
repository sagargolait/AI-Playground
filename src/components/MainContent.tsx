import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { useState, useRef, useEffect } from "react";
import { useChatManager } from "@/hooks/useChatManager";
import { Message } from "ai";
import { Textarea } from "@/components/ui/textarea";

export default function MainContent() {
  const { config, setConfig } = useModelConfig();
  const [projectName, setProjectName] = useState("Untitled Prompt");
  const [messageCompletionTimes, setMessageCompletionTimes] = useState<
    Record<string, number>
  >({});

  const messageContainerRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    error,
    reload,
    setMessages,
  } = useChatManager({
    config: {
      model: config?.model || "default-model",
      temperature: Number(config?.temperature) || 0.7,
      topP: Number(config?.topP) || 1,
      frequencyPenalty: Number(config?.frequencyPenalty) || 0,
      presencePenalty: Number(config?.presencePenalty) || 0,
    },
    callbacks: {
      onResponse: () => {},
      onFinish: (message, options) => {
        setConfig({
          ...config,
          usage: options.usage,
        });

        if (message.createdAt) {
          const completionTime =
            (Date.now() - new Date(message.createdAt).getTime()) / 1000;
          setMessageCompletionTimes((prev) => ({
            ...prev,
            [message.id]: completionTime,
          }));
        }
      },
    },
  });

  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const savedName = sessionStorage.getItem("projectName");
    if (savedName) {
      setProjectName(savedName);
    }
  }, []);

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

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);

  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
  };

  const handleProjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setProjectName(newName);
    sessionStorage.setItem("projectName", newName);
  };

  const MessageRow = ({
    index,
    style,
  }: {
    index: number;
    style: React.CSSProperties;
  }) => {
    const m = messages[index];
    const isEditing = editingMessageId === m.id;
    const [localEditContent, setLocalEditContent] = useState(m.content);

    useEffect(() => {
      if (isEditing) {
        setLocalEditContent(m.content);
      }
    }, [isEditing, m.content]);

    const handleLocalSave = async () => {
      const messageIndex = messages.findIndex((msg) => msg.id === m.id);
      if (messageIndex === -1) return;

      const updatedMessages = [...messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: localEditContent,
      };
      await setMessages(updatedMessages);
      await reload();
      setEditingMessageId(null);
    };

    return (
      <div style={{ ...style, height: "auto" }}>
        <div
          className={`flex flex-col p-2 mb-4 ${
            m.role === "user"
              ? ""
              : "border border-transparent rounded-md hover:border-white hover:bg-[#0c0e11] transition-colors"
          }`}
        >
          <div className="flex justify-between items-center">
            {m.role === "user" ? (
              <span className="inline-flex gap-2 text-blue-400">
                <span className="inline-flex border-none px-2 py-1 text-sm rounded-full bg-green-500 font-bold text-white gap-1 items-center">
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
                {isLoading && m.id === messages[messages.length - 1]?.id && (
                  <Loader2Icon className="h-4 w-4 animate-spin" />
                )}
              </span>
            )}
            {m.role === "user" && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleEditMessage(m)}
                className="opacity-1 group-hover:opacity-100 transition-opacity"
              >
                <PenLine className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <Textarea
                value={localEditContent}
                onChange={(e) => setLocalEditContent(e.target.value)}
                className="min-h-[100px] mb-2"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" onClick={() => setEditingMessageId(null)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleLocalSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <CodeBlock
              code={m.content}
              isLoading={isLoading}
              id={m.id}
              reload={reload}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="flex w-full lg:w-[60%] flex-col flex-1">
      <div className="flex items-center md:justify-between justify-center p-4 border-b ">
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Untitled Prompt"
            className="border-0 p-2 bg-transparent"
            value={projectName}
            onChange={handleProjectNameChange}
          />
          <Button variant="ghost" size="icon">
            <PenLine className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div
        className="flex flex-1 p-6 overflow-auto custom-scrollbar"
        ref={messageContainerRef}
      >
        {messages.length !== 0 ? (
          <div className="flex flex-col gap-4 flex-1">
            <div className="flex flex-col gap-4">
              {messages.map((_, index) => (
                <MessageRow key={index} index={index} style={{}} />
              ))}
            </div>
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
                    } as React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>);
                    handleSubmit(
                      new Event(
                        "submit"
                      ) as unknown as React.FormEvent<HTMLFormElement>
                    );
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
          className="flex gap-2 items-center w-full max-w-3xl mx-auto relative"
          onSubmit={handleSubmit}
        >
          <Input
            className="flex-1 min-w-0"
            placeholder="Type something"
            value={input}
            onChange={handleInputChange}
            disabled={error !== null}
          />
          <div className="flex-shrink-0 flex gap-2">
            <Button variant="ghost" size="icon">
              <Info className="h-4 w-4" />
            </Button>
            {isLoading ? (
              <Button onClick={stop} variant="destructive">
                Stop
              </Button>
            ) : (
              <Button
                onClick={(e) =>
                  handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
                }
                disabled={input.length === 0}
              >
                Run
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
