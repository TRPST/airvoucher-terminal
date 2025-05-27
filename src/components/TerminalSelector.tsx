import React, { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { ChevronDown, AlertCircle, Terminal } from "lucide-react";
import { fetchRetailerTerminals } from "@/actions";
import type { RetailerTerminal } from "@/actions";

interface TerminalSelectorProps {
  retailerId: string;
  onSelect?: (terminalId: string) => void;
}

const TerminalSelector: React.FC<TerminalSelectorProps> = ({
  retailerId,
  onSelect,
}) => {
  const [terminals, setTerminals] = useState<RetailerTerminal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getTerminals = async () => {
      if (!retailerId) {
        console.log("No retailerId provided to TerminalSelector");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      console.log("Fetching terminals for retailer:", retailerId);

      try {
        const { data, error } = await fetchRetailerTerminals(retailerId);

        if (error) {
          console.error("Error fetching terminals:", error);
          setError(error.message || "Failed to fetch terminals");
          setIsLoading(false);
          return;
        }

        if (!data || data.length === 0) {
          console.log("No terminals found for retailer:", retailerId);
          // Create a mock terminal for testing if none exists
          if (process.env.NODE_ENV === "development") {
            const mockTerminal = {
              id: "mock-terminal-id",
              name: "Development Terminal",
              status: "active" as const,
              last_active: null,
            };
            setTerminals([mockTerminal]);
            setSelected(mockTerminal.id);

            if (onSelect) {
              onSelect(mockTerminal.id);
            }
          } else {
            setError("No terminals found for this retailer");
          }
          setIsLoading(false);
          return;
        }

        console.log("Terminals found:", data.length);
        setTerminals(data);

        // Handle terminal selection
        const saved = localStorage.getItem("activeTerminal");
        // Only use saved terminal if it belongs to this retailer
        const terminalExists = saved && data.some((t) => t.id === saved);
        const selectedId = terminalExists ? saved : data[0].id;

        console.log("Selected terminal:", selectedId);
        setSelected(selectedId);

        // Call onSelect with the selected terminal
        if (onSelect) {
          onSelect(selectedId);
        }
      } catch (err) {
        console.error("Unexpected error in TerminalSelector:", err);
        setError("Failed to fetch terminals");
      } finally {
        setIsLoading(false);
      }
    };

    getTerminals();
  }, [retailerId, onSelect]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="inline-flex items-center px-4 py-1 bg-primary/30 text-white rounded-full animate-pulse">
        <span className="truncate">Loading terminals...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="inline-flex items-center px-4 py-1 bg-red-600/20 text-red-500 rounded-full">
        <AlertCircle className="w-4 h-4 mr-1" />
        <span className="truncate">{error}</span>
      </div>
    );
  }

  // If there are no terminals, show a message
  if (terminals.length === 0) {
    return (
      <div className="inline-flex items-center px-4 py-1 bg-amber-600/20 text-amber-600 rounded-full">
        <Terminal className="w-4 h-4 mr-1" />
        <span className="truncate">No terminals</span>
      </div>
    );
  }

  // If there's only one terminal, show it but don't make it a dropdown
  if (terminals.length === 1 && selected) {
    return (
      <div className="inline-flex items-center px-4 py-1 bg-primary text-primary-foreground rounded-full">
        <Terminal className="w-4 h-4 mr-1" />
        <span className="truncate">{terminals[0].name}</span>
      </div>
    );
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center px-4 py-1 bg-primary text-primary-foreground rounded-full hover:bg-primary/90">
          <span className="truncate">
            {terminals.find((t) => t.id === selected)?.name}
          </span>
          <ChevronDown className="ml-2 w-4 h-4" />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content side="bottom" align="end" sideOffset={4} asChild>
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-20"
          >
            {terminals.map((t) => (
              <DropdownMenu.Item
                key={t.id}
                className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onSelect={() => {
                  setSelected(t.id);
                  localStorage.setItem("activeTerminal", t.id);
                  if (onSelect) {
                    onSelect(t.id);
                  }
                }}
              >
                {t.name}
              </DropdownMenu.Item>
            ))}
          </motion.div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export default TerminalSelector;
