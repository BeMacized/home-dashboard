import { Injectable } from '@angular/core';
import {
    getAuth,
    createConnection,
    subscribeServices,
    subscribeEntities,
    ERR_HASS_HOST_REQUIRED,
    AuthData,
    HassEntities as _HassEntities,
    HassEntity as _HassEntity,
    HassServices,
    HassService,
    callService,
    Connection,
    HassEntityBase,
    Auth,
} from '../../../lib/home-assistant-js-websocket/lib/index';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

export declare type HassEntity = _HassEntity & {
    features: string[];
    icon?: string;
};

export declare interface HassEntities {
    [entity_id: string]: HassEntity;
}

@Injectable({
    providedIn: 'root',
})
export class HomeAssistantService {
    private connection: Connection;
    private entities$: BehaviorSubject<HassEntities> = new BehaviorSubject<HassEntities>({});

    get entities(): Observable<HassEntities> {
        return this.entities$.asObservable();
    }

    constructor() {}

    async callService(domain: string, service: string, payload: any) {
        if (!this.connection) return console.warn('Cannot call service as connection is null');
        await callService(this.connection, domain, service, payload);
    }

    async connect() {
        let auth;
        try {
            auth = await getAuth({
                hassUrl: environment.hassUrl,
                saveTokens: this._saveTokens,
                loadTokens: this._loadTokens,
            });
        } catch (err) {
            if (err === ERR_HASS_HOST_REQUIRED) {
                auth = await getAuth({
                    hassUrl: environment.hassUrl,
                    saveTokens: this._saveTokens,
                    loadTokens: this._loadTokens,
                });
                auth.getToken();
            } else {
                alert(`Unknown error: ${err}`);
                return;
            }
        }
        auth = new Auth(auth.data, auth._saveTokens);
        this.connection = await createConnection({ auth });
        subscribeEntities(this.connection, ent => {
            const entities = this._parseSupportedFeatures(ent);
            Object.values(entities).forEach(entity => (entity.icon = this.getIconForEntity(entity)));
            this.entities$.next(entities);
        });
    }

    _saveTokens = async (data: AuthData | null) => {
        if (data) {
            localStorage.setItem('HOME_DASH_HASS_AUTH', JSON.stringify(data));
        } else {
            localStorage.removeItem('HOME_DASH_HASS_AUTH');
        }
    };

    _loadTokens = async () => {
        const data = localStorage.getItem('HOME_DASH_HASS_AUTH');
        return data ? JSON.parse(data) : data;
    };

    _parseSupportedFeatures(entities: _HassEntities): HassEntities {
        function _parseEntity(entity: _HassEntity): HassEntity {
            let features = [];
            switch (entity.entity_id.split('.')[0]) {
                case 'light':
                    features = [
                        'BRIGHTNESS',
                        'COLOR_TEMP',
                        'EFFECT',
                        'FLASH',
                        'COLOR',
                        'TRANSITION',
                        null,
                        'WHITE_VALUE',
                    ].filter((flag, index) => flag && entity.attributes.supported_features & (1 << index));
                    break;
            }
            return Object.assign({ features }, entity);
        }
        return Object.keys(entities).reduce((acc, e) => {
            acc[e] = _parseEntity(entities[e]);
            return acc;
        }, {});
    }

    getIconForEntity(entity: HassEntity): string {
        if (entity.entity_id.startsWith('light.'))
            return entity.state === 'on' ? 'eva eva-bulb' : 'eva eva-bulb-outline';
        if (entity.entity_id.startsWith('switch.'))
            return entity.state === 'on' ? 'eva eva-toggle-right' : 'eva eva-toggle-left-outline';
        return 'eva eva-question-mark-circle';
    }
}
