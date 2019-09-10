import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewEncapsulation } from '@angular/core';
import 'conic-gradient';
import { DomSanitizer } from '@angular/platform-browser';
import { fade } from '../../../../utils/animations';

import mired from 'mired';
import colorTemp from 'color-temperature';
import Color from 'color';

@Component({
    selector: 'app-color-editor',
    templateUrl: './color-editor.component.html',
    styleUrls: ['./color-editor.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
    animations: [fade()],
})
export class ColorEditorComponent implements OnInit, OnChanges {
    mode: 'COLOR' | 'TEMP';
    @Input('mode') set _mode(v: 'COLOR' | 'TEMP') {
        if (v !== this.mode) this.recalculateGradient(v);
        this.mode = v;
    }
    @Input() miredsMin: number;
    @Input() miredsMax: number;

    @Output() done: EventEmitter<void> = new EventEmitter<void>();

    gradientBlobUrl;
    stops: string;
    constructor(private sanitizer: DomSanitizer) {}

    ngOnInit() {}

    ngOnChanges() {
        this.recalculateGradient(this.mode);
    }

    recalculateGradient(mode: 'COLOR' | 'TEMP') {
        let stops = this.stops;
        switch (mode) {
            case 'COLOR':
                stops = '#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00';
                break;
            case 'TEMP':
                if (!this.miredsMin || !this.miredsMax) break;
                const count = 5;
                const rawStops = new Array(count).fill(null).map((_, i) => {
                    const mireds = ((count - i - 1) / (count - 1)) * (this.miredsMax - this.miredsMin) + this.miredsMin;
                    const c: { [c: string]: number } = colorTemp.colorTemperature2rgb(mired.miredToKelvin(mireds));
                    return (
                        `#${c.red.toString(16).padStart(2, '0')}` +
                        `${c.green.toString(16).padStart(2, '0')}` +
                        `${c.blue.toString(16).padStart(2, '0')}`
                    );
                });
                stops = [...rawStops, ...rawStops.slice(0, rawStops.length - 1).reverse()].join(', ');
                break;
        }
        if (stops !== this.stops) {
            this.stops = stops;
            this.gradientBlobUrl = this.sanitizer.bypassSecurityTrustStyle(
                'url(' + new (window as any).ConicGradient({ stops }).blobURL + ')'
            );
        }
    }
}
