import * as React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowRight, Shield, Store, Users } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [hoveredCard, setHoveredCard] = React.useState<string | null>(null);

  // Card animation variants
  const cardVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    hover: {
      scale: 1.05,
      boxShadow:
        "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      transition: { type: "spring", stiffness: 400, damping: 17 },
    },
    tap: { scale: 0.98 },
  };

  // Role options with hardcoded colors instead of Tailwind classes
  const roles = [
    {
      id: "admin",
      title: "Admin",
      icon: Shield,
      description: "Manage retailers, vouchers, and platform settings",
      href: "/admin",
      gradient: "linear-gradient(to bottom right, #3b82f6, #4f46e5)",
      textColor: "#e0f2fe",
      iconColor: "#3b82f6",
      hoverRing: "#3b82f6",
    },
    {
      id: "retailer",
      title: "Retailer",
      icon: Store,
      description: "Sell vouchers and manage your inventory",
      href: "/retailer",
      gradient: "linear-gradient(to bottom right, #10b981, #16a34a)",
      textColor: "#d1fae5",
      iconColor: "#10b981",
      hoverRing: "#10b981",
    },
    {
      id: "agent",
      title: "Agent",
      icon: Users,
      description: "Manage your retailer network and track commissions",
      href: "/agent",
      gradient: "linear-gradient(to bottom right, #f59e0b, #ea580c)",
      textColor: "#fef3c7",
      iconColor: "#f59e0b",
      hoverRing: "#f59e0b",
    },
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
      }}
    >
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid hsla(var(--border), 0.4)",
          backgroundColor: "hsla(var(--background), 0.95)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 1rem",
            height: "4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span
              style={{
                fontWeight: "bold",
                fontSize: "1.5rem",
                background:
                  "linear-gradient(to right, hsl(var(--primary)), hsla(var(--primary), 0.7))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              AirVoucher
            </span>
            <span
              style={{
                borderRadius: "9999px",
                backgroundColor: "hsla(var(--primary), 0.1)",
                padding: "0.125rem 0.5rem",
                fontSize: "0.75rem",
                fontWeight: 500,
                color: "hsl(var(--primary))",
              }}
            >
              MVP
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontSize: "0.875rem",
            }}
          >
            <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
              About
            </Link>
            <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
              Contact
            </Link>
            <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
              Support
            </Link>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        <section
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "4rem 1rem" }}
        >
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <motion.h1
              style={{
                marginBottom: "1rem",
                fontSize: "2.25rem",
                fontWeight: "bold",
                letterSpacing: "-0.025em",
              }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to AirVoucher Platform
            </motion.h1>
            <motion.p
              style={{
                maxWidth: "48rem",
                margin: "0 auto",
                color: "hsl(var(--muted-foreground))",
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              The complete solution for managing and selling vouchers in South
              Africa. Select your role below to get started.
            </motion.p>
          </div>

          <div
            className="grid grid-cols-1 gap-8 md:grid-cols-3"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "2rem",
            }}
          >
            {roles.map((role, index) => (
              <motion.div
                key={role.id}
                variants={cardVariants}
                initial="initial"
                animate="animate"
                whileHover="hover"
                whileTap="tap"
                transition={{ delay: index * 0.1 }}
                onMouseEnter={() => setHoveredCard(role.id)}
                onMouseLeave={() => setHoveredCard(null)}
                onClick={() => router.push(role.href)}
                style={{
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                  boxShadow:
                    hoveredCard === role.id
                      ? `0 0 0 2px ${role.hoverRing}, 0 0 0 4px white`
                      : "none",
                }}
              >
                {/* Card background */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: role.gradient,
                  }}
                />

                <div style={{ position: "relative", padding: "1.5rem 2rem" }}>
                  <div
                    style={{
                      marginBottom: "0.75rem",
                      display: "flex",
                      height: "3rem",
                      width: "3rem",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      backgroundColor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                    }}
                  >
                    <role.icon
                      style={{
                        height: "1.5rem",
                        width: "1.5rem",
                        color: "white",
                      }}
                    />
                  </div>
                  <h3
                    style={{
                      marginBottom: "0.5rem",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      color: "white",
                    }}
                  >
                    {role.title}
                  </h3>
                  <p style={{ marginBottom: "1.5rem", color: role.textColor }}>
                    {role.description}
                  </p>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "white",
                      }}
                    >
                      Enter Portal
                    </span>
                    <div
                      style={{
                        display: "flex",
                        height: "2rem",
                        width: "2rem",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "9999px",
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                        backdropFilter: "blur(4px)",
                      }}
                    >
                      <ArrowRight
                        style={{
                          height: "1rem",
                          width: "1rem",
                          color: "white",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Quick access links */}
          <div
            style={{
              marginTop: "4rem",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <h2
              style={{
                marginBottom: "1.5rem",
                fontSize: "1.25rem",
                fontWeight: 600,
              }}
            >
              Quick Access
            </h2>
            <div
              className="grid grid-cols-1 gap-4 md:grid-cols-3"
              style={{
                display: "grid",
                gap: "1rem",
              }}
            >
              {roles.map((role) => (
                <Link
                  key={role.id}
                  href={role.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    borderRadius: "0.5rem",
                    padding: "1rem",
                    backgroundColor: "hsla(var(--muted), 0.5)",
                    transition: "background-color 150ms",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      height: "2.5rem",
                      width: "2.5rem",
                      flexShrink: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "9999px",
                      backgroundColor: "white",
                    }}
                  >
                    <role.icon
                      style={{
                        height: "1.25rem",
                        width: "1.25rem",
                        color: role.iconColor,
                      }}
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{role.title}</div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      {role.title} Portal
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid hsl(var(--border))",
          padding: "1.5rem 0",
        }}
      >
        <div
          style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div
            className="flex flex-col items-center justify-between gap-4 md:flex-row"
            style={{
              display: "flex",
              gap: "1rem",
            }}
          >
            <p
              className="text-center text-sm text-muted-foreground md:text-left"
              style={{
                fontSize: "0.875rem",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              &copy; 2025 AirVoucher. All rights reserved.
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                fontSize: "0.875rem",
                color: "hsl(var(--muted-foreground))",
              }}
            >
              <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
                Terms
              </Link>
              <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
                Privacy
              </Link>
              <Link href="#" style={{ color: "hsl(var(--muted-foreground))" }}>
                Security
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
