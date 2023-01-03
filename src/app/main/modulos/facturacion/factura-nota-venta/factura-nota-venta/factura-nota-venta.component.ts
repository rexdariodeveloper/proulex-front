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
import { locale as english } from '../factura-nota-venta-listado/i18n/en';
import { locale as spanish } from '../factura-nota-venta-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { FacturaNotaVentaService } from './factura-nota-venta.service';
import { NotaVentaDialogComponent, NotaVentaDialogData } from './dialogs/nota-venta.dialog';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { OrdenesVentaService } from './ordenes-venta.service';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { JsonResponse } from '@models/json-response';
import { FacturacionDescargasService } from '../../descargas.service';
import { SATUsoCFDIComboProjection } from '@models/sat-uso-cfdi';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { FacturasRelacionService } from '../../facturas-relacion.service';
import { FacturaRelacionDialogData, FacturaRelacionDialogComponent } from '../../dialogs/factura-relacion.dialog';
import { MotivoCancelacionDialogData, MotivoCancelacionDialogComponent } from '../../dialogs/motivo-cancelacion.dialog';
import { DatosFacturacion } from '@app/main/modelos/datos-facturacion';

@Component({
    selector: 'factura-nota-venta',
    templateUrl: './factura-nota-venta.component.html',
    styleUrls: ['./factura-nota-venta.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FacturaNotaVentaComponent {

    private URL = "/api/v1/cxcfacturas-nota-venta/";
    private rutaDestino = "/app/facturacion/factura-nota-venta/ver/";

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

    rfcClienteControl: FormControl = new FormControl();
    usoCFDIControl: FormControl = new FormControl();
    sedeControl: FormControl = new FormControl();
    tipoRelacionControl: FormControl = new FormControl();

    listRFCCliente: DatosFacturacion[];
    listUsoCFDI: SATUsoCFDIComboProjection[];
    listUsoCFDIFiltrado: SATUsoCFDIComboProjection[] = [];
    listSedes: SucursalComboProjection[];
    listTipoRelacion: ControlMaestroMultipleComboSimpleProjection[];
    listMotivosCancelacion: ControlMaestroMultipleComboSimpleProjection[];

    //Tabla Ordenes Venta
    tablaOrdenesVenta = [];

    columnasTabla: any[] = [
        {
            name: 'fecha',
            title: "Fecha Venta",
            class: "mat-column-flex flex-40",
            centrado: false,
            type: 'fecha',
            tooltip: false
        },
        {
            name: 'codigo',
            title: "Nota de Venta",
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'subtotal',
            title: "Subtotal",
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
            name: 'impuestos',
            title: "Impuestos",
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
    columnasFechas: string[] = ['fecha'];
    displayedColumns: string[] = ['fecha', 'codigo', 'subtotal', 'descuento', 'impuestos', 'total', 'borrar'];

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
        public _facturaService: FacturaNotaVentaService,
        public _ordenesVentaService: OrdenesVentaService,
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
                rutaAtras: "/app/facturacion/factura-nota-venta",
                rutaBorrar: this.URL + "delete/",
                icono: "note"
            }
        });

        // Subscribe to update usuario on changes
        this._facturaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.listRFCCliente = datos.listRFCCliente;
                this.listUsoCFDI = datos.listUsoCFDI;
                this.listUsoCFDIFiltrado = this.listUsoCFDI;
                this.listSedes = datos.listSedes;
                this.listTipoRelacion = datos.listTipoRelacion;
                this.listMotivosCancelacion = datos.listMotivosCancelacion;
                this.factura = datos.factura || new CXCFactura();

                this.form = this.createForm();

                let tablaOrdenesVenta = datos.detalles || [];
                this.tablaOrdenesVenta = [...tablaOrdenesVenta];
                this._ordenesVentaService.setDatos(this.tablaOrdenesVenta);

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

                    this.displayedColumns = ['fecha', 'codigo', 'subtotal', 'descuento', 'impuestos', 'total'];
                    this.displayedColumnsFacturasRelacion = ['fecha', 'folio', 'receptorRFC', 'total', 'tipoRelacion.valor'];

                    this.titulo = (this.factura.serie ? this.factura.serie + ' ' : '') + this.factura.folio;
                } else {
                    this.form.enable({ emitEvent: false });
                }

                this.usoCFDIControl.disable();
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
        this.rfcClienteControl = new FormControl(this.factura?.datosFacturacion, [Validators.required]);
        this.usoCFDIControl = new FormControl(this.factura?.receptorUsoCFDI, [Validators.required]);
        this.sedeControl = new FormControl(null, [Validators.required]);
        this.tipoRelacionControl = new FormControl(null, [Validators.required]);
        
        this.rfcClienteControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: DatosFacturacion) => {
            this.listUsoCFDIFiltrado = [];
            this.usoCFDIControl.setValue(null);

            if (this.pageType == 'ver' || !this.rfcClienteControl.value) {
                this.usoCFDIControl.disable();
            } else {
                this.usoCFDIControl.enable();
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
            rfcCliente: this.rfcClienteControl,
            usoCFDI: this.usoCFDIControl,
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

    guardar(previsualizar: boolean = false) {
        if (this._facturaService.cargando) {
            return;
        }

        this._facturaService.cargando = true;

        if (this.form.valid) {
            this.form.disable({ emitEvent: false });

            let sucursalId: number;
            let ordenesVentaId: number[] = [];

            this._ordenesVentaService.getDatos().forEach(registro => {
                if (!sucursalId) {
                    sucursalId = registro.sucursalId;
                }

                ordenesVentaId.push(registro.id);
            });

            if (ordenesVentaId.length == 0) {
                this._facturaService.cargando = false;
                this.form.enable({ emitEvent: false });

                this._matSnackBar.open('No se han agregado Notas de Venta por facturar.', 'OK', { duration: 5000 });

                return;
            }

            let facturasRelacionadas = null;
            
            if (this._facturasRelacionService.getDatos().length) {
                facturasRelacionadas = {};

                this._facturasRelacionService.getDatos().forEach(registro => {
                    facturasRelacionadas[registro.id] = registro.tipoRelacionId;
                });
            }

            let body = {
                datosFacturacionId: this.rfcClienteControl.value.id,
                usoCFDIId: this.usoCFDIControl.value.id,
                sucursalId: sucursalId,
                ordenesVentaId: ordenesVentaId,
                facturasRelacionadas: facturasRelacionadas,
                previsualizar: previsualizar
            }

            this._facturaService.guardar(JSON.stringify(body), this.URL + 'save/').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
						
                        this.factura = result.data;

                        this.descargarXML();
                        this.descargarPDF();
                        
                        this.router.navigate([this.rutaDestino + this.hashid.encode(this.factura.id)]);
                    }

                    this._facturaService.cargando = false;
                    this.form.enable({ emitEvent: false });

                    if (previsualizar) {
                        this.previsualizarFactura(result.message);
                    }
                }.bind(this)
            );
        } else {
            this._facturaService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    agregarNotaVenta() {
        this.sedeControl.setValue(null);
        this.modalShow();
    }

    modalShow(): void {
        let dialogData: NotaVentaDialogData = {
            camposListado: this.createCamposListado(),
            onAceptar: this.onAceptarDialog.bind(this),
            listadoSedes: this.listSedes,
        };

        const dialogRef = this.dialog.open(NotaVentaDialogComponent, {
            width: '800px',
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
                name: 'notaVenta',
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

    onAceptarDialog(notaVenta: any) {
        let tablaOrdenesVenta: any[] = this._ordenesVentaService.getDatos();

        if (notaVenta) {
            let notaVentaId = notaVenta.id;
            let index = this.getRowIndex(notaVentaId);

            if (index == null) {
                tablaOrdenesVenta.push(notaVenta);
            }
        }

        this.tablaOrdenesVenta = [...tablaOrdenesVenta];
        this._ordenesVentaService.setDatos(this.tablaOrdenesVenta);
    }

    getRowIndex(notaVentaId: number) {
        let index: number = null;
        this._ordenesVentaService.getDatos().forEach((registro, i) => { index = registro.id == notaVentaId ? i : index; });
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
        var impuestos = 0;
        var total = 0;

        this._ordenesVentaService.getDatos().forEach(modelo => {
            subtotal += modelo.subtotal;
            descuento += modelo.descuento;
            impuestos += modelo.impuestos;
            total += modelo.total;
        });

        const valores = {
            subtotal: this.redondear(subtotal),
            descuento: this.redondear(descuento),
            impuestos: this.redondear(impuestos),
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
        this._facturaService.cargando = true;

        this._facturaService.descargarArchivo(this.factura.id, 'xml').then(
            function (result: JsonResponse) {
                this._facturaService.cargando = false;
            }.bind(this)
        );
    }

    descargarPDF(): void {
        this._facturaService.cargando = true;

        this._facturaService.descargarArchivo(this.factura.id, 'pdf').then(
            function (result: JsonResponse) {
                this._facturaService.cargando = false;
            }.bind(this)
        );
    }

    previsualizarFactura(xmlString): void {
        this._facturaService.cargando = true;
        this.form.disable({ emitEvent: false });

        this._facturaService.previsualizarFactura(xmlString).then(
            function (result: JsonResponse) {
                this._facturaService.cargando = false;
                this.form.enable({ emitEvent: false });
            }.bind(this)
        );
    }
}