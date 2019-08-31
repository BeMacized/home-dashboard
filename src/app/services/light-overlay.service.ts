import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { delay, filter, map, mergeMap, switchMap, take, tap, throttleTime } from 'rxjs/operators';
import { HassEntity, HomeAssistantService } from './home-assistant.service';
import { async } from 'rxjs/internal/scheduler/async';

@Injectable({
    providedIn: 'root',
})
export class LightOverlayService {
    entity$: Observable<HassEntity>;
    showOverlay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    dim$: BehaviorSubject<number> = new BehaviorSubject<number>(0);
    dimSet$: Subject<number> = new Subject<number>();
    dimSubscription: Subscription;

    constructor(private hass: HomeAssistantService) {
        this._handleDimSet();
    }

    _handleDimSet() {
        this.dimSet$
            .pipe(
                // Throttle dim requests
                throttleTime(1000, async, { leading: true, trailing: true }),
                // Only accept dim requests if there's an active entity
                filter(_ => this.entity$ != null),
                // Transform brightness and get entity
                mergeMap(value =>
                    this.entity$.pipe(
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
    }

    open(entity$: Observable<HassEntity>) {
        if (this.entity$) return console.error('Cannot open light overlay while already open');
        // Reference entity on class
        this.entity$ = entity$;
        // Get initial brightness
        this.entity$
            .pipe(
                take(1),
                filter(e => e.features.includes('BRIGHTNESS'))
            )
            .subscribe(e => this.dim$.next((e.attributes.brightness || 0) / 255));
        // Subscribe to brightness
        this.dimSubscription = this.entity$
            .pipe(
                filter(e => e.features.includes('BRIGHTNESS')),
                map(e => e.attributes.brightness || 0)
            )
            .subscribe(v => this.dim$.next(v / 255));
        // Show the overlay
        this.showOverlay$.next(true);
    }

    close() {
        this.entity$ = null;
        if (this.dimSubscription) {
            this.dimSubscription.unsubscribe();
            this.dimSubscription = null;
        }
        this.showOverlay$.next(false);
    }
}
