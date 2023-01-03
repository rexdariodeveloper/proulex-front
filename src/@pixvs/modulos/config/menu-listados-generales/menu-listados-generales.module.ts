import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseHighlightModule, FuseSidebarModule } from '@fuse/components';
import { MenuListadosGeneralesListadoComponent } from './menu-listados-generales/menu-listados-generales.component';
import { FichaListadoModule } from '@pixvs/componentes/fichas/ficha-listado/listado.module';
import { CommonModule } from '@angular/common';
import { ModulosSidebarComponent } from './menu-listados-generales/components/modulos-sidebar/modulos-sidebar.component';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsDynamicComponentModule } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.module';
import { MenuListadosGeneralesService } from './menu-listados-generales/menu-listados-generales.service';
import { CamposPipe } from './menu-listados-generales/pipes/campos.pipe';
import { PixvsTablasModule } from '@pixvs/componentes/tablas/tablas.module';
import { CatalogoService } from './menu-listados-generales/catalogo.service';
import { RegistroCatalogoDialogComponent } from './menu-listados-generales/dialogs/registro-catalogo/registro-catalogo.dialog';
import { BuscarMenuPipe } from './menu-listados-generales/pipes/buscar-menu.pipe';


const routes = [
    {
        path: 'menu-listados-generales',
        component: MenuListadosGeneralesListadoComponent,
        resolve: {
            data: MenuListadosGeneralesService,
        },
        data: { url: '/api/v1/menu-listados-generales/all' }
	},{
        path: 'menu-listados-generales/ver/:id',
        component: MenuListadosGeneralesListadoComponent,
        resolve: {
            data: MenuListadosGeneralesService,
        },
        data: { url: '/api/v1/menu-listados-generales/all/' }
    }
];

@NgModule({
    declarations: [
		// Components
        MenuListadosGeneralesListadoComponent,
		ModulosSidebarComponent,
		
		// Pipes
		CamposPipe,
		BuscarMenuPipe,

		// Dialogs
		RegistroCatalogoDialogComponent
    ],
    imports: [
        CommonModule,
        RouterModule.forChild(routes),

        MatIconModule,
        MatToolbarModule,
        MatRippleModule,
        MatButtonModule,
        MatSnackBarModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        ScrollingModule,

        TranslateModule,

		PixvsDynamicComponentModule,
		PixvsTablasModule,

        FichaListadoModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule

    ],
    providers: [
		MenuListadosGeneralesService,
		CatalogoService
	],
	entryComponents: [
		RegistroCatalogoDialogComponent
	]
})

export class MenuListadosGeneralesListadoModule {
}