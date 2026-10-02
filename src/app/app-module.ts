import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { renderingProviders } from './rendering.providers';
import { CoreModule } from './core/core.module';
import { environment } from '../environments/environment';
import { SharedModule } from './shared/shared.module';
import { LayoutModule } from './layout/layout.module';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CoreModule.forRoot({
      apiBaseUrl: environment.apiBaseUrl,
      apiRequestTimeoutMs: 15_000,

      storage: {
        namespace: 'default',
        version: 1,
        defaultArea: 'local',
      },

      auth: {
        refreshPath: '/auth/refresh',
        loginRoute: '/login',
      },

      connection: {
        pollIntervalMs: 30_000,
        timeoutMs: 5_000,
        degradedLatencyMs: 2_500,
      },

      theme: {
        defaultColor: 'default',
        defaultMode: 'system',
      },
    }),
    SharedModule,
    LayoutModule,
  ],
  providers: [provideBrowserGlobalErrorListeners(), ...renderingProviders],
  bootstrap: [App],
})
export class AppModule {}
