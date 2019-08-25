import { Component, Input, OnInit } from '@angular/core';
import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistantService } from '../../services/home-assistant.service';
import { Observable } from 'rxjs';
import { filter, map, share, take } from 'rxjs/operators';
import { TileBehavior } from './tile-behaviors/tile-behavior';
import { DefaultBehavior } from './tile-behaviors/default-behavior';
import { LightBehavior } from './tile-behaviors/light-behavior';

@Component({
    selector: 'app-entity-tile',
    templateUrl: './entity-tile.component.html',
    styleUrls: ['./entity-tile.component.scss'],
})
export class EntityTileComponent implements OnInit {
    @Input() entityId: string;
    entity$: Observable<HassEntity>;
    active$: Observable<boolean>;
    name$: Observable<string>;
    value$: Observable<string>;
    icon$: Observable<string>;
    behavior: TileBehavior;
    type: string;

    constructor(private hass: HomeAssistantService) {}

    ngOnInit() {
        this.type = this.entityId.split('.')[0];
        this.behavior = this.createBehaviorForType(this.type);
        this.entity$ = this.hass.entities.pipe(
            map(entities => entities[this.entityId]),
            filter(e => !!e)
        );
        this.name$ = this.entity$.pipe(map(e => this.behavior.getName(e)));
        this.value$ = this.entity$.pipe(map(e => this.behavior.getValue(e)));
        this.active$ = this.entity$.pipe(map(e => this.behavior.getActive(e)));
        this.icon$ = this.entity$.pipe(map(e => this.behavior.getIconName(e)));
    }

    onClick() {
        this.entity$.pipe(take(1)).subscribe(entity => this.behavior.onTap(entity));
    }

    createBehaviorForType(type: string) {
        switch (type) {
            case 'light':
                return new LightBehavior(this.hass);
            default:
                return new DefaultBehavior();
        }
    }
}
