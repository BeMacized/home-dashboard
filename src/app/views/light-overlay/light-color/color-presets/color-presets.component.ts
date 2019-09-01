import { Component, ElementRef, OnInit, QueryList, ViewChildren } from '@angular/core';

interface Preset {
    offsetX: number;
    offsetY: number;
}

@Component({
    selector: 'app-color-presets',
    templateUrl: './color-presets.component.html',
    styleUrls: ['./color-presets.component.scss'],
})
export class ColorPresetsComponent implements OnInit {
    presets: Preset[] = [];

    constructor(private el: ElementRef) {
        this.presets = new Array(6).fill({}).map((_, i) => {
            const width = el.nativeElement.clientWidth;

            const offsetX = 0;
            const offsetY = 0;

            return {
                offsetX,
                offsetY,
            };
        });
    }

    ngOnInit() {}
}
