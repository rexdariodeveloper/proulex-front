import { NgModule } from '@angular/core';

import { VectorMapsComponent } from './vector-maps.component';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { GoogleChartsModule } from 'angular-google-charts';


@NgModule({
    declarations: [
        VectorMapsComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        MatIconModule,
        MatButtonModule,
        GoogleChartsModule
    ],
    providers: [
    ],
    exports: [
        VectorMapsComponent
    ]
})
export class VectorMapsModule {
}
