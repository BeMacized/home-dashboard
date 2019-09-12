import {
    AfterViewInit,
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import 'conic-gradient';
import { DomSanitizer } from '@angular/platform-browser';
import { fade } from '../../../../utils/animations';
import { DIRECTION_ALL } from 'hammerjs';
import mired from 'mired';
import colorTemp from 'color-temperature';
import Color from 'color';
import { HammerService } from '../../../../services/hammer.service';

@Component({
    selector: 'app-color-editor',
    templateUrl: './color-editor.component.html',
    styleUrls: ['./color-editor.component.scss'],
    animations: [fade('fade', '.5s ease')],
})
export class ColorEditorComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
    // I/O
    @Input() mode: 'COLOR' | 'TEMP';
    @Input() miredsMin: number;
    @Input() miredsMax: number;
    @Output() done: EventEmitter<void> = new EventEmitter<void>();

    // Gesture
    @ViewChild('gradientArea') gradientAreaEl;
    hammer: HammerManager;

    // Gradient
    colorGradient;
    tempGradient;
    tempStops: string;

    // Picker
    pickerTop = 0;
    pickerLeft = 0;

    constructor(private sanitizer: DomSanitizer, private hs: HammerService) {}

    ngOnInit() {
        this.colorGradient = this.sanitizer.bypassSecurityTrustStyle(
            'url(' +
                new (window as any).ConicGradient({ stops: '#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00' }).blobURL +
                ')'
        );
    }

    ngOnChanges() {
        if (!this.miredsMin || !this.miredsMax) return;
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
        const stops = [...rawStops, ...rawStops.slice(0, rawStops.length - 1).reverse()].join(', ');
        if (stops !== this.tempStops) {
            this.tempStops = stops;
            this.tempGradient = this.sanitizer.bypassSecurityTrustStyle(
                'url(' + new (window as any).ConicGradient({ stops: this.tempStops }).blobURL + ')'
            );
        }
    }

    ngAfterViewInit() {
        // Listen for gestures
        this.hammer = this.hs.create(this.gradientAreaEl);
        this.hammer.get('pan').set({ direction: DIRECTION_ALL, threshold: 1 });
        this.hammer.on('pan', event => this.onPick(event));
        this.hammer.on('tap', event => this.onPick(event));
    }

    ngOnDestroy() {
        this.hammer.destroy();
    }

    onPick(event: HammerInput) {
        const area: ClientRect = this.gradientAreaEl.nativeElement.getBoundingClientRect();
        const cursorY = Math.max(0, Math.min(event.center.y - area.top, area.height));
        const cursorX = Math.max(0, Math.min(event.center.x - area.left, area.width));

        // Keep picker within bounds
        {
            let normalY = cursorY - area.height / 2;
            let normalX = cursorX - area.width / 2;

            const distance = Math.sqrt(Math.pow(normalX, 2) + Math.pow(normalY, 2));
            const maxDistance = area.width / 2;
            const minDistance = area.width / 6;

            if (distance > maxDistance) {
                normalY *= maxDistance / distance;
                normalX *= maxDistance / distance;
            } else if (distance < minDistance) {
                normalY *= minDistance / distance;
                normalX *= minDistance / distance;
            }

            this.pickerTop = normalY + area.height / 2;
            this.pickerLeft = normalX + area.width / 2;
        }
        // TODO: CALCULATE COLOR
    }
}
