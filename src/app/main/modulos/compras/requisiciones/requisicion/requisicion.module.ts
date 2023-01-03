import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { RequisicionComponent } from './requisicion.component';
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

import { RequisicionService } from './requisicion.service';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { ArticuloDialogComponent } from './dialogs/articulo/articulo.dialog';
import { ArticulosService } from './articulos.service';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { RequisicionComentariosDialogModule } from './dialogs/comentarios/comentarios.dialog.module';
import { NgxPrintModule } from 'ngx-print';
import { ImageCropperModule } from 'ngx-image-cropper';

const routes = [

    {
        path: 'requisiciones/:handle', redirectTo: 'requisiciones/:handle/', pathMatch: 'full'
    },
    {
        path: 'requisiciones/:handle/:id',
        component: RequisicionComponent,
        resolve: {
            data: RequisicionService,
        },
		data: { url: '/api/v1/requisiciones/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		RequisicionComponent,
		ArticuloDialogComponent
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
		
		RequisicionComentariosDialogModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		RequisicionService,
		ArticulosService,
		PendingChangesGuard
	],
	entryComponents: [
		ArticuloDialogComponent
	]
})
export class RequisicionModule {
}