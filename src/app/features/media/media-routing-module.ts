import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MediaPage } from './pages/media-page/media-page';
import { GalleryPage } from './pages/gallery-page/gallery-page';
import { LivestreamPage } from './pages/livestream-page/livestream-page';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: MediaPage,
    data: {
      seo: {
        title: 'Media | Nezeza Ijuru',
        description: 'Watch, listen to, and explore media from Nezeza Ijuru.',
        url: '/media',
      },
    },
  },
  { path: 'gallery/:albumSlug', component: GalleryPage },
  {
    path: 'livestream',
    component: LivestreamPage,
    data: {
      seo: {
        title: 'Livestream | Nezeza Ijuru',
        description: 'Watch Nezeza Ijuru live ministry sessions and events.',
        url: '/media/livestream',
      },
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MediaRoutingModule {}
