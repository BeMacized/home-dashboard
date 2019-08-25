import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

export function fade(name = 'fade', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [style({ opacity: 0 }), animate(length)]),
        transition(':leave', [animate(length, style({ opacity: 0 }))]),
    ]);
}

export function fadeUp(name = 'fadeUp', length = '.15s ease') {
    return trigger(name, [
        transition(':enter', [style({ opacity: 0, transform: 'translateY(44px)' }), animate(length)]),
        transition(':leave', [animate(length, style({ opacity: 0, transform: 'translateY(44px)' }))]),
    ]);
}

export function zoomFade(name = 'zoomFade', length = '.5s ease') {
    return trigger(name, [
        transition(':enter', [style({ opacity: 0, transform: 'scale(0)' }), animate(length)]),
        transition(':leave', [animate(length, style({ opacity: 0, transform: 'scale(0)' }))]),
    ]);
}

export function vshrink(name = 'vshrink', length = '.2s ease') {
    return trigger(name, [
        transition(':enter', [style({ transform: 'scaleY(0)', height: 0, opacity: 0 }), animate(length)]),
        transition(':leave', [animate(length, style({ transform: 'scaleY(0)', height: 0, opacity: 0 }))]),
    ]);
}

export function fadeUpStaggered(name = 'fadeUpStaggered', length = '.15s ease', interval = 50) {
    return trigger(name, [
        transition('* => *', [
            query(
                ':enter',
                [style({ opacity: 0, transform: 'translateY(44px)' }), stagger(interval, [animate(length)])],
                { optional: true }
            ),
            query(
                ':leave',
                [stagger(interval, [animate(length, style({ opacity: 0, transform: 'translateY(44px)' }))])],
                { optional: true }
            ),
        ]),
    ]);
}
