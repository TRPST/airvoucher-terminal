import React, { useState, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { getMockTerminals } from "@/lib/MockData";
import { Terminal } from "@/lib/MockData";

const TerminalSelector: React.FC = () => {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const data = getMockTerminals();
    setTerminals(data);
    const saved = localStorage.getItem("activeTerminal");
    setSelected(saved || (data[0]?.id ?? null));
  }, []);

  // If there are 0 or 1 terminals, don't render the selector
  if (terminals.length <= 1) {
    return null;
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="inline-flex items-center px-4 py-1 bg-blue-600 text-white rounded-full hover:bg-blue-700">
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
            className="mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
          >
            {terminals.map((t) => (
              <DropdownMenu.Item
                key={t.id}
                className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                onSelect={() => {
                  setSelected(t.id);
                  localStorage.setItem("activeTerminal", t.id);
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
