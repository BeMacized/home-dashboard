import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-home-view',
    templateUrl: './home-view.component.html',
    styleUrls: ['./home-view.component.scss'],
})
export class HomeViewComponent implements OnInit {
    rooms = ['Living Room', 'Bedroom Bodhi', 'Kitchen', 'Bathroom', 'Hallway'];
    activeRoom = 0;

    constructor() {}

    ngOnInit() {}

    onRoomPageChange(index: number) {
        this.activeRoom = index;
    }
}
