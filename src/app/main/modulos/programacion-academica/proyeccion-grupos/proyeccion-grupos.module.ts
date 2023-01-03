import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { ProyeccionListadoComponent } from './proyeccion-listado/proyeccion-listado.component';
import { ProyeccionGrupoService } from './proyeccion-listado/proyeccion-listado.service';
import { HttpService } from '@services/http.service';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { ErroresDialogComponent } from './proyeccion-listado/dialogs/errores/errores.dialog';

const routes = [
    {
        path: 'proyeccion-grupos',
        component: ProyeccionListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/proyeccion-grupos/all' }
    }
];

@NgModule({
    declarations: [
        ProyeccionListadoComponent,
        ErroresDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsBloqueoPantallaModule,
        MatIconModule,
        MatDialogModule,
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
        MatToolbarModule,
        MatTableModule,
        MatListModule,
        MatCheckboxModule,
        MatPaginatorModule

    ],
    providers: [
        FichasDataService,
        ProyeccionGrupoService,
        HttpService
    ],
    entryComponents: [
        ErroresDialogComponent
    ]
})

export class ProyeccionListadoModule {
}