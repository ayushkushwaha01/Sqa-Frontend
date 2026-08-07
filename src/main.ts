
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// Global fix: Patch Highcharts-Angular ngOnDestroy to prevent
// "Cannot read properties of undefined (reading 'columns')" crash
// that causes blank screens when navigating between pages with charts.
import { HighchartsChartComponent } from 'highcharts-angular';
const originalOnDestroy = HighchartsChartComponent.prototype.ngOnDestroy;
HighchartsChartComponent.prototype.ngOnDestroy = function () {
  try {
    originalOnDestroy.call(this);
  } catch (e) {
    // Silently catch Highcharts internal destroy errors
    this.chart = null;
  }
};

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
