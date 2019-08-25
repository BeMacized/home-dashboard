import { HassEntity } from 'home-assistant-js-websocket';
import { TileBehavior } from './tile-behavior';

export class DefaultBehavior implements TileBehavior {
    getIconName(entity: HassEntity): string {
        return 'question-mark-circle';
    }

    getActive(entity: HassEntity): boolean {
        return false;
    }

    getValue(entity: HassEntity): string {
        return entity.state;
    }

    getName(entity: HassEntity): string {
        return 'UNIMPLEMENTED TYPE';
    }

    onTap(entity: HassEntity): void {}
}
