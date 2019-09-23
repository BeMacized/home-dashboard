import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-color-preset',
    templateUrl: './color-preset.component.html',
    styleUrls: ['./color-preset.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class ColorPresetComponent implements OnInit {
    @Input() active = false;
    @Input() color = '#FFFFFF';

    constructor() {}

    ngOnInit() {}
}
