import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@app/guards';
import { PuntoVentaGeneralService } from '../services/punto-venta.service';

const appRoutes: Routes = [ 
    // {
    //     path: 'otro',
    //     loadChildren: () => import('@main/modulos/otro/otro.module').then(m => m.OtroListadoModule),
    //     canActivate: [AuthGuard]
    // }, 
    {
        path: 'catalogos',
        loadChildren: () => import('@main/modulos/catalogos/catalogos.module').then(m => m.CatalogosModule),
        canActivate: [AuthGuard]
	},
	{
        path: 'compras',
        loadChildren: () => import('@main/modulos/compras/compras.module').then(m => m.ComprasModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'inventario',
        loadChildren: () => import('@main/modulos/inventario/inventario.module').then(m => m.InventarioModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'programacion-academica',
        loadChildren: () => import('@main/modulos/programacion-academica/programacion-academica.module').then(m => m.ProgramacionAcademicaModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'control-escolar',
        loadChildren: () => import('@main/modulos/control-escolar/control-escolar.module').then(m => m.ControlEscolarModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'ventas',
        loadChildren: () => import('@main/modulos/ventas/ventas.module').then(m => m.VentasModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'dashboard',
        loadChildren: () => import('@main/modulos/dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'facturacion',
        loadChildren: () => import('@main/modulos/facturacion/facturacion.module').then(m => m.FacturacionModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'ingreso-promocion',
        loadChildren: () => import('@main/modulos/ingreso-promocion/ingreso-promocion.module').then(m => m.IngresoPromocionModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'cxc',
        loadChildren: () => import('@main/modulos/cxc/cxc.module').then(m => m.CXCModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'configuracion',
        loadChildren: () => import('@main/modulos/configuracion/configuracion.module').then(m => m.ConfiguracionModule),
        canActivate: [AuthGuard]
    }
	// {
	// 	path: 'programacion-academica',
	// 	loadChildren: () => import('@main/modulos/programacion_academica/programacion_academica.module').then(m => m.ProgramacionAcademicaModule),
	// 	canActivate: [AuthGuard]
	// },
    // {
    //     path: 'reportes',
    //     loadChildren: () => import('@main/modulos/reportes/reportes.module').then(m => m.ReportesModule),
    //     canActivate: [AuthGuard]
    // },
];

@NgModule({
    imports: [
        RouterModule.forChild(appRoutes),
    ],
    providers: [
    ],
    exports: [
    ]
})

export class ModulosModule {
}
