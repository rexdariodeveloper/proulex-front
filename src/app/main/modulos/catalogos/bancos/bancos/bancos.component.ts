import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { takeUntil } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from '../bancos-listado/i18n/en';
import { locale as spanish } from '../bancos-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { BancosService } from './bancos.service';
import { JsonResponse } from '@models/json-response';
import { Banco } from '@app/main/modelos/banco';

@Component({
    selector: 'bancos',
    templateUrl: './bancos.component.html',
    styleUrls: ['./bancos.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class BancosComponent {

    private URL = "/api/v1/bancos/";

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    banco: Banco;
    form: FormGroup;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _bancosService: BancosService,
        public validatorService: ValidatorService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this._bancosService.translate = this.translate;

        // Set the default
        this.banco = new Banco();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/catalogos/bancos",
                rutaBorrar: this.URL + "delete/",
                icono: "monetization_on"
            }
        });

        // Subscribe to update usuario on changes
        this._bancosService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.banco = datos.banco || new Banco();
                this.form = this.createForm();

                if (this.pageType == 'ver') {
                    this.form.disable({ emitEvent: false });
                } else {
                    this.form.enable({ emitEvent: false });
                }
            });
    }

    createForm(): FormGroup {
        let form = this._formBuilder.group({
            id: new FormControl(this.banco.id),
            codigo: new FormControl(this.banco.codigo, [Validators.required, Validators.maxLength(3)]),
            rfc: new FormControl(this.banco.rfc, [Validators.required, Validators.maxLength(20)]),
            razonSocial: new FormControl(this.banco.razonSocial, [Validators.required, Validators.maxLength(200)]),
            nombre: new FormControl(this.banco.nombre, [Validators.required, Validators.maxLength(150)]),
            activo: new FormControl(this.banco.activo, [Validators.required]),
            fechaModificacion: new FormControl(this.banco.fechaModificacion),
        });

        return form;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(cambo: string) {
        let form_field = this.form.get(cambo);

        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);

        return !!(validator && validator.required);
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    guardar() {
        if (this._bancosService.cargando) {
            return;
        }

        this._bancosService.cargando = true;

        if (this.form.valid) {
            this.form.disable({ emitEvent: false });

            this._bancosService.guardar(new Banco(this.form.getRawValue()), this.URL + 'save/').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });

                        this.router.navigate([this.config.rutaAtras]);
                    } else {
                        this._bancosService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._bancosService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }
}