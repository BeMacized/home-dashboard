import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable, of } from 'rxjs';

@Component({
    selector: 'app-room-tile',
    templateUrl: './room-tile.component.html',
    styleUrls: ['./room-tile.component.scss'],
})
export class RoomTileComponent implements OnInit {
    @Input() active = false;
    @Input() icon = 'home';
    @Input() name = 'Unknown Room';
    @Output() onSelect: EventEmitter<void> = new EventEmitter<void>();

    constructor() {}

    ngOnInit() {}

    onClick() {
        if (!this.active) this.onSelect.emit();
    }
}
