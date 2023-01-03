import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ProgramacionAcademicaComercialComponent } from './programacion-academica-comercial.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import {  MatDatepickerModule } from '@angular/material/datepicker';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { ProgramacionAcademicaComercialService } from './programacion-academica-comercial.service';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { ProgramacionDialogComponent } from './dialogs/programacion/programacion.dialog';
import { MatTableModule } from '@angular/material/table';
import { ProgramacionEditarDetalleDialogComponent } from './dialogs/editar-detalle/editar-detalle.dialog';
import { PixvsYearCalendarModule } from '@pixvs/componentes/year-calendar/year-calendar.module';
import { ProgramacionEditarDetalleCalendarioDialogComponent } from './dialogs/editar-detalle-calendario/editar-detalle-calendario.dialog';



const routes = [

    {
        path: 'programacion-academica-comercial/:handle', redirectTo: 'programacion-academica-comercial/:handle/', pathMatch: 'full'
    },
    {
        path: 'programacion-academica-comercial/:handle/:id',
        component: ProgramacionAcademicaComercialComponent,
        resolve: {
            data: ProgramacionAcademicaComercialService,
        },
        data: { url: '/api/v1/programacion-academica-comercial/listados/' }
    }
];

@NgModule({
    declarations: [
        ProgramacionAcademicaComercialComponent,

		ProgramacionDialogComponent,
        ProgramacionEditarDetalleDialogComponent,
        ProgramacionEditarDetalleCalendarioDialogComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatTabsModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
		MatTableModule,

        FichaCrudModule, 
        PixvsMatSelectModule,
		PixvsMatChipAutocompleteModule,
        PixvsYearCalendarModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        ProgramacionAcademicaComercialService
    ],
	entryComponents: [
		ProgramacionDialogComponent
	]
})
export class ProgramacionAcademicaComercialModule {
}