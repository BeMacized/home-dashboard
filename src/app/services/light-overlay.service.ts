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
    showOverlay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

    constructor() {}

    open(entity$: Observable<HassEntity>) {
        if (this.entity$) return console.error('Cannot open light overlay while already open');
        // Reference entity on class
        this.entity$ = entity$;
        // Show the overlay
        this.showOverlay$.next(true);
    }

    close() {
        this.entity$ = null;
        this.showOverlay$.next(false);
    }
}
