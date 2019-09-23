import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { fadeDown } from '../../utils/animations';
import { SwUpdate } from '@angular/service-worker';

@Component({
    selector: 'app-update-notification',
    templateUrl: './update-notification.component.html',
    styleUrls: ['./update-notification.component.scss'],
    animations: [fadeDown('fadeDown', '.5s ease')],
})
export class UpdateNotificationComponent implements OnInit {
    @HostBinding('@fadeDown') fadeDown = true;
    @Input() mode: 'AVAILABLE' | 'ACTIVATED';
    @Output() dismiss: EventEmitter<void> = new EventEmitter<void>();

    constructor(public swUpdate: SwUpdate) {}

    ngOnInit() {}

    get content() {
        switch (this.mode) {
            case 'AVAILABLE':
                return 'A new update is available';
            case 'ACTIVATED':
                return 'The new update has been activated!';
            default:
                return '';
        }
    }
}
