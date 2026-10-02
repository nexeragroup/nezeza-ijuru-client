import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PublicLayoutComponent } from './layout/public-layout/public-layout.component';

const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        title: 'Nezeza Ijuru | Make heaven rejoice',
        data: {
          seo: {
            title: 'Nezeza Ijuru | Make heaven rejoice',
            description:
              'Make heaven rejoice through evangelism, discipleship, worship, godly families, youth empowerment, and compassionate community service.',
            url: '/',
          },
        },
        loadChildren: () =>
          import('./features/home/home-module').then((module) => module.HomeModule),
      },
      {
        path: 'give',
        title: 'Give | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Give | Nezeza Ijuru',
            description: 'Support the Gospel mission and compassionate work of Nezeza Ijuru.',
            url: '/give',
          },
        },
        loadChildren: () =>
          import('./features/give/give-module').then((module) => module.GiveModule),
      },
      {
        path: 'about',
        title: 'About Nezeza Ijuru',
        data: {
          seo: {
            title: 'About Nezeza Ijuru',
            description: 'Learn about the vision, mission, and people behind Nezeza Ijuru.',
            url: '/about',
          },
        },
        loadChildren: () =>
          import('./features/about/about-module').then((module) => module.AboutModule),
      },
      {
        path: 'programs',
        title: 'Programs | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Programs | Nezeza Ijuru',
            description: 'Explore Nezeza Ijuru programs for evangelism, discipleship, worship, families, youth, and community care.',
            url: '/programs',
          },
        },
        loadChildren: () =>
          import('./features/programs/programs-module').then((module) => module.ProgramsModule),
      },
      {
        path: 'conferences',
        title: 'Conferences | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Conferences | Nezeza Ijuru',
            description: 'Find upcoming and past Nezeza Ijuru conferences, programs, and ministry gatherings.',
            url: '/conferences',
          },
        },
        loadChildren: () =>
          import('./features/conferences/conferences-module').then(
            (module) => module.ConferencesModule,
          ),
      },
      {
        path: 'media',
        title: 'Media | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Media | Nezeza Ijuru',
            description: 'Watch, listen to, and explore media from Nezeza Ijuru.',
            url: '/media',
          },
        },
        loadChildren: () =>
          import('./features/media/media-module').then((module) => module.MediaModule),
      },
      {
        path: 'contact',
        title: 'Contact | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Contact | Nezeza Ijuru',
            description: 'Contact Nezeza Ijuru for prayer, partnership, giving, and event information.',
            url: '/contact',
          },
        },
        loadChildren: () =>
          import('./features/contact/contact-module').then((module) => module.ContactModule),
      },
      {
        path: '**',
        title: 'Page not found | Nezeza Ijuru',
        data: {
          seo: {
            title: 'Page not found | Nezeza Ijuru',
            description: 'The page you requested could not be found.',
            robots: 'noindex, nofollow',
          },
        },
        loadChildren: () =>
          import('./features/error/error-module').then((module) => module.ErrorModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { scrollPositionRestoration: 'top' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
