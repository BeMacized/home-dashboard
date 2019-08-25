import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-entity-section',
    templateUrl: './entity-section.component.html',
    styleUrls: ['./entity-section.component.scss'],
})
export class EntitySectionComponent implements OnInit {
    @Input() title = 'Entities';
    constructor() {}

    ngOnInit() {}
}
