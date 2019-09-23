import { TileBehavior } from './tile-behavior';
import { HassEntity, HomeAssistantService } from '../../../services/home-assistant.service';
import { HammerGesturesPlugin } from '@angular/platform-browser/src/dom/events/hammer_gestures';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { EntityTileComponent } from '../entity-tile.component';
import { EntityOverlayService } from '../../../services/entity-overlay.service';

export class LightBehavior extends TileBehavior {
    constructor(private hass: HomeAssistantService, private entityOverlay: EntityOverlayService) {
        super();
    }

    getActive(entity: HassEntity): boolean {
        return entity.state === 'on';
    }

    getValue(entity: HassEntity): string {
        if (entity.state === 'off') return 'off';
        if (entity.features.includes('BRIGHTNESS') && (entity.attributes.brightness || 0) < 255) {
            return Math.round(((entity.attributes.brightness || 0) / 255) * 100) + '%';
        }
        return entity.state;
    }

    getName(entity: HassEntity): string {
        return entity.attributes.friendly_name;
    }

    onTap($event: HammerInput, entity: Observable<HassEntity>): void {
        entity.pipe(take(1)).subscribe(e => this.hass.callService('light', 'toggle', { entity_id: e.entity_id }));
    }

    onPress($event: HammerInput, entity: Observable<HassEntity>) {
        $event.srcEvent.preventDefault();
        this.entityOverlay.open(entity);
    }
}
