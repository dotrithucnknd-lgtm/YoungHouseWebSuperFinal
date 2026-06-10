"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useThemeMode } from "@/utils/useThemeMode";

const ContactChatWidget = dynamic(() => import("@/components/ContactChatWidget"), {
  ssr: false,
  loading: () => null,
});

const CompareFloatingButton = dynamic(() => import("@/components/CompareFloatingButton"), {
  ssr: false,
  loading: () => null,
});

const ClientCommons = () => {
  //
  useThemeMode();

  const pathname = usePathname();
  //  CUSTOM THEME STYLE
  useEffect(() => {
    const $body = document.querySelector("body");
    if (!$body) return;

    let newBodyClass = "";

    if (false) {
      newBodyClass = "theme-cyan-blueGrey";
    }

    newBodyClass && $body.classList.add(newBodyClass);
    return () => {
      newBodyClass && $body.classList.remove(newBodyClass);
    };
  }, [pathname]);

  const hiddenWidgetPrefixes = [
    "/admin",
    "/operator",
    "/tenant",
    "/staff",
    "/manager",
    "/ctv",
  ];
  const showContactWidget = !hiddenWidgetPrefixes.some((prefix) =>
    pathname?.startsWith(prefix)
  );

  return (
    <>
      {showContactWidget && <ContactChatWidget />}
      <CompareFloatingButton />
    </>
  );
};

export default ClientCommons;
