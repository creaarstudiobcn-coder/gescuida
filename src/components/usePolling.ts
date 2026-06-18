"use client";

import { useCallback, useEffect, useRef, useState } from "react";

// Hook de "tiempo real" por polling (compatible con Vercel serverless).
// Refresca los datos cada `intervalMs` y al volver a enfocar la pestaña.
export function usePolling<T>(url: string, intervalMs = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const json = (await res.json()) as T;
      if (mounted.current) {
        setData(json);
        setError(null);
      }
    } catch (e) {
      if (mounted.current) setError((e as Error).message);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    const onFocus = () => fetchData();
    window.addEventListener("focus", onFocus);
    return () => {
      mounted.current = false;
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [fetchData, intervalMs]);

  return { data, error, loading, refresh: fetchData };
}
