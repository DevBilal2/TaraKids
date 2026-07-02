// app/components/WhatsAppWidgetClient.js
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

// Lazy load the entire FloatingWhatsApp library to reduce initial bundle
const FloatingWhatsApp = dynamic(
  () => import("react-floating-whatsapp").then((mod) => mod.default || mod.FloatingWhatsApp),
  { ssr: false }
);

export default function WhatsAppWidgetClient() {
  const [mounted, setMounted] = useState(false);

  // Defer widget loading aggressively to avoid blocking initial render on mobile
  useEffect(() => {
    // Use requestIdleCallback for mobile performance
    const loadWidget = () => {
      setMounted(true);
    };

    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        // Wait for browser to be idle, with 8 second timeout to reduce main-thread work
        requestIdleCallback(loadWidget, { timeout: 8000 });
      } else {
        // Fallback: defer with longer timeout for mobile
        setTimeout(loadWidget, 3000);
      }
    }
  }, []);

  // Don't render until mounted (prevents SSR issues and reduces initial JS)
  if (!mounted) {
    return null;
  }

  return (
    <FloatingWhatsApp
      phoneNumber="923284114902"
      accountName="Tara Kids"
      avatar="/Logo.png"
      statusMessage="Typically replies within minutes"
      chatMessage="Hello! 👋 How can we help you today?"
      darkMode={false}
      placeholder="Type your message here..."
      allowClickAway={true}
      allowEsc={true}
      position="left"
      buttonStyle={{
        backgroundColor: "#25D366",
        left: "24px",
        right: "auto",
        bottom: "24px",
      }}
      chatboxStyle={{
        borderRadius: "16px",
        left: "24px",
        right: "auto",
        bottom: "84px",
      }}
    />
  );
}
