import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Proveedor, ProveedorEditarProjection } from '@app/main/modelos/proveedor';
import { ProveedorContacto, ProveedorContactoEditarProjection } from '@app/main/modelos/proveedor-contacto';
import { ProveedorFormaPago, ProveedorFormaPagoEditarProjection } from '@app/main/modelos/proveedor-forma-pago';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { DepartamentoComboProjection } from '@models/departamento';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { CuentaBancariaService } from './cuenta-bancaria.service';
import { Cuenta } from '@app/main/modelos/cuentas';


@Component({
    selector: 'cuenta-bancaria',
    templateUrl: './cuenta-bancaria.component.html',
    styleUrls: ['./cuenta-bancaria.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CuentaBancariaComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    cuenta: Cuenta;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    bancos: any[];
    monedas: any[];


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
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _cuentaBancariaService: CuentaBancariaService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        this.cuenta = new Cuenta({});
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.cuenta = new Cuenta({});
            }

            this.config = {
                rutaAtras: "/app/catalogos/cuentas-bancarias",
                rutaBorrar: "/api/v1/cuentas-bancarias/delete/",
                icono: "credit_card"
            }

        });

        // Subscribe to update proveedor on changes
        this._cuentaBancariaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.cuenta) {
                    this.cuenta = datos.cuenta;
                    this.titulo = this.cuenta.codigo
                } else {
                    this.cuenta = null;//new Proveedor();
                }

				this.bancos = datos.bancos;
				this.monedas = datos.monedas;

                this.form = this.createProveedorForm();

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });
    }

    createProveedorForm(): FormGroup {
		

        let form = this._formBuilder.group({

            id: new FormControl(this.cuenta?.id,[]),
            codigo: new FormControl(this.cuenta?.codigo,[Validators.required]),
            descripcion: new FormControl(this.cuenta?.descripcion,[Validators.required]),
            moneda: new FormControl(this.cuenta?.moneda,[Validators.required]),
            monedaId: new FormControl(this.cuenta?.monedaId,[]),
            banco: new FormControl(this.cuenta?.banco,[Validators.required]),
            bancoId: new FormControl(this.cuenta?.bancoId,[]),
            clabe: new FormControl(this.cuenta?.clabe,[]),
            convenio: new FormControl(this.cuenta?.convenio,[]),
            activo: new FormControl(this.cuenta?.activo,[]),
            creadoPor: new FormControl(this.cuenta?.creadoPor,[]),
            creadoPorId: new FormControl(this.cuenta?.creadoPorId,[]),
            modificadoPor: new FormControl(this.cuenta?.modificadoPor,[]),
            modificadoPorId: new FormControl(this.cuenta?.modificadoPorId,[]),
            fechaCreacion: new FormControl(this.cuenta?.fechaCreacion,[]),
            fechaModificacion: new FormControl(this.cuenta?.fechaModificacion,[])

        });

        form.get('moneda').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(data)
                form.get('monedaId').setValue(data?.id)
        });

        form.get('banco').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(data)
                form.get('bancoId').setValue(data?.id)
        });

        return form;
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string, form: FormGroup) {

        let form_field = form.get(campo);
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

        if (this.form.valid) {

            this._cuentaBancariaService.cargando = true;
			this.form.disable();

            this._cuentaBancariaService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/cuentas-bancarias/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
						});
						this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._cuentaBancariaService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );

        } else {
            this._cuentaBancariaService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }

    }
}