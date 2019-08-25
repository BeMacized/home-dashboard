import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-room-section',
    templateUrl: './room-section.component.html',
    styleUrls: ['./room-section.component.scss'],
})
export class RoomSectionComponent implements OnInit {
    @Input() title = 'Rooms';
    constructor() {}

    ngOnInit() {}
}
