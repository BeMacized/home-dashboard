import { Injectable } from '@angular/core';
import {
    getAuth,
    createConnection,
    subscribeServices,
    subscribeEntities,
    ERR_HASS_HOST_REQUIRED,
    AuthData,
    HassEntities,
    HassServices,
    HassService,
    callService,
    Connection,
} from 'home-assistant-js-websocket';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class HomeAssistantService {
    private connection: Connection;
    private entities$: BehaviorSubject<HassEntities> = new BehaviorSubject<HassEntities>({});
    private services$: BehaviorSubject<HassServices> = new BehaviorSubject<HassServices>({});

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
                // hassUrl: environment.hassUrl,
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
        this.connection = await createConnection({ auth });
        subscribeEntities(this.connection, ent => this.entities$.next(ent));
        subscribeServices(this.connection, services => this.services$.next(services));
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
}
