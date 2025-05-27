import * as React from "react";
import { FileText, TrendingUp, Inbox, CreditCard, Users } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

import { cn } from "@/utils/cn";

type ReportCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href: string;
  color: "blue" | "green" | "amber" | "purple" | "pink";
};

const ReportCard = ({
  icon: Icon,
  title,
  description,
  href,
  color,
}: ReportCardProps) => {
  // Define color variants
  const colorVariants = {
    blue: "bg-primary/10 text-primary border-primary/20",
    green: "bg-green-500/10 text-green-500 border-green-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    pink: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  };

  return (
    <Link href={href}>
      <motion.div
        whileHover={{
          scale: 1.03,
          boxShadow:
            "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        }}
        transition={{
          duration: 0.2,
          ease: "easeInOut",
        }}
        className={cn(
          "flex flex-col h-full rounded-lg border border-border bg-card p-6 shadow-sm",
          "cursor-pointer hover:border-primary/20"
        )}
      >
        <div
          className={cn(
            "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
            colorVariants[color]
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="mb-2 text-xl font-medium">{title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{description}</p>
        <div className="mt-auto flex items-center text-sm text-primary">
          <span>View Report</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="ml-1 h-4 w-4"
          >
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </div>
      </motion.div>
    </Link>
  );
};

export default function AdminReports() {
  const reports: ReportCardProps[] = [
    {
      icon: FileText,
      title: "Sales Report",
      description:
        "Comprehensive view of all sales transactions with detailed breakdowns by voucher type, retailer, and time period.",
      href: "/admin/reports/sales",
      color: "blue",
    },
    {
      icon: TrendingUp,
      title: "Earnings Summary",
      description:
        "Overview of platform commissions, agent commissions, and retailer earnings with trend analysis.",
      href: "/admin/reports/earnings",
      color: "green",
    },
    {
      icon: Inbox,
      title: "Inventory Report",
      description:
        "Current stock levels, popular vouchers, and inventory valuation across all voucher categories.",
      href: "/admin/reports/inventory",
      color: "amber",
    },
    {
      icon: CreditCard,
      title: "Voucher Performance",
      description:
        "Analysis of voucher sales performance, including popularity, margin, and turnover rate by provider.",
      href: "/admin/reports/vouchers",
      color: "purple",
    },
    {
      icon: Users,
      title: "Agent Performance",
      description:
        "Detailed breakdown of agent performance, retailer acquisition, and commission earnings over time.",
      href: "/admin/reports/agents",
      color: "pink",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Reports
        </h1>
        <p className="text-muted-foreground">
          Access detailed reports and analytics about your business.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <ReportCard
            key={report.title}
            icon={report.icon}
            title={report.title}
            description={report.description}
            href={report.href}
            color={report.color}
          />
        ))}
      </div>

      {/* Recently Generated Reports Section - Placeholder */}
      <div className="mt-8 rounded-lg border border-border p-6">
        <h2 className="mb-4 text-lg font-medium">Recently Generated Reports</h2>
        <div className="rounded-md bg-muted/50 p-10 text-center">
          <p className="text-sm text-muted-foreground">
            No recently generated reports. Generate a report to see it here.
          </p>
        </div>
      </div>
    </div>
  );
}
