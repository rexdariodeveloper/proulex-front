import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { CommonModule } from '@angular/common';
import { FichaCrudModule } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.module';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { NgxMaskModule } from 'ngx-mask';
import { MatExpansionModule } from '@angular/material/expansion';
import { PagoProveedoresComponent } from './pago-proveedores/pago-proveedores.component';
import { PagoProveedoresService } from './pago-proveedores/pago-proveedores.service';
import { TranslateModule } from '@ngx-translate/core';
import { MontoPagarPipe } from './pago-proveedores/pipes/monto-pagar.pipe';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { UtilsModule } from '@app/main/utils/utils.module';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { SolicitudPagoProveedoresHistorialComponent } from './pago-proveedores/solicitud-historial.component';


const routes = [
    {
        path: 'pago-proveedores',
        component: PagoProveedoresComponent,
        resolve: {
            data: PagoProveedoresService,
        },
        data: { url: '/api/v1/pago-proveedores/all' }
    }
];

@NgModule({
    declarations: [
		PagoProveedoresComponent,

		MontoPagarPipe,

		SolicitudPagoProveedoresHistorialComponent
    ],
    imports: [
        CommonModule,
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
		MatExpansionModule,
		
		PixvsMatSelectModule,
		UtilsModule,

		FichaCrudModule,

		TranslateModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		FichasDataService,
		PagoProveedoresService
	],
	entryComponents: [
	]
})

export class PagoProveedoresModule {
}