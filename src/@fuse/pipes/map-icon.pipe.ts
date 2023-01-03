import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'mapIcon' })
export class MapIconPipe implements PipeTransform {
    /**
     * Transform
     *
     * @param {string} value
     * @param {any[]} args
     * @returns {string}
     */
    transform(value: string, defaultUrl: string): string {
        let iconUrl = !!defaultUrl? defaultUrl : 'assets/icons/markers/default.png';
        return !!value? value : iconUrl;
    }
}
