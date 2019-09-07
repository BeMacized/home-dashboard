import { Component, OnInit } from '@angular/core';
import { LightOverlayService } from '../../../services/light-overlay.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-light-color',
    templateUrl: './light-color.component.html',
    styleUrls: ['./light-color.component.scss'],
})
export class LightColorComponent implements OnInit {
    constructor(public lightOverlay: LightOverlayService) {}

    ngOnInit() {}

    get showBrightnessModeButton(): Observable<boolean> {
        return this.lightOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('BRIGHTNESS'))));
    }
}
