import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { delay, filter, map, mergeMap, switchMap, take, tap, throttleTime } from 'rxjs/operators';
import { HassEntity, HomeAssistantService } from './home-assistant.service';
import { async } from 'rxjs/internal/scheduler/async';

type LightOverlayMode = 'BRIGHTNESS' | 'COLOR';

type CloseHandler = () => boolean;

@Injectable({
    providedIn: 'root',
})
export class EntityOverlayService {
    private entitySubscription: Subscription;
    entity$: BehaviorSubject<HassEntity> = new BehaviorSubject<HassEntity>(null);
    showOverlay$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
    mode$: BehaviorSubject<LightOverlayMode> = new BehaviorSubject<LightOverlayMode>(null);
    closeHandlers: CloseHandler[] = [];

    constructor() {}

    registerCloseHandler(handler: CloseHandler) {
        if (!this.closeHandlers.includes(handler)) this.closeHandlers.push(handler);
    }

    unregisterCloseHandler(handler: CloseHandler) {
        if (this.closeHandlers.includes(handler)) this.closeHandlers.splice(this.closeHandlers.indexOf(handler), 1);
    }

    open(entity$: Observable<HassEntity>) {
        if (this.showOverlay$.value) return console.error('Cannot open light overlay while already open');
        // Reference entity on class
        this.entitySubscription = entity$.subscribe(entity => this.entity$.next(entity));
        entity$.pipe(take(1)).subscribe(entity => {
            // Set mode
            if (entity.features.includes('BRIGHTNESS')) {
                this.mode$.next('BRIGHTNESS');
            } else if (entity.features.includes('COLOR') || entity.features.includes('COLOR_TEMP')) {
                this.mode$.next('COLOR');
            } else {
                this.mode$.next(null);
                return;
            }
            // Show the overlay
            this.showOverlay$.next(true);
        });
    }

    close() {
        if (!this.showOverlay$.value) return;
        for (const handler of this.closeHandlers) {
            if (!handler()) return;
        }
        this.entitySubscription.unsubscribe();
        this.entitySubscription = null;
        this.entity$.next(null);
        this.showOverlay$.next(false);
    }
}
