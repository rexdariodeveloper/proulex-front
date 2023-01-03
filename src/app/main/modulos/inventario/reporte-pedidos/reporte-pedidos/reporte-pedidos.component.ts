import { Component, ViewEncapsulation } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';

@Component({
    selector: 'reporte-pedidos',
    templateUrl: './reporte-pedidos.component.html',
    styleUrls: ['./reporte-pedidos.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ReportePedidosComponent {

    filtros: FieldConfig[];
    filtrosOpciones: any;
    private _unsubscribeAll: Subject<any>;

    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
    localidades: any[] = [];
    listadoLocalidades: any[] = [];

    config: FichaListadoConfig;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
		private _fichasDataService: FichasDataService,
		private _matSnackBar: MatSnackBar
	) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.config = {
            localeEN: english,
            localeES: spanish,
            icono: "toc",
            columnaId: "id",
            rutaDestino: "",
            columns: [
                {
                    name: 'pedido',
                    title: this.translate.instant('TABLA.PEDIDO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                {
                    name: 'fechaPedido',
                    title: this.translate.instant('TABLA.FECHA_PEDIDO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: 'fecha',
                    tooltip: false
                },
                {
                    name: 'origen',
                    title: this.translate.instant('TABLA.ORIGEN'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                /*{
                    name: 'destino',
                    title: this.translate.instant('TABLA.DESTINO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },*/
                {
                    name: 'codigoArticulo',
                    title: this.translate.instant('TABLA.CODIGO_ART'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                {
                    name: 'isbn',
                    title: this.translate.instant('TABLA.ISBN'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                {
                    name: 'articulo',
                    title: this.translate.instant('TABLA.ARTICULO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                {
                    name: 'um',
                    title: this.translate.instant('TABLA.UM'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: null,
                    tooltip: false
                },
                {
                    name: 'cantidadPedido',
                    title: this.translate.instant('TABLA.CANTIDAD_PEDIDO'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false
                },
                {
                    name: 'cantidadSurtida',
                    title: this.translate.instant('TABLA.CANTIDAD_SURTIDO'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false
                },
                {
                    name: 'fechaSurtido',
                    title: this.translate.instant('TABLA.FECHA_SURTIDO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: 'fecha',
                    tooltip: false
                },
                {
                    name: 'transito',
                    title: this.translate.instant('TABLA.TRANSITO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: 'decimal2',
                    tooltip: false
                },
                {
                    name: 'cantidadRecibida',
                    title: this.translate.instant('TABLA.CANTIDAD_RECIBO'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false
                },
                {
                    name: 'fechaRecibo',
                    title: this.translate.instant('TABLA.FECHA_RECIBO'),
                    class: "mat-column-flex",
                    centrado: false,
                    type: 'fecha',
                    tooltip: false
                },
                {
                    name: 'cantidadPendiente',
                    title: this.translate.instant('TABLA.CANTIDAD_PENDIENTE'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false
                },
                {
                    name: 'costo',
                    title: this.translate.instant('TABLA.COSTO'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false,
                    prefijo: '$'
                },
                {
                    name: 'total',
                    title: this.translate.instant('TABLA.TOTAL'),
                    class: "mat-column-flex",
                    centrado: true,
                    type: 'decimal2',
                    tooltip: false,
                    prefijo: '$'
                }
            ],
            reordenamiento: false,
            displayedColumns: ['pedido','fechaPedido','origen','codigoArticulo', 'isbn', 'articulo','um','cantidadPedido','cantidadSurtida','fechaSurtido', 'transito','cantidadRecibida','fechaRecibo','cantidadPendiente', 'costo', 'total'],
            columasFechas: ['fechaPedido','fechaSurtido','fechaRecibo'],
            listadoMenuOpciones: []
        };
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._fichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {

					console.log('datos',datos);

                    if (datos?.localidades) {

                        let localidades = datos.localidades.filter(loc => loc.id > 0);
                        let almacenes = datos.almacenes.filter(alm => alm.id > 0);
                        let estatusValidos = ["Por surtir","Surtido parcial","Surtido","Completo","Cerrado"];
                        let estatus = datos.estatus.filter(cmm => estatusValidos.includes(cmm.valor));

                        this.filtros = [
                            {
                                type: "input",
                                label: this.translate.instant('DESDE'),
                                inputType: "date",
                                name: "fechaDesde",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('HASTA'),
                                inputType: "date",
                                name: "fechaHasta",
                                validations: []
                            },
                            {
                                type: "input",
                                label: this.translate.instant('CODIGO'),
                                inputType: "text",
                                name: "codigo",
                                validations: []
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('LOCALIDAD_ORIGEN'),
                                name: "localidades",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: localidades,
                                campoValor: 'nombre',
                                values: ['almacen.nombre','nombre']
                            },
                            {
                                type: "pixvsMatSelect",
                                label: this.translate.instant('ESTATUS'),
                                name: "estatus",
                                formControl: new FormControl(null),
                                validations: [],
                                multiple: true,
                                selectAll: false,
                                list: estatus,
                                campoValor: 'valor',
                                values: ['valor']
                            },
                            {
                                type: "button",
                                label: "Save",
                                hidden: true
                            }
                        ];

                        this.filtrosOpciones = [{
                            title: 'EXCEL',
                            icon: 'arrow_downward',
                            tipo: FichaListadoConfig.EXCEL,
                            url: '/api/v1/pedidos/report/download/excel'
                        }];
                    }else if(!datos.datos?.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.SIN_REGISTROS'), 'OK', {
							duration: 5000,
						});
					}
                }
            );
    }
}