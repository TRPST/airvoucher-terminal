import * as React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  User,
  Users,
  MapPin,
  Calendar,
  Percent,
} from "lucide-react";

export default function AgentProfilePage() {
  // Mock profile data
  const profile = {
    name: "Sarah Johnson",
    email: "agent@airvoucher.com",
    phone: "+27 82 345 6789",
    role: "Sales Agent",
    territory: "Western Cape",
    address: "456 Ocean View Drive, Cape Town, South Africa",
    joinDate: "February 5, 2025",
    bio: "Experienced sales agent managing a portfolio of retail partners across the Western Cape region.",
    stats: {
      retailers: 28,
      activeRetailers: 24,
      monthlySales: "R 245,680",
      commission: "R 12,284",
    },
  };

  return (
    <Layout role="agent">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
            Edit Profile
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Card */}
          <motion.div
            className="col-span-1 rounded-xl border bg-card text-card-foreground shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {profile.role} - {profile.territory}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Member since {profile.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-6 space-y-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{profile.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{profile.phone}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{profile.role}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <span>{profile.address}</span>
              </div>
            </div>
          </motion.div>

          {/* Stats Card */}
          <motion.div
            className="col-span-1 rounded-xl border bg-card text-card-foreground shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Performance Overview
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Total Retailers
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {profile.stats.retailers}
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Active Retailers
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {profile.stats.activeRetailers}
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Monthly Sales
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {profile.stats.monthlySales}
                  </div>
                </div>
                <div className="rounded-lg bg-primary/5 p-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Commission (MTD)
                  </div>
                  <div className="mt-1 text-2xl font-bold">
                    {profile.stats.commission}
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t p-6">
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="rounded-lg bg-background p-3">
                <div className="font-medium">
                  Added new retailer: Cape Town Electronics
                </div>
                <div className="text-sm text-muted-foreground">
                  Today at 11:45 AM
                </div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="font-medium">
                  Conducted training session with 5 retailers
                </div>
                <div className="text-sm text-muted-foreground">
                  Yesterday at 3:30 PM
                </div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="font-medium">
                  Updated contact information for Sunshine Markets
                </div>
                <div className="text-sm text-muted-foreground">
                  May 4, 2025 at 10:15 AM
                </div>
              </div>
              <div className="rounded-lg bg-background p-3">
                <div className="font-medium">
                  Commission payment received: R 8,950
                </div>
                <div className="text-sm text-muted-foreground">
                  May 2, 2025 at 9:00 AM
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Account Settings */}
        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Commission Settings</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-medium">Payment Method</div>
                <p className="text-sm text-muted-foreground">
                  Update your bank details and preferred payment method
                </p>
                <button className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Update Details
                </button>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Commission Reports</div>
                <p className="text-sm text-muted-foreground">
                  Configure how you receive your commission statements
                </p>
                <button className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Configure
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
