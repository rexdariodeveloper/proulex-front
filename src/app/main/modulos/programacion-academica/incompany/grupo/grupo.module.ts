import { LOCALE_ID, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { GrupoComponent } from './grupo.component';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ImageCropperModule } from 'ngx-image-cropper';
import { MatTableModule } from '@angular/material/table';
import { FuseSidebarModule } from '@fuse/components';
import {MatStepperModule} from '@angular/material/stepper';


import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PixvsMatChipAutocompleteModule } from '@pixvs/componentes/material/mat-chip-autocomplete/pixvs-mat-chip-autocomplete.module';
import { UsuarioDatosAdicionalesModule } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.module';

import { GrupoService } from './grupo.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
import { CriterioEvaluacionComponent } from './dialogs/criterio-evaluacion/criterio-evaluacion.dialog';
import { ModalidadPersonalizadaComponent } from './dialogs/modalidad-personalizada/modalidad-personalizada.dialog';
import { ModalidadHorarioComponent } from './dialogs/modalidad-horario/modalidad-horario.dialog';
import { ReprogramarClaseComponent } from './dialogs/reprogramar-clase/reprogramar-clase.dialog';
import { CambioProfesorTitularIncompanyComponent } from './dialogs/cambio-profesor-titular/cambio-profesor-titular.dialog';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { registerLocaleData } from "@angular/common";
import localeEs from "@angular/common/locales/es";
import { ComisionComponent } from './dialogs/comision/comision.dialog';
import { NgxMaskModule } from 'ngx-mask';
import { MatPaginatorModule } from '@angular/material/paginator';

registerLocaleData(localeEs, "es");


const routes = [

    {
        path: 'incompany/:handle', redirectTo: 'incompany/:handle/', pathMatch: 'full'
    },
    {
        path: 'incompany/:handle/:id',
        component: GrupoComponent,
        resolve: {
            data: GrupoService,
        },
		data: { url: '/api/v1/incompany/grupos/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        GrupoComponent,
        AddExamenComponent,
        CriterioEvaluacionComponent,
        ModalidadPersonalizadaComponent,
        ModalidadHorarioComponent,
        ReprogramarClaseComponent,
        CambioProfesorTitularIncompanyComponent,
        ComisionComponent
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
        MatRippleModule,
        FuseSidebarModule,
        MatStepperModule,
        MatPaginatorModule,

        FichaCrudModule, 
        PixvsMatSelectModule,

        TranslateModule,
        NgxMaskModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule,
        UsuarioDatosAdicionalesModule,
        ImageCropperModule,
        PixvsMatChipAutocompleteModule,
        MatTableModule

    ],
    providers: [
		GrupoService,
		PendingChangesGuard,
        FechasHabilesService,
        { provide: LOCALE_ID, useValue: "es" }
    ]
})
export class GrupoModule {
}