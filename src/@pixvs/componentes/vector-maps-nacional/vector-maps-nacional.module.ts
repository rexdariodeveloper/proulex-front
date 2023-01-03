import { NgModule } from '@angular/core';

import { VectorNacionalMapsComponent } from './vector-maps-nacional.component';

import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { GoogleChartsModule } from 'angular-google-charts';


@NgModule({
    declarations: [
        VectorNacionalMapsComponent,
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
        VectorNacionalMapsComponent
    ]
})
export class VectorMapsNacionalModule {
}
