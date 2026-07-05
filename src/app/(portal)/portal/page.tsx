"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PortalRootPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("session", session);
      // console.log("router", data);

      if (session) {
        router.replace("/portal/appointments");
      } else {
        router.replace("/portal/login");
      }
    });
  }, [router]);

  return null;
}
