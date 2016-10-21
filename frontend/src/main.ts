import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/';

// init foundation
declare var jQuery; // redeclare with type any for 'foundation' property
jQuery(document).foundation();

// init environment
if (environment.production) {
  enableProdMode();
}

// init app
platformBrowserDynamic().bootstrapModule(AppModule);
