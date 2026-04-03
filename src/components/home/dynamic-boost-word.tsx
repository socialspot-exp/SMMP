"use client";

import { useEffect, useState } from "react";

const WORDS = ["Followers", "Views", "Subscribers", "Likes"] as const;

export function DynamicBoostWord() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const id = window.setInterval(() => {
      setVisible(false);
      window.setTimeout(() => {
        setIndex((i) => (i + 1) % WORDS.length);
        setVisible(true);
      }, 500);
    }, 3000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className="text-primary inline-block transition-all duration-500"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(10px)",
      }}
    >
      {WORDS[index]}
    </span>
  );
}
