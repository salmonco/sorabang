"use client";

import { useEffect } from "react";
import { initAmplitude } from "@/lib/analytics";

export default function AmplitudeInitializer() {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
}
