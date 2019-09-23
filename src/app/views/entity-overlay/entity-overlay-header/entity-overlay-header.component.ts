import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-entity-overlay-header',
    templateUrl: './entity-overlay-header.component.html',
    styleUrls: ['./entity-overlay-header.component.scss'],
})
export class EntityOverlayHeaderComponent implements OnInit {
    @Input() text = 'Unknown';
    @Input() subtext = '';
    @Input() icon = 'bulb';

    constructor() {}

    ngOnInit() {}
}
