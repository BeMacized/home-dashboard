import { BrowserModule, HAMMER_GESTURE_CONFIG, HammerGestureConfig } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeViewComponent } from './views/home-view/home-view.component';
import { EntityPageScaffoldComponent } from './components/layouts/entity-page-scaffold/entity-page-scaffold.component';
import { EntityPageHeaderComponent } from './components/layouts/entity-page-scaffold/entity-page-header/entity-page-header.component';
import { EntitySectionComponent } from './components/entity-section/entity-section.component';
import { EntityTileComponent } from './components/entity-tile/entity-tile.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { RoomSectionComponent } from './components/room-section/room-section.component';
import { RoomTileComponent } from './components/room-tile/room-tile.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PageViewComponent } from './components/page-view/page-view.component';
import { PageViewPageComponent } from './components/page-view/page-view-page/page-view-page.component';
import { LightOverlayComponent } from './views/light-overlay/light-overlay.component';
import { LightDimmerComponent } from './views/light-overlay/light-dimmer/light-dimmer.component';
import { LightColorComponent } from './views/light-overlay/light-color/light-color.component';
import { ColorPresetsComponent } from './views/light-overlay/light-color/color-presets/color-presets.component';

@NgModule({
    declarations: [
        AppComponent,
        HomeViewComponent,
        EntityPageScaffoldComponent,
        EntityPageHeaderComponent,
        EntitySectionComponent,
        EntityTileComponent,
        RoomSectionComponent,
        RoomTileComponent,
        PageViewComponent,
        PageViewPageComponent,
        LightOverlayComponent,
        LightDimmerComponent,
        LightColorComponent,
        ColorPresetsComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
