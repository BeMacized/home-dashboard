import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { LightOverlayService } from '../../../services/light-overlay.service';
import { filter, map } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { HammerService } from '../../../services/hammer.service';
import { DIRECTION_VERTICAL } from 'hammerjs';

@Component({
    selector: 'app-light-dimmer',
    templateUrl: './light-dimmer.component.html',
    styleUrls: ['./light-dimmer.component.scss'],
})
export class LightDimmerComponent implements OnInit, OnDestroy {
    dimSubscription: Subscription;
    dimHeight$: BehaviorSubject<number> = new BehaviorSubject<number>(0.0);
    dragging = false;
    startDimValue: number;
    hammer: HammerManager;

    constructor(public lightOverlay: LightOverlayService, private hs: HammerService, private el: ElementRef) {}

    ngOnInit() {
        this.dimSubscription = this.lightOverlay.dim$
            .pipe(filter(_ => !this.dragging))
            .subscribe(v => this.dimHeight$.next(v));

        // Listen for gestures
        this.hammer = this.hs.create(this.el);
        this.hammer.get('pan').set({ direction: DIRECTION_VERTICAL, threshold: 1 });
        this.hammer.on('pan', event => this.onPan(event));
        this.hammer.on('tap', event => this.onTap(event));
    }

    ngOnDestroy() {
        this.hammer.destroy();
        this.dimSubscription.unsubscribe();
    }

    onTap(event: HammerInput) {
        this.onDim(event);
    }

    onPan(event: HammerInput) {
        if (!this.dragging) {
            this.dragging = true;
            this.startDimValue = this.dimHeight$.value;
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
        const dimValue = 1 - Math.max(0, Math.min(1, (pressY - minY) / dimmerHeight));
        this.dimHeight$.next(dimValue);
        this.lightOverlay.dimSet$.next(dimValue);
    }
}
