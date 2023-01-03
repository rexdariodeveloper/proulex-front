import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { PixvsMatSelectSimpleComponent } from './mat-select-search-simple.component';

@NgModule({
    declarations: [
		PixvsMatSelectSimpleComponent
    ],
    imports: [
        CommonModule,
        
        ReactiveFormsModule,
        MatSelectModule,
        MatTooltipModule,
        MatFormFieldModule,
		NgxMatSelectSearchModule,
		MatSelectInfiniteScrollModule,

        TranslateModule

	],
    exports: [
        PixvsMatSelectSimpleComponent
    ],
})
export class PixvsMatSelectSimpleModule {
}
