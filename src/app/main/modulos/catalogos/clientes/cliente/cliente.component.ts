import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Banco } from '@app/main/modelos/banco';
import { Cliente } from '@app/main/modelos/cliente';
import { ClienteContacto } from '@app/main/modelos/cliente-contacto';
import { ClienteCuentaBancaria } from '@app/main/modelos/cliente-cuenta-bancaria';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { FormaPagoComboProjection } from '@app/main/modelos/FormaPago';
import { ListadoPrecioComboProjection } from '@app/main/modelos/listado-precio';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ClienteService } from './cliente.service';
import { Almacen } from '@app/main/modelos/almacen';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { UsuarioComboProjection } from '@models/usuario';
import { MunicipioComboProjection } from '@models/municipio';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { SATRegimenFiscalComboProjection } from '@models/sat-regimen-fiscal';
import { ClienteDatosFacturacion } from '@app/main/modelos/cliente-datos-facturacion';

@Component({
    selector: 'cliente',
    templateUrl: './cliente.component.html',
    styleUrls: ['./cliente.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ClienteComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    cliente: Cliente;
    form: FormGroup;

    //Contactos
    contactoGroup: FormGroup;
    contactoGroupIndex: number = null;
    contactoEnEdicion: boolean = false;
    contactos: FormArray;
    clienteContacto: ClienteContacto;

    //Cuentas Bancarias
    cuentaBancariaGroup: FormGroup;
    cuentaBancariaGroupIndex: number = null;
    cuentaBancariaEnEdicion: boolean = false;
    cuentasBancarias: FormArray;
    clienteCuentaBancaria: ClienteCuentaBancaria;
    @ViewChild('estadoAlmacenSelect') estadoAlmacenSelect: PixvsMatSelectComponent;
    
    // Almacenes (consignación)
    almacenGroup: FormGroup;
    almacenGroupIndex: number = null;
    almacenEnEdicion: boolean = false;
    almacenes: FormArray;
    almacen: Almacen;
    sucursalAlmacenControl: FormControl = new FormControl();
    responsableAlmacenControl: FormControl = new FormControl();
    paisAlmacenControl: FormControl = new FormControl();
    estadoAlmacenControl: FormControl = new FormControl();

    //Facturación
    datosFacturacionEnEdicion: boolean = false
    
    @ViewChild('estadoFacturacionSelect') estadoFacturacionSelect: PixvsMatSelectComponent;
	@ViewChild('municipioFacturacionSelect') municipioFacturacionSelect: PixvsMatSelectComponent;

    idFacturacionTmp: number = 1;
	existeFacturacionPredeterminada: boolean = false;
	CMM_RFC_TipoPersona = ControlesMaestrosMultiples.CMM_RFC_TipoPersona;
    rfcExtranjero: string;

    facturacionEditar: ClienteDatosFacturacion = null;
    formFacturacion: FormGroup;
	tipoPersonaFacturacionControl: FormControl = new FormControl();
	paisFacturacionControl: FormControl = new FormControl();
	estadoFacturacionControl: FormControl = new FormControl();
	telefonoFijoFacturacionControl: FormControl = new FormControl();
	telefonoMovilFacturacionControl: FormControl = new FormControl();
	telefonoTrabajoFacturacionControl: FormControl = new FormControl();
	telefonoTrabajoExtensionFacturacionControl: FormControl = new FormControl();
	telefonoMensajeriaInstantaneaFacturacionControl: FormControl = new FormControl();
	regimenFiscalControl: FormControl = new FormControl();

    tiposPersona: ControlMaestroMultipleComboProjection[] = [];
    estadosFacturacion: EstadoComboProjection[] = [];
    municipiosFacturacion: MunicipioComboProjection[] = [];
    listRegimenFiscal: SATRegimenFiscalComboProjection[] = [];
	listRegimenFiscalFiltrado: SATRegimenFiscalComboProjection[] = [];

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    paises: PaisComboProjection[];
    estados: EstadoComboProjection[];
    estadosMexico: EstadoComboProjection[];
    monedas: MonedaComboProjection[];
    formasPago: FormaPagoComboProjection[];
    bancos: Banco[];
    listados: ListadoPrecioComboProjection[];
    estadosAlmacen: EstadoComboProjection[];
    sucursales: SucursalComboProjection[];
    usuariosResponsables: UsuarioComboProjection[];

    paisControl: FormControl = new FormControl();
    estadoControl: FormControl = new FormControl();
    listadoPrecioControl: FormControl = new FormControl();

    @ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;

    permiteDesactivarConsignacion: boolean = true;

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
        public _clienteService: ClienteService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.cliente = new Cliente();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.cliente = new Cliente();
            }

            this.config = {
                rutaAtras: "/app/catalogos/clientes",
                rutaBorrar: "/api/v1/clientes/delete/",
                icono: "person_pin"
            }
        });

        // Subscribe to update cliente on changes
        this._clienteService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.cliente) {
                    this.cliente = datos.cliente;
                    this.titulo = this.cliente.codigo

                    this.cliente.facturacion.forEach(facturacion => {
                        facturacion.idTmp = this.idFacturacionTmp++;
    
                        if (facturacion.predeterminado) {
                            this.existeFacturacionPredeterminada = true;
                        }
                    });
                } else {
                    this.cliente = new Cliente();
                }

                this.estados = datos.estados;
                this.estadosFacturacion = this.estados;
                this.paises = datos.paises;
                this.monedas = datos.monedas;
                this.listados = datos.listados;
                this.formasPago = datos.formasPago;
                this.bancos = datos.bancos;
                this.sucursales = datos.sucursales;
                this.usuariosResponsables = datos.usuariosResponsables;
                this.permiteDesactivarConsignacion = datos.permiteDesactivarConsignacion;
                this.tiposPersona = datos.tiposPersona;
                this.listRegimenFiscal = datos.listRegimenFiscal;
                this.rfcExtranjero = datos.rfcExtranjero;
                this.estadosMexico = datos.estadosMexico;

                this.form = this.createClienteForm();

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });
        
        this._clienteService.onEstadosFacturacionChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((estados: EstadoComboProjection[]) => {
                if (estados != null) {
                    this.municipiosFacturacion = [];
                    
                    if (!!this.formFacturacion.get('municipio')) {
                        this.formFacturacion.get('municipio').setValue(null);
                    }

                    this.estadosFacturacion = estados;
                    
                    if (!!this.estadoFacturacionSelect) {
                        this.estadoFacturacionSelect.setDatos(this.estadosFacturacion);
                    }
                }
            });

        this._clienteService.onMunicipiosFacturacionChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((municipios: MunicipioComboProjection[]) => {
                if (municipios != null) {
                    this._clienteService.onMunicipiosFacturacionChanged.next(null);

                    this.municipiosFacturacion = municipios;
                    
                    if (!!this.municipioFacturacionSelect) {
                        this.municipioFacturacionSelect.setDatos(this.municipiosFacturacion);
                    }

                    this.formFacturacion.get('municipio').setValue(null);
                }
            });
    }

    createClienteForm(): FormGroup {
        this.paisControl = new FormControl(this.cliente.pais, [Validators.required]);
        this.estadoControl = new FormControl(this.cliente.estado, [Validators.required]);
        this.listadoPrecioControl = new FormControl(this.cliente.listadoPrecio);

        this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (!!this.estadoSelect) {
                //this.estadoSelect.setDatos([]);
                //this.estadoControl.setValue(null);
                if (this.paisControl.value) {
                    this._clienteService.getComboEstados(this.paisControl.value.id).then(value =>{
                        this.estados = value.data;
                        this.estadoSelect.setDatos(this.estados);
                    });
                }
            }
        });

        this.contactos = new FormArray([]);
        this.cuentasBancarias = new FormArray([]);
        this.almacenes = new FormArray([]);

        if (this.cliente.contactos) {
            this.cliente.contactos.forEach(contacto => {
                this.contactos.push(this.createClienteContactoForm(contacto, this.cliente));
            });
        }

        if (this.cliente.cuentasBancarias) {
            this.cliente.cuentasBancarias.forEach(cuenta => {
                this.cuentasBancarias.push(this.createClienteCuentaBancariaForm(cuenta, this.cliente));
            });
        }

        if (this.cliente.almacenesConsignacion) {
            this.cliente.almacenesConsignacion.forEach(almacen => {
                this.almacenes.push(this.createAlmacenForm(almacen, this.cliente));
            });
        }

        if (this.cliente.facturacion) {
            this.setFormFacturacion();
        }

        let form = this._formBuilder.group({
            id: [this.cliente.id],
            codigo: new FormControl(this.cliente.codigo, []),
            nombre: new FormControl(this.cliente.nombre, [Validators.required, Validators.maxLength(100),]),
            rfc: new FormControl(this.cliente.rfc, [Validators.required, Validators.maxLength(20),]),
            razonSocial: new FormControl(this.cliente.razonSocial, [Validators.required, Validators.maxLength(100),]),            
            domicilio: new FormControl(this.cliente.domicilio, [Validators.required, Validators.maxLength(200),]),
            colonia: new FormControl(this.cliente.colonia, [Validators.required, Validators.maxLength(100),]),
            paisId: this.paisControl,
            estadoId: this.estadoControl,
            ciudad: new FormControl(this.cliente.ciudad, [Validators.required, Validators.maxLength(100),]),
            cp: new FormControl(this.cliente.cp, [Validators.required, Validators.maxLength(5),]),
            telefono: new FormControl(this.cliente.telefono, [Validators.required, Validators.maxLength(25),]),
            extension: new FormControl(this.cliente.extension,[Validators.required]),
            correoElectronico: new FormControl(this.cliente.correoElectronico, [Validators.required, Validators.maxLength(50),]),
            paginaWeb: new FormControl(this.cliente.paginaWeb, [Validators.maxLength(200),]),
            comentarios: new FormControl(this.cliente.comentarios, [Validators.maxLength(3000)]),

            formaPagoId: new FormControl(this.cliente.formaPago, [Validators.required,]),
            monedaId: new FormControl(this.cliente.moneda, [Validators.required,]),
            cuentaCXC: new FormControl(this.cliente.cuentaCXC, [Validators.required, Validators.maxLength(50)]),
            montoCredito: new FormControl(this.cliente.montoCredito, [Validators.min(0)]),
            diasCobro: new FormControl(this.cliente.diasCobro, [Validators.required]),
            listadoPrecio: this.listadoPrecioControl,
            consignacion: new FormControl(!!this.cliente.consignacion, []),
            
            contactos: this.contactos,
            cuentasBancarias: this.cuentasBancarias,
            almacenesConsignacion: this.almacenes,

            fechaModificacion: this.cliente.fechaModificacion,
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }

        return form;
    }

    createClienteContactoForm(clienteContacto: ClienteContacto, cliente: Cliente): FormGroup {
        this.clienteContacto = clienteContacto ? clienteContacto : new ClienteContacto();
        this.clienteContacto.predeterminado = this.clienteContacto.predeterminado || false;

        let form: FormGroup = this._formBuilder.group({
            id: [this.clienteContacto.id],
            clienteId: new FormControl(this.clienteContacto.clienteId, []),
            nombre: new FormControl(this.clienteContacto.nombre, [Validators.required, Validators.maxLength(100),]),
            primerApellido: new FormControl(this.clienteContacto.primerApellido, [Validators.required, Validators.maxLength(50),]),
            segundoApellido: new FormControl(this.clienteContacto.segundoApellido, [Validators.maxLength(50),]),
            departamento: new FormControl(this.clienteContacto.departamento, [Validators.required, Validators.maxLength(100)]),
            telefono: new FormControl(this.clienteContacto.telefono, [Validators.required, Validators.maxLength(25),]),
            extension: new FormControl(this.clienteContacto.extension, [Validators.required]),
            correoElectronico: new FormControl(this.clienteContacto.correoElectronico, [Validators.required, Validators.maxLength(50),]),
            horarioAtencion: new FormControl(this.clienteContacto.horarioAtencion, [Validators.required, Validators.maxLength(250),]),
            predeterminado: new FormControl(this.clienteContacto.predeterminado, [Validators.required,]),
            activo: new FormControl(clienteContacto ? this.clienteContacto.activo : true, [Validators.required,]),
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createClienteCuentaBancariaForm(cuentaBancaria: ClienteCuentaBancaria, cliente: Cliente): FormGroup {
        this.clienteCuentaBancaria = cuentaBancaria ? cuentaBancaria : new ClienteCuentaBancaria();

        let form = this._formBuilder.group({
            id: [this.clienteCuentaBancaria.id],
            clienteId: new FormControl(this.clienteCuentaBancaria.clienteId, []),
            banco: new FormControl(this.clienteCuentaBancaria.banco, [Validators.required]),
            cuenta: new FormControl(this.clienteCuentaBancaria.cuenta, [Validators.maxLength(40),]),
            activo: new FormControl(cuentaBancaria ? this.clienteCuentaBancaria.activo : true, [Validators.required,]),
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    setFormFacturacion() {
        this.formFacturacion = null;

        setTimeout(() => {
            this.formFacturacion = this.createFacturacionForm();
            this.updateDatosFacturacionRequired(this.facturacionEditar?.datosFacturacion?.tipoPersona);
        });
    }

    createFacturacionForm(): FormGroup {
        var datos = this.facturacionEditar?.datosFacturacion;

        // Inicializar FormControls
        this.tipoPersonaFacturacionControl = new FormControl(datos?.tipoPersona || null, [Validators.required])
        this.paisFacturacionControl = new FormControl(datos?.pais || null, [])
        this.estadoFacturacionControl = new FormControl(datos?.estado || null, [])
        this.telefonoFijoFacturacionControl = new FormControl(datos?.telefonoFijo || null, [])
        this.telefonoMovilFacturacionControl = new FormControl(datos?.telefonoMovil || null, [])
        this.telefonoTrabajoFacturacionControl = new FormControl(datos?.telefonoTrabajo || null, [])
        this.telefonoTrabajoExtensionFacturacionControl = new FormControl(datos?.telefonoTrabajoExtension || null, [])
        this.telefonoMensajeriaInstantaneaFacturacionControl = new FormControl(datos?.telefonoMensajeriaInstantanea || null, [])
        this.regimenFiscalControl = new FormControl(datos?.regimenFiscal || null, [Validators.required])

        switch (this.tipoPersonaFacturacionControl?.value?.id) {
            case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.FISICA:
                this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
                    return model.fisica;
                });
                break;

            case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.MORAL:
                this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
                    return model.moral;
                });
                break;
        }

        if (datos?.pais || null) {
            this._clienteService.getEstadosFacturacion(datos.pais.id);
        }

        // Subscripciones FormControl.valueChanges
        this.tipoPersonaFacturacionControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoPersona: ControlMaestroMultipleComboProjection) => {
            this.updateDatosFacturacionRequired(tipoPersona);
        });

        this.paisFacturacionControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
            if (!!pais) {
                this._clienteService.getEstadosFacturacion(pais.id);
            }
        });

        // Inicializar Form
        let form = this._formBuilder.group({
            idTmp: [this.facturacionEditar?.idTmp || this.idFacturacionTmp++],
            id: [this.facturacionEditar?.id || null],
            predeterminado: new FormControl(this.facturacionEditar?.predeterminado || !this.existeFacturacionPredeterminada, []),
            datosFacturacionId: new FormControl(datos?.id || null, []),
            tipoPersona: this.tipoPersonaFacturacionControl,
            rfc: new FormControl(datos?.rfc || null, [Validators.required, Validators.maxLength(20)]),
            nombre: new FormControl(datos?.nombre || null, []),
            primerApellido: new FormControl(datos?.primerApellido || null, []),
            segundoApellido: new FormControl(datos?.segundoApellido || null, []),
            razonSocial: new FormControl(datos?.razonSocial || null, []),
            registroIdentidadFiscal: new FormControl(datos?.registroIdentidadFiscal || null, []),
            calle: new FormControl(datos?.calle || null, [Validators.maxLength(250)]),
            numeroExterior: new FormControl(datos?.numeroExterior || null, [Validators.maxLength(10)]),
            numeroInterior: new FormControl(datos?.numeroInterior || null, [Validators.maxLength(10)]),
            colonia: new FormControl(datos?.colonia || null, [Validators.maxLength(250)]),
            cp: new FormControl(datos?.cp || null, [Validators.required, Validators.maxLength(10)]),
            pais: this.paisFacturacionControl,
            estado: this.estadoFacturacionControl,
            ciudad: new FormControl(datos?.ciudad || null, []),
            correoElectronico: new FormControl(datos?.correoElectronico || null, [Validators.email, Validators.maxLength(50)]),
            telefonoFijo: this.telefonoFijoFacturacionControl,
            telefonoMovil: this.telefonoMovilFacturacionControl,
            telefonoTrabajo: this.telefonoTrabajoFacturacionControl,
            telefonoTrabajoExtension: this.telefonoTrabajoExtensionFacturacionControl,
            telefonoMensajeriaInstantanea: this.telefonoMensajeriaInstantaneaFacturacionControl,
            regimenFiscal: this.regimenFiscalControl
        });

        return form;
    }

    updateDatosFacturacionRequired(tipoPersona) {
        if (!!tipoPersona) {
            this.formFacturacion.controls['nombre'].clearValidators();
            this.formFacturacion.controls['primerApellido'].clearValidators();
            this.formFacturacion.controls['segundoApellido'].clearValidators();
            this.formFacturacion.controls['razonSocial'].clearValidators();
            this.formFacturacion.controls['regimenFiscal'].clearValidators();

            this.listRegimenFiscalFiltrado = this.listRegimenFiscal;

            switch (tipoPersona.id) {
                case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.FISICA:
                    this.paisFacturacionControl.setValue(this.paises[0]);
                    this.formFacturacion.controls['nombre'].setValidators([Validators.required, Validators.maxLength(50)]);
                    this.formFacturacion.controls['primerApellido'].setValidators([Validators.required, Validators.maxLength(50)]);
                    this.formFacturacion.controls['segundoApellido'].setValidators([Validators.maxLength(50)]);
                    this.formFacturacion.controls['regimenFiscal'].setValidators([Validators.required]);

                    this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
                        return model.fisica;
                    });
                    break;

                case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.MORAL:
                    this.paisFacturacionControl.setValue(this.paises[0]);
                    this.formFacturacion.controls['razonSocial'].setValidators([Validators.required, Validators.maxLength(50)]);
                    this.formFacturacion.controls['regimenFiscal'].setValidators([Validators.required]);

                    this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
                        return model.moral;
                    });
                    break;

                case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.EXTRANJERO:
                    this.paisFacturacionControl.setValue(null);
                    this.formFacturacion.controls['rfc'].setValue(this.rfcExtranjero);
                    this.formFacturacion.controls['razonSocial'].setValidators([Validators.required, Validators.maxLength(50)]);
                    break;
            }
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

    verificarRfc() {
        if (this.form.valid) {
            this._clienteService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/clientes/verificarRfc').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        if (result.message == 'Un cliente') {
                            var clienteTemp: Cliente = result.data;
                            
                            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                width: '400px',
                                data: {
                                    mensaje: 'El RFC ya ha sido utilizado por ' + clienteTemp.codigo + ' ' + clienteTemp.nombre
                                }
                            });

                            dialogRef.afterClosed().subscribe(confirm => {
                                if (confirm) {
                                    this.guardar();
                                }
                            });
                        } else if (result.message == 'Mas de un cliente') {
                            var clienteTemp: Cliente = result.data;

                            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                                width: '400px',
                                data: {
                                    mensaje: 'El RFC ya ha sido utilizado por mas de un cliente'
                                }
                            });

                            dialogRef.afterClosed().subscribe(confirm => {
                                if (confirm) {
                                    this.guardar();
                                }
                            });
                        } else {
                            this.guardar();
                        }
                    } else {
                        this._clienteService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();
                        
                        break;
                    }

                }
            }

            this._clienteService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }
    }

    guardar() {
        let modelo = this.form.getRawValue();

        this._clienteService.cargando = true;
        this.form.disable();        
        
        modelo.paisId = modelo.paisId.id;
        modelo.estadoId = modelo.estadoId.id;
        modelo.formaPagoId = modelo.formaPagoId.id;
        modelo.monedaId = modelo.monedaId.id;   
        modelo.listadoPrecioId = modelo.listadoPrecio?.id || null;
        modelo.facturacion = this.cliente.facturacion || [];

        modelo.cuentasBancarias.forEach(cuenta => {
            cuenta.bancoId = cuenta.banco.id;
        });

        (this.cliente.facturacion || []).forEach(facturacion => {
            delete facturacion.idTmp;
        });

        this._clienteService.guardar(JSON.stringify(modelo), '/api/v1/clientes/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
                    });

                    if (!!!this.cliente.id) {
                        this._matSnackBar.open(result.message, 'OK', {
                            duration: 5000,
                        });
                    }

                    this.form.disable();
                    this.router.navigate([this.config.rutaAtras])
                } else {
                    this._clienteService.cargando = false;
                    this.form.enable();
                }
            }.bind(this)
        );
    }

    newContacto(): void {
        this.contactoGroup = this.createClienteContactoForm(null, this.cliente);
        this.contactoGroupIndex = null;
        this.contactos.push(this.contactoGroup);
        this.contactoEnEdicion = true;
    }

    newCuentaBancaria(): void {
        this.cuentaBancariaGroup = this.createClienteCuentaBancariaForm(null, this.cliente);
        this.cuentaBancariaGroupIndex = null;
        this.cuentasBancarias.push(this.cuentaBancariaGroup);
        this.cuentaBancariaEnEdicion = true;
    }

    cancelarContacto(form: FormGroup): void {
        if (this.contactoGroupIndex == null) {
            this.contactos.removeAt(this.contactos.controls.length - 1);
        }

        this.contactoEnEdicion = false;
    }

    cancelarCuentaBancaria(form: FormGroup): void {
        if (this.cuentaBancariaGroupIndex == null) {
            this.cuentasBancarias.removeAt(this.cuentasBancarias.controls.length - 1);
        }

        this.cuentaBancariaEnEdicion = false;
    }

    editarContacto(selectedContacto: FormGroup, index: number): void {
        this.contactoGroup = this.createClienteContactoForm(selectedContacto.getRawValue(), this.cliente);
        this.contactoGroupIndex = index;
        this.contactoEnEdicion = true;
    }

    editarCuentaBancaria(selectedCuentaBancaria: FormGroup, index: number): void {
        this.cuentaBancariaGroup = this.createClienteCuentaBancariaForm(selectedCuentaBancaria.getRawValue(), this.cliente);
        this.cuentaBancariaGroupIndex = index;
        this.cuentaBancariaEnEdicion = true;
    }

    newDatosFacturacion(): void {
        this.datosFacturacionEnEdicion = true;
    }

    addContacto(): void {
        if (this.contactoGroup.valid) {
            if (this.contactoGroupIndex != null) {
                this.contactos.controls[this.contactoGroupIndex] = this.createClienteContactoForm(this.contactoGroup.getRawValue(), this.cliente);
            }

            this.contactoEnEdicion = false;
        } else {
            for (const key of Object.keys(this.contactoGroup.controls)) {
                if (this.contactoGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();

                        break;
                    }
                }
            }

            this._clienteService.cargando = false;

            this.contactoGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }
        
    }

    addCuentaBancaria(): void {
        if (this.cuentaBancariaGroup.valid) {
            if (this.cuentaBancariaGroupIndex != null) {
                this.cuentasBancarias.controls[this.cuentaBancariaGroupIndex] = this.createClienteCuentaBancariaForm(this.cuentaBancariaGroup.getRawValue(), this.cliente);
            }

            this.cuentaBancariaEnEdicion = false;
        } else {
            for (const key of Object.keys(this.cuentaBancariaGroup.controls)) {
                if (this.cuentaBancariaGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();

                        break;
                    }
                }
            }

            this._clienteService.cargando = false;
            this.cuentaBancariaGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }
    }

    editarFacturacion(facturacion: ClienteDatosFacturacion) {
        if (this.form?.enabled) {
            this.facturacionEditar = facturacion;
            this.limpiarFormularioFacturacion();
            this.datosFacturacionEnEdicion = true;
        }
    }

    eliminarFacturacion(idTmp: number) {
        this.cliente.facturacion = this.cliente.facturacion.filter(facturacion => {
            if (facturacion.idTmp == idTmp && facturacion.predeterminado) {
                this.existeFacturacionPredeterminada = false;
            }

            return facturacion.idTmp != idTmp;
        });

        this.limpiarFormularioFacturacion();
    }

    limpiarFormularioFacturacion() {
        this.setFormFacturacion();
        this.datosFacturacionEnEdicion = false;
    }

    cancelarFormularioFacturacion(){
		this.facturacionEditar = null;
		this.limpiarFormularioFacturacion();
        this.datosFacturacionEnEdicion = false;
	}

    guardarFacturacion() {
        if (this.formFacturacion.valid) {
            // if (!this.telefonoFijoFacturacionControl.value && !this.telefonoMovilFacturacionControl.value && !this.telefonoTrabajoFacturacionControl.value && !this.telefonoMensajeriaInstantaneaFacturacionControl.value) {
            //     this._matSnackBar.open('Es necesario ingresar al menos un teléfono para continuar', 'OK', {
            //         duration: 5000,
            //     });
            //     return;
            // }

            let facturacionGuardar: any = this.formFacturacion.getRawValue();

            facturacionGuardar.rfc = (facturacionGuardar.rfc || '').toUpperCase();
            facturacionGuardar.nombre = facturacionGuardar.nombre ? facturacionGuardar.nombre.toUpperCase() : null;
            facturacionGuardar.primerApellido = facturacionGuardar.primerApellido ? facturacionGuardar.primerApellido.toUpperCase() : null;
            facturacionGuardar.segundoApellido = facturacionGuardar.segundoApellido ? facturacionGuardar.segundoApellido.toUpperCase() : null;
            facturacionGuardar.razonSocial = facturacionGuardar.razonSocial ? facturacionGuardar.razonSocial.toUpperCase() : null;
            facturacionGuardar.registroIdentidadFiscal = facturacionGuardar.registroIdentidadFiscal ? facturacionGuardar.registroIdentidadFiscal.toUpperCase() : null;

            if (facturacionGuardar.predeterminado && this.existeFacturacionPredeterminada && !this.facturacionEditar?.predeterminado) {
                this._matSnackBar.open('Solo se permite un registro predeterminado', 'OK', {
                    duration: 5000,
                });
                return;
            }

            if (facturacionGuardar.predeterminado && !this.existeFacturacionPredeterminada) {
                this.existeFacturacionPredeterminada = true;
            }

            let facturacionEditar: ClienteDatosFacturacion = (this.cliente.facturacion || []).find(facturacion => {
                return facturacion.idTmp == facturacionGuardar.idTmp;
            });

            let facturacion: ClienteDatosFacturacion = {
                idTmp: facturacionGuardar.idTmp,
                id: facturacionGuardar.id,
                predeterminado: facturacionGuardar.predeterminado,
                datosFacturacion: null
            }

            facturacionGuardar.id = facturacionGuardar.datosFacturacionId;
            facturacionGuardar.datosFacturacionId = null;
            facturacionGuardar.idTmp = null;
            facturacionGuardar.predeterminado = null;

            facturacion.datosFacturacion = facturacionGuardar;

            if (!!facturacionEditar) {
                facturacionEditar.datosFacturacion = facturacion.datosFacturacion;

                this.cliente.facturacion = [].concat(this.cliente.facturacion || []);
            } else {
                this.cliente.facturacion = (this.cliente.facturacion || []).concat(facturacion);
            }

            this.facturacionEditar = null;
            this.limpiarFormularioFacturacion();
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

    createAlmacenForm(almacen: Almacen, cliente: Cliente): FormGroup {
        this.almacen = almacen ? almacen : new Almacen();

        let direccionRequiredValidators: any[] = [];
		if (!this.almacen.mismaDireccionCliente) {
			direccionRequiredValidators = [Validators.required];
		}

        this.sucursalAlmacenControl = new FormControl(this.almacen.sucursal, [Validators.required]);
        this.responsableAlmacenControl = new FormControl(this.almacen.responsable, [Validators.required]);
        this.paisAlmacenControl = new FormControl(this.almacen.pais, direccionRequiredValidators);
        this.estadoAlmacenControl = new FormControl(this.almacen.estado, direccionRequiredValidators);

        this.paisAlmacenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (!!this.estadoAlmacenSelect) {
                if (this.paisAlmacenControl.value) {
                    this._clienteService.getComboEstados(this.paisAlmacenControl.value.id).then(value =>{
                        this.estadosAlmacen = value.data;
                        this.estadoAlmacenSelect.setDatos(this.estadosAlmacen);
                    });
                }
            }
        });

        let form = this._formBuilder.group({
            id: [this.almacen.id],
			codigoAlmacen: new FormControl(this.almacen.codigoAlmacen, [Validators.required, Validators.maxLength(12)]),
			nombre: new FormControl(this.almacen.nombre, [Validators.required, Validators.maxLength(250)]),
			sucursal: this.sucursalAlmacenControl,
			responsable: this.responsableAlmacenControl,
			mismaDireccionSucursal: [false],
			mismaDireccionCliente: new FormControl(this.almacen.mismaDireccionCliente || false, []),
			domicilio: new FormControl(this.almacen.domicilio, direccionRequiredValidators.concat([Validators.maxLength(250)])),
			cp: new FormControl(this.almacen.cp, direccionRequiredValidators.concat([Validators.maxLength(5),Validators.pattern('[0-9]+')])),
			colonia: new FormControl(this.almacen.colonia, direccionRequiredValidators.concat([Validators.maxLength(250)])),
			ciudad: new FormControl(this.almacen.ciudad, direccionRequiredValidators.concat([Validators.maxLength(100)])),
			pais: this.paisControl,
			estado: this.estadoControl,
			telefono: new FormControl(this.almacen.telefono, direccionRequiredValidators.concat([Validators.maxLength(100)])),
			extension: new FormControl(this.almacen.extension, [Validators.maxLength(3),Validators.pattern('[0-9]+')]),
			activo: new FormControl(this.almacen.activo == undefined ? true : this.almacen.activo, []),
			predeterminado: [false],
			esCedi: [false],

            fechaModificacion: this.almacen.fechaModificacion,
        });

        form.controls['mismaDireccionCliente'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(!!this.almacenGroup){
                this.cambiarValidatorsDireccion(!!this.almacenGroup.controls['mismaDireccionCliente'].value);
            }
		});

        return form;
    }

    newAlmacen(): void {
        this.almacenGroup = this.createAlmacenForm(null, this.cliente);
        this.almacenGroupIndex = null;
        this.almacenes.push(this.almacenGroup);
        this.almacenEnEdicion = true;
    }

    cambiarValidatorsDireccion(required: boolean) {
		let direccionRequiredValidators: any[] = [];
		if (!required) {
			direccionRequiredValidators = [Validators.required];
		}

		this.almacenGroup.controls.domicilio.setValidators(direccionRequiredValidators.concat([Validators.maxLength(250)]));
		this.almacenGroup.controls.domicilio.updateValueAndValidity();
		this.almacenGroup.controls.cp.setValidators(direccionRequiredValidators.concat([Validators.maxLength(10)]));
		this.almacenGroup.controls.cp.updateValueAndValidity();
		this.almacenGroup.controls.colonia.setValidators(direccionRequiredValidators.concat([Validators.maxLength(250)]));
		this.almacenGroup.controls.colonia.updateValueAndValidity();
		this.almacenGroup.controls.ciudad.setValidators(direccionRequiredValidators.concat([Validators.maxLength(100)]));
		this.almacenGroup.controls.ciudad.updateValueAndValidity();
		this.almacenGroup.controls.pais.setValidators(direccionRequiredValidators);
		this.almacenGroup.controls.pais.updateValueAndValidity();
		this.almacenGroup.controls.estado.setValidators(direccionRequiredValidators);
		this.almacenGroup.controls.estado.updateValueAndValidity();
		this.almacenGroup.controls.telefono.setValidators(direccionRequiredValidators.concat([Validators.maxLength(100)]));
		this.almacenGroup.controls.telefono.updateValueAndValidity();
	}

    cancelarAlmacen(form: FormGroup): void {
        if (this.almacenGroupIndex == null) {
            this.almacenes.removeAt(this.almacenes.controls.length - 1);
        }

        this.almacenEnEdicion = false;
    }

    editarAlmacen(selectedAlmacen: FormGroup, index: number): void {
        this.almacenGroup = this.createAlmacenForm(selectedAlmacen.getRawValue(), this.cliente);
        this.almacenGroupIndex = index;
        this.almacenEnEdicion = true;
    }

    addAlmacen(): void {
        if (this.almacenGroup.valid) {
            if (this.almacenGroupIndex != null) {
                this.almacenes.controls[this.almacenGroupIndex] = this.createAlmacenForm(this.almacenGroup.getRawValue(), this.cliente);
            }

            this.almacenEnEdicion = false;
        } else {
            for (const key of Object.keys(this.almacenGroup.controls)) {
                if (this.almacenGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();

                        break;
                    }
                }
            }

            this._clienteService.cargando = false;

            this.almacenGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }
        
    }
}