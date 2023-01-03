import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { MatToolbarModule } from '@angular/material/toolbar';
import { PuestosComponent } from './puestos/puestos.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { PuestoModule } from './puesto/puesto.module';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
//import { HabilidadResponsabilidadDialogComponent } from './puesto/dialogs/habilidadResponsabilidad/habilidad-responsabilidad.dialog';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';

const routes = [
    {
        path: 'puestos',
        component: PuestosComponent,
        resolve: {
            data: FichasDataService,
        },
        data: { url: '/api/v1/puestos/all' }
    }
];

@NgModule({
    declarations: [
        PuestosComponent,
        //HabilidadResponsabilidadDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        FichaListadoModule,
        PuestoModule,
        MatToolbarModule,
        MatButtonModule,

        FuseSharedModule,
        FuseHighlightModule,
        PixvsDynamicComponentModule

    ],
    providers: [
        FichasDataService
    ],
    entryComponents: [
		//HabilidadResponsabilidadDialogComponent
	]
})

export class PuestosModule {
}