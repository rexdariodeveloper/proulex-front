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
import { MatTableModule } from '@angular/material/table';
import { DevolucionOrdenCompraComponent } from './devolucion.component';
import { DevolverOrdenCompraService } from './devolucion.service';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';



const routes = [

    {
        path: 'devolucion-oc/:handle', redirectTo: 'devolucion-oc/:handle/', pathMatch: 'full'
    },
    {
        path: 'devolucion-oc/:handle/:id',
        component: DevolucionOrdenCompraComponent,
        resolve: {
            data: DevolverOrdenCompraService,
        },
		data: { url: '/api/v1/devolucion-ordenes-compra/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
		DevolucionOrdenCompraComponent
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

        FichaCrudModule, 
		PixvsMatSelectModule,
		PixvsTablasModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		DevolverOrdenCompraService,
		PendingChangesGuard
	],
	entryComponents: [
	]
})
export class DevolucionOrdenCompraModule {
}