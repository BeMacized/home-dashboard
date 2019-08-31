import { Component, HostBinding, OnInit } from '@angular/core';
import { fade, zoomFade } from '../../utils/animations';
import { LightOverlayService } from '../../services/light-overlay.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-light-overlay',
    templateUrl: './light-overlay.component.html',
    styleUrls: ['./light-overlay.component.scss'],
    animations: [fade('fade', '.5s ease')],
})
export class LightOverlayComponent implements OnInit {
    @HostBinding('@fade') bgFade;

    constructor(public lightOverlay: LightOverlayService) {}

    ngOnInit() {}

    onClickBG() {
        this.lightOverlay.close();
    }
}
