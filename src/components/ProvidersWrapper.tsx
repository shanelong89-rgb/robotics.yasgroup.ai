"use client";

import dynamic from "next/dynamic";

const Providers = dynamic(() => import("./Providers").then(m => ({ default: m.Providers })), {
  ssr: false,
});

export { Providers };