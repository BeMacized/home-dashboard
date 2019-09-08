import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
    selector: 'app-color-editor',
    templateUrl: './color-editor.component.html',
    styleUrls: ['./color-editor.component.scss'],
    encapsulation: ViewEncapsulation.ShadowDom,
})
export class ColorEditorComponent implements OnInit {
    constructor() {}

    ngOnInit() {}
}
