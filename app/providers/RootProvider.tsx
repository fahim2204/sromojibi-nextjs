"use client";

import { ReactNode, useState } from "react";
import NextTopLoader from "nextjs-toploader";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { NextUIProvider } from "@nextui-org/react";

import { CSPostHogProvider } from "./PostHogProvider";

interface NextWrapperProps {
  children: ReactNode;
}

export function RootProvider({ children }: NextWrapperProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>
        <CSPostHogProvider>
          <NextThemesProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <NextTopLoader
              height={3}
              color="#007BFF"
              showSpinner={false}
            />
            <NextUIProvider>
              {children}
            </NextUIProvider>
          </NextThemesProvider>
        </CSPostHogProvider>
      </NuqsAdapter>
    </QueryClientProvider>
  );
}

export default RootProvider;
