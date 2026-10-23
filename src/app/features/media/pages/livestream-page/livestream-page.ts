import { Component, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Inject, Input, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Livestream, MediaService } from '../../services/media.service';
import { MediaEmbedService } from '../../services/media-embed.service';

@Component({
  selector: 'app-livestream-page',
  standalone: false,
  styleUrl: './livestream-page.css',
  templateUrl: './livestream-page.html',
})
export class LivestreamPage implements OnInit, OnDestroy {
  @Input() sessionIds: string[] | null = null;
  @Input() embedded = false;
  readonly streams = signal<Livestream[]>([]);
  readonly selected = signal<Livestream | undefined>(undefined);
  readonly embed = signal<SafeResourceUrl | null>(null);
  readonly loading = signal(true);
  readonly error = signal(false);
  private timer?: ReturnType<typeof setInterval>;
  private request?: Subscription;
  private busy = false;

  constructor(
    private readonly media: MediaService,
    private readonly embeds: MediaEmbedService,
    private readonly route: ActivatedRoute,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngOnInit(): void {
    this.refresh();
    if (isPlatformBrowser(this.platformId)) {
      this.timer = setInterval(() => {
        if (!document.hidden) this.refresh();
      }, 60_000);
    }
  }

  refresh(): void {
    if (this.busy) return;
    this.busy = true;
    this.request?.unsubscribe();
    this.request = this.media.getLivestreams().subscribe({
      next: (streams) => {
        const available = streams.filter(
          (stream) => this.sessionIds === null || this.sessionIds.includes(stream.sessionId),
        );
        this.streams.set(available.filter((stream) => stream.state === 'LIVE'));
        const sessionId =
          this.selected()?.sessionId ?? this.route.snapshot.queryParamMap.get('session');
        const selected =
          this.streams().find((stream) => stream.sessionId === sessionId) ?? this.streams()[0];
        if (selected) this.select(selected);
        else {
          this.selected.set(undefined);
          this.embed.set(null);
        }
        this.loading.set(false);
        this.error.set(!selected && available.some((stream) => stream.state === 'UNKNOWN'));
        this.busy = false;
      },
      error: () => {
        this.loading.set(false);
        this.error.set(true);
        this.busy = false;
      },
    });
  }

  select(stream: Livestream): void {
    if (
      this.selected()?.videoId !== stream.videoId ||
      this.selected()?.embeddable !== stream.embeddable ||
      !this.embed()
    ) {
      this.embed.set(stream.embeddable === false ? null : this.embeds.videoEmbedUrl(stream.url));
    }
    this.selected.set(stream);
  }

  ngOnDestroy(): void {
    clearInterval(this.timer);
    this.request?.unsubscribe();
  }
}
