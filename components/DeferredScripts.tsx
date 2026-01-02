"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

export default function DeferredScripts() {
  const [shouldLoadScripts, setShouldLoadScripts] = useState(false);

  useEffect(() => {
    // Load scripts after user interaction or after 3 seconds
    let timeoutId: NodeJS.Timeout;
    
    const loadScripts = () => {
      setShouldLoadScripts(true);
    };

    // Use requestIdleCallback for optimal timing, with fallback
    const scheduleScriptLoading = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(
          () => {
            loadScripts();
          },
          { timeout: 3000 }
        );
      } else {
        // Fallback for browsers without requestIdleCallback
        timeoutId = setTimeout(loadScripts, 3000);
      }
    };

    // Load on user interaction (scroll, click, or touch)
    const interactionEvents = ['scroll', 'click', 'touchstart', 'mousemove'];
    const handleInteraction = () => {
      loadScripts();
      // Remove listeners after first interaction
      interactionEvents.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };

    // Add interaction listeners
    interactionEvents.forEach(event => {
      window.addEventListener(event, handleInteraction, { once: true, passive: true });
    });

    // Schedule loading as fallback
    scheduleScriptLoading();

    return () => {
      clearTimeout(timeoutId);
      interactionEvents.forEach(event => {
        window.removeEventListener(event, handleInteraction);
      });
    };
  }, []);

  if (!shouldLoadScripts) return null;

  return (
    <>
      {/* Google Analytics - Deferred loading */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-Y11DNC9PE3"
        strategy="lazyOnload"
        id="gtag-base"
      />
      <Script id="google-analytics" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-Y11DNC9PE3', {
            page_path: window.location.pathname,
          });
        `}
      </Script>


      
    </>
  );
}
