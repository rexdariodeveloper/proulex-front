import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationSpanish } from 'app/navigation/i18n/es';

import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

import { LoginService } from '@pixvs/services/login.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

import { JsonResponse, JsonResponseError } from '@pixvs/models/json-response';
import { MatSnackBar } from '@angular/material/snack-bar';

import { environment } from 'environments/environment';
import { ElementFinder } from 'protractor';

@Component({
    selector: 'login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;

    languages: any;
    selectedLanguage: any;

    private email: AbstractControl;
    private password: AbstractControl;
    private remember: AbstractControl;

    returnUrl: string;
    show: boolean = false;
    correoRecordar: string;
    cargando: boolean = false;
    customBackground: boolean = false;
    logginCorreo: boolean;

    aplicacionAlumnosSIIAU: boolean = environment.aplicacionAlumnosSIIAU;
    createAnAccount: boolean = environment?.registroPublico || false;
    loginEnlaceExterno: boolean = environment.loginEnlaceExterno || false;
    loginEnlaceExternoTexto: string = environment.loginEnlaceExternoTexto;
    loginEnlaceExternoLink: string = environment.loginEnlaceExternoLink;
    loginSIIAU: boolean = environment?.loginSIIAU || false;

    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FormBuilder} _formBuilder
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private loginService: LoginService,
        private router: Router,
        private route: ActivatedRoute,
        private snackBar: MatSnackBar,
        private _translateService: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
    ) {

        this.correoRecordar = localStorage.getItem("recordar");

        this.customBackground = this._fuseConfigService.config?.source?._value?.customBackground;

        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true
                },
                toolbar: {
                    hidden: true
                },
                footer: {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };

        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'es',
                title: 'Español',
                flag: 'mx'
            }
        ];
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        if (!!environment.aplicacionAlumnosSIIAU || !!environment.loginSIIAU) {
            this.loginForm = this._formBuilder.group({
                email: ['', Validators.required],
                password: ['', Validators.required],
                remember: []
            });
        } else {
            this.loginForm = this._formBuilder.group({
                email: ['', [Validators.required, Validators.email]],
                password: ['', Validators.required],
                remember: []
            });
        }

        if(environment.loginSIIAU==true){
            this.logginCorreo = false;
        }
        else{
            this.logginCorreo= true;
        }
        this.remember = this.loginForm.controls.remember;
        this.email = this.loginForm.controls.email;
        if (this.correoRecordar) {
            this.email.setValue(this.correoRecordar);
            this.remember.setValue(true);

        }
        this.password = this.loginForm.controls.password;


        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { 'id': this._translateService.currentLang });
    }

    /** Moatrar u Ocultar password */
    // click event function toggle
    passwordshow() {
        this.show = !this.show;
    };

    onLogin() {
        if (this.cargando)
            return;
        this.show = false;
        this.cargando = true;
        if (!this.aplicacionAlumnosSIIAU && !this.loginSIIAU) {
            this.loginService.login(this.email.value, this.password.value).subscribe(
                response => {
                    try {

                        let jsonResponse: JsonResponse = response;
                        if (jsonResponse.status == 200) {

                            if (!!jsonResponse.data.verification) {
                                this.router.navigate(['acceso/verification']);
                                localStorage.setItem('username', this.email.value);
                            } else {
                                this.loginService.onLoggedIn(jsonResponse.data);

                                this.cargaMenuPrincipal(jsonResponse.data.menu);

                                if (this.remember.value) {
                                    localStorage.setItem('recordar', this.email.value);
                                } else {
                                    localStorage.setItem('recordar', '');
                                }

                                this._fuseSidebarService.getAutorizaciones();

                                this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                                this.router.navigate([this.returnUrl]);
                                this.snackBar.open('Bienvenido', 'OK', {
                                    duration: 5000,
                                });
                            }

                        } else {
                            this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                                duration: 5000,
                            });
                        }

                    } catch (error) {
                        this.cargando = false;
                        console.error('Error JS', error?.stack);
                        this.snackBar.open(error?.message, 'OK', {
                            duration: 5000,
                        });
                    }
                    this.cargando = false;
                }, err => {
                    this.cargando = false;
                    this.snackBar.open(this.loginService.getError(err), 'OK', {
                        duration: 5000,
                    });
                }
            );
        } else {
            if (this.aplicacionAlumnosSIIAU) {
                this.loginService.loginSiiau(this.email.value, this.password.value).subscribe(
                    response => {
                        try {
                            let jsonResponse: JsonResponse = response;
                            if (jsonResponse.status == 200) {

                                this.loginService.onLoggedInSiiau(jsonResponse.data);

                                this.cargaMenuPrincipal(jsonResponse.data.menu);

                                if (this.remember.value) {
                                    localStorage.setItem('recordar', this.email.value);
                                } else {
                                    localStorage.setItem('recordar', '');
                                }

                                //this._fuseSidebarService.getAutorizaciones();

                                this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                                this.router.navigate([this.returnUrl]);
                                this.snackBar.open('Bienvenido', 'OK', {
                                    duration: 5000,
                                });

                            } else {
                                this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                                    duration: 5000,
                                });
                            }

                        } catch (error) {
                            this.cargando = false;
                            console.error('Error JS', error?.stack);
                            this.snackBar.open(error?.message, 'OK', {
                                duration: 5000,
                            });
                        }
                        this.cargando = false;
                    }, err => {
                        this.cargando = false;
                        this.snackBar.open(this.loginService.getError(err), 'OK', {
                            duration: 5000,
                        });
                    }
                )
            }
            if (this.loginSIIAU && this.logginCorreo == false) {
                this.loginService.loginSiiauGeneral(this.email.value, this.password.value).subscribe(
                    response => {
                        try {
                            let jsonResponse: JsonResponse = response;
                            if (jsonResponse.status == 200) {

                                this.loginService.onLoggedInSiiau(jsonResponse.data);

                                this.cargaMenuPrincipal(jsonResponse.data.menu);

                                if (this.remember.value) {
                                    localStorage.setItem('recordar', this.email.value);
                                } else {
                                    localStorage.setItem('recordar', '');
                                }

                                //this._fuseSidebarService.getAutorizaciones();

                                this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                                this.router.navigate([this.returnUrl]);
                                this.snackBar.open('Bienvenido', 'OK', {
                                    duration: 5000,
                                });

                            } else {
                                this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                                    duration: 5000,
                                });
                            }

                        } catch (error) {
                            this.cargando = false;
                            console.error('Error JS', error?.stack);
                            this.snackBar.open(error?.message, 'OK', {
                                duration: 5000,
                            });
                        }
                        this.cargando = false;
                    }, err => {
                        this.cargando = false;
                        this.snackBar.open(this.loginService.getError(err), 'OK', {
                            duration: 5000,
                        });
                    }
                )
            }else{
                this.loginService.login(this.email.value, this.password.value).subscribe(
                    response => {
                        try {
    
                            let jsonResponse: JsonResponse = response;
                            if (jsonResponse.status == 200) {
    
                                if (!!jsonResponse.data.verification) {
                                    this.router.navigate(['acceso/verification']);
                                    localStorage.setItem('username', this.email.value);
                                } else {
                                    this.loginService.onLoggedIn(jsonResponse.data);
    
                                    this.cargaMenuPrincipal(jsonResponse.data.menu);
    
                                    if (this.remember.value) {
                                        localStorage.setItem('recordar', this.email.value);
                                    } else {
                                        localStorage.setItem('recordar', '');
                                    }
    
                                    this._fuseSidebarService.getAutorizaciones();
    
                                    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                                    this.router.navigate([this.returnUrl]);
                                    this.snackBar.open('Bienvenido', 'OK', {
                                        duration: 5000,
                                    });
                                }
    
                            } else {
                                this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                                    duration: 5000,
                                });
                            }
    
                        } catch (error) {
                            this.cargando = false;
                            console.error('Error JS', error?.stack);
                            this.snackBar.open(error?.message, 'OK', {
                                duration: 5000,
                            });
                        }
                        this.cargando = false;
                    }, err => {
                        this.cargando = false;
                        this.snackBar.open(this.loginService.getError(err), 'OK', {
                            duration: 5000,
                        });
                    }
                );
            }
        }
    }

    /**
     * Set the language
     *
     * @param lang
     */
    setLanguage(lang): void {
        // Set the selected language for the toolbar
        this.selectedLanguage = lang;

        // Use the selected language for translations
        this._translateService.use(lang.id);
    }

    cargaMenuPrincipal(menu): void {
        localStorage.setItem('menu', JSON.stringify(menu.navigation));
        localStorage.setItem('menu_traducciones', JSON.stringify(menu.traducciones));
        localStorage.setItem('menu_permisos', JSON.stringify(menu.permisos));

        // Carga Menu
        this._fuseNavigationService.cargaMenuLocalStorage();

    }

    onEnlaceExterno() {
        window.open(this.loginEnlaceExternoLink, "_blank");
    }

    onCambiarLogin(tipoL) {
        if (tipoL == 2)
            this.logginCorreo = true;
        else
            this.logginCorreo = false;
    }
}
