export interface HeroSlide {
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
}

export interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  route: string;
  fragment: string;
}

export interface AudienceItem {
  title: string;
  description: string;
  points: readonly string[];
}

export interface TechItem {
  name: string;
  icon: string;
}

export interface TechCategory {
  category: string;
  items: readonly TechItem[];
}

export interface StatItem {
  value: string;
  label: string;
}

export interface ProcessStep {
  step: string;
  title: string;
  description: string;
}
