import { Observable } from 'rxjs';
import { HassEntity } from '../../../services/home-assistant.service';

export abstract class TileBehavior {
    getIconName(entity: HassEntity): string {
        return entity.icon;
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
