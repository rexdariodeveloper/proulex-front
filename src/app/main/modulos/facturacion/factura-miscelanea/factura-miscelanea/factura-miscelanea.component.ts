import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { locale as english } from '../factura-miscelanea-listado/i18n/en';
import { locale as spanish } from '../factura-miscelanea-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { FacturaMiscelaneaService } from './factura-miscelanea.service';
import { ConceptoDialogComponent, ConceptoDialogData } from './dialogs/concepto.dialog';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { JsonResponse } from '@models/json-response';
import { FacturacionDescargasService } from '../../descargas.service';
import { SATUsoCFDIComboProjection } from '@models/sat-uso-cfdi';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { FormaPagoComboProjection } from '@app/main/modelos/FormaPago';
import * as moment from 'moment';
import { TablaService } from './tabla.service';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { FacturasRelacionService } from '../../facturas-relacion.service';
import { FacturaRelacionDialogData, FacturaRelacionDialogComponent } from '../../dialogs/factura-relacion.dialog';
import { MotivoCancelacionDialogComponent, MotivoCancelacionDialogData } from '../../dialogs/motivo-cancelacion.dialog';
import { DatosFacturacion } from '@app/main/modelos/datos-facturacion';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';

@Component({
    selector: 'factura-miscelanea',
    templateUrl: './factura-miscelanea.component.html',
    styleUrls: ['./factura-miscelanea.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FacturaMiscelaneaComponent {

    private URL = "/api/v1/cxcfacturas-miscelanea/";
    private rutaDestino = "/app/facturacion/factura-miscelanea/ver/";

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    factura: CXCFactura;
    form: FormGroup;

    sedeControl: FormControl = new FormControl();
    rfcClienteControl: FormControl = new FormControl();
    formaPagoControl: FormControl = new FormControl();
    metodoPagoControl: FormControl = new FormControl();
    monedaControl: FormControl = new FormControl();
    usoCFDIControl: FormControl = new FormControl();
    tipoRelacionControl: FormControl = new FormControl();

    listSedes: SucursalComboProjection[];
    listRFCCliente: DatosFacturacion[];
    listFormaPago: FormaPagoComboProjection[];
    listMetodoPago: ControlMaestroMultipleComboSimpleProjection[];
    listMoneda: MonedaComboProjection[];
    listUsoCFDI: SATUsoCFDIComboProjection[];
    listUsoCFDIFiltrado: SATUsoCFDIComboProjection[] = [];
    listUnidadMedida: UnidadMedidaComboProjection[];
    listObjetoImpuesto: ControlMaestroMultipleComboSimpleProjection[];
    listTipoRelacion: ControlMaestroMultipleComboSimpleProjection[];
    listMotivosCancelacion: ControlMaestroMultipleComboSimpleProjection[];

    //Tabla Artículos
    tablaArticulos = [];
    contadorRegistros = 0;

    columnasTabla: any[] = [
        {
            name: 'cantidad',
            title: "Cantidad",
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'descripcion',
            title: "Descripción",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'unidadMedida.nombre',
            title: "UM",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'claveProdServ',
            title: "Clave de producto",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'objetoImpuesto.referencia',
            title: "Objeto impuesto",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'valorUnitario',
            title: "Precio unitario",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'descuento',
            title: "Descuento",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'iva',
            title: "% IVA",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'importeIVA',
            title: "Monto IVA",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'ieps',
            title: "% IEPS",
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'iepsCuotaFija',
            title: "IEPS Cuota fija",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'importeIEPS',
            title: "Monto IEPS",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'total',
            title: "Total",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'borrar',
            title: '',
            class: "mat-column-80",
            centrado: true,
            type: 'delete',
            tooltip: false
        }
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['cantidad', 'descripcion', 'unidadMedida.nombre', 'claveProdServ', 'objetoImpuesto.referencia', 'valorUnitario', 'descuento', 'iva', 'importeIVA', 'ieps', 'iepsCuotaFija', 'importeIEPS', 'total', 'borrar'];

    //Tabla Facturas Relación
    tablaFacturasRelacion = [];

    columnasTablaFacturasRelacion: any[] = [
        {
            name: 'fecha',
            title: "Fecha Factura",
            class: "mat-column-flex flex-40",
            centrado: false,
            type: 'fecha',
            tooltip: false
        },
        {
            name: 'folio',
            title: "Factura",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'receptorRFC',
            values: ['receptorRFC', 'receptorNombre'],
            title: "Receptor",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'total',
            title: "Monto Factura",
            class: "mat-column-flex",
            centrado: false,
            type: 'money',
            tooltip: false
        },
        {
            name: 'tipoRelacion.valor',
            title: "Tipo de Relación",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'borrar',
            title: '',
            class: "mat-column-80",
            centrado: true,
            type: 'delete',
            tooltip: false
        }
    ];
    columnasFechasFacturasRelacion: string[] = ['fecha'];
    displayedColumnsFacturasRelacion: string[] = ['fecha', 'folio', 'receptorRFC', 'total', 'tipoRelacion.valor', 'borrar'];

    // Private
    private _unsubscribeAll: Subject<any>;
    private _numeroFormatoPipe: NumeroFormatoPipe = new NumeroFormatoPipe();
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
        public _facturaService: FacturaMiscelaneaService,
        public _tablaService: TablaService,
        public _facturasRelacionService: FacturasRelacionService,
        public _impuestosService: ImpuestosArticuloSATService,
        public _descargasService: FacturacionDescargasService,
        public validatorService: ValidatorService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this._facturaService.translate = this.translate;

        // Set the default
        this.factura = new CXCFactura();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/facturacion/factura-miscelanea",
                rutaBorrar: this.URL + "delete/",
                icono: "view_list"
            }
        });

        // Subscribe to update usuario on changes
        this._facturaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.listSedes = datos.listSedes;
                this.listRFCCliente = datos.listRFCCliente;
                this.listFormaPago = datos.listFormaPago;
                this.listMetodoPago = datos.listMetodoPago;
                this.listMoneda = datos.listMoneda;
                this.listUsoCFDI = datos.listUsoCFDI;
                this.listUsoCFDIFiltrado = this.listUsoCFDI;
                this.listUnidadMedida = datos.listUnidadMedida;
                this.listObjetoImpuesto = datos.listObjetoImpuesto;
                this.listTipoRelacion = datos.listTipoRelacion;
                this.listMotivosCancelacion = datos.listMotivosCancelacion;
                this.factura = datos.factura || new CXCFactura();

                this.form = this.createForm();

                let tablaArticulos = datos.factura?.detalles || [];

                tablaArticulos.forEach(modelo => {
                    modelo.impuestos.forEach(impuesto => {
                        if (impuesto.clave === '002') {
                            modelo.iva = (impuesto.tasaOCuota * 100);
                        } else if (impuesto.clave === '003') {
                            modelo.ieps = (impuesto.tipoFactor === 'Tasa' ? (impuesto.tasaOCuota * 100) : null);
                            modelo.iepsCuotaFija = (impuesto.tipoFactor === 'Cuota' ? impuesto.tasaOCuota : null);
                        }
                    });

                    var valores = this._impuestosService.getMontos(modelo.cantidad, modelo.valorUnitario, modelo.descuento, modelo.iva, modelo.ieps, modelo.iepsCuotaFija);

                    modelo.subtotal = valores.subtotal;
                    modelo.importeIVA = valores.iva;
                    modelo.importeIEPS = valores.ieps;
                    modelo.total = valores.total;
                });

                this.tablaArticulos = [...tablaArticulos];
                this._tablaService.setDatos(this.tablaArticulos);

                let tablaFacturasRelacion = this.factura.facturasRelacionadas || [];

                tablaFacturasRelacion.forEach(registro => {
                    registro.total = 0;

                    let detalles = registro.detalles;

                    detalles.forEach(modelo => {
                        modelo.impuestos.forEach(impuesto => {
                            if (impuesto.clave === '002') {
                                modelo.iva = (impuesto.tasaOCuota * 100);
                            } else if (impuesto.clave === '003') {
                                modelo.ieps = (impuesto.tipoFactor === 'Tasa' ? (impuesto.tasaOCuota * 100) : null);
                                modelo.iepsCuotaFija = (impuesto.tipoFactor === 'Cuota' ? impuesto.tasaOCuota : null);
                            }
                        });

                        var valores = this._impuestosService.getMontos(modelo.cantidad, modelo.valorUnitario, modelo.descuento, modelo.iva, modelo.ieps, modelo.iepsCuotaFija);

                        registro.total += valores.total;
                    });
                });

                this.tablaFacturasRelacion = [...tablaFacturasRelacion];
                this._facturasRelacionService.setDatos(this.tablaFacturasRelacion);

                if (this.pageType == 'ver') {
                    this.form.disable({ emitEvent: false });

                    this.displayedColumns = ['cantidad', 'descripcion', 'unidadMedida.nombre', 'claveProdServ', 'objetoImpuesto.referencia', 'valorUnitario', 'descuento', 'iva', 'importeIVA', 'ieps', 'iepsCuotaFija', 'importeIEPS', 'total'];
                    this.displayedColumnsFacturasRelacion = ['fecha', 'folio', 'receptorRFC', 'total', 'tipoRelacion.valor'];
                    
                    this.titulo = (this.factura.serie ? this.factura.serie + ' ' : '') + this.factura.folio;
                } else {
                    this.form.enable({ emitEvent: false });
                }

                this.usoCFDIControl.disable();
                this.form.get('fecha').disable();
            });

        this._facturaService.onRFCChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos == false) {
                    this.rfcClienteControl.setValue(null);
                }
            });
    }

    createForm(): FormGroup {
        var monedaPredeterminada = this.listMoneda.filter(model => { return model.predeterminada; })[0];

        this.sedeControl = new FormControl(this.factura?.sucursal, [Validators.required]);
        this.rfcClienteControl = new FormControl(this.factura?.datosFacturacion, [Validators.required]);
        this.formaPagoControl = new FormControl(this.factura?.formaPago, [Validators.required]);
        this.metodoPagoControl = new FormControl(this.factura?.metodoPago, [Validators.required]);
        this.monedaControl = new FormControl(this.factura?.moneda || monedaPredeterminada, [Validators.required]);
        this.usoCFDIControl = new FormControl(this.factura?.receptorUsoCFDI, [Validators.required]);

        this.rfcClienteControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: DatosFacturacion) => {
            this.listUsoCFDIFiltrado = [];
            this.usoCFDIControl.setValue(null);

            if (this.pageType == 'ver' || !this.rfcClienteControl.value) {
                this.usoCFDIControl.disable();
            } else {
                this.usoCFDIControl.enable();
            }

            if (this.pageType == 'ver' || this.rfcClienteControl.value.alumno) {
                this.metodoPagoControl.disable();

                this.metodoPagoControl.setValue(this.listMetodoPago.find(x => { return x.referencia == 'PUE'}));
            } else {
                this.metodoPagoControl.enable();
            }

            if (!!data) {
                this.listUsoCFDI.forEach(usoCFDI => {
                    if ((data.tipoPersonaId === ControlesMaestrosMultiples.CMM_RFC_TipoPersona.FISICA && usoCFDI.fisica === true)
                        || (data.tipoPersonaId === ControlesMaestrosMultiples.CMM_RFC_TipoPersona.MORAL && usoCFDI.moral === true)) {
                        var existe = usoCFDI.regimenesFiscales.filter(model => {
                            return model.id === data.regimenFiscalId;
                        })[0];

                        if (existe) {
                            this.listUsoCFDIFiltrado.push(usoCFDI);
                        }
                    }
                });

                this._facturaService.validarRFC(data.rfc);
            }
        });

        let form = this._formBuilder.group({
            id: [this.factura.id],
            fecha: new FormControl(moment(this.factura?.fecha || new Date()).format('DD/MM/YYYY'), [Validators.required]),
            sede: this.sedeControl,
            rfcCliente: this.rfcClienteControl,
            formaPago: this.formaPagoControl,
            metodoPago: this.metodoPagoControl,
            moneda: this.monedaControl,
            usoCFDI: this.usoCFDIControl,
            diasCredito: new FormControl(this.factura?.diasCredito || 0, [Validators.required, Validators.min(0)]),
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
        if (this._facturaService.cargando) {
            return;
        }

        this._facturaService.cargando = true;

        if (this.form.valid) {
            this.form.disable({ emitEvent: false });

            if (this._tablaService.getDatos().length == 0) {
                this._facturaService.cargando = false;
                this.form.enable({ emitEvent: false });

                this._matSnackBar.open('No se han agregado Artículos por facturar.', 'OK', { duration: 5000 });

                return;
            }

            var modelo = this.form.getRawValue();

            let factura = {
                formaPagoId: modelo.formaPago.id,
                diasCredito: modelo.diasCredito,
                monedaId: modelo.moneda.id,
                metodoPagoId: modelo.metodoPago.id,
                receptorUsoCFDIId: modelo.usoCFDI.id,
                datosFacturacionId: modelo.rfcCliente.id,
                sucursalId: modelo.sede.id,
                detalles: [],
                facturasRelacionadas: null
            }

            this._tablaService.getDatos().forEach(modelo => {
                let detalle = {
                    claveProdServ: modelo.claveProdServ,
                    noIdentificacion: 'S/C',
                    descripcion: modelo.descripcion,
                    unidadMedidaId: modelo.unidadMedidaId,
                    unidadMedida: modelo.unidadMedida,
                    cantidad: modelo.cantidad,
                    valorUnitario: modelo.valorUnitario,
                    importe: modelo.subtotal,
                    descuento: modelo.descuento,
                    objetoImpuestoId: modelo.objetoImpuestoId,
                    objetoImpuesto: modelo.objetoImpuesto,
                    impuestos: []
                }

                let impuestoIVA = {
                    clave: '002',
                    nombre: 'IVA',
                    tipoFactor: (modelo.ivaExento || modelo.importeIVA == 0 ? 'Exento' : 'Tasa'),
                    base: (detalle.importe - detalle.descuento),
                    tasaOCuota: (modelo.iva / 100),
                    importe: modelo.importeIVA,
                }

                detalle.impuestos.push(impuestoIVA);

                if (modelo.importeIEPS > 0) {
                    let impuestoIEPS = {
                        clave: '003',
                        nombre: 'IEPS',
                        tipoFactor: (modelo.iepsCuotaFijaCheckControl ? 'Cuota' : 'Tasa'),
                        base: (detalle.importe - detalle.descuento),
                        tasaOCuota: modelo.iepsCuotaFija || (modelo.ieps / 100),
                        importe: modelo.importeIEPS,
                    }

                    detalle.impuestos.push(impuestoIEPS);
                }

                factura.detalles.push(detalle);
            });

            if (this._facturasRelacionService.getDatos().length) {
                let facturasRelacionadas = [];

                this._facturasRelacionService.getDatos().forEach(registro => {
                    let facturaRelacionar = {
                        id: registro.id,
                        tipoRelacionId: registro.tipoRelacionId,
                        tipoRelacion: registro.tipoRelacion
                    };

                    facturasRelacionadas.push(facturaRelacionar);
                });

                factura.facturasRelacionadas = facturasRelacionadas;
            }

            this._facturaService.guardar(factura, this.URL + 'save/').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });

                        this.factura = result.data;

                        this.descargarXML();
                        this.descargarPDF();

                        this.router.navigate([this.rutaDestino + this.hashid.encode(this.factura.id)]);
                    } else {
                        this._facturaService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._facturaService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    nuevoArticulo() {
        this.modalShow();
    }

    onEditar(id) {
        if (!this.factura.id) {
            this.modalShow(this._tablaService.getDatos()[this.getRowIndex(id)]);
        }
    }

    modalShow(articulo?: any): void {
        let dialogData: ConceptoDialogData = {
            articulo: articulo,
            listUnidadMedida: this.listUnidadMedida,
            listObjetoImpuesto: this.listObjetoImpuesto,

            onAceptar: this.onAceptarDialog.bind(this)
        };

        const dialogRef = this.dialog.open(ConceptoDialogComponent, {
            width: '600px',
            data: dialogData
        });
    }

    createCamposListado() {
        return [
            {
                type: 'pixvsMatSelect',
                label: 'Sede',
                name: 'sede',
                formControl: this.sedeControl,
                multiple: false,
                selectAll: false,
                list: [].concat(this.listSedes),
                campoValor: 'nombre',
                values: ['codigoSucursal', 'nombre'],
                elementsPerScroll: 100,
                validations: [],
            },
            {
                type: 'input',
                label: 'Nota de Venta',
                inputType: 'text',
                name: 'Miscelanea',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: 'Este campo es requerido'
                    }
                ],
            }
        ];
    }

    onAceptarDialog(articulo: any) {
        let tablaArticulos: any[] = this._tablaService.getDatos();

        let index = this.getRowIndex(articulo.id);

        if (index != null) {
            tablaArticulos[index] = articulo;
        } else {
            this.contadorRegistros -= 1;
            articulo.id = this.contadorRegistros;
            tablaArticulos.push(articulo);
        }

        this._tablaService.setDatos(tablaArticulos);
    }

    getRowIndex(id: number) {
        let index: number = null;
        this._tablaService.getDatos().forEach((registro, i) => { index = registro.id == id ? i : index; });
        return index;
    }

    agregarFacturaRelacion() {
        this.sedeControl.setValue(null);
        this.modalShowFacturaRelacion();
    }

    modalShowFacturaRelacion(): void {
        let dialogData: FacturaRelacionDialogData = {
            camposListado: this.createCamposListadoFacturaRelacion(),
            onAceptar: this.onAceptarDialogFacturaRelacion.bind(this),
            listadoSedes: this.listSedes,
            listadoTiposRelacion: this.listTipoRelacion
        };

        const dialogRef = this.dialog.open(FacturaRelacionDialogComponent, {
            width: '800px',
            data: dialogData
        });
    }

    createCamposListadoFacturaRelacion() {
        return [
            {
                type: 'pixvsMatSelect',
                label: 'Sede',
                name: 'sede',
                formControl: this.sedeControl,
                multiple: false,
                selectAll: false,
                list: [].concat(this.listSedes),
                campoValor: 'nombre',
                values: ['codigoSucursal', 'nombre'],
                elementsPerScroll: 100,
                validations: [],
            },
            {
                type: 'pixvsMatSelect',
                label: 'Tipo de Relación',
                name: 'tipoRelacion',
                formControl: this.tipoRelacionControl,
                multiple: false,
                selectAll: false,
                list: [].concat(this.listTipoRelacion),
                campoValor: 'valor',
                elementsPerScroll: 100,
                validations: [],
            },
            {
                type: 'input',
                label: 'Factura',
                inputType: 'text',
                name: 'factura',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: 'Este campo es requerido'
                    }
                ],
            }
        ];
    }

    onAceptarDialogFacturaRelacion(factura: any) {
        let tablaFacturasRelacion: any[] = this._facturasRelacionService.getDatos();

        if (factura) {
            let facturaId = factura.id;
            let index = this.getRowIndex(facturaId);

            if (index == null) {
                tablaFacturasRelacion.push(factura);
            }
        }

        this.tablaFacturasRelacion = [...tablaFacturasRelacion];
        this._facturasRelacionService.setDatos(this.tablaFacturasRelacion);
    }

    getRowIndexFacturaRelacion(facturaId: number) {
        let index: number = null;
        this._facturasRelacionService.getDatos().forEach((registro, i) => { index = registro.id == facturaId ? i : index; });
        return index;
    }

    getTotales() {
        var subtotal = 0;
        var descuento = 0;
        var iva = 0;
        var ieps = 0;
        var total = 0;

        this._tablaService.getDatos().forEach(modelo => {
            subtotal += modelo.subtotal;
            descuento += this._numeroFormatoPipe.stringMoneyToNumber(modelo.descuento);
            iva += modelo.importeIVA;
            ieps += modelo.importeIEPS;
            total += modelo.total;
        });

        const valores = {
            subtotal: this.redondear(subtotal),
            descuento: this.redondear(descuento),
            iva: this.redondear(iva),
            ieps: this.redondear(ieps),
            total: this.redondear(total)
        };

        return valores;
    }

    private redondear(cantidad: number = 0, decimales: number = 6): number {
        return Number(Math.round(parseFloat(cantidad + 'e' + decimales)) + 'e-' + decimales);
    }

    cancelar(): void {
        this.modalShowMotivoCancelacion();
    }

    modalShowMotivoCancelacion(): void {
        let dialogData: MotivoCancelacionDialogData = {
            onAceptar: this.onAceptarDialogMotivoCancelacion.bind(this),
            listMotivosCancelacion: this.listMotivosCancelacion,
        };

        const dialogRef = this.dialog.open(MotivoCancelacionDialogComponent, {
            width: '400px',
            data: dialogData
        });
    }

    onAceptarDialogMotivoCancelacion(motivoCancelacionId: any) {
        if (this._facturaService.cargando) {
            return;
        }

        this._facturaService.cargando = true;

        this._facturaService.cancelarFactura(this.factura.id, motivoCancelacionId).then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });

                    this.router.navigate([this.config.rutaAtras]);
                } else {
                    this._facturaService.cargando = false;
                }
            }.bind(this)
        );
    }

    descargarXML(): void {
        this._facturaService.descargarArchivo(this.factura.id, 'xml');
    }

    descargarPDF(): void {
        this._facturaService.descargarArchivo(this.factura.id, 'pdf');
    }
}