import { HttpErrorResponse } from '@angular/common/http';
import { Component, RESPONSE_INIT, computed, inject, signal } from '@angular/core';
import { SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { OnDestroy, OnInit } from '@angular/core';
import { Subject, Subscription, catchError, finalize, forkJoin, of, takeUntil } from 'rxjs';
import {
  ConferenceEvent,
  ConferenceProgramDetails as ConferenceProgramDetailsModel,
  ConferenceProgramMedia,
} from '../../interfaces/conference.interface';
import { ConferencesService } from '../../services/conferences.service';
import { SeoService } from '../../../../core';
import { Livestream, MediaService } from '../../../media/services/media.service';
import { MediaEmbedService } from '../../../media/services/media-embed.service';

export function publishedConferenceEvents(
  events: readonly ConferenceEvent[] | undefined,
): ConferenceEvent[] {
  return (events ?? []).filter((event) => event.publicationStatus === 'PUBLISHED');
}

@Component({
  selector: 'app-conference-program-details',
  standalone: false,
  styleUrl: './conference-program-details.css',
  templateUrl: './conference-program-details.html',
})
export class ConferenceProgramDetails implements OnInit, OnDestroy {
  readonly details = signal<ConferenceProgramDetailsModel | null>(null);
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly errorKind = signal<'not-found' | 'unavailable'>('unavailable');
  readonly streams = signal<Livestream[]>([]);
  readonly publishedEvents = computed(() =>
    publishedConferenceEvents(this.details()?.conferenceProgram.events),
  );
  readonly activeEvent = computed(
    () => this.publishedEvents().find((event) => event.eventStatus === 'ACTIVE') ?? null,
  );
  readonly nextEvent = computed(
    () => this.publishedEvents().find((event) => event.eventStatus === 'PLANNED') ?? null,
  );
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });
  private request?: Subscription;
  private readonly destroyed$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly conferencesApi: ConferencesService,
    private readonly mediaApi: MediaService,
    private readonly embeds: MediaEmbedService,
    private readonly seo: SeoService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntil(this.destroyed$)).subscribe((params) => {
      const conferenceId = params.get('conferenceId');
      const programId = params.get('conferenceProgramId');
      if (conferenceId && programId) this.loadProgram(conferenceId, programId);
      else this.setError(404);
    });
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  retry(): void {
    const conferenceId = this.route.snapshot.paramMap.get('conferenceId');
    const programId = this.route.snapshot.paramMap.get('conferenceProgramId');
    if (conferenceId && programId) this.loadProgram(conferenceId, programId);
  }

  schedule(value: string, timezone: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Date unavailable';
    try {
      return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: timezone || 'Africa/Kigali',
      }).format(date);
    } catch {
      return new Intl.DateTimeFormat('en', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'UTC',
      }).format(date);
    }
  }

  readableStatus(status: string): string {
    return status.toLowerCase().replaceAll('_', ' ');
  }

  streamFor(event: ConferenceEvent): Livestream | undefined {
    return this.streams().find((stream) => stream.sessionId === event.id);
  }

  isLive(event: ConferenceEvent): boolean {
    return this.streamFor(event)?.state === 'LIVE';
  }

  liveEmbed(event: ConferenceEvent): SafeResourceUrl | null {
    const stream = this.streamFor(event);
    return stream ? this.embeds.videoEmbedUrl(stream.url) : null;
  }

  eventMedia(event: ConferenceEvent): ConferenceProgramMedia[] {
    return (this.details()?.media ?? []).filter(
      (media) => media.targetType === 'EVENT' && media.targetId === event.id,
    );
  }

  programMedia(): ConferenceProgramMedia[] {
    const programId = this.details()?.conferenceProgram.id;
    return (this.details()?.media ?? []).filter(
      (media) => media.targetType === 'CONFERENCE_PROGRAM' && media.targetId === programId,
    );
  }

  private loadProgram(conferenceId: string, programId: string): void {
    this.request?.unsubscribe();
    this.loading.set(true);
    this.loadError.set(false);
    this.request = forkJoin({
      details: this.conferencesApi.getConferenceProgram(conferenceId, programId),
      streams: this.mediaApi.getLivestreams().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: ({ details, streams }) => {
          this.details.set(details);
          this.streams.set(streams);
          this.seo.updatePage({
            title: `${details.conferenceProgram.program.name} | ${details.conference.title}`,
            description:
              details.conferenceProgram.conferenceSummary ||
              details.conferenceProgram.program.summary ||
              details.conferenceProgram.program.description ||
              details.conference.theme,
            canonicalPath: `/conferences/${details.conference.id}/program/${details.conferenceProgram.id}`,
            type: 'article',
          });
        },
        error: (error: HttpErrorResponse) => this.setError(error.status === 404 ? 404 : 503),
      });
  }

  private setError(status: 404 | 503): void {
    this.details.set(null);
    this.loading.set(false);
    this.loadError.set(true);
    this.errorKind.set(status === 404 ? 'not-found' : 'unavailable');
    const notFound = status === 404;
    this.seo.updatePage({
      title: notFound ? 'Program not found | Nezeza Ijuru' : 'Program unavailable | Nezeza Ijuru',
      description: notFound
        ? 'The conference program you requested could not be found.'
        : 'This conference program is temporarily unavailable. Please try again shortly.',
      robots: 'noindex,nofollow,noarchive',
    });
    if (this.responseInit) this.responseInit.status = status;
  }
}
