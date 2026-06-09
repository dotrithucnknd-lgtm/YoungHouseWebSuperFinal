"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  ensureSalesCTVProfile,
  type CTVProfileWithUser,
} from "@/lib/ctvServices";

export function useSalesProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<CTVProfileWithUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    const { data, error: err } = await ensureSalesCTVProfile(
      user.id,
      user.name || user.email || "Sales"
    );
    if (err) setError(err);
    setProfile(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) reload();
    else setLoading(false);
  }, [user?.id]);

  return { profile, loading, error, reload, user };
}
