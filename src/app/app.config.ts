import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

import { routes } from './app.routes';

/** Warm homepage remotes so first visit to Home reuses cached modules. Errors are ignored; cards retry on the homepage. */
function preloadHomepageRemotes(): Promise<void> {
  return Promise.all([
    loadRemoteModule({ remoteName: 'sleep', exposedModule: './Analysis' }).catch(() => undefined),
    loadRemoteModule({ remoteName: 'glucose', exposedModule: './Component' }).catch(() => undefined),
    loadRemoteModule({ remoteName: 'mood', exposedModule: './Card' }).catch(() => undefined),
    loadRemoteModule({ remoteName: 'heartRate', exposedModule: './Card' }).catch(() => undefined),
  ]).then(() => undefined);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withHashLocation()),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => () => preloadHomepageRemotes(),
    },
  ],
};
