import { Smartphone, ChevronDown, Plus, MoreHorizontal } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { TablePlaceholder } from "@/components/ui/table-placeholder";
import { cn } from "@/utils/cn";
import type { TerminalSectionProps } from "./types";

export function TerminalsSection({
  retailerId,
  terminals,
  onTerminalsUpdate,
  isExpanded,
  onToggle,
  onAddTerminal,
}: TerminalSectionProps) {

  // Format terminal data for table
  const terminalData = terminals.map((terminal) => ({
    Name: terminal.name,
    Status: (
      <div
        className={cn(
          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          terminal.status === "active"
            ? "bg-green-500/10 text-green-500"
            : "bg-amber-500/10 text-amber-500"
        )}
      >
        {terminal.status.charAt(0).toUpperCase() + terminal.status.slice(1)}
      </div>
    ),
    "Last Active": terminal.last_active
      ? new Date(terminal.last_active).toLocaleString("en-ZA", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Never",
    Actions: (
      <div className="flex items-center gap-2">
        <button className="rounded-md p-2 hover:bg-muted">
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    ),
  }));

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-6 py-4 hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-lg font-medium">Terminals</h3>
          <div className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
            {terminals.length}
          </div>
        </div>
        <ChevronDown
          className={cn(
            "h-5 w-5 text-muted-foreground transition-transform",
            isExpanded && "rotate-180"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="border-t border-border p-4">
              <div className="flex justify-end mb-2">
                <button
                  onClick={onAddTerminal}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  Add Terminal
                </button>
              </div>
              <TablePlaceholder
                columns={["Name", "Status", "Last Active", "Actions"]}
                data={terminalData}
                emptyMessage="No terminals found for this retailer"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
