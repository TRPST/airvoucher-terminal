import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLandingPage = router.pathname === "/";
  const isAuthPage = router.pathname.startsWith("/auth/");

  // Determine user role based on URL path
  let role: "admin" | "retailer" | "agent" = "admin";
  if (router.pathname.startsWith("/retailer")) {
    role = "retailer";
  } else if (router.pathname.startsWith("/agent")) {
    role = "agent";
  }

  // For auth pages and landing page, render without Layout
  if (isAuthPage || isLandingPage) {
    return (
      <ThemeProvider attribute="class">
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </ThemeProvider>
    );
  }

  // For protected pages, use Layout
  return (
    <ThemeProvider attribute="class">
      <ToastProvider>
        <Layout role={role}>
          <Component {...pageProps} />
        </Layout>
      </ToastProvider>
    </ThemeProvider>
  );
}
