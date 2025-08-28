"use client";

import { initAmplitude } from "@/lib/analytics";
import { useEffect } from "react";

export const AmplitudeInitializer = () => {
  useEffect(() => {
    initAmplitude();
  }, []);

  return null;
};
