"use client";

import { logAmplitudeEvent } from "@/lib/analytics";
import { useEffect } from "react";

export const TrackPageView = () => {
  useEffect(() => {
    logAmplitudeEvent("page_view", {
      page_path: window.location.pathname,
    });
  }, []);

  return null;
};
