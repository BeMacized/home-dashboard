import { Component, ElementRef, HostBinding, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-page-view-page',
    templateUrl: './page-view-page.component.html',
    styleUrls: ['./page-view-page.component.scss'],
})
export class PageViewPageComponent implements OnInit {
    @Input() state = -1;
    @HostBinding('class.left') get left() {
        return this.state < 0;
    }
    @HostBinding('class.center') get center() {
        return this.state === 0;
    }
    @HostBinding('class.right') get right() {
        return this.state > 0;
    }

    constructor(public elementRef: ElementRef) {}

    ngOnInit() {}
}
