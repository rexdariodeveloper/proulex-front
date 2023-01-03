import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
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
import {  MatDatepickerModule } from '@angular/material/datepicker';

import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { TranslateModule } from '@ngx-translate/core';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { NgxPrintModule } from 'ngx-print';
import { ImageCropperModule } from 'ngx-image-cropper';
import { CXPSolicitudPagoDetalleComponent } from './detalle.component';
import { CXPSolicitudPagoService } from './detalle.service';
import { UtilsModule } from '@app/main/utils/utils.module';

const routes = [

    {
        path: 'programacion-pagos/:handle', redirectTo: 'programacion-pagos/:handle/', pathMatch: 'full'
    },
    {
        path: 'programacion-pagos/:handle/:id',
        component: CXPSolicitudPagoDetalleComponent,
        resolve: {
            data: CXPSolicitudPagoService,
        },
		data: { url: '/api/v1/programacion-pagos/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		CXPSolicitudPagoDetalleComponent
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
		MatCheckboxModule,
		ImageCropperModule,

		NgxPrintModule,

        FichaCrudModule, 
		PixvsMatSelectModule,
		PixvsTablasModule,

		TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,

		UtilsModule

    ],
    providers: [
		CXPSolicitudPagoService,
		PendingChangesGuard
	],
	entryComponents: [
	]
})
export class CXPSolicitudPagoDetalleModule {
}