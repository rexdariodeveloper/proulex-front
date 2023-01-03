import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

import { LoginService } from '@pixvs/services/login.service';

import { JsonResponse, JsonResponseError } from '@models/json-response';
import { UsuarioRecuperacion } from '@models/usuario';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';

@Component({
    selector: 'verification',
    templateUrl: './verification.component.html',
    styleUrls: ['./verification.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class VerificationComponent implements OnInit, OnDestroy {
    verificationForm: FormGroup;

    languages: any;
    selectedLanguage: any;

    returnUrl: string;
    cargando: boolean = false;
    username: string;

    // Private
    private _unsubscribeAll: Subject<any>;

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
        this.username = localStorage.getItem('username');
        this.verificationForm = this._formBuilder.group({
            code: ['', [Validators.required, Validators.minLength(6),Validators.maxLength(6)]],
        });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { 'id': this._translateService.currentLang });
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    verificarCodigo(){
        let username = localStorage.getItem('username');
        let codigo = this.verificationForm.get ('code').value;

        this.loginService.verify(username,codigo).subscribe(
            response => {
                try {

                    let jsonResponse: JsonResponse = response;
                    if (jsonResponse.status == 200) {

                            this.loginService.onLoggedIn(jsonResponse.data);

                            this.cargaMenuPrincipal(jsonResponse.data.menu);

                            this._fuseSidebarService.getAutorizaciones();

                            this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                            this.router.navigate([this.returnUrl]);
                            this.snackBar.open('Bienvenido', 'OK', {
                                duration: 5000,
                            });

                            localStorage.removeItem('username');
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
}
