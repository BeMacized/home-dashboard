/* tslint:disable:prefer-const */
import { Component, ElementRef, HostBinding, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { fade } from '../../utils/animations';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { EntityOverlayService } from '../../services/entity-overlay.service';

@Component({
    selector: 'app-entity-overlay',
    templateUrl: './entity-overlay.component.html',
    styleUrls: ['./entity-overlay.component.scss'],
    animations: [fade('controlFade', '.25s ease'), fade('bgFade', '.5s ease')],
})
export class EntityOverlayComponent implements OnInit, OnDestroy {
    @HostBinding('style.pointer-events') get pointerEvents() {
        return this.open ? 'auto' : 'none';
    }

    @HostBinding('style.display') get displayStyle() {
        return this.display ? 'block' : 'none';
    }

    @ViewChild('controlContainer') controlContainer;
    mouseDown = false;

    tileElement: Element;
    style: { [p: string]: any } = {};
    open = false;
    display = false;

    openSubscription: Subscription;
    entitySubscription: Subscription;

    constructor(private el: ElementRef, public entityOverlay: EntityOverlayService) {}

    ngOnInit() {
        this.entitySubscription = this.entityOverlay.entity$.pipe(filter(e => !!e)).subscribe(entity => {
            const query = document.querySelectorAll(`[data-entity-id="${entity.entity_id}"]`);
            this.tileElement = query.length ? query.item(0) : null;
        });
        this.openSubscription = this.entityOverlay.showOverlay$
            .pipe(filter(open => open !== this.open))
            .subscribe(open => {
                this.open = open;
                if (open) {
                    this.display = true;
                    this.refreshStyle(false, false);
                    setTimeout(() => this.refreshStyle(true, true));
                } else {
                    setTimeout(() => this.refreshStyle(true, false));
                    setTimeout(() => {
                        if (!this.entityOverlay.showOverlay$.value) {
                            this.display = false;
                        }
                    }, 500);
                }
            });
    }

    ngOnDestroy() {
        this.openSubscription.unsubscribe();
        this.entitySubscription.unsubscribe();
    }

    @HostListener('document:keydown.escape', ['$event'])
    onKeydownHandler(event: KeyboardEvent) {
        this.entityOverlay.close();
    }

    @HostListener('mousedown', ['$event'])
    onMouseDown(event) {
        if (event.target === this.el.nativeElement) this.mouseDown = true;
    }

    @HostListener('mouseup', ['$event'])
    onMouseUp(event) {
        // We check for mouse down, to prevent accidentally closing the overlay immediately after opening it.
        if (event.target === this.el.nativeElement && this.mouseDown) this.entityOverlay.close();
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
