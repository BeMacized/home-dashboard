import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { EntityOverlayService } from '../../../services/entity-overlay.service';
import { HomeAssistantService } from '../../../services/home-assistant.service';
import { HammerService } from '../../../services/hammer.service';
import { DIRECTION_VERTICAL } from 'hammerjs';

@Component({
    selector: 'app-switch-toggle',
    templateUrl: './switch-toggle.component.html',
    styleUrls: ['./switch-toggle.component.scss'],
})
export class SwitchToggleComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('switchTrack') switchTrackEl;
    @ViewChild('switch') switchEl;
    hammer: HammerManager;
    panning = false;
    switchTop = 0;
    switchTopMax = 0;

    get showColorModeButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(
            map(e => (!e ? null : e.features.includes('COLOR') || e.features.includes('COLOR_TEMP')))
        );
    }

    constructor(
        public entityOverlay: EntityOverlayService,
        private hass: HomeAssistantService,
        private hs: HammerService
    ) {}

    ngOnInit() {
        const trackPadding = 10;
        const trackHeight = this.switchTrackEl.nativeElement.clientHeight;
        const fillHeight = this.switchEl.nativeElement.clientHeight;
        this.switchTopMax = trackHeight - fillHeight - trackPadding * 2;
        // Get initial state
        this.entityOverlay.entity$.pipe(take(1)).subscribe(e => {
            switch (e.state) {
                case 'off': {
                    this.switchTop = this.switchTopMax;
                    break;
                }
                case 'on': {
                    this.switchTop = 0;
                    break;
                }
            }
        });
    }

    ngAfterViewInit() {
        // Listen for gestures
        this.hammer = this.hs.create(this.switchEl);
        this.hammer.get('pan').set({ direction: DIRECTION_VERTICAL, threshold: 1 });
        this.hammer.on('pan', event => this.onPan(event));
        this.hammer.on('tap', event => this.onTap(event));
    }

    ngOnDestroy() {
        this.hammer.destroy();
    }

    onPan(event: HammerInput) {
        const trackPadding = 10;
        const fillHeight = this.switchEl.nativeElement.clientHeight;
        const pressY = event.center.y;
        const trackTop = this.switchTrackEl.nativeElement.getBoundingClientRect().top;
        const pressTop = pressY - trackTop - fillHeight / 2 - trackPadding;
        this.switchTop = Math.min(this.switchTopMax, Math.max(0, pressTop));

        // Set panning flag
        this.panning = true;
        // Release
        if (event.isFinal) {
            this.panning = false;
            if (this.switchTop < this.switchTopMax / 2) {
                this.switchTop = 0;
                this.entityOverlay.entity$
                    .pipe(take(1))
                    .subscribe(e => this.hass.callService('homeassistant', 'turn_on', { entity_id: e.entity_id }));
            } else {
                this.switchTop = this.switchTopMax;
                this.entityOverlay.entity$
                    .pipe(take(1))
                    .subscribe(e => this.hass.callService('homeassistant', 'turn_off', { entity_id: e.entity_id }));
            }
        }
    }

    onTap(event: HammerInput) {
        this.switchTop = this.switchTop < this.switchTopMax / 2 ? this.switchTopMax : 0;
        this.entityOverlay.entity$
            .pipe(take(1))
            .subscribe(e => this.hass.callService('homeassistant', 'toggle', { entity_id: e.entity_id }));
    }
}
