"use client";

import dynamic from "next/dynamic";

const GalaxyGraph = dynamic(
  () => import("./GalaxyGraph"),
  { ssr: false }
);

export default GalaxyGraph;
