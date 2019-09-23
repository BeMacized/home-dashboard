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
import { EntityOverlayComponent } from './views/entity-overlay/entity-overlay.component';
import { LightDimmerComponent } from './views/entity-overlay/light-dimmer/light-dimmer.component';
import { LightColorComponent } from './views/entity-overlay/light-color/light-color.component';
import { ColorPresetsComponent } from './views/entity-overlay/light-color/color-presets/color-presets.component';
import { EntityOverlayHeaderComponent } from './views/entity-overlay/entity-overlay-header/entity-overlay-header.component';
import { ColorPresetComponent } from './views/entity-overlay/light-color/color-presets/color-preset/color-preset.component';
import { ColorEditorComponent } from './views/entity-overlay/light-color/color-editor/color-editor.component';
import { EntitySectionPageComponent } from './components/entity-section/entity-section-page/entity-section-page.component';
import { EllipsisModule } from 'ngx-ellipsis';
import { SwitchToggleComponent } from './views/entity-overlay/switch-toggle/switch-toggle.component';

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
        EntityOverlayComponent,
        LightDimmerComponent,
        LightColorComponent,
        ColorPresetsComponent,
        EntityOverlayHeaderComponent,
        ColorPresetComponent,
        ColorEditorComponent,
        EntitySectionPageComponent,
        SwitchToggleComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        EllipsisModule,
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
