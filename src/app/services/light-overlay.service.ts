import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { delay, filter, map, mergeMap, switchMap, take, tap, throttleTime } from 'rxjs/operators';
import { HassEntity, HomeAssistantService } from './home-assistant.service';
import { async } from 'rxjs/internal/scheduler/async';

type LightOverlayMode = 'BRIGHTNESS' | 'COLOR';

@Injectable({
    providedIn: 'root',
})
export class LightOverlayService {
    entity$: Observable<HassEntity>;
    showOverlay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    mode$: BehaviorSubject<LightOverlayMode> = new BehaviorSubject<LightOverlayMode>(null);

    constructor() {}

    open(entity$: Observable<HassEntity>) {
        if (this.entity$) return console.error('Cannot open light overlay while already open');
        // Reference entity on class
        this.entity$ = entity$;
        this.entity$.pipe(take(1)).subscribe(entity => {
            // Set mode
            if (entity.features.includes('BRIGHTNESS')) {
                this.mode$.next('BRIGHTNESS');
            } else if (entity.features.includes('COLOR') || entity.features.includes('COLOR_TEMP')) {
                this.mode$.next('COLOR');
            }
            // Show the overlay
            this.showOverlay$.next(true);
        });
    }

    close() {
        this.entity$ = null;
        this.showOverlay$.next(false);
    }
}
