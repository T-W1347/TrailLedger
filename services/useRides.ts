import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function useRides(userId: string | undefined) {
  const [rides, setRides] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRides = async () => {
    if (!userId) return;

    setLoading(true);

    const { data, error } = await supabase
      .from("logs")
      .select(`
        *,
        trails (
          name,
          location,
          difficulty
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("FETCH RIDES ERROR:", error);
      setLoading(false);
      return;
    }

    setRides(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchRides();
  }, [userId]);

  return { rides, loading, refetch: fetchRides };
}