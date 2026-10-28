import { describe, expect, it } from 'vitest';
import { ConferenceEvent } from '../../interfaces/conference.interface';
import { publishedConferenceEvents } from './conference-program-details';

describe('publishedConferenceEvents', () => {
  it('does not render draft events returned by the public API', () => {
    const events = [
      { id: 'published', publicationStatus: 'PUBLISHED' },
      { id: 'draft', publicationStatus: 'DRAFT' },
    ] as ConferenceEvent[];

    expect(publishedConferenceEvents(events).map((event) => event.id)).toEqual([
      'published',
    ]);
  });
});
