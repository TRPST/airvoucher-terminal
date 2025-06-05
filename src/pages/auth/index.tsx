import { useRouter } from "next/router";
import { AuthGate } from "@/components/AuthGate";
import { ClientOnlyAuth } from "@/components/ClientOnlyAuth";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function TerminalAuthPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-center">
          <Image src="/assets/airvoucher-logo.png" alt="AirVoucher Logo" width={100} height={100} />
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md rounded-xl shadow-lg p-8 bg-card border border-border"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">
            Terminal Login
          </h2>

          <AuthGate>
            <ClientOnlyAuth role="terminal" />
          </AuthGate>
        </motion.div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center text-sm text-muted-foreground">
            &copy; 2025 AirVoucher. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
} 