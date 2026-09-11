"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, Suspense, type ReactNode } from "react";
import { isLocalhost } from "@/lib/utils";

function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const isProduction = process.env.NODE_ENV === "production";
    if (!isProduction || isLocalhost) return;

    if (pathname && posthog) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture("$pageview", {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

export function CSPostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const isProduction = process.env.NODE_ENV === "production";
    const posthogKey =
      process.env.NEXT_PUBLIC_POSTHOG_KEY ||
      "phc_zDS6t9D8w9fyWQTALPveUukFzraNUTS5RuLZGvvsJh4Y";
    const posthogHost =
      process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://eu.i.posthog.com";

    // Only initialize if we're in production, not on localhost, and a key is configured
    if (isProduction && !isLocalhost && posthogKey) {
      posthog.init(posthogKey, {
        api_host: posthogHost,
        // @ts-ignore
        defaults: "2026-05-30",
        person_profiles: "identified_only",
        capture_pageview: false,
        enable_recording_console_log: true,
        session_recording: {
          maskAllInputs: false,
          captureCanvas: {
            canvasFps: 4,
            canvasQuality: "0.4",
          },
        },
      });
    }
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PostHogProvider>
  );
}

export default CSPostHogProvider;
