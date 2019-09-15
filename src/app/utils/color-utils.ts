import mired from 'mired';
import colorTemp from 'color-temperature';

export function miredsToHex(mireds: number) {
    const c: { [c: string]: number } = colorTemp.colorTemperature2rgb(mired.miredToKelvin(mireds));
    return (
        `#${c.red.toString(16).padStart(2, '0')}` +
        `${c.green.toString(16).padStart(2, '0')}` +
        `${c.blue.toString(16).padStart(2, '0')}`
    );
}
