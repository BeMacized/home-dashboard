import { Component, ElementRef, EventEmitter, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { filter, take } from 'rxjs/operators';
import { HassEntity, HomeAssistantService } from '../../../../services/home-assistant.service';
import mired from 'mired';
import colorTemp from 'color-temperature';
import Color from 'color';
import * as _ from 'lodash';
import { EntityOverlayService } from '../../../../services/entity-overlay.service';

const LS_KEY_PREFIX = 'LS_COLOR_PRESETS_';

interface ColorRGBPreset {
    type: 'RGB';
    color: string;
}

interface ColorTempPreset {
    type: 'TEMP';
    mireds: number;
}

type ColorPreset = ColorRGBPreset | ColorTempPreset;

@Component({
    selector: 'app-color-presets',
    templateUrl: './color-presets.component.html',
    styleUrls: ['./color-presets.component.scss'],
    animations: [],
})
export class ColorPresetsComponent implements OnInit {
    currentPreset;
    presetValues: ColorPreset[] = [];

    @Output() edit: EventEmitter<void> = new EventEmitter<void>();

    constructor(private entityOverlay: EntityOverlayService, private hass: HomeAssistantService) {}

    ngOnInit() {
        // Load preset values
        this.entityOverlay.entity$
            .pipe(
                filter(e => !!e),
                take(1)
            )
            .subscribe(entity => {
                const rawValues = window.localStorage.getItem(LS_KEY_PREFIX + entity.entity_id);
                if (!rawValues) {
                    // If none found, generate defaults
                    this.presetValues = this.generateDefaultPresets(entity);
                    this.savePresets(entity);
                } else {
                    // Otherwise parse values
                    this.presetValues = JSON.parse(rawValues);
                }
                // Set active preset if a preset matches current state
                this.presetValues.forEach((preset, presetIndex) => {
                    const rgbMatch =
                        preset.type === 'RGB' &&
                        _.isEqual(
                            entity.attributes['rgb_color'],
                            Color(preset.color)
                                .rgb()
                                .array()
                        );
                    const tempMatch = preset.type === 'TEMP' && entity.attributes['color_temp'] === preset.mireds;
                    if (rgbMatch || tempMatch) {
                        this.currentPreset = presetIndex;
                    }
                });
            });
    }

    getDisplayColor(presetIndex: number) {
        if (this.presetValues.length <= presetIndex) return '#00000000';
        const preset = this.presetValues[presetIndex];
        let color;
        switch (preset.type) {
            case 'RGB':
                color = preset.color;
                break;
            case 'TEMP':
                const c: { red: number; green: number; blue: number } = colorTemp.colorTemperature2rgb(
                    mired.miredToKelvin(preset.mireds)
                );
                color = `#${c.red.toString(16).padStart(2, '0')}${c.green
                    .toString(16)
                    .padStart(2, '0')}${c.blue.toString(16).padStart(2, '0')}`;
                break;
        }

        return Color(color)
            .lighten(0.25)
            .hex()
            .toString();
    }

    onPresetSelect(presetIndex: number) {
        // If already selected, deselect
        if (!this.presetValues || this.currentPreset === presetIndex) {
            this.currentPreset = null;
            return;
        }
        // Select preset
        this.currentPreset = presetIndex;
        const preset = this.presetValues[presetIndex];
        // Prepare data for setting colour
        let data;
        switch (preset.type) {
            case 'RGB':
                data = {
                    rgb_color: Color(preset.color)
                        .rgb()
                        .array(),
                };
                break;
            case 'TEMP':
                data = { color_temp: preset.mireds };
                break;
        }
        // Send color change to HASS
        this.entityOverlay.entity$.pipe(take(1)).subscribe(entity => {
            this.hass.callService('light', 'turn_on', Object.assign({ entity_id: entity.entity_id }, data));
        });
    }

    onEdit() {
        this.edit.emit();
    }

    savePresets(entity: HassEntity) {
        window.localStorage.setItem(LS_KEY_PREFIX + entity.entity_id, JSON.stringify(this.presetValues));
    }

    generateDefaultPresets(entity: HassEntity): ColorPreset[] {
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
            colors.slice(0, count).forEach(color => presets.push({ type: 'RGB', color }));
        }

        return presets;
    }
}
