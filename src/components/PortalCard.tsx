import * as React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface PortalCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  gradient: string;
  textColor: string;
}

export const PortalCard: React.FC<PortalCardProps> = ({
  title,
  description,
  icon: Icon,
  link,
  gradient,
  textColor,
}) => {
  return (
    <Link href={link}>
      <motion.div
        className="relative overflow-hidden rounded-xl shadow-lg cursor-pointer"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        role="button"
        aria-label={`Enter ${title} portal`}
      >
        {/* Card background */}
        <div className="absolute inset-0" style={{ background: gradient }} />

        <div className="relative p-6">
          <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-white/20 backdrop-blur-sm">
            <Icon className="w-6 h-6 text-white" />
          </div>

          <h3 className="mb-2 text-xl font-semibold text-white">{title}</h3>

          <p className="mb-6" style={{ color: textColor }}>
            {description}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white">Enter Portal</span>
            <div className="group">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm">
                <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};
