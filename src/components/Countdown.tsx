"use client";

import { useState, useEffect } from "react";

export default function Countdown() {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function update() {
      const now = new Date();
      // Next question at 21:00 CET/CEST
      const target = new Date(now);
      target.setHours(21, 0, 0, 0);
      if (now >= target) {
        target.setDate(target.getDate() + 1);
      }

      const diff = target.getTime() - now.getTime();
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      );
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <p className="text-white/70 text-sm">
      Neue Frage in {timeLeft}
    </p>
  );
}
