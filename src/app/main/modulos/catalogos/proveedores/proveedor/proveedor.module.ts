import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { ProveedorComponent } from './proveedor.component';
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
import { MatToolbarModule } from '@angular/material/toolbar';


import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';

import { ProveedorService } from './proveedor.service';
import { TranslateModule } from '@ngx-translate/core';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PendingChangesGuard } from '@pixvs/guards/pending-changes.guard';
import { VerificarRfcComponent } from './dialogs/verificar-rfc/verificar-rfc.dialog';



const routes = [

    {
        path: 'proveedores/:handle', redirectTo: 'proveedores/:handle/', pathMatch: 'full'
    },
    {
        path: 'proveedores/:handle/:id',
        component: ProveedorComponent,
        resolve: {
            data: ProveedorService,
        },
		data: { url: '/api/v1/proveedores/listados/' },
		canDeactivate: [PendingChangesGuard]
    }
];

@NgModule({
    declarations: [
        ProveedorComponent,
        VerificarRfcComponent
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

        FichaCrudModule, 
        PixvsMatSelectModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        MatToolbarModule

    ],
    providers: [
		ProveedorService,
		PendingChangesGuard
    ]
})
export class ProveedorModule {
}