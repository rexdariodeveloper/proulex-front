import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { CarouselComponent } from './carousel.component';
import { CarouselImplementComponent } from './carousel-implement.component';

import { MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatRippleModule } from '@angular/material/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';

@NgModule({
    declarations: [
        CarouselComponent,
        CarouselImplementComponent
    ],
    imports: [
        CommonModule,
        RouterModule,

        MatIconModule,
        MatPaginatorModule,
        MatTableModule,
        MatToolbarModule,
        MatRippleModule,
        MatSortModule,
        MatButtonModule,
        MatSnackBarModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatDatepickerModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule
    ],
    providers: [
    ],
    exports: [
        CarouselComponent
    ]
})
export class CarouselModule {
}
