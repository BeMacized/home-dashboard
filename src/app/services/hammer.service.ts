import { ElementRef, Injectable, NgZone } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class HammerService {
    constructor(private zone: NgZone) {}

    public get lib() {
        return typeof window !== 'undefined' ? (window as any).Hammer : undefined;
    }

    public create(elementRef: ElementRef): HammerManager {
        return this.zone.run(_ => {
            return new this.lib(elementRef.nativeElement);
        });
    }
}
