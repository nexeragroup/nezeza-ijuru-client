export interface AboutStat {
  value: string;
  label: string;
}

export interface AboutValue {
  title: string;
  description: string;
  icon: string;
}

export interface AboutTimelineItem {
  step: string;
  title: string;
  description: string;
}

export interface AboutPrinciple {
  title: string;
  description: string;
}

export interface AboutCapability {
  title: string;
  points: readonly string[];
}
