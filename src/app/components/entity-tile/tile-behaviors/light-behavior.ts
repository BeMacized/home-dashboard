import { TileBehavior } from './tile-behavior';
import { HassEntity } from 'home-assistant-js-websocket';
import { HomeAssistantService } from '../../../services/home-assistant.service';

export class LightBehavior implements TileBehavior {
    constructor(private hass: HomeAssistantService) {}

    getActive(entity: HassEntity): boolean {
        return entity.state === 'on';
    }

    getIconName(entity: HassEntity): string {
        return 'bulb';
    }

    getValue(entity: HassEntity): string {
        return entity.state;
    }

    getName(entity: HassEntity): string {
        return entity.attributes.friendly_name;
    }

    onTap(entity: HassEntity): void {
        this.hass.callService('light', 'toggle', { entity_id: entity.entity_id });
    }
}
