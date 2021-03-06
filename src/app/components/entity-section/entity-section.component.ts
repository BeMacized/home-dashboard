import {
    Component,
    ElementRef,
    EventEmitter,
    HostListener,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { distinct, distinctUntilChanged } from 'rxjs/operators';
import * as $ from 'jquery';

@Component({
    selector: 'app-entity-section',
    templateUrl: './entity-section.component.html',
    styleUrls: ['./entity-section.component.scss'],
})
export class EntitySectionComponent implements OnInit, OnDestroy {
    @ViewChild('pageScroller') pageScroller: ElementRef;
    @Input() title = 'Entities';
    @Output() pageChange: EventEmitter<number> = new EventEmitter<number>();
    pageScroll: Subject<number> = new Subject<number>();
    animating = false;

    constructor() {}

    ngOnInit() {
        this.pageScroll.pipe(distinctUntilChanged()).subscribe(page => {
            this.pageChange.emit(page);
        });
    }

    ngOnDestroy() {
        this.pageScroll.unsubscribe();
    }

    _onPageScroll() {
        if (!this.animating) {
            const pos = this.pageScroller.nativeElement.scrollLeft;
            const childCount = this.pageScroller.nativeElement.childElementCount;
            const pageWidth = this.pageScroller.nativeElement.clientWidth;
            const page = Math.min(childCount - 1, Math.max(0, Math.round(pos / pageWidth)));
            this.pageScroll.next(page);
        }
    }

    async setPage(index: number) {
        // Validate input
        const childCount = this.pageScroller.nativeElement.childElementCount;
        if (index >= childCount) return;
        // Update state
        this.animating = true;
        this.pageChange.emit(index);
        // Please forgive me for I have sinned
        $(this.pageScroller.nativeElement).animate(
            { scrollLeft: this.pageScroller.nativeElement.clientWidth * index },
            '.25s ease',
            () => (this.animating = false)
        );
    }
}
