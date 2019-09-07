import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-light-overlay-header',
    templateUrl: './light-overlay-header.component.html',
    styleUrls: ['./light-overlay-header.component.scss'],
})
export class LightOverlayHeaderComponent implements OnInit {
    @Input() text = 'Unknown';

    constructor() {}

    ngOnInit() {}
}
