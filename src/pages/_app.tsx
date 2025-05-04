import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { Layout } from "@/components/Layout";
import { useRouter } from "next/router";
import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isLandingPage = router.pathname === "/";

  // Determine user role based on URL path
  let role: "admin" | "retailer" | "agent" = "admin";
  if (router.pathname.startsWith("/retailer")) {
    role = "retailer";
  } else if (router.pathname.startsWith("/agent")) {
    role = "agent";
  }

  return (
    <ThemeProvider>
      <ToastProvider>
        {isLandingPage ? (
          <Component {...pageProps} />
        ) : (
          <Layout role={role}>
            <Component {...pageProps} />
          </Layout>
        )}
      </ToastProvider>
    </ThemeProvider>
  );
}
