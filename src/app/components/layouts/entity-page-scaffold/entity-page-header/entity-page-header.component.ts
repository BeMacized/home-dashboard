import { Component, OnInit } from '@angular/core';
import { HomeAssistantService } from '../../../../services/home-assistant.service';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-entity-page-header',
    templateUrl: './entity-page-header.component.html',
    styleUrls: ['./entity-page-header.component.scss'],
})
export class EntityPageHeaderComponent implements OnInit {
    temperature$: Observable<number>;
    weatherLocation$: Observable<string>;
    weatherState$: Observable<string>;

    constructor(private hass: HomeAssistantService) {
        this.temperature$ = hass.entities.pipe(
            map(entities => entities['weather.br_unknown_station']),
            filter(e => !!e),
            map(e => e.attributes['temperature'])
        );
        this.weatherLocation$ = hass.entities.pipe(
            map(entities => entities['weather.br_unknown_station']),
            filter(e => !!e),
            map(e => e.attributes.friendly_name)
        );
        this.weatherState$ = hass.entities.pipe(
            map(entities => entities['weather.br_unknown_station']),
            filter(e => !!e),
            map(e => e.state.substring(0, 1).toUpperCase() + e.state.substring(1))
        );
    }

    ngOnInit() {}
}
