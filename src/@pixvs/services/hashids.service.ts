import { Injectable, IterableDiffers } from '@angular/core';
const Hashids = require('hashids/cjs')
const hashids = new Hashids('', 5, 'ABCDEFGHIJKLMPQRSTVWXYZ123456789');

@Injectable({ providedIn: 'root' })
export class HashidsService {

    constructor() { }

    encode(item: number): string {
        return !!item ? hashids.encode(item) : null;
    }

    decode(item: string): number {
        if (item)
            return hashids.decode(item)[0];
        else
            return null
    }
}