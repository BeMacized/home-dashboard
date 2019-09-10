import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { EntityOverlayService } from '../../../services/entity-overlay.service';
import { zoomFadeGrow, zoomFadeShrink } from '../../../utils/animations';

type Mode = 'PRESETS' | 'EDIT';
type EditMode = 'COLOR' | 'TEMP';

@Component({
    selector: 'app-light-color',
    templateUrl: './light-color.component.html',
    styleUrls: ['./light-color.component.scss'],
    animations: [zoomFadeGrow(), zoomFadeShrink()],
})
export class LightColorComponent implements OnInit, OnDestroy {
    mode: Mode = 'PRESETS';
    editMode: EditMode = 'COLOR';
    overlaySubscription: Subscription;

    constructor(public entityOverlay: EntityOverlayService) {}

    ngOnInit() {
        this.overlaySubscription = this.entityOverlay.showOverlay$.subscribe(() => (this.mode = 'PRESETS'));
    }

    ngOnDestroy() {
        this.overlaySubscription.unsubscribe();
    }

    get showBrightnessModeButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('BRIGHTNESS'))));
    }

    onEdit() {
        this.mode = 'EDIT';
    }

    onDone() {
        this.mode = 'PRESETS';
    }
}
