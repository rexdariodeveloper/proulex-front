import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatSelectComponent } from './pixvs-mat-select.component';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSelectInfiniteScrollModule } from 'ng-mat-select-infinite-scroll';
import { NuevoRegistroDialogComponent } from './dialogs/nuevo/nuevo.dialog';
import { MatButtonModule } from '@angular/material/button';
import { PixvsDynamicComponentModule } from '../dinamicos/pixvs-dynamic-component.module';
import { PixvsMatSelectService } from './pixvs-mat-select.service';

@NgModule({
    declarations: [
		PixvsMatSelectComponent,
		
		NuevoRegistroDialogComponent
    ],
    imports: [
        CommonModule,
        
        ReactiveFormsModule,
        MatSelectModule,
        MatFormFieldModule,
		NgxMatSelectSearchModule,
		MatSelectInfiniteScrollModule,
		MatButtonModule,

		PixvsDynamicComponentModule,

        TranslateModule

	],
	entryComponents: [
		NuevoRegistroDialogComponent
	],
    exports: [
        PixvsMatSelectComponent
    ],
    providers: [
        PixvsMatSelectService
    ]
})
export class PixvsMatSelectModule {
}
