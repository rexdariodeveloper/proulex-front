import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { GestionFacturasListadoComponent } from './gestion-facturas/gestion-facturas.component';
import { CargarFacturaModule } from './cargar-factura/cargar-factura.module';
import { GestionFacturasService } from './gestion-facturas/gestion-facturas.service';


const routes = [
    {
        path: 'gestion-facturas',
        component: GestionFacturasListadoComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/gestion-facturas/all' }
    }
];

@NgModule({
    declarations: [
        GestionFacturasListadoComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

		FichaListadoModule,
		
		CargarFacturaModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
		FichasDataService,
		GestionFacturasService
    ]
})

export class GestionFacturasModule {
}