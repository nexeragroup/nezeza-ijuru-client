import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { filter } from 'rxjs';
import { environment } from '../../../environments/environment';

interface SeoRouteData {
  readonly title: string;
  readonly description: string;
  readonly keywords?: string;
  readonly image?: string;
  readonly url?: string;
  readonly robots?: string;
  readonly type?: 'website' | 'article';
}

interface SeoPageUpdate {
  readonly title: string;
  readonly description: string;
  readonly canonicalPath?: string;
  readonly imagePath?: string;
  readonly robots?: string;
  readonly type?: 'website' | 'article';
}

const DEFAULT_SEO: SeoRouteData = {
  title: 'Nezeza Ijuru | Make heaven rejoice',
  description:
    'An annual Gospel mission centred on evangelism, discipleship, worship, godly families, youth empowerment, and compassionate service.',
  image: '/brand/logos/logo-primary.png',
  url: '/',
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  initialize(): void {
    this.apply(this.findSeoData(this.router.routerState.snapshot.root));

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => this.apply(this.findSeoData(this.router.routerState.snapshot.root)));
  }

  updatePage(update: SeoPageUpdate): void {
    this.apply({
      title: update.title,
      description: update.description,
      image: update.imagePath,
      url: update.canonicalPath,
      robots: update.robots,
      type: update.type,
    });
  }

  private apply(seo: SeoRouteData | undefined): void {
    const metadata = seo ?? DEFAULT_SEO;
    const canonicalUrl = this.absoluteUrl(metadata.url ?? '/');
    const imageUrl = this.absoluteUrl(metadata.image ?? DEFAULT_SEO.image!);
    const robots = metadata.robots ?? (environment.indexable ? 'index, follow' : 'noindex, nofollow');

    this.title.setTitle(metadata.title);
    this.updateName('description', metadata.description);
    this.updateName('robots', robots);
    this.updateName('googlebot', robots);

    if (metadata.keywords) {
      this.updateName('keywords', metadata.keywords);
    }

    this.updateProperty('og:type', metadata.type ?? 'website');
    this.updateProperty('og:site_name', 'Nezeza Ijuru');
    this.updateProperty('og:title', metadata.title);
    this.updateProperty('og:description', metadata.description);
    this.updateProperty('og:url', canonicalUrl);
    this.updateProperty('og:image', imageUrl);
    this.updateProperty('og:image:alt', 'Nezeza Ijuru');
    this.updateName('twitter:card', 'summary');
    this.updateName('twitter:title', metadata.title);
    this.updateName('twitter:description', metadata.description);
    this.updateName('twitter:image', imageUrl);
    this.setLink('canonical', canonicalUrl);
    this.setLink('alternate', canonicalUrl, 'en');
    this.setStructuredData(metadata, canonicalUrl, imageUrl);
  }

  private findSeoData(snapshot: ActivatedRouteSnapshot): SeoRouteData | undefined {
    let current: ActivatedRouteSnapshot | null = snapshot;
    let seo: SeoRouteData | undefined;

    while (current) {
      seo = (current.data['seo'] as SeoRouteData | undefined) ?? seo;
      current = current.firstChild;
    }

    return seo;
  }

  private absoluteUrl(path: string): string {
    return new URL(path, `${environment.siteUrl}/`).toString();
  }

  private updateName(name: string, content: string): void {
    this.meta.updateTag({ name, content }, `name='${name}'`);
  }

  private updateProperty(property: string, content: string): void {
    this.meta.updateTag({ property, content }, `property='${property}'`);
  }

  private setLink(rel: string, href: string, hreflang?: string): void {
    const selector = hreflang ? `link[rel='${rel}'][hreflang='${hreflang}']` : `link[rel='${rel}']`;
    let link = this.document.head.querySelector<HTMLLinkElement>(selector);

    if (!link) {
      link = this.document.createElement('link');
      link.rel = rel;
      if (hreflang) {
        link.hreflang = hreflang;
      }
      this.document.head.appendChild(link);
    }

    link.href = href;
  }

  private setStructuredData(seo: SeoRouteData, url: string, image: string): void {
    const id = 'nezeza-ijuru-structured-data';
    let script = this.document.getElementById(id) as HTMLScriptElement | null;

    if (!script) {
      script = this.document.createElement('script');
      script.id = id;
      script.type = 'application/ld+json';
      this.document.head.appendChild(script);
    }

    const siteUrl = this.absoluteUrl('/');
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Organization',
          '@id': `${siteUrl}#organization`,
          name: 'Nezeza Ijuru',
          url: siteUrl,
          logo: image,
          email: 'info@nezezaijuru.org',
          telephone: '+250788319899',
        },
        {
          '@type': 'WebSite',
          '@id': `${siteUrl}#website`,
          name: 'Nezeza Ijuru',
          url: siteUrl,
          publisher: { '@id': `${siteUrl}#organization` },
        },
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: seo.title,
          description: seo.description,
          isPartOf: { '@id': `${siteUrl}#website` },
        },
      ],
    });
  }
}
