import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule } from '@fuse/components';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { PuntoVentaInicioComponent } from './inicio/inicio.component';
import { PuntoVentaInicioService } from './inicio/inicio.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { PuntoVentaAbiertoModule } from './punto-venta-abierto/punto-venta-abierto.module';
import { PuntoVentaGuard } from './punto-venta.guard';


const routes: Routes = [
    {
        path: 'punto-venta',
        component: PuntoVentaInicioComponent,
        resolve: {
            data: PuntoVentaInicioService,
        },
        data: { url: '/api/v1/punto-venta/inicio/' },
        canActivate: [PuntoVentaGuard]
    }
];

@NgModule({
    declarations: [
        PuntoVentaInicioComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        MatCardModule,
        MatButtonModule,
        TranslateModule,

        FichaListadoModule,
        PixvsMatSelectModule,

        PuntoVentaAbiertoModule,

        FuseSharedModule,
        FuseHighlightModule

    ],
    providers: [
        FichasDataService,
        PuntoVentaInicioService
    ]
})

export class PuntoVentaModule {
}