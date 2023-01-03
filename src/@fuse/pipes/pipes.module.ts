import { NgModule } from '@angular/core';

import { KeysPipe } from './keys.pipe';
import { GetByIdPipe } from './getById.pipe';
import { HtmlToPlaintextPipe } from './htmlToPlaintext.pipe';
import { FilterPipe } from './filter.pipe';
import { CamelCaseToDashPipe } from './camelCaseToDash.pipe';
import { DateLocalePipe } from './dateLocale.pipe';
import { HashIdPipe } from './hashId.pipe';
import { SafePipe } from './safe.pipe';
import { CapitalizeFirstPipe } from './capitalize-first.pipe';
import { MapIconPipe } from './map-icon.pipe';
import { CountDown } from './countDown.pipe';

@NgModule({
    declarations: [
        KeysPipe,
        GetByIdPipe,
        HtmlToPlaintextPipe,
        FilterPipe,
        CamelCaseToDashPipe,
        DateLocalePipe, 
        HashIdPipe,
        SafePipe,
        CapitalizeFirstPipe,
        MapIconPipe,
        CountDown
    ],
    imports: [],
    exports: [
        KeysPipe,
        GetByIdPipe,
        HtmlToPlaintextPipe,
        FilterPipe,
        CamelCaseToDashPipe,
        DateLocalePipe,
        HashIdPipe,
        SafePipe,
        CapitalizeFirstPipe,
        MapIconPipe,
        CountDown
    ]
})
export class FusePipesModule {
}
