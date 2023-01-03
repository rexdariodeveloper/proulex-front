import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { HttpService } from '@pixvs/services/http.service';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationSpanish } from 'app/navigation/i18n/es';

import { environment } from '@environments/environment';
import { JsonResponse, JsonResponseError } from '@pixvs/models/json-response';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSnackBarHorizontalPosition } from '@angular/material/snack-bar';
import { MatSnackBarVerticalPosition } from '@angular/material/snack-bar';


import { IpServiceService } from '@pixvs/services/ip-service.service';
import { WebSocketAPI } from '@pixvs/config/websocket-api';
import { Usuario } from '@models/usuario';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Version } from './version';

enum TipoNotificacion {
    AlertaNotificacion = 1,
    NotificacionSistema = 2,
    ActualizacionSistema = 3,
    ActualizacionNotificaciones = 4
}

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

    fuseConfig: any;
    navigationMenu: any;
    environment = environment;
    ipAddress: string;

    // Private
    private _unsubscribeAll: Subject<any>;

    //WebSockets
    webSocketAPI: WebSocketAPI;
    mensaje: any;
    name: string;
    horizontalPosition: MatSnackBarHorizontalPosition = 'center';
    verticalPosition: MatSnackBarVerticalPosition = 'bottom';

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private _httpService: HttpService,
        private ip: IpServiceService,
        private _snackBar: MatSnackBar,
        private translate: TranslateService,
        public dialog: MatDialog,
    ) {

        // Carga Menu
        if (!localStorage.getItem('login') && this.environment.noRequiredLogin) {
            this.getMenuPublico();
        } else {
            this._fuseNavigationService.cargaMenuLocalStorage();
        }
        this._fuseNavigationService.cargaMenuLocalStorage();
        //Timezone

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ----------------------------------------------------------------------------------------------------
         */

        /**
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('tr');
         });
         */

        /**
         * ----------------------------------------------------------------------------------------------------
         * ngxTranslate Fix End
         * ----------------------------------------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {

        //this.getIP();

        localStorage.setItem('version', Version.actual);
        localStorage.setItem('versionActual', Version.actual);
        this.checkVersion();

        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });

        this.webSocketAPI = new WebSocketAPI(this);
        this.connect();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }

    getIP() {
        this.ip.getIPAddress().subscribe((res: any) => {
            this.ipAddress = res.ip;
            localStorage.setItem('ipAddress', this.ipAddress);
        });
    }

    getMenuPublico() {
        this._httpService.getMenuPublico().subscribe(
            response => {
                try {
                    let jsonResponse: JsonResponse = response;
                    if (jsonResponse.status == 200) {
                        //localStorage.setItem('menu', JSON.stringify(jsonResponse.data));
                        localStorage.setItem('menu', JSON.stringify(jsonResponse.data.navigation));
                        localStorage.setItem('menu_traducciones', JSON.stringify(jsonResponse.data.traducciones));
                        localStorage.setItem('menu_permisos', JSON.stringify(jsonResponse.data.permisos));

                        // Carga Menu
                        this._fuseNavigationService.cargaMenuLocalStorage();
                    }
                } catch (error) {
                    console.log(error);
                }
            }, err => {
                console.log(err)
            }
        );
    }


    /*Handle Websocket*/
    connect() {
        this.webSocketAPI._connect();
    }

    disconnect() {
        this.webSocketAPI._disconnect();
    }

    sendMessage() {
        this.webSocketAPI._send(this.name);
    }

    handleMessage(message) {
        let mensajeJson = JSON.parse(message);

        let usuarios: number[] = mensajeJson.usuarios;

        let usuarioActual: Usuario;
        usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        if (mensajeJson.tipo == TipoNotificacion.AlertaNotificacion && usuarios.includes(usuarioActual.id)) {

            this._fuseSidebarService.getAutorizaciones();
            this.openSnackBar(mensajeJson.mensaje == null ? "Tienes (1) nueva Autorización" : mensajeJson.mensaje);

        } else if ((mensajeJson.tipo == TipoNotificacion.NotificacionSistema && usuarios == null) ||
            (mensajeJson.tipo == TipoNotificacion.NotificacionSistema && usuarios.includes(usuarioActual.id))) {

            this.openSnackBar(mensajeJson.mensaje);

        } else if ((mensajeJson.tipo == TipoNotificacion.ActualizacionSistema && usuarios == null) ||
            (mensajeJson.tipo == TipoNotificacion.ActualizacionSistema && usuarios.includes(usuarioActual.id))) {

            this.actualizarSistema(mensajeJson.mensaje);

        } else if (mensajeJson.tipo == TipoNotificacion.ActualizacionNotificaciones && usuarios.includes(usuarioActual.id)) {

            this._fuseSidebarService.getAutorizaciones();

        }

    }


    openSnackBar(mensaje: string) {

        this._snackBar.open(mensaje, 'Ok', {
            duration: 3000,
            horizontalPosition: this.horizontalPosition,
            verticalPosition: this.verticalPosition,
        });
    }

    checkVersion() {
        setTimeout(() => {
            console.log("check version")
            var versionActual: string = localStorage.getItem('versionActual');
            if (versionActual != null && versionActual != Version.actual) {
                this.actualizarSistema(versionActual);
            }else{
                this.checkVersion();
            }
            
        }, 60000);

    }


    actualizarSistema(version: string) {

        localStorage.setItem('versionActual', version);
        if (version == Version.actual) {
            return;
        }

        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                titulo: this.translate.instant('INTERFAZ.ACTUALIZACION'),
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_ACTUALIZACION'),
                cancelar: this.translate.instant('INTERFAZ.POSPONER')
            },
            disableClose: true
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                window.location.reload();
            } else {
                this.openSnackBar(this.translate.instant('MENSAJE.ACTUALIZACION_POSPUESTA'));
                this.checkVersion();
                /*
                setTimeout(() => {
                    this.actualizarSistema(version);
                }, 60000);
                */

            }
        });
    }



}
