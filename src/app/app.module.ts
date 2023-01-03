import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from "@ngx-translate/core";
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule } from '@fuse/components';

import { fuseConfig } from 'app/main/fuse-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { InicioModule } from '@main/modulos/inicio/inicio.module';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { PaginatorIntlService } from '@fuse/services/PaginatorIntlService';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';

import { AuthGuard } from './guards';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { FichaListadoService } from '@services/ficha-listado.service';


const appRoutes: Routes = [
    {

        path: 'sistema',
        loadChildren: () => import('@pixvs/modulos/sistema/sistema.module').then(m => m.SistemaModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'config',
        loadChildren: () => import('@pixvs/modulos/config/config.module').then(m => m.ConfigModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'app',
        loadChildren: () => import('@app/main/modulos/modulos.module').then(m => m.ModulosModule),
        canActivate: [AuthGuard]
    },
    {
        path: 'acceso',
        loadChildren: () => import('@pixvs/modulos/acceso/acceso.module').then(m => m.AccesoModule)
    },
    {
        path: 'publico',
        loadChildren: () => import('@app/main/publico/publico.module').then(m => m.PublicoModule),
    },
    {
        path: '**',
        redirectTo: '/'
    },
];

@NgModule({
    declarations: [
        AppComponent,
        IconSnackBarComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes),
        DeviceDetectorModule.forRoot(),

        TranslateModule.forRoot(),

        // Material moment date module
        MatMomentDateModule,

        // Material
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        FuseConfirmDialogModule,

        // App modules
        LayoutModule,
        InicioModule
    ],
    bootstrap: [
        AppComponent
    ],
    providers: [
        {
            provide: MatPaginatorIntl,
            useFactory: (translate, loader) => {
                const service = new PaginatorIntlService();
                service.injectTranslateService(translate, loader);
                return service;
            },
            deps: [TranslateService, FuseTranslationLoaderService]
        },
		{ provide: MAT_DATE_LOCALE, useValue: 'es-MX' },
        FichaListadoService
    ],
    entryComponents: [
        IconSnackBarComponent
    ]
})
export class AppModule {
}
