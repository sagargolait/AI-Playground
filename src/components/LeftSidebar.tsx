import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquarePlus, Settings, Menu, X } from "lucide-react";
import { useState } from "react";

export default function LeftSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        className="fixed top-4 left-4 md:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      <div
        className={`
        w-full md:w-[200px] lg:w-[280px] border-r flex flex-col bg-[#1a1a1a]
        fixed md:relative h-full z-50
        ${
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }
        transition-transform duration-200 ease-in-out
      `}
      >
        <div className="p-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold hidden md:block">
            AI Playground
          </h1>
          <h1 className="text-xl font-semibold md:hidden">AI</h1>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <MessageSquarePlus className="h-4 w-4" />
              <span className="md:inline">ChatBot</span>
            </Button>
            {/* <Button variant="ghost" className="w-full justify-start gap-2">
              <MessageSquarePlus className="h-4 w-4" />
              Create new prompt
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <PenLine className="h-4 w-4" />
              New tuned model
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <Library className="h-4 w-4" />
              My library
            </Button>
            <Button variant="ghost" className="w-full justify-start gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Prompt Gallery
            </Button>
            <div className="pt-4">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Code2 className="h-4 w-4" />
                Developer documentation
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Developer forum
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Share2 className="h-4 w-4" />
                API for Enterprise
              </Button>
            </div> */}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button variant="ghost" className="w-full justify-start gap-2">
            <Settings className="h-4 w-4" />
            <span className="md:inline">Settings</span>
          </Button>
        </div>
      </div>
    </>
  );
}
