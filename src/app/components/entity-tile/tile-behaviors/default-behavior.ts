import { TileBehavior } from './tile-behavior';
import { Observable } from 'rxjs';
import { HassEntity } from '../../../services/home-assistant.service';
import { take } from 'rxjs/operators';

export class DefaultBehavior extends TileBehavior {
    onTap($event: HammerInput, entity: Observable<HassEntity>): void {
        entity.pipe(take(1)).subscribe(e => console.log(e));
    }
}
