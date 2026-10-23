export interface Program {
  id: string;
  slug: string;
  name: string;
  summary: string | null;
  description: string | null;
  featuredMediaId: string | null;
  featuredMedia?: ProgramMedia | null;
  publicationStatus: string;
  conferences?: ProgramConference[];
}

export interface ProgramMedia {
  id: string;
  targetType: 'PROGRAM';
  targetId: string;
  sourceType: 'UPLOAD' | 'EXTERNAL';
  mediaType: 'IMAGE' | 'VIDEO' | 'PODCAST' | 'AUDIO' | 'DOCUMENT' | 'OTHER';
  title: string;
  caption: string | null;
  altText: string | null;
  url: string;
  durationSeconds: number | null;
  isFeatured: boolean;
}

export interface ProgramConference {
  id: string;
  conferenceId: string;
  programId: string;
  conferenceSummary: string | null;
  isFeatured: boolean;
  startDate: string | null;
  endDate: string | null;
  conference?: {
    id: string;
    year: number;
    slug: string;
    title: string;
    theme: string;
    isCurrent: boolean;
    publicationStatus: string;
  };
}
