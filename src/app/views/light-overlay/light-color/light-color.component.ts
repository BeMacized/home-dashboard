import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';
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
    entitySubscription: Subscription;
    currentEntityId: string;

    constructor(public entityOverlay: EntityOverlayService) {}

    ngOnInit() {
        this.overlaySubscription = this.entityOverlay.showOverlay$.subscribe(() => (this.mode = 'PRESETS'));
        this.entitySubscription = this.entityOverlay.entity$
            .pipe(
                filter(e => e && e.entity_id !== this.currentEntityId),
                tap(e => (this.currentEntityId = e.entity_id))
            )
            .subscribe(
                e =>
                    (this.editMode = e.features.includes('COLOR')
                        ? 'COLOR'
                        : e.features.includes('COLOR_TEMP')
                        ? 'TEMP'
                        : null)
            );
    }

    ngOnDestroy() {
        this.entitySubscription.unsubscribe();
        this.overlaySubscription.unsubscribe();
    }

    get showBrightnessModeButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('BRIGHTNESS'))));
    }

    get showColorButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('COLOR'))));
    }

    get showColorTempButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('COLOR_TEMP'))));
    }

    onEdit() {
        this.mode = 'EDIT';
    }

    onDone() {
        this.mode = 'PRESETS';
    }
}
