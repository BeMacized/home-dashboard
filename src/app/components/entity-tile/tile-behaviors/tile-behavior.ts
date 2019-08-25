import { HassEntity } from 'home-assistant-js-websocket';

export interface TileBehavior {
    getIconName(entity: HassEntity): string;
    getActive(entity: HassEntity): boolean;
    getName(entity: HassEntity): string;
    getValue(entity: HassEntity): string;
    onTap(entity: HassEntity): void;
}
