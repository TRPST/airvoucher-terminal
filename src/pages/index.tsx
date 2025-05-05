import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Shield, Store, Users } from "lucide-react";
import { PortalCard } from "@/components/PortalCard";
import { cn } from "@/utils/cn";

export default function LandingPage() {
  // Portal options with their details
  const portals = [
    {
      title: "Admin",
      description: "Manage retailers, vouchers, and platform settings",
      icon: Shield,
      link: "/auth/admin",
      gradient: "linear-gradient(to bottom right, #3b82f6, #4f46e5)",
      textColor: "#e0f2fe",
    },
    {
      title: "Retailer",
      description: "Sell vouchers and manage your inventory",
      icon: Store,
      link: "/auth/retailer",
      gradient: "linear-gradient(to bottom right, #10b981, #16a34a)",
      textColor: "#d1fae5",
    },
    {
      title: "Agent",
      description: "Manage your retailer network and track commissions",
      icon: Users,
      link: "/auth/agent",
      gradient: "linear-gradient(to bottom right, #f59e0b, #ea580c)",
      textColor: "#fef3c7",
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Simplified Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              AirVoucher
            </span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              BETA
            </span>
          </div>
          {/* Menu icon is hidden for now as mentioned in the requirements */}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.h1
              className="mb-4 text-4xl font-bold tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to AirVoucher
            </motion.h1>
            <motion.p
              className="mx-auto text-lg text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Choose your portal to get started
            </motion.p>
          </div>

          {/* Portal Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {portals.map((portal, index) => (
              <PortalCard
                key={index}
                title={portal.title}
                description={portal.description}
                icon={portal.icon}
                link={portal.link}
                gradient={portal.gradient}
                textColor={portal.textColor}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              &copy; 2025 AirVoucher. All rights reserved.
            </p>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <Link href="#" className="text-muted-foreground">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground">
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
