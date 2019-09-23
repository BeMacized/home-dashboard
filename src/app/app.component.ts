import { Component, OnDestroy, OnInit } from '@angular/core';
import { HomeAssistantService } from './services/home-assistant.service';
import { EntityOverlayService } from './services/entity-overlay.service';
import { SwUpdate } from '@angular/service-worker';
import { Subscription } from 'rxjs';
import { environment } from '../environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
    updateMode: 'AVAILABLE' | 'ACTIVATED';
    updateSubscriptions: Subscription[];

    constructor(
        private hass: HomeAssistantService,
        public entityOverlay: EntityOverlayService,
        private swUpdate: SwUpdate
    ) {}

    ngOnInit() {
        this.hass.connect();
        if (environment.production) {
            this.swUpdate.checkForUpdate();
            setInterval(() => this.swUpdate.checkForUpdate(), 60000);
        }
        this.updateSubscriptions = [
            this.swUpdate.available.subscribe(e => (this.updateMode = 'AVAILABLE')),
            this.swUpdate.activated.subscribe(e => (this.updateMode = 'ACTIVATED')),
        ];
    }

    ngOnDestroy() {
        this.updateSubscriptions.forEach(s => s.unsubscribe());
    }
}
