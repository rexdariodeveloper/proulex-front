import { NgModule } from '@angular/core';
import { FechaPipe } from './fecha.pipe';
import { NumeroFormatoPipe } from './numero-formato.pipe';
import { SumaPipe } from './suma.pipe';
import { TextoPipe } from './texto.pipe';


@NgModule({
    declarations: [
        FechaPipe,
        SumaPipe,
        TextoPipe,
        NumeroFormatoPipe
    ],
    imports: [],
    exports: [
        FechaPipe,
        SumaPipe,
        TextoPipe,
        NumeroFormatoPipe
    ]
})
export class PipesModule {
}
