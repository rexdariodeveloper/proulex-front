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
import { ProveedorService } from './proveedor.service';
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

import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
//import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { FormaPagoComboProjection } from '@app/main/modelos/FormaPago';


@Component({
    selector: 'proveedor',
    templateUrl: './proveedor.component.html',
    styleUrls: ['./proveedor.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ProveedorComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    proveedor: ProveedorEditarProjection;
    form: FormGroup;

    //Contactos
    contactoGroup: FormGroup;
    contactoGroupIndex: number = null;
    contactoEnEdicion: boolean = false;
    contactos: FormArray;
    proveedorContacto: ProveedorContactoEditarProjection;

    //Formas Pago
	formaPagoGroup: FormGroup;
	formaPagoGroupIndex: number = null;
    formaPagoEnEdicion: boolean = false;
    formasPago: FormArray;
    proveedorFormaPago: ProveedorFormaPagoEditarProjection;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
	rolControl: FormControl;
	
	tiposProveedor: ControlMaestroMultipleComboProjection[];
	paises: PaisComboProjection[];
	estados: EstadoComboProjection[];
	monedas: MonedaComboProjection[];
	departamentos: DepartamentoComboProjection[];
	tiposContacto: ControlMaestroMultipleComboProjection[];
	formasPagoListado: FormaPagoComboProjection[];

	paisControl: FormControl = new FormControl();
	estadoControl: FormControl = new FormControl();
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };


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
        public _proveedorService: ProveedorService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.proveedor = new Proveedor();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.proveedor = new Proveedor();
            }

            this.config = {
                rutaAtras: "/app/catalogos/proveedores",
                rutaBorrar: "/api/v1/proveedores/delete/",
                icono: "local_shipping"
            }

        });

        // Subscribe to update proveedor on changes
        this._proveedorService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.proveedor) {
                    this.proveedor = datos.proveedor;
                    this.titulo = this.proveedor.codigo
                } else {
                    this.proveedor = new Proveedor();
                }

				this.tiposProveedor = datos.tiposProveedor;
				this.paises = datos.paises;
				this.estados = datos.estados || [];
				this.monedas = datos.monedas;
				this.departamentos = datos.departamentos;
				this.tiposContacto = datos.tiposContacto;
				this.formasPagoListado = datos.formasPago;

                this.form = this.createProveedorForm();

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });
		this._proveedorService.onComboEstadosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoEstados => {
			if (listadoEstados) {
				this._proveedorService.onComboEstadosChanged.next(null);
				this.estados = listadoEstados;
				this.estadoSelect.setDatos(this.estados);
			}
		});
    }

    createProveedorForm(): FormGroup {
		
		this.paisControl = new FormControl(this.proveedor.pais, [Validators.required]);
		this.estadoControl = new FormControl(this.proveedor.estado, []);
		
		this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(!!this.estadoSelect){
				this.estadoSelect.setDatos([]);
				this.estadoControl.setValue(null);
				if (this.paisControl.value) {
					this._proveedorService.getComboEstados(this.paisControl.value.id);
				}
			}
		});

        this.contactos = new FormArray([]);
        this.formasPago = new FormArray([]);

        if (this.proveedor.contactos) {
            this.proveedor.contactos.forEach(contacto => {
                this.contactos.push(this.createProveedorContactoForm(contacto, this.proveedor));
            });
        }

        if (this.proveedor.formasPago) {
            this.proveedor.formasPago.forEach(formaPago => {
                this.formasPago.push(this.createProveedorFormaPagoForm(formaPago, this.proveedor));
            });
        }

        let form = this._formBuilder.group({
            id: [this.proveedor.id],
            codigo: new FormControl(this.proveedor.codigo, []),
            tipoProveedor: new FormControl(this.proveedor.tipoProveedor, [Validators.required]),
            nombre: new FormControl(this.proveedor.nombre, [Validators.required, Validators.maxLength(100),]),
            razonSocial: new FormControl(this.proveedor.razonSocial, [Validators.required, Validators.maxLength(100),]),
            rfc: new FormControl(this.proveedor.rfc, [Validators.required, Validators.maxLength(20),]),
            domicilio: new FormControl(this.proveedor.domicilio, [Validators.required, Validators.maxLength(200),]),
            colonia: new FormControl(this.proveedor.colonia, [Validators.required, Validators.maxLength(100),]),
            pais: this.paisControl,
            estado: this.estadoControl,
            ciudad: new FormControl(this.proveedor.ciudad, [Validators.required, Validators.maxLength(100),]),
            cp: new FormControl(this.proveedor.cp, [Validators.required, Validators.maxLength(5),]),
            telefono: new FormControl(this.proveedor.telefono, [Validators.required, Validators.maxLength(25),]),
            extension: new FormControl(this.proveedor.extension, [Validators.maxLength(3),]),
            correoElectronico: new FormControl(this.proveedor.correoElectronico, [Validators.required, Validators.maxLength(50),]),
            paginaWeb: new FormControl(this.proveedor.paginaWeb, [Validators.maxLength(200),]),
            diasPlazoCredito: new FormControl(this.proveedor.diasPlazoCredito, [Validators.required,Validators.min(0)]),
            montoCredito: new FormControl(this.proveedor.montoCredito, [Validators.min(0)]),
            diasPago: new FormControl(this.proveedor.diasPago, []),
            moneda: new FormControl(this.proveedor.moneda, [Validators.required,]),
            fechaModificacion: this.proveedor.fechaModificacion,
            contactos: this.contactos,
            formasPago: this.formasPago,
            //contactoGroup: this.contactoGroup

        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }
        return form;
    }

    createProveedorContactoForm(proveedorContacto: ProveedorContactoEditarProjection, proveedor: ProveedorEditarProjection): FormGroup {

        this.proveedorContacto = proveedorContacto ? proveedorContacto : new ProveedorContactoEditarProjection();
        this.proveedorContacto.predeterminado = this.proveedorContacto.predeterminado || false;

        let form: FormGroup = this._formBuilder.group({
            id: [this.proveedorContacto.id],
            proveedorId: new FormControl(this.proveedorContacto.proveedorId, []),
            nombre: new FormControl(this.proveedorContacto.nombre, [Validators.required, Validators.maxLength(100),]),
            primerApellido: new FormControl(this.proveedorContacto.primerApellido, [Validators.required, Validators.maxLength(50),]),
            segundoApellido: new FormControl(this.proveedorContacto.segundoApellido, [Validators.required, Validators.maxLength(50),]),
            departamento: new FormControl(this.proveedorContacto.departamento, [Validators.required,]),
            telefono: new FormControl(this.proveedorContacto.telefono, [Validators.required, Validators.maxLength(25),]),
            extension2: new FormControl(this.proveedorContacto.extension, [Validators.maxLength(3),]),
            correoElectronico: new FormControl(this.proveedorContacto.correoElectronico, [Validators.required, Validators.maxLength(50),]),
            horarioAtencion: new FormControl(this.proveedorContacto.horarioAtencion, [Validators.required, Validators.maxLength(250),]),
            tipoContacto: new FormControl(this.proveedorContacto.tipoContacto, [Validators.required,]),
            predeterminado: new FormControl(this.proveedorContacto.predeterminado, [Validators.required,]),
            fechaModificacion: this.proveedorContacto.fechaModificacion,

        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }


    createProveedorFormaPagoForm(formaPago: ProveedorFormaPagoEditarProjection, proveedor: ProveedorEditarProjection): FormGroup {

        this.proveedorFormaPago = formaPago ? formaPago : new ProveedorFormaPagoEditarProjection();
        this.proveedorFormaPago.predeterminado = this.proveedorFormaPago.predeterminado || false;

        let form = this._formBuilder.group({
            id: [this.proveedorFormaPago.id],
            proveedorId: new FormControl(this.proveedorFormaPago.proveedorId, []),
            formaPago: new FormControl(this.proveedorFormaPago.formaPago, [Validators.required,]),
            moneda: new FormControl(this.proveedorFormaPago.moneda, []),
            banco: new FormControl(this.proveedorFormaPago.banco, [Validators.maxLength(150)]),
            referencia: new FormControl(this.proveedorFormaPago.referencia, [Validators.maxLength(100),]),
            numeroCuenta: new FormControl(this.proveedorFormaPago.numeroCuenta, [Validators.maxLength(50),]),
            cuentaClabe: new FormControl(this.proveedorFormaPago.cuentaClabe, [Validators.maxLength(50),]),
            bicSwift: new FormControl(this.proveedorFormaPago.bicSwift, [Validators.maxLength(50),]),
            iban: new FormControl(this.proveedorFormaPago.iban, [Validators.maxLength(50),]),
            nombreTitularTarjeta: new FormControl(this.proveedorFormaPago.nombreTitularTarjeta, [Validators.maxLength(250),]),
            predeterminado: new FormControl(this.proveedorFormaPago.predeterminado, [Validators.required,]),
            fechaModificacion: this.proveedorFormaPago.fechaModificacion,

		});

		this.setPermisosFormaPago(this.proveedorFormaPago.formaPago?.id,form);
		
		form.controls.formaPago.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			this.setPermisosFormaPago(value?.id,form);
		});

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
	}
	
	setPermisosFormaPago(formaPagoId: number, form: FormGroup){
		form.controls.cuentaClabe.setValidators([Validators.maxLength(50)]);
		form.controls.cuentaClabe.updateValueAndValidity();
		form.controls.banco.setValidators([Validators.maxLength(150)]);
		form.controls.banco.updateValueAndValidity();
		form.controls.numeroCuenta.setValidators([Validators.maxLength(50)]);
		form.controls.numeroCuenta.updateValueAndValidity();
		form.controls.moneda.setValidators([]);
		form.controls.moneda.updateValueAndValidity();
		switch(formaPagoId){
			case ControlesMaestrosMultiples.CMM_CXPP_FormaPago.TRANSFERENCIA_ELECTRONICA_DE_FONDOS:
				form.controls.cuentaClabe.setValidators([Validators.required,Validators.maxLength(50)]);
				form.controls.cuentaClabe.updateValueAndValidity();
			case ControlesMaestrosMultiples.CMM_CXPP_FormaPago.TARJETA_DE_CREDITO:
			case ControlesMaestrosMultiples.CMM_CXPP_FormaPago.TARJETA_DE_DEBITO:
				form.controls.banco.setValidators([Validators.required,Validators.maxLength(150)]);
				form.controls.banco.updateValueAndValidity();
				form.controls.numeroCuenta.setValidators([Validators.required,Validators.maxLength(50)]);
				form.controls.numeroCuenta.updateValueAndValidity();
			case ControlesMaestrosMultiples.CMM_CXPP_FormaPago.EFECTIVO:
				form.controls.moneda.setValidators([Validators.required]);
				form.controls.moneda.updateValueAndValidity();
				break;
		}
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

    verificarRfc(){
     if (this.form.valid) {  
         this._proveedorService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/proveedores/verificarRfc').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        if(result.message == 'Un proveedor'){
                            var proveedorTemp: Proveedor = result.data;
                            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                width: '400px',
                                data: {
                                    mensaje: 'El RFC ya ha sido utilizado por '+proveedorTemp.codigo+' '+proveedorTemp.nombre
                                }
                            });
                            dialogRef.afterClosed().subscribe(confirm => {
                                if (confirm) {
                                    this.guardar();
                                }
                            });
                        }
                        else if(result.message =='Mas de un proveedor'){
                            var proveedorTemp: Proveedor = result.data;
                            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                width: '400px',
                                data: {
                                    mensaje: 'El RFC ya ha sido utilizado por mas de un proveedor'
                                }
                            });
                            dialogRef.afterClosed().subscribe(confirm => {
                                if (confirm) {
                                    this.guardar();
                                }
                            });
                        }
                        else{
                            this.guardar();
                        }
                    }
                    else {
                        this._proveedorService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );   
         } else {

            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._proveedorService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    guardar() {

        //if (this.form.valid) {

        this._proveedorService.cargando = true;
		this.form.disable({emitEvent: false});

        this._proveedorService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/proveedores/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
					});
                    if(!!!this.proveedor.id){
                        this._matSnackBar.open(result.message, 'OK', {
                            duration: 5000,
                        });
                    }
					this.form.disable({emitEvent: false});
                    this.router.navigate([this.config.rutaAtras])
                } else {
                    this._proveedorService.cargando = false;
                    this.form.enable({emitEvent: false});
                }
            }.bind(this)
        );
        /*} else {

            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._proveedorService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }*/

    }

    newContactoCompras(): void {
		this.contactoGroup = this.createProveedorContactoForm(null, this.proveedor);
		this.contactoGroupIndex = null;
        this.contactos.push(this.contactoGroup);

        this.contactoEnEdicion = true;
    }

    newFormaPago(): void {
		this.formaPagoGroup = this.createProveedorFormaPagoForm(null, this.proveedor);
		this.formaPagoGroupIndex = null;
        this.formasPago.push(this.formaPagoGroup);

        this.formaPagoEnEdicion = true;
    }

    cancelarContactoCompras(form: FormGroup): void {
		if (this.contactoGroupIndex == null) {
            this.contactos.removeAt(this.contactos.controls.length - 1);
        }
        this.contactoEnEdicion = false;
    }

    cancelarFormaPago(form: FormGroup): void {
        if (this.formaPagoGroupIndex == null) {
            this.formasPago.removeAt(this.formasPago.controls.length - 1);
        }

        this.formaPagoEnEdicion = false;
    }


    editarContacto(selectedContacto: FormGroup, index: number): void {

        this.contactoGroup = this.createProveedorContactoForm(selectedContacto.getRawValue(), this.proveedor);
        this.contactoGroupIndex = index;

        this.contactoEnEdicion = true;
    }


    editarFormaPago(selectedFormaPago: FormGroup, index: number): void {

		this.formaPagoGroup = this.createProveedorFormaPagoForm(selectedFormaPago.getRawValue(), this.proveedor);
		this.formaPagoGroupIndex = index;

        this.formaPagoEnEdicion = true;
    }


    addContactoCompras(): void {

        if (this.contactoGroup.valid) {


            //this.contactos.push(Object.assign(Object.create(this.contactoGroup), this.contactoGroup));


            //this.contactoGroup = this.createProveedorContactoForm(this.proveedor);
			//this.contactos.push(this.contactoGroup);
			
			if(this.contactoGroupIndex != null){
				this.contactos.controls[this.contactoGroupIndex] = this.createProveedorContactoForm(this.contactoGroup.getRawValue(), this.proveedor);
			}

            this.contactoEnEdicion = false;

        } else {

            for (const key of Object.keys(this.contactoGroup.controls)) {
                if (this.contactoGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._proveedorService.cargando = false;
            this.contactoGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    addFormaPago(): void {

        if (this.formaPagoGroup.valid) {


            //this.formasPago.push(Object.assign(Object.create(this.formaPagoGroup), this.formaPagoGroup));


            //this.formaPagoGroup = this.createProveedorFormaPagoForm(this.proveedor);
			//this.formasPago.push(this.formaPagoGroup);
			
			if(this.formaPagoGroupIndex != null){
				this.formasPago.controls[this.formaPagoGroupIndex] = this.createProveedorFormaPagoForm(this.formaPagoGroup.getRawValue(), this.proveedor);
			}

            this.formaPagoEnEdicion = false;

        } else {

            for (const key of Object.keys(this.formaPagoGroup.controls)) {
                if (this.formaPagoGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._proveedorService.cargando = false;
            this.formaPagoGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

	validarMostrarCampoFormaPago(formaPagoId: number, formasPagoIdsValidas: number[]){
		return !!formaPagoId && formasPagoIdsValidas.includes(formaPagoId);
	}

}