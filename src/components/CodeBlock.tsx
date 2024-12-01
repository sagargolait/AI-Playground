"use client";

import React, { useState } from "react";
import { Check, Copy, Download, Edit, RotateCw, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MarkdownCodeBlock } from "./MarkdownCodeBlock";

interface CodeBlockProps {
  code: string;
  onEdit?: (code: string) => void;
  isLoading?: boolean;
  messageGroup?: string;
  timestamp?: number;
  id?: string;
  reload?: () => void;
}

const detectLanguage = (code: string): string => {
  const firstLine = code.split("\n")[0];
  const match = firstLine.match(/^```(\w+)/);
  if (match) {
    return match[1];
  }

  return "text";
};

export function CodeBlock({
  code,
  onEdit,
  messageGroup,
  timestamp,
  id,
  reload,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCode, setEditedCode] = useState(code);

  const language = detectLanguage(code);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy code", err);
    }
  };

  const shareCode = () => {
    const shareData = {
      title: `Code Snippet (${language})`,
      text: code,
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      copyCode();
    }
  };

  const downloadCode = (format: string) => {
    let content = code;
    let fileExtension = language;

    if (format === "html") {
      content = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Code Export</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js"></script>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-${language}.min.js"></script>
        </head>
        <body>
          <pre><code class="language-${language}">${code}</code></pre>
        </body>
        </html>
      `;
      fileExtension = "html";
    }

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `code_${messageGroup || "snippet"}.${fileExtension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEdit = () => {
    if (isEditing && onEdit) {
      onEdit(editedCode);
    }
    setIsEditing(!isEditing);
  };

  return (
    <div
      className={`relative group bg-primary-700 rounded-lg overflow-hidden max-w-full flex-1 pt-4 ${
        messageGroup ? `message-group-${messageGroup}` : ""
      }`}
      data-timestamp={timestamp}
    >
      <div className="absolute right-2 top-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={copyCode}
          className="h-8 w-8"
        >
          {copied ? (
            <Check className="h-4 w-4" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={shareCode}
          className="h-8 w-8"
        >
          <Share className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Download className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => downloadCode("raw")}>
              Download Raw
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => downloadCode("html")}>
              Download as HTML
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        {id && id == "error" && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => reload && reload()}
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        )}
        {onEdit && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEdit}
            className="h-8 w-8"
          >
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEditing ? (
        <textarea
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          className="w-full h-full min-h-[200px] p-4 bg-zinc-900 text-zinc-50 font-mono break-words whitespace-pre-wrap"
        />
      ) : (
        <div className="max-w-full overflow-x-auto mt-4">
          <MarkdownCodeBlock content={code} />
        </div>
      )}
    </div>
  );
}
