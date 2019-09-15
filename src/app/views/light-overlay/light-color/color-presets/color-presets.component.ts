import { Component, EventEmitter, Input, Output } from '@angular/core';
import mired from 'mired';
import colorTemp from 'color-temperature';
import ColorConvert from 'color-convert';
import { LightColor } from '../light-color.component';
import { miredsToHex } from '../../../../utils/color-utils';

@Component({
    selector: 'app-color-presets',
    templateUrl: './color-presets.component.html',
    styleUrls: ['./color-presets.component.scss'],
    animations: [],
})
export class ColorPresetsComponent {
    @Input() currentColor = '#FFFFFF';
    @Input() currentPreset: number;
    @Input() presets: LightColor[] = [];
    @Output() currentPresetChange: EventEmitter<number> = new EventEmitter<number>();
    @Output() edit: EventEmitter<void> = new EventEmitter<void>();

    constructor() {}

    getDisplayColor(presetIndex: number) {
        if (this.presets.length <= presetIndex) return '#00000000';
        const preset = this.presets[presetIndex];
        let color;
        switch (preset.type) {
            case 'COLOR':
                color = preset.color;
                break;
            case 'TEMP':
                color = miredsToHex(preset.mireds);
                break;
        }

        // Return lighter version
        const hsl: number[] = ColorConvert.hex.hsl(color.substring(1));
        hsl[2] = Math.min(hsl[2] + 10, 100);
        return '#' + ColorConvert.hsl.hex(hsl);
    }

    onPresetSelect(presetIndex: number) {
        // Disable preset
        if (this.currentPreset === presetIndex) {
            this.currentPreset = null;
            this.currentPresetChange.emit(null);
            return;
        }

        // Select preset
        this.currentPreset = presetIndex;
        this.currentPresetChange.emit(presetIndex);
    }

    onEdit() {
        this.edit.emit();
    }

    isDark(currentColor: string) {
        return ColorConvert.hex.hsl(currentColor)[2] < 60;
    }
}
