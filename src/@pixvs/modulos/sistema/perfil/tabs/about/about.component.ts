import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { fuseAnimations } from '@fuse/animations';

import { Usuario } from '@models/usuario';
import { MatDialog } from '@angular/material/dialog';
import { ContrasenaDialog } from '../../contrasena-dialog';
import { JsonResponse } from '@models/json-response';

@Component({
    selector: 'perfil-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PerfilAboutComponent implements OnInit, OnDestroy {
    public usuarioActual: Usuario;

    about: any;
    languages: any;
    selectedLanguage: any;

    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {PerfilService} _perfilService
     */
    constructor(
        private _translateService: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public dialog: MatDialog,
    ) {

        this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

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

    cambiarPassword() {
        const dialogRef = this.dialog.open(ContrasenaDialog, {
            width: '400px',
            data: {
                mensaje: 'Mensaje'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                /*
                this.dataService.eliminar(this.config.rutaBorrar + this.hashid.encode(this.currentId)).then(
                    function (result: JsonResponse) {

                        if (result.status == 200) {
                            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                                duration: 5000,
                            });
                            this.router.navigate([this.config.rutaAtras])
                        }

                    }.bind(this)
                );
                    */
            }
        });
    }
}
