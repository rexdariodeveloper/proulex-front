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
import { NgxMaskModule } from 'ngx-mask';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ReciboOrdenCompraComponent } from './recibo.component';
import { ReciboOrdenCompraService } from './recibo.service';
import { MatTableModule } from '@angular/material/table';
import { ArchivoDialogComponent } from './dialogs/archivo/archivo.dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { ComentariosDialogModule } from './dialogs/comentarios/comentarios.dialog.module';



const routes = [

    {
        path: 'recibo-oc/:handle', redirectTo: 'recibo-oc/:handle/', pathMatch: 'full'
    },
    {
        path: 'recibo-oc/:handle/:id',
        component: ReciboOrdenCompraComponent,
        resolve: {
            data: ReciboOrdenCompraService,
        },
		data: { url: '/api/v1/recibo-ordenes-compra/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		ReciboOrdenCompraComponent,
		ArchivoDialogComponent
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
		MatTableModule,
		NgxMaskModule,
		MatProgressSpinnerModule,

        FichaCrudModule, 
		PixvsMatSelectModule,
		PixvsTablasModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,

        ComentariosDialogModule

    ],
    providers: [
		ReciboOrdenCompraService,
		PendingChangesGuard
	],
	entryComponents: [
		ArchivoDialogComponent
	]
})
export class ReciboOrdenCompraModule {
}