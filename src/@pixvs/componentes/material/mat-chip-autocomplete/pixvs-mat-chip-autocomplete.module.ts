import { NgModule } from '@angular/core';
import { PixvsMatChipAutocompleteComponent } from './pixvs-mat-chip-autocomplete.component';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { PixvsMatChipAutocompletePipe } from './pixvs-mat-chip-autocomplete.pipe';


@NgModule({
    declarations: [
        PixvsMatChipAutocompleteComponent,

        PixvsMatChipAutocompletePipe
    ],
    imports: [
        CommonModule,

        ReactiveFormsModule,
        MatFormFieldModule,

        MatAutocompleteModule,
        MatChipsModule,
        MatButtonModule,
        MatIconModule,
		DragDropModule

    ],
    exports: [
        PixvsMatChipAutocompleteComponent
    ],
})
export class PixvsMatChipAutocompleteModule {
}
