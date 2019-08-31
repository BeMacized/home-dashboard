import { HassEntity } from 'home-assistant-js-websocket';
import { Observable } from 'rxjs';

export abstract class TileBehavior {
    getIconName(entity: HassEntity): string {
        return 'question-mark-circle';
    }

    getActive(entity: HassEntity): boolean {
        return false;
    }

    getName(entity: HassEntity): string {
        return 'UNIMPLEMENTED TYPE';
    }

    getValue(entity: HassEntity): string {
        return entity.state;
    }

    onTap($event: HammerInput, entity: Observable<HassEntity>): void {}

    onPress($event: HammerInput, entity: Observable<HassEntity>): void {}
}
