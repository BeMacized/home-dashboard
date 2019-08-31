import { Component, OnInit } from '@angular/core';
import { HomeAssistantService } from './services/home-assistant.service';
import { LightOverlayService } from './services/light-overlay.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
    constructor(private hass: HomeAssistantService, public lightOverlayService: LightOverlayService) {}

    ngOnInit() {
        this.hass.connect();
    }
}
