import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { filter, map, take, tap, throttle, throttleTime } from 'rxjs/operators';
import { EntityOverlayService } from '../../../services/entity-overlay.service';
import { zoomFadeGrow, zoomFadeShrink } from '../../../utils/animations';
import { ColorEditorValue } from './color-editor/color-editor.component';
import { HassEntity, HomeAssistantService } from '../../../services/home-assistant.service';
import ColorConvert from 'color-convert';
import * as _ from 'lodash';
import { async } from 'rxjs/internal/scheduler/async';
import { miredsToHex } from '../../../utils/color-utils';

const PRESETS_KEY_PREFIX = 'LIGHT_COLOR_PRESETS_';

type Mode = 'PRESETS' | 'EDIT';

export interface LightRGBColor {
    type: 'COLOR';
    color: string;
}

export interface LightTempColor {
    type: 'TEMP';
    mireds: number;
}

export type LightColor = LightRGBColor | LightTempColor;

@Component({
    selector: 'app-light-color',
    templateUrl: './light-color.component.html',
    styleUrls: ['./light-color.component.scss'],
    animations: [zoomFadeGrow(), zoomFadeShrink()],
})
export class LightColorComponent implements OnInit, OnDestroy {
    mode: Mode = 'PRESETS';
    overlaySubscription: Subscription;
    entitySubscription: Subscription;
    _editValue;

    entity: HassEntity;
    currentPreset: number;
    presets: LightColor[] = [];
    changeColorSubject: Subject<LightColor> = new Subject<LightColor>();
    savePresetsSubject: Subject<void> = new Subject<void>();
    currentColor;

    constructor(public entityOverlay: EntityOverlayService, private hass: HomeAssistantService) {}

    ngOnInit() {
        this.entityOverlay.registerCloseHandler(this.onOverlayClose);
        this.overlaySubscription = this.entityOverlay.showOverlay$.subscribe(() => (this.mode = 'PRESETS'));
        this.entitySubscription = this.entityOverlay.entity$.subscribe(e => {
            if (!this.entity || (e && e.entity_id !== this.entity.entity_id)) {
                this.loadPresets(e);
            }
            this.entity = e;
            if (!this._editValue) {
                this._editValue = e.features.includes('COLOR')
                    ? { type: 'COLOR', color: '#' + ColorConvert.rgb.hex(e.attributes['rgb_color']) }
                    : e.features.includes('COLOR_TEMP')
                    ? { type: 'TEMP', mireds: e.attributes['color_temp'] }
                    : null;
                this.currentColor = this._editValue
                    ? this._editValue.type === 'COLOR'
                        ? this._editValue.color
                        : this._editValue.type === 'COLOR_TEMP'
                        ? miredsToHex(this._editValue.mireds)
                        : null
                    : null;
            }
        });
        this.savePresetsSubject
            .pipe(
                throttleTime(100, async, { leading: true, trailing: true }),
                filter(() => !!this.entity)
            )
            .subscribe(() => this.savePresets(this.entity));
        this.changeColorSubject
            .pipe(
                throttleTime(1000, async, { leading: true, trailing: true }),
                filter(() => !!this.entity)
            )
            .subscribe(color => {
                let data;
                switch (color.type) {
                    case 'COLOR':
                        data = {
                            rgb_color: ColorConvert.hex.rgb(color.color),
                        };
                        this.currentColor = color.color;
                        break;
                    case 'TEMP':
                        data = { color_temp: color.mireds };
                        this.currentColor = miredsToHex(color.mireds);
                        break;
                }
                // Send color change to HASS
                this.hass.callService(
                    'light',
                    'turn_on',
                    Object.assign(
                        {
                            entity_id: this.entity.entity_id,
                            transition: this.entity.features.includes('TRANSITION') ? 1 : undefined,
                        },
                        data
                    )
                );
            });
    }

    ngOnDestroy() {
        this.savePresetsSubject.unsubscribe();
        this.changeColorSubject.unsubscribe();
        this.entityOverlay.unregisterCloseHandler(this.onOverlayClose);
        this.entitySubscription.unsubscribe();
        this.overlaySubscription.unsubscribe();
    }

    onOverlayClose = () => {
        if (this.mode === 'EDIT') {
            this.onDone();
            return false;
        }
        return true;
    };

    get showBrightnessModeButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('BRIGHTNESS'))));
    }

    get showColorButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('COLOR'))));
    }

    get showColorTempButton(): Observable<boolean> {
        return this.entityOverlay.entity$.pipe(map(e => (!e ? null : e.features.includes('COLOR_TEMP'))));
    }

    onEdit() {
        this.mode = 'EDIT';
    }

    onDone() {
        this.mode = 'PRESETS';
    }

    get editValue(): ColorEditorValue {
        return this._editValue;
    }

    set editValue(value: ColorEditorValue) {
        this.changeColorSubject.next(value);
        this._editValue = value;
        if (this.currentPreset !== null && this.currentPreset !== undefined) {
            this.presets[this.currentPreset] = value;
            this.savePresetsSubject.next();
        }
    }

    switchColorType = (type: 'COLOR' | 'TEMP') => {
        if (this.editValue && this.editValue.type === type) return;
        switch (type) {
            case 'COLOR': {
                this.editValue = {
                    type: 'COLOR',
                    color: '#' + ColorConvert.rgb.hex(this.entity.attributes['rgb_color']),
                };
                break;
            }
            case 'TEMP': {
                this.editValue = {
                    type: 'TEMP',
                    mireds: this.entity.attributes['color_temp'],
                };
                break;
            }
        }
    };

    loadPresets = (entity: HassEntity) => {
        const rawValues = window.localStorage.getItem(PRESETS_KEY_PREFIX + entity.entity_id);
        if (!rawValues) {
            // If none found, generate defaults
            this.presets = this.generateDefaultPresets(entity);
            this.savePresets(entity);
        } else {
            // Otherwise parse values
            this.presets = JSON.parse(rawValues);
        }
        // Set active preset if a preset matches current state
        this.presets.forEach((preset, presetIndex) => {
            const rgbMatch =
                preset.type === 'COLOR' &&
                _.isEqual(entity.attributes['rgb_color'], ColorConvert.hex.rgb(preset.color));
            const tempMatch = preset.type === 'TEMP' && entity.attributes['color_temp'] === preset.mireds;
            if (rgbMatch || tempMatch) {
                this.currentPreset = presetIndex;
            }
        });
    };

    savePresets = (entity: HassEntity) => {
        window.localStorage.setItem(PRESETS_KEY_PREFIX + entity.entity_id, JSON.stringify(this.presets));
    };

    generateDefaultPresets(entity: HassEntity): LightColor[] {
        const presets = [];

        if (entity.features.includes('COLOR_TEMP')) {
            const count = entity.features.includes('COLOR') ? 3 : 6;
            for (let i = 0; i < count; i++) {
                const min = entity.attributes['min_mireds'];
                const max = entity.attributes['max_mireds'];
                presets.push({ type: 'TEMP', mireds: Math.round(min + i * ((max - min) / (count - 1))) });
            }
        }
        if (entity.features.includes('COLOR')) {
            const count = entity.features.includes('COLOR_TEMP') ? 3 : 6;
            const colors = ['#ff0000', '#00ff00', '#be00ff', '#00ffff', '#ff7e00', '#003fff'];
            colors.slice(0, count).forEach(color => presets.push({ type: 'COLOR', color }));
        }

        return presets;
    }

    onChangePreset(index: number) {
        this.currentPreset = index;
        if (index === null || index === undefined) return;
        this.changeColorSubject.next(this.presets[index]);
    }
}
