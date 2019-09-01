import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { LightOverlayService } from '../../../services/light-overlay.service';
import { filter, map, mergeMap, take, tap, throttleTime } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { HammerService } from '../../../services/hammer.service';
import { DIRECTION_VERTICAL } from 'hammerjs';
import { async } from 'rxjs/internal/scheduler/async';
import { HomeAssistantService } from '../../../services/home-assistant.service';

@Component({
    selector: 'app-light-dimmer',
    templateUrl: './light-dimmer.component.html',
    styleUrls: ['./light-dimmer.component.scss'],
})
export class LightDimmerComponent implements OnInit, OnDestroy {
    dragging = false;
    dragStartBrightness: number;
    hammer: HammerManager;
    brightness$: BehaviorSubject<number>;
    brightnessSet$: Subject<number>;

    constructor(
        public lightOverlay: LightOverlayService,
        private hass: HomeAssistantService,
        private hs: HammerService,
        private el: ElementRef
    ) {}

    ngOnInit() {
        // Initialize subjects
        this.brightness$ = new BehaviorSubject<number>(0.0);
        this.brightnessSet$ = new Subject<number>();
        // Get initial brightness
        this.lightOverlay.entity$
            .pipe(
                take(1),
                tap(e => console.log(e)),
                filter(e => e.features.includes('BRIGHTNESS'))
            )
            .subscribe(e => this.brightness$.next((e.attributes.brightness || 0) / 255));
        // Subscribe to brightness change requests
        this.brightnessSet$
            .pipe(
                // Throttle dim requests
                throttleTime(1000, async, { leading: true, trailing: true }),
                // Only accept dim requests if there's an active entity
                filter(_ => this.lightOverlay.entity$ != null),
                // Transform brightness and get entity
                mergeMap(value =>
                    this.lightOverlay.entity$.pipe(
                        take(1),
                        map(entity => ({ entity, value: Math.round(Math.max(0, Math.min(1, value)) * 255) }))
                    )
                ),
                // Only accept dim requests if the entity supports brightness
                filter(ev => ev.entity.features.includes('BRIGHTNESS'))
            )
            .subscribe(async ev => {
                // Send dim request to HASS
                await this.hass.callService('light', ev.value ? 'turn_on' : 'turn_off', {
                    brightness: ev.value ? ev.value : undefined,
                    entity_id: ev.entity.entity_id,
                    // transition: ev.entity.features.includes('TRANSITION') ? 1 : undefined,
                });
            });
        // Listen for gestures
        this.hammer = this.hs.create(this.el);
        this.hammer.get('pan').set({ direction: DIRECTION_VERTICAL, threshold: 1 });
        this.hammer.on('pan', event => this.onPan(event));
        this.hammer.on('tap', event => this.onTap(event));
    }

    ngOnDestroy() {
        this.hammer.destroy();
        this.brightness$.unsubscribe();
        this.brightnessSet$.unsubscribe();
    }

    onTap(event: HammerInput) {
        this.onDim(event);
    }

    onPan(event: HammerInput) {
        if (!this.dragging) {
            this.dragging = true;
            this.dragStartBrightness = this.brightness$.value;
        }
        this.onDim(event);
        if (event.isFinal) {
            this.dragging = false;
        }
    }

    onDim(event: HammerInput) {
        const minY = this.el.nativeElement.getBoundingClientRect().top;
        const dimmerHeight = this.el.nativeElement.clientHeight;
        const pressY = event.center.y;
        const brightness = 1 - Math.max(0, Math.min(1, (pressY - minY) / dimmerHeight));
        this.brightness$.next(brightness);
        this.brightnessSet$.next(brightness);
    }
}
