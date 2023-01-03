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

@Component({
    selector: 'reset-password',
    templateUrl: './reset-password.component.html',
    styleUrls: ['./reset-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    resetPasswordForm: FormGroup;

    languages: any;
    selectedLanguage: any;

    private token: string = '';
    recuperacion: UsuarioRecuperacion = null;

    private contrasenia: string = '';

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
        this.route.queryParams.subscribe(qParams => {
            if (qParams.tkn) {
                this.token = qParams.tkn;
                this.buscarUsuarioRecuperacion(this.token);
            }
        })
        this.resetPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required],
            passwordConfirm: ['', [Validators.required, confirmPasswordValidator]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.resetPasswordForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.resetPasswordForm.get('passwordConfirm').updateValueAndValidity();
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

    buscarUsuarioRecuperacion(token: string) {
        this.loginService.buscarUsuarioRecuperacion(token).subscribe(
            response => {
                let jsonResponse: JsonResponse = response;
                if (jsonResponse.status == 200) {
                    this.recuperacion = jsonResponse.data;
                } else {
                    this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                        duration: 5000,
                    });
                }
            }, err => {
                this.snackBar.open(this.loginService.getError(err), 'OK', {
                    duration: 5000,
                });
            }
        );
    }

    actualizarContrasenia() {
        this.loginService.actualizarContrasenia(this.token, this.contrasenia).subscribe(
            response => {
                let jsonResponse: JsonResponse = response;
                if (jsonResponse.status == 200) {
                    this.router.navigate(['/acceso/login'])
                }
                this.snackBar.open(jsonResponse.message, jsonResponse.title, {
                    duration: 5000,
                });
            }, err => {
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

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if (!control.parent || !control) {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if (!password || !passwordConfirm) {
        return null;
    }

    if (passwordConfirm.value === '') {
        return null;
    }

    if (password.value === passwordConfirm.value) {
        return null;
    }

    return { 'passwordsNotMatching': true };
};
