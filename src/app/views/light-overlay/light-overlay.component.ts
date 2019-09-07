import { Component, HostBinding, OnInit, ViewChild } from '@angular/core';
import { fade, zoomFade } from '../../utils/animations';
import { LightOverlayService } from '../../services/light-overlay.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-light-overlay',
    templateUrl: './light-overlay.component.html',
    styleUrls: ['./light-overlay.component.scss'],
    animations: [fade('fade', '.25s ease')],
})
export class LightOverlayComponent implements OnInit {
    @HostBinding('@fade') bgFade;
    @ViewChild('controlContainer') controlContainer;
    mouseDown = false;

    constructor(public lightOverlay: LightOverlayService) {}

    ngOnInit() {}

    onMouseDown(event) {
        if (event.target === this.controlContainer.nativeElement) this.mouseDown = true;
    }

    onMouseUp(event) {
        if (event.target === this.controlContainer.nativeElement && this.mouseDown) this.lightOverlay.close();
        this.mouseDown = false;
    }
}
