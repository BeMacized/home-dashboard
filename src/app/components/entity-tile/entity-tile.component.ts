import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistantService } from '../../services/home-assistant.service';
import { Observable, Subscription } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';
import { TileBehavior } from './tile-behaviors/tile-behavior';
import { DefaultBehavior } from './tile-behaviors/default-behavior';
import { LightBehavior } from './tile-behaviors/light-behavior';
import { HammerService } from '../../services/hammer.service';
import { EntityOverlayService } from '../../services/entity-overlay.service';

@Component({
    selector: 'app-entity-tile',
    templateUrl: './entity-tile.component.html',
    styleUrls: ['./entity-tile.component.scss'],
})
export class EntityTileComponent implements OnInit, OnDestroy {
    @Input() entityId: string;
    entitySubscription: Subscription;
    entity$: Observable<HassEntity>;
    active$: Observable<boolean>;
    name$: Observable<string>;
    value$: Observable<string>;
    icon$: Observable<string>;
    behavior: TileBehavior;
    type: string;
    hammer: HammerManager;

    constructor(
        private hass: HomeAssistantService,
        private entityOverlay: EntityOverlayService,
        private el: ElementRef,
        private hs: HammerService
    ) {}

    ngOnInit() {
        // Create the behavior for this entity
        this.type = this.entityId.split('.')[0];
        this.behavior = this.createBehaviorForType(this.type);
        // Get entity by its id
        this.entity$ = this.hass.entities.pipe(
            map(entities => entities[this.entityId]),
            filter(e => !!e),
            shareReplay(1)
        );
        this.name$ = this.entity$.pipe(map(e => this.behavior.getName(e)));
        this.value$ = this.entity$.pipe(map(e => this.behavior.getValue(e)));
        this.active$ = this.entity$.pipe(map(e => this.behavior.getActive(e)));
        this.icon$ = this.entity$.pipe(map(e => this.behavior.getIconName(e)));
        // Listen for gestures
        this.hammer = this.hs.create(this.el);
        this.hammer.add(new this.hs.lib.Tap());
        this.hammer.add(new this.hs.lib.Press());
        this.hammer.on('tap', event => this.behavior.onTap(event, this.entity$));
        this.hammer.on('press', event => this.behavior.onPress(event, this.entity$));
    }

    ngOnDestroy() {
        this.entitySubscription.unsubscribe();
        this.hammer.destroy();
    }

    createBehaviorForType(type: string) {
        switch (type) {
            case 'light':
                return new LightBehavior(this.hass, this.entityOverlay);
            default:
                return new DefaultBehavior();
        }
    }
}
