"use client";

import type { ReactNode } from "react";
import { NextUIProvider } from "@nextui-org/react";
import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";

if (typeof window !== "undefined") {
  posthog.init("phc_zDS6t9D8w9fyWQTALPveUukFzraNUTS5RuLZGvvsJh4Y", {
    api_host: "https://eu.i.posthog.com",
    // @ts-ignore
    defaults: "2026-05-30",
  });
}

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider client={posthog}>
      <NextUIProvider>
        {children}
      </NextUIProvider>
    </PostHogProvider>
  );
}
