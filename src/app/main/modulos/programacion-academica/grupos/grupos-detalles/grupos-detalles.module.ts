import { LOCALE_ID, NgModule } from "@angular/core";
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { GruposDetallesComponent } from './grupos-detalles.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import {  MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import LocaleEs from '@angular/common/locales/es';
import {MatButtonToggleModule} from '@angular/material/button-toggle';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';

import { GruposService } from '../grupos/grupos.service';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
import { CambioGrupoComponent } from './dialogs/cambio-grupo/cambio-grupo.dialog';

import { SolicitudPagoProveedoresHistorialComponent } from './solicitud-historial.component';

import localeEs from "@angular/common/locales/es";
import { registerLocaleData } from "@angular/common";
import { CambioProfesorTitularComponent } from "./dialogs/cambio-profesor-titular/cambio-profesor-titular.dialog";
import { CancelarGrupoComponent } from "./dialogs/cancelar-grupo/cancelar-grupo.dialog";
import { PixvsTablasModule } from "@pixvs/componentes/tablas/tablas.module";
import { EvidenciasService } from "./evidencias.service";
import { EvidenciaDialogComponent } from "./dialogs/evidencia/evidencia.dialog";
import { TabCalificacionesComponent } from "./tabs/calificaciones/tab-calificaciones.component";
import { CalificacionesService } from "@app/main/modulos/control-escolar/calificaciones/calificaciones/calificaciones.service";
import { TabAsistenciasComponent } from "./tabs/asistencias/tab-asistencias.component";
import { AsistenciaService } from "@app/main/modulos/control-escolar/asistencias/asistencias/asistencia.service";
registerLocaleData(localeEs, "es");



const routes = [

    {
        path: 'grupos/ver', redirectTo: 'grupos/ver', pathMatch: 'full'
    },
    {
        path: 'grupos/ver/:id',
        component: GruposDetallesComponent,
        resolve: {
            data: GruposService,
        },
		data: { url: '/api/v1/grupos/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];


@NgModule({
    declarations: [
        GruposDetallesComponent,
        AddExamenComponent,
        SolicitudPagoProveedoresHistorialComponent,
        CambioGrupoComponent,
        CambioProfesorTitularComponent,
        CancelarGrupoComponent,
        EvidenciaDialogComponent,
        //tabs
        TabCalificacionesComponent,
        TabAsistenciasComponent
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
        MatDialogModule,
        MatProgressBarModule,
        MatCardModule,
        MatDatepickerModule,
        MatListModule,
        MatCheckboxModule,
        MatExpansionModule,
        MatSortModule,
        MatButtonToggleModule,

        FichaCrudModule, 
        PixvsMatSelectModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        UsuarioDatosAdicionalesModule,
        ImageCropperModule,
        PixvsMatChipAutocompleteModule,
        MatTableModule,
        PixvsTablasModule

    ],
    providers: [
		GruposService,
		PendingChangesGuard,
        FechasHabilesService,
        EvidenciasService,
        CalificacionesService,
        AsistenciaService,
        { provide: LOCALE_ID, useValue: "es" }
    ]
})
export class GruposDetallesModule {
}