/* tslint:disable:prefer-const */
import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { destroyDelay, fade, zoomFade } from '../../utils/animations';
import { LightOverlayService } from '../../services/light-overlay.service';
import { Observable, Subscription } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-light-overlay',
    templateUrl: './light-overlay.component.html',
    styleUrls: ['./light-overlay.component.scss'],
    animations: [fade('controlFade', '.25s ease'), fade('bgFade', '.5s ease')],
})
export class LightOverlayComponent implements OnInit, OnDestroy {
    @HostBinding('style.pointer-events') get pointerEvents() {
        return this.open ? 'auto' : 'none';
    }

    @ViewChild('controlContainer') controlContainer;
    mouseDown = false;

    tileElement: Element;
    style: { [p: string]: any } = {};
    open = false;

    openSubscription: Subscription;
    entitySubscription: Subscription;

    constructor(private el: ElementRef, public lightOverlay: LightOverlayService, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.entitySubscription = this.lightOverlay.entity$.pipe(filter(e => !!e)).subscribe(entity => {
            const query = document.querySelectorAll(`[data-entity-id="${entity.entity_id}"]`);
            this.tileElement = query.length ? query.item(0) : null;
        });
        this.openSubscription = this.lightOverlay.showOverlay$
            .pipe(filter(open => open !== this.open))
            .subscribe(open => {
                this.open = open;
                if (open) {
                    this.refreshStyle(false, false);
                    setTimeout(() => this.refreshStyle(true, true));
                } else {
                    setTimeout(() => this.refreshStyle(true, false));
                }
            });
    }

    ngOnDestroy() {
        this.openSubscription.unsubscribe();
        this.entitySubscription.unsubscribe();
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event) {
        if (event.target === this.el.nativeElement) this.mouseDown = true;
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event) {
        // We check for mouse down, to prevent accidentally closing the overlay immediately after opening it.
        if (event.target === this.el.nativeElement && this.mouseDown) this.lightOverlay.close();
        this.mouseDown = false;
    }

    refreshStyle(animate: boolean, open: boolean) {
        let scaleX = 1;
        let scaleY = 1;
        let transX = 0;
        let transY = 0;

        if (this.tileElement && !open) {
            const bounds = this.tileElement.getBoundingClientRect();
            transX = bounds.left - window.innerWidth / 2 + bounds.width / 2;
            transY = bounds.top - window.innerHeight / 2 + bounds.height / 2;
            scaleX = scaleY = Math.min(bounds.width / window.innerWidth, bounds.height / window.innerHeight);
        }

        this.style = {
            opacity: open ? '1' : '0',
            transition: `transform ${animate ? '.25s' : '0s'} ease-in-out, opacity ${
                animate ? '.25s' : '0s'
            } ease-in-out`,
            transform: `translate(${transX}px, ${transY}px) scale(${scaleX}, ${scaleY})`,
        };
    }
}
