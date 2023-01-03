import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {
    forgotPasswordForm: FormGroup;

    languages: any;
    selectedLanguage: any;
    cargando: boolean = false;

    email: string = '';

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
        private _fuseTranslationLoaderService: FuseTranslationLoaderService
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
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]]
        });

        // Set the selected language from default languages
        this.selectedLanguage = _.find(this.languages, { 'id': this._translateService.currentLang });
    }

    onEnviarRecuperacion() {
        if (this.cargando)
            return;

        this.cargando = true;
        this.loginService.generarRecuperacion(this.email).subscribe(
            response => {
                let jsonResponse: JsonResponse = response;
                if (jsonResponse.status == 200) {
                }
                this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                    duration: 5000,
                });
                this.cargando = false;
            }, err => {
                this.cargando = false;
                this.snackBar.open(this.loginService.getError(err), 'OK', {
                    duration: 5000,
                });
            }
        );
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
}
