import { Pipe, PipeTransform } from '@angular/core';
import { HashidsService } from '@services/hashids.service';

@Pipe({ name: 'hashId' })
export class HashIdPipe implements PipeTransform {
    hashidsService: HashidsService;
    constructor(_hashidsService: HashidsService) {
        this.hashidsService = _hashidsService;
    }

    transform(id: number): string {
        return this.hashidsService.encode(id);
    }
}
