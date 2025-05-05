import * as React from "react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Mail, Phone, User, Shield, MapPin, Calendar } from "lucide-react";

export default function AdminProfilePage() {
  // Mock profile data
  const profile = {
    name: "John Doe",
    email: "admin@airvoucher.com",
    phone: "+27 81 234 5678",
    role: "System Administrator",
    address: "123 Main Street, Cape Town, South Africa",
    joinDate: "January 15, 2025",
    bio: "System administrator with full access to all AirVoucher platform features and settings.",
  };

  return (
    <Layout role="admin">
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
                    {profile.role}
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
                <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
                <span>{profile.role}</span>
              </div>
              <div className="flex items-start">
                <MapPin className="h-5 w-5 mr-3 text-muted-foreground mt-0.5" />
                <span>{profile.address}</span>
              </div>
            </div>
          </motion.div>

          {/* Activity & Settings */}
          <motion.div
            className="col-span-1 rounded-xl border bg-card text-card-foreground shadow"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-semibold mb-4">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
            <div className="border-t p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="rounded-lg bg-background p-3">
                  <div className="font-medium">
                    Updated retailer commission rates
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Today at 10:30 AM
                  </div>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <div className="font-medium">Added new voucher provider</div>
                  <div className="text-sm text-muted-foreground">
                    Yesterday at 2:15 PM
                  </div>
                </div>
                <div className="rounded-lg bg-background p-3">
                  <div className="font-medium">
                    Generated monthly sales report
                  </div>
                  <div className="text-sm text-muted-foreground">
                    May 3, 2025 at 9:00 AM
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Settings */}
        <motion.div
          className="rounded-xl border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4">Account Settings</h3>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-medium">Two-Factor Authentication</div>
                <p className="text-sm text-muted-foreground">
                  Add an extra layer of security to your account
                </p>
                <button className="mt-2 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  Enable
                </button>
              </div>
              <div className="space-y-2">
                <div className="font-medium">Notification Preferences</div>
                <p className="text-sm text-muted-foreground">
                  Manage how you receive notifications and alerts
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
