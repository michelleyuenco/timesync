export const COMMON_TIMEZONES = [
  { value: "Pacific/Auckland", label: "Auckland (NZST)", offset: 12 },
  { value: "Australia/Sydney", label: "Sydney (AEST)", offset: 10 },
  { value: "Asia/Tokyo", label: "Tokyo (JST)", offset: 9 },
  { value: "Asia/Shanghai", label: "Shanghai (CST)", offset: 8 },
  { value: "Asia/Singapore", label: "Singapore (SGT)", offset: 8 },
  { value: "Asia/Bangkok", label: "Bangkok (ICT)", offset: 7 },
  { value: "Asia/Kolkata", label: "Kolkata (IST)", offset: 5.5 },
  { value: "Asia/Dubai", label: "Dubai (GST)", offset: 4 },
  { value: "Europe/Moscow", label: "Moscow (MSK)", offset: 3 },
  { value: "Europe/Istanbul", label: "Istanbul (TRT)", offset: 3 },
  { value: "Africa/Cairo", label: "Cairo (EET)", offset: 2 },
  { value: "Europe/Berlin", label: "Berlin (CET)", offset: 1 },
  { value: "Europe/Paris", label: "Paris (CET)", offset: 1 },
  { value: "Europe/London", label: "London (GMT)", offset: 0 },
  { value: "America/Sao_Paulo", label: "São Paulo (BRT)", offset: -3 },
  { value: "America/New_York", label: "New York (EST)", offset: -5 },
  { value: "America/Chicago", label: "Chicago (CST)", offset: -6 },
  { value: "America/Denver", label: "Denver (MST)", offset: -7 },
  { value: "America/Los_Angeles", label: "Los Angeles (PST)", offset: -8 },
  { value: "Pacific/Honolulu", label: "Honolulu (HST)", offset: -10 },
] as const;

export type TimezoneValue = (typeof COMMON_TIMEZONES)[number]["value"];
