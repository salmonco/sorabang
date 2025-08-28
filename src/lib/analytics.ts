import amplitude from "amplitude-js";

const AMPLITUDE_API_KEY = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;

export const initAmplitude = () => {
  console.log("Initializing Amplitude...");
  if (AMPLITUDE_API_KEY) {
    amplitude.getInstance().init(AMPLITUDE_API_KEY);
    // Generate a unique user ID if not already set
    let userId = localStorage.getItem("amplitude_user_id");
    if (!userId) {
      userId = crypto.randomUUID(); // Generate a UUID
      localStorage.setItem("amplitude_user_id", userId);
    }
    amplitude.getInstance().setUserId(userId);
    amplitude.getInstance().logEvent("app_opened");
  } else {
    console.warn("Amplitude API Key is not set. Analytics will not be sent.");
  }
};

const commonProperties = {
  web_deploy_version: process.env.NEXT_PUBLIC_WEB_DEPLOY_VERSION || "unknown",
  timestamp: new Date().toISOString(),
};

export const logAmplitudeEvent = (
  eventName: string,
  eventProperties?: Record<string, unknown>
) => {
  if (AMPLITUDE_API_KEY) {
    const properties = { ...commonProperties, ...eventProperties };
    console.log(`Logging Amplitude Event: ${eventName}`, properties);
    amplitude.getInstance().logEvent(eventName, properties);
  } else {
    console.warn(
      `Amplitude API Key is not set. Event "${eventName}" will not be sent.`
    );
  }
};
