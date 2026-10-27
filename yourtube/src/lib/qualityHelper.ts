export const PLAN_QUALITY_LIMITS: Record<string, number> = {
  free: 480,
  bronze: 720,
  silver: 1080,
  gold: 2160,
};

export const QUALITY_OPTIONS = [
  { value: "2160p", label: "2160p (4K)", height: 2160 },
  { value: "1440p", label: "1440p (2K)", height: 1440 },
  { value: "1080p", label: "1080p (HD)", height: 1080 },
  { value: "720p", label: "720p (HD)", height: 720 },
  { value: "480p", label: "480p", height: 480 },
  { value: "360p", label: "360p", height: 360 },
  { value: "240p", label: "240p", height: 240 },
  { value: "144p", label: "144p", height: 144 },
];

export const SPEED_OPTIONS = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const getMaxQualityForPlan = (plan?: string): number => {
  if (!plan) return PLAN_QUALITY_LIMITS.free;
  return PLAN_QUALITY_LIMITS[plan.toLowerCase()] || PLAN_QUALITY_LIMITS.free;
};

export const getPlanDisplayName = (plan?: string): string => {
  if (!plan) return "Free";
  return plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
};

export const getUpgradeMessage = (qualityHeight: number): string => {
  if (qualityHeight <= 480) return "";
  if (qualityHeight <= 720) return "Upgrade to Bronze or higher for 720p";
  if (qualityHeight <= 1080) return "Upgrade to Silver or higher for 1080p";
  return "Upgrade to Gold for 4K quality";
};
