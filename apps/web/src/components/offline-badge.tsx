import { useEffect, useState } from "react";

export function OfflineBadge() {
  const [online, setOnline] = useState(
    typeof navigator === "undefined" ? true : navigator.onLine,
  );

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  if (online) return null;

  return (
    <div
      role="status"
      className="mb-4 rounded-2xl border border-moss/30 bg-leaf/20 px-4 py-2 text-center text-sm text-ink"
    >
      You are offline — Funds still works. Your vault stays on this device.
    </div>
  );
}
