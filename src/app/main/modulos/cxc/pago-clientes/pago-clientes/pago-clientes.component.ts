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
import { locale as english } from '../pago-clientes-listado/i18n/en';
import { locale as spanish } from '../pago-clientes-listado/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PagoClientesService } from './pago-clientes.service';
import { FacturasService } from './facturas.service';
import { CXCFactura } from '@app/main/modelos/cxcfactura';
import { JsonResponse } from '@models/json-response';
import { CuentaBancariaComboProjection } from '@app/main/modelos/cuentas';
import { ClienteCuentaBancaria } from '@app/main/modelos/cliente-cuenta-bancaria';
import { FormaPagoComboProjection } from '@app/main/modelos/FormaPago';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { ValidatorService } from '@services/validators.service';
import * as moment from 'moment';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';
import { CXCPagoDetalle } from '@app/main/modelos/cxcpago-detalle';

@Component({
    selector: 'pago-clientes',
    templateUrl: './pago-clientes.component.html',
    styleUrls: ['./pago-clientes.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PagoClientesComponent {

    private URL = "/api/v1/cxcpago-clientes/";

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    //Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String = 'Pago de clientes - Detalle';
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    saldo: any;
    form: FormGroup;

    cuentaBancariaControl: FormControl = new FormControl();
    cuentaEmisorControl: FormControl = new FormControl();
    formaPagoControl: FormControl = new FormControl();
    monedaControl: FormControl = new FormControl();

    listCuentasBancarias: CuentaBancariaComboProjection[];
    listClienteCuentasBancarias: ClienteCuentaBancaria[];
    listFormaPago: FormaPagoComboProjection[];
    listMoneda: MonedaComboProjection[];
    listMonedasParidad: any[];
    fechaSistema: any;

    //Tabla Facturas
    columnasTabla: any[] = [
        { name: 'seleccionado', title: "", class: "mat-column-60", centrado: false, type: 'selection' },
        { name: 'sede', title: "Sede", class: "mat-column-flex", centrado: false, type: null },
        { name: 'folio', title: "Folio", class: "mat-column-160", centrado: false, type: null },
        { name: 'fecha', title: "Fecha", class: "mat-column-120", centrado: false, type: 'fecha' },
        { name: 'monto', title: "Monto", class: "mat-column-160", centrado: false, type: 'money' },
        { name: 'saldo', title: "Saldo", class: "mat-column-160", centrado: false, type: 'money' },
        { name: 'montoPago', title: "Monto de pago", class: "mat-column-160", centrado: false, type: 'money', editable: true },
        { name: 'metodoPago', title: "Método de pago", class: "mat-column-100", centrado: false, type: null }
    ];
    columnasFechas: string[] = ['fecha'];
    displayedColumns: string[] = ['seleccionado', 'sede', 'folio', 'fecha', 'monto', 'saldo', 'montoPago', 'metodoPago'];

    //Private
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
        public _pagoService: PagoClientesService,
        public _facturasService: FacturasService,
        public validatorService: ValidatorService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this._pagoService.translate = this.translate;

        //Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/cxc/pago-clientes",
                rutaBorrar: this.URL + "delete/",
                icono: "payment"
            }
        });

        //Subscribe to update usuario on changes
        this._pagoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.saldo = datos.saldo;
                this.listCuentasBancarias = datos.listCuentasBancarias;
                this.listClienteCuentasBancarias = datos.listClienteCuentasBancarias;
                this.listFormaPago = datos.listFormaPago;
                this.listMoneda = datos.listMoneda;
                this.listMonedasParidad = datos.listMonedasParidad;
                this.fechaSistema = datos.fechaSistema;

                this.listMoneda.forEach(moneda => {
                    moneda.tipoCambioOficial = (this.listMonedasParidad.filter(x => x.monedaId == moneda.id)[0]).tipoCambioOficial;
                });

                this.form = this.createForm();
                this.habilitarCampos();
                this._facturasService.setDatos(datos.facturas || []);
            });
    }

    createForm(): FormGroup {
        var cuentaPredeterminada = this.listCuentasBancarias.filter(model => { return model.codigo === '00-000000000'; })[0];
        var monedaPredeterminada = this.listMoneda.filter(model => { return model.predeterminada; })[0];

        this.cuentaBancariaControl = new FormControl(cuentaPredeterminada, []);
        this.formaPagoControl = new FormControl(null, [Validators.required]);
        this.cuentaEmisorControl = new FormControl(null, []);
        this.monedaControl = new FormControl(monedaPredeterminada, [Validators.required]);

        this.monedaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: MonedaComboProjection) => {
            this.habilitarCampos();

            this.form.controls['tipoCambio'].setValue(this.monedaControl.value?.tipoCambioOficial);
        });

        let form = this._formBuilder.group({
            id: [null],
            cuentaBancaria: this.cuentaBancariaControl,
            formaPago: this.formaPagoControl,
            fecha: new FormControl(moment(new Date()).format('YYYY-MM-DD'), [Validators.required]),
            numeroOperacion: new FormControl(null, [Validators.maxLength(100)]),
            monto: new FormControl(null, [Validators.required, Validators.min(0.000001), Validators.max(this.saldo.saldo)]),
            cuentaEmisor: this.cuentaEmisorControl,
            moneda: this.monedaControl,
            tipoCambio: new FormControl(this.monedaControl.value?.tipoCambioOficial, [Validators.required]),
            timbrar: new FormControl(true, [])
        });

        return form;
    }

    ngOnDestroy(): void {
        //Unsubscribe from all subscriptions
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
        if (this._pagoService.cargando) {
            return;
        }

        this._pagoService.cargando = true;

        if (this.form.valid) {
            let validar: any = this.validarTabla();

            if (!validar.valido) {
                this._pagoService.cargando = false;
                this._matSnackBar.open(validar.mensaje, 'OK', { duration: 5000 });

                return;
            }

            this.form.disable({ emitEvent: false });

            var modelo = this.form.getRawValue();

            let cuentaEmisor = modelo.cuentaEmisor;
            let cuentaBeneficiario = modelo.cuentaBancaria;

            let facturas: CXCFactura[] = [];

            this._facturasService.getDatos().forEach(registro => {
                let importePagado: number = this._numeroFormatoPipe.stringMoneyToNumber(registro.montoPago);

                if (importePagado > 0) {
                    let insertar: boolean = false;

                    let factura: CXCFactura = facturas.find(factura => {
                        return factura.datosFacturacionId == registro.datosFacturacionId
                            && (!modelo.timbrar || factura.metodoPagoTemp == registro.metodoPago);
                    });

                    if (!factura) {
                        factura = {
                            sucursalId: null,
                            datosFacturacionId: registro.datosFacturacionId,
                            pago: {
                                fecha: modelo.fecha,
                                formaPagoId: modelo.formaPago.id,
                                formaPago: modelo.formaPago,
                                monedaId: modelo.moneda.id,
                                moneda: modelo.moneda,
                                tipoCambio: modelo.tipoCambio,
                                noOperacion: modelo.numeroOperacion || null,
                                cuentaOrdenante: cuentaEmisor?.cuenta || null,
                                cuentaOrdenanteEmisorRFC: cuentaEmisor?.banco?.rfc || null,
                                cuentaOrdenanteNombreBanco: cuentaEmisor?.banco?.razonSocial || cuentaEmisor?.banco?.nombre || null,
                                cuentaBeneficiarioId: cuentaBeneficiario?.id || null,
                                cuentaBeneficiario: cuentaBeneficiario?.clabe || cuentaBeneficiario?.codigo || null,
                                cuentaBeneficiarioEmisorRFC: cuentaBeneficiario?.banco?.rfc || null,
                                detalles: []
                            },
                            total: 0,
                            timbrar: modelo.timbrar && registro.metodoPago === 'PPD',
                            metodoPagoTemp: registro.metodoPago,
                            fechaCreacion: this.fechaSistema
                        };

                        insertar = true;
                    }

                    let pagoDetalle: CXCPagoDetalle = {
                        doctoRelacionadoId: registro.facturaId,
                        noParcialidad: registro.noParcialidad,
                        importeSaldoAnterior: registro.saldo,
                        importePagado: importePagado,
                        importeSaldoInsoluto: registro.saldo - importePagado,
                        objetoImpuestoId: 2000970 //CMM_SAT_ObjetoImp - No objeto de impuesto.
                    }

                    if (importePagado > factura.total) {
                        factura.total = importePagado;
                        factura.sucursalId = registro.sedeId;
                    }

                    factura.pago.detalles.push(pagoDetalle);

                    if (insertar) {
                        facturas.push(factura);
                    }
                }
            });

            this._pagoService.guardar(facturas, this.URL + 'save/').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });

                        let facturasArchivos: CXCFactura[] = result.data;

                        facturasArchivos.forEach(factura => {
                            if (factura.uuid) {
                                this.descargarXML(factura.id)
                            }

                            this.descargarPDF(factura.id);
                        });

                        this.router.navigate([this.config.rutaAtras]);
                    } else {
                        this._pagoService.cargando = false;
                        this.form.enable({ emitEvent: false });
                        this.habilitarCampos();
                    }
                }.bind(this)
            );
        } else {
            this._pagoService.cargando = false;
            this.form.enable({ emitEvent: false });
            this.habilitarCampos();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    habilitarCampos() {
        if (this.monedaControl.value && this.monedaControl.value.codigo === 'MXN') {
            this.form.controls['tipoCambio'].disable();
        } else {
            this.form.controls['tipoCambio'].enable();
        }
    }

    validarTabla() {
        let tabla: any[] = this._facturasService.getDatos();

        if (!tabla.length || !tabla.filter(x => x.montoPago).length) {
            return { valido: false, mensaje: 'No se han agregado Facturas por pagar.' };
        } else if (this.getBalance() != 0) {
            return { valido: false, mensaje: 'El balance Saldo total / Monto aplicado debe ser ' + this._numeroFormatoPipe.transform(0) };
        } else {
            let mensaje = '';

            tabla.forEach(registro => {
                if (!mensaje && registro.saldo < this._numeroFormatoPipe.stringMoneyToNumber(registro.montoPago)) {
                    mensaje = 'El monto de pago para la Factura [' + registro.folio + '] excede el saldo.'
                }
            });

            if (mensaje) {
                return { valido: false, mensaje: mensaje };
            }
        }

        return { valido: true };
    }

    getBalance() {
        let montoPago = this.form.controls['monto'].value || 0;
        let montoAplicado = 0;

        this._facturasService.getDatos().forEach(registro => {
            montoAplicado += this._numeroFormatoPipe.stringMoneyToNumber(registro.montoPago);
        });

        return montoPago - montoAplicado;
    }

    onSelecionar(event) {
        let tabla: any[] = this._facturasService.getDatos();
        let index = this.getRowIndex(event.id);

        let saldoDisponible = this.getBalance();
        let montoPago = event.seleccionado && saldoDisponible > 0 ? saldoDisponible > tabla[index].saldo ? tabla[index].saldo : saldoDisponible : null;

        tabla[index].montoPago = this._numeroFormatoPipe.transform(montoPago);
    }

    onCellValueChange(event) {
        let tabla: any[] = this._facturasService.getDatos();
        let index = this.getRowIndex(event.id);

        tabla[index].seleccionado = this._numeroFormatoPipe.stringMoneyToNumber(event.nuevoValor) > 0;
    }

    getRowIndex(id: number) {
        let index: number = null;
        this._facturasService.getDatos().forEach((registro, i) => { index = registro.facturaId == id ? i : index; });
        return index;
    }

    descargarXML(id: number): void {
        this._pagoService.descargarArchivo(id, 'xml');
    }

    descargarPDF(id: number): void {
        this._pagoService.descargarArchivo(id, 'pdf');
    }
}