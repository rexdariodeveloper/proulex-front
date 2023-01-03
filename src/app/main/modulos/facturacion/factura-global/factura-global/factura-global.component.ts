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
import { locale as english } from '../factura-global-listado/i18n/en';
import { locale as spanish } from '../factura-global-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { FacturaGlobalService } from './factura-global.service';
import { NotaVentaDialogComponent, NotaVentaDialogData } from './dialogs/nota-venta.dialog';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { OrdenesVentaService } from './ordenes-venta.service';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { JsonResponse } from '@models/json-response';
import { FacturacionGlobalNotaVentaProjection, FacturacionGlobalImpuestosNotaVentaProjection } from '@app/main/modelos/orden-venta';
import { PixvsMatAccordionCell } from '@pixvs/componentes/mat-accordion/mat-accordion.component';
import { FacturacionDescargasService } from '../../descargas.service';
import { SATPeriodicidadComboProjection } from '@models/sat-periodicidad';
import { SATMesComboProjection } from '@models/sat-mes';
import { FacturaRelacionDialogComponent, FacturaRelacionDialogData } from '../../dialogs/factura-relacion.dialog';
import { ImpuestosArticuloSATService } from '@app/main/services/impuestos-articulo-sat.service';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { FacturasRelacionService } from '../../facturas-relacion.service';
import { MotivoCancelacionDialogData, MotivoCancelacionDialogComponent } from '../../dialogs/motivo-cancelacion.dialog';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';

@Component({
    selector: 'factura-global',
    templateUrl: './factura-global.component.html',
    styleUrls: ['./factura-global.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class FacturaGlobalComponent {

    private URL = "/api/v1/cxcfacturas-global/";
    private rutaDestino = "/app/facturacion/factura-global/ver/";

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

    esVersion4: boolean;
    filtrosNotasVenta: any;
    periodicidadControl: FormControl = new FormControl();
    mesesControl: FormControl = new FormControl();
    anioControl: FormControl = new FormControl();
    sedeControl: FormControl = new FormControl();
    tipoRelacionControl: FormControl = new FormControl();

    listPeriodicidades: SATPeriodicidadComboProjection[];
    listMeses: SATMesComboProjection[];
    listMesesFiltrado: SATMesComboProjection[];
    listAnios: Anio[] = [];
    listSedes: SucursalComboProjection[];
    listPlanteles: SucursalPlantelComboProjection[];
    listTipoRelacion: ControlMaestroMultipleComboSimpleProjection[];
    listMotivosCancelacion: ControlMaestroMultipleComboSimpleProjection[];

    //Tabla Ordenes Venta
    tablaOrdenesVenta = [];

    columnasTabla: any[] = [
        { name: 'cantidad', title: "Cantidad", class: "mat-column-flex flex-40", centrado: false, type: null, tooltip: false },
        { name: 'unidad', title: "Unidad", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'claveProdServ', title: "Clave Producto", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'noIdentificacion', title: "No. Identificación", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'descripcion', title: "Descripción", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'valorUnitario', title: "Valor Unitario", class: "mat-column-flex", centrado: false, type: 'decimal2', tooltip: false },
        { name: 'subtotal', title: "Subtotal", class: "mat-column-flex", centrado: false, type: 'decimal2', tooltip: false },
        { name: 'descuento', title: "Descuento", class: "mat-column-flex", centrado: false, type: 'decimal2', tooltip: false },
        { name: 'impuestos', title: "Impuestos", class: "mat-column-flex", centrado: false, type: 'decimal2', tooltip: false },
        { name: 'total', title: "Total", class: "mat-column-flex", centrado: false, type: 'decimal2', tooltip: false },
        { name: 'borrar', title: '', class: "mat-column-80", centrado: true, type: 'delete', tooltip: false }
    ];
    columnasFechas: string[] = [''];
    displayedColumns: string[] = ['cantidad', 'unidad', 'claveProdServ', 'noIdentificacion', 'descripcion', 'valorUnitario', 'subtotal', 'descuento', 'impuestos', 'total', 'borrar'];

    data: any[] = [];
    headers: PixvsMatAccordionCell[] = [];
    details: PixvsMatAccordionCell[] = [
        { name: 'Impuesto', value: 'nombre', flex: '0 0 20%' },
        { name: 'Tipo Factor', value: 'tipoFactor', flex: '0 0 20%' },
        { name: 'Base', value: 'base', flex: '0 0 20%', type: 'money' },
        { name: 'Tasa o Cuota', value: 'tasaOCuota', flex: '0 0 20%', type: 'decimal2' },
        { name: 'Importe', value: 'importe', flex: '0 0 20%', type: 'money' }
    ]

    //Tabla Facturas Relación
    tablaFacturasRelacion = [];

    columnasTablaFacturasRelacion: any[] = [
        { name: 'fecha', title: "Fecha Factura", class: "mat-column-flex flex-40", centrado: false, type: 'fecha', tooltip: false },
        { name: 'folio', title: "Factura", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'receptorRFC', values: ['receptorRFC', 'receptorNombre'], title: "Receptor", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'total', title: "Monto Factura", class: "mat-column-flex", centrado: false, type: 'money', tooltip: false },
        { name: 'tipoRelacion.valor', title: "Tipo de Relación", class: "mat-column-flex", centrado: false, type: null, tooltip: false },
        { name: 'borrar', title: '', class: "mat-column-80", centrado: true, type: 'delete', tooltip: false }
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
        public _facturaService: FacturaGlobalService,
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
                rutaAtras: "/app/facturacion/factura-global",
                rutaBorrar: this.URL + "delete/",
                icono: "event_note"
            }
        });

        // Subscribe to update usuario on changes
        this._facturaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.listSedes = datos?.listSedes || [];
                this.listPlanteles = datos?.listPlanteles || [];
                this.listPeriodicidades = datos?.listPeriodicidades || [];
                this.listMeses = datos?.listMeses || [];
                this.listMesesFiltrado = this.listMeses;
                this.listTipoRelacion = datos?.listTipoRelacion || [];
                this.listMotivosCancelacion = datos?.listMotivosCancelacion || [];
                this.factura = datos.factura || new CXCFactura();
                this.esVersion4 = datos.esVersion4 || false;

                if (this.factura.id) {
                    this.listAnios.push(new Anio(this.factura.anio));
                } else {
                    var anioActual = new Date().getFullYear();

                    this.listAnios.push(new Anio(anioActual - 1));
                    this.listAnios.push(new Anio(anioActual));
                }

                this.form = this.createForm();

                let notasVenta: FacturacionGlobalNotaVentaProjection[] = datos.notasVenta;

                if (notasVenta) {
                    let impuestos: FacturacionGlobalImpuestosNotaVentaProjection[] = datos.impuestos;

                    if (impuestos) {
                        notasVenta.forEach(notaVenta => {
                            notaVenta.impuestosDetalles = impuestos.filter(impuesto => impuesto.ordenVentaId == notaVenta.id);
                        });
                    }

                    this.setDatosTablas(notasVenta || []);
                }

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

                this.displayedColumns = ['cantidad', 'unidad', 'claveProdServ', 'noIdentificacion', 'descripcion', 'valorUnitario', 'subtotal', 'descuento', 'impuestos', 'total'];

                if (this.pageType == 'ver') {
                    this.form.disable({ emitEvent: false });

                    this.headers = [
                        { name: 'Cantidad', value: 'cantidad', flex: '0 0 7%', type: 'decimal2' },
                        { name: 'Unidad', value: 'unidad', flex: '0 0 7%' },
                        { name: 'Clave Producto', value: 'claveProdServ', flex: '0 0 10%' },
                        { name: 'No. Identificación', value: 'noIdentificacion', flex: '0 0 12%' },
                        { name: 'Descripción', value: 'descripcion', flex: '0 0 10%' },
                        { name: 'Valor Unitario', value: 'valorUnitario', flex: '0 0 10%', type: 'money' },
                        { name: 'Subtotal', value: 'subtotal', flex: '0 0 10%', type: 'money' },
                        { name: 'Descuento', value: 'descuento', flex: '0 0 10%', type: 'money' },
                        { name: 'Impuestos', value: 'impuestos', flex: '0 0 10%', type: 'money' },
                        { name: 'Total', value: 'total', flex: '0 0 10%', type: 'money' }
                    ];

                    this.displayedColumnsFacturasRelacion = ['fecha', 'folio', 'receptorRFC', 'total', 'tipoRelacion.valor'];

                    this.titulo = (this.factura.serie ? this.factura.serie + ' ' : '') + this.factura.folio;
                } else {
                    this.form.enable({ emitEvent: false });

                    this.headers = [
                        { name: 'Cantidad', value: 'cantidad', flex: '0 0 7%', type: 'decimal2' },
                        { name: 'Unidad', value: 'unidad', flex: '0 0 7%' },
                        { name: 'Clave Producto', value: 'claveProdServ', flex: '0 0 10%' },
                        { name: 'No. Identificación', value: 'noIdentificacion', flex: '0 0 12%' },
                        { name: 'Descripción', value: 'descripcion', flex: '0 0 10%' },
                        { name: 'Valor Unitario', value: 'valorUnitario', flex: '0 0 10%', type: 'money' },
                        { name: 'Subtotal', value: 'subtotal', flex: '0 0 10%', type: 'money' },
                        { name: 'Descuento', value: 'descuento', flex: '0 0 10%', type: 'money' },
                        { name: 'Impuestos', value: 'impuestos', flex: '0 0 10%', type: 'money' },
                        { name: 'Total', value: 'total', flex: '0 0 10%', type: 'money' },
                        { name: '', value: '', flex: '0 0 4%', type: 'delete' }
                    ];
                }

                this.mesesControl.disable();
            });
    }

    createForm(): FormGroup {
        this.sedeControl = new FormControl(null, [Validators.required]);
        this.periodicidadControl = new FormControl(this.factura?.periodicidad, [Validators.required]);
        this.mesesControl = new FormControl(this.factura?.mes, [Validators.required]);
        this.anioControl = new FormControl(new Anio(this.factura?.id ? this.factura.anio : new Date().getFullYear()), [Validators.required]);

        this.periodicidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: SATPeriodicidadComboProjection) => {
            this.listMesesFiltrado = [];
            this.mesesControl.setValue(null);

            if (this.pageType == 'ver' || !this.periodicidadControl.value) {
                this.mesesControl.disable();
            } else {
                this.mesesControl.enable();
            }

            if (!!data) {
                this.listMeses.forEach(mes => {
                    if ((data.codigo != "05" && mes.periodicidad == null) || (mes.periodicidad?.id === data.id)) {
                        this.listMesesFiltrado.push(mes);
                    }
                });
            }
        });

        let form = this._formBuilder.group({
            id: [this.factura.id],
            periodicidad: this.periodicidadControl,
            meses: this.mesesControl,
            anio: this.anioControl,
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
                sucursalId: sucursalId,
                periodicidadId: this.periodicidadControl.value?.id || null,
                mesId: this.mesesControl.value?.id || null,
                anio: this.anioControl.value?.id || null,
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

    agregarNotasVenta() {
        this.sedeControl.setValue(null);
        this.modalShow();
    }

    modalShow(): void {
        let dialogData: NotaVentaDialogData = {
            camposListado: this.createCamposListado(),
            onAceptar: this.onAceptarDialog.bind(this),
            listadoSedes: this.listSedes,
            listadoPlanteles: this.listPlanteles
        };

        const dialogRef = this.dialog.open(NotaVentaDialogComponent, {
            width: '300px',
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
                validations: [],
            },
            {
                type: 'input',
                label: 'Fecha Inicio',
                inputType: 'date',
                name: 'fechaInicio',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: 'Este campo es requerido'
                    }
                ],
            },
            {
                type: 'input',
                label: 'Fecha Fin',
                inputType: 'date',
                name: 'fechaFin',
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

    onAceptarDialog(notasVenta: any, filtrosNotasVenta: any) {
        this.setDatosTablas([]);

        if (notasVenta) {
            this.setDatosTablas(notasVenta);
        }

        if (!!filtrosNotasVenta) {
            this.filtrosNotasVenta = filtrosNotasVenta;
        }
    }

    getRowIndex(notaVentaId: number) {
        let index: number = null;
        this._ordenesVentaService.getDatos().forEach((registro, i) => { index = registro.id == notaVentaId ? i : index; });
        return index;
    }

    setDatosTablas(tablaOrdenesVenta) {
        this.tablaOrdenesVenta = [...tablaOrdenesVenta];
        this._ordenesVentaService.setDatos(this.tablaOrdenesVenta);

        let rows = [];
        this.tablaOrdenesVenta.forEach(notaVenta => {
            let row = notaVenta;

            row.children = notaVenta.impuestosDetalles;

            rows.push(row);
        });

        this.data = [].concat(rows);
    }

    recargarTabla(data) {
        this.setDatosTablas(data);
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

    exportarExcel(): void {
        if (this._facturaService.cargando) {
            return;
        }

        if (this._ordenesVentaService.getDatos().length == 0) {
            this._matSnackBar.open('No se han agregado Notas de Venta por facturar.', 'OK', { duration: 5000 });

            return;
        }

        this._facturaService.cargando = true;
        this.form.disable({ emitEvent: false });

        this._facturaService.exportarNotasVenta(this.filtrosNotasVenta).then(
            function (result: JsonResponse) {
                this._facturaService.cargando = false;
                this.form.enable({ emitEvent: false });
            }.bind(this)
        );
    }
}

class Anio {
    public id?: number;
    public valor?: number;

    public constructor(id) {
        this.id = id;
        this.valor = id;
    }
}