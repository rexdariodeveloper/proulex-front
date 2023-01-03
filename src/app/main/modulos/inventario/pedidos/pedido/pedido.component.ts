import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { ArticuloDialogComponent, ArticuloDialogData } from './dialogs/articulo/articulo.dialog';

import { PedidoService } from './pedido.service';
import { Pedido, PedidoMovimiento, PedidoProjection } from '@app/main/modelos/pedido';
import { PedidoDetalleProjection } from '@app/main/modelos/pedido-detalle';

import * as moment from 'moment';
import { PixvsTablaSimpleComponent } from '@pixvs/componentes/tablas/simple/tabla-simple.component';
import { PedidoDetalleService } from './pedido-detalle.service';
import { ComponentesDialogComponent, ComponentesDialogData } from './dialogs/componentes/componentes.dialog';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { MatTableDataSource } from '@angular/material/table';

@Component({
    selector: 'pedido',
    templateUrl: './pedido.component.html',
    styleUrls: ['./pedido.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PedidoComponent {

    private URL: string = '/api/v1/pedidos';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    @ViewChild('tablaArticulos') vwTablaArticulos: PixvsTablaSimpleComponent;

    @ViewChild('localidadOrigenSelect') localidadOrigenSelect: PixvsMatSelectComponent;
    @ViewChild('localidadCEDISSelect') localidadCEDISSelect: PixvsMatSelectComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    // Controls
    form: FormGroup;
    currentId: number;
    fechaPedido: any;
    fechaActual: string = moment().format('YYYY-MM-DD');
    historial: any;

    // Private
    private pedido: Pedido;
    private _unsubscribeAll: Subject<any>;

    // Listados
    localidades: any[] = [];
    cedis: any[] = [];
    articulos: any[] = [];
    temporada: any[] = [];
    existencia: any[] = [];
    existenciaPaquetes: any[] = [];

    // Listados filtrados
    listadoLocalidadesOrigen: any[] = [];
    listadoLocalidadesCEDIS: any[] = [];
    listadoArticulosTemporada: any[] = [];
    listadoArticulosCedi: any[] = [];

    // Cbo Controls    
    articuloControl: FormControl = new FormControl();
    localidadOrigenControl: FormControl = new FormControl();
    localidadCEDISControl: FormControl = new FormControl();

    // Tabla Artículos
    tablaArticulos: any[] = [];
    columnasTabla: any[] = [
        {
            name: 'articulo.codigoArticulo',
            values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
            title: this.translate.instant('ARTICULO'),
            class: "mat-column-flex flex-40",
            centrado: false,
            type: null,
            tooltip: true,
            iconosInfo: [
                {
                    title: 'componentes',
                    icon: 'horizontal_split',
                    idExtra: 1,
                    comparacionMostrar: {
                        columna: 'articulo.articuloSubtipoId',
                        valorComparar: ArticulosSubtipos.PAQUETE_DE_LIBROS
                    }
                }
            ]
        },
        {
            name: 'unidadMedida',
            title: this.translate.instant('UM'),
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'minimo',
            title: this.translate.instant('MINIMO'),
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'maximo',
            title: this.translate.instant('MAXIMO'),
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'existencia',
            title: this.translate.instant('EXISTENCIA'),
            class: "mat-column-flex",
            centrado: true,
            type: 'decimal2',
            dir: 'rtl',
            tooltip: false
        },
        {
            name: 'cantidadPedida',
            title: this.translate.instant('CANTIDAD'),
            class: "mat-column-flex",
            centrado: true,
            type: 'decimal2',
            dir: 'rtl',
            tooltip: false
        },
        {
			name: 'acciones',
			title: 'Acciones',
			class: "mat-column-flex",
			centrado: true,
			type: 'acciones'
		}
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['articulo.codigoArticulo', 'unidadMedida', 'minimo', 'maximo', 'existencia', 'cantidadPedida', 'acciones'];
    camposListado: FieldConfig[] = [];
    detalles: any[] = [];
	listadoAccionesArticulos = [
		{
			title: 'Eliminar',
			tipo: '',
			icon: 'delete',
			accion: this.onBorrarArticulo.bind(this)
		}
	];

    articulosUsadosIds: { [id: number]: boolean } = {};

    movimientos: PedidoMovimiento[] = [];
	dataSourceMovimientos: MatTableDataSource<PedidoMovimiento> = new MatTableDataSource([]);
	displayedColumnsMovimientos: string[] = [
		'fecha',
        'codigoArticulo',
        'nombreArticulo',
        'um',
        'cantidadPedida',
        'cantidadRecibida',
        'cantidadAjuste',
        'almacen',
        'usuario'
	];

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
        public _pedidoService: PedidoService,
        public _detalleService: PedidoDetalleService,
        public validatorService: ValidatorService,
        public fechaPipe: FechaPipe,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/inventario/pedidos",
                rutaBorrar: this.URL + "/pedidos/delete/",
                rutaEnviar: this.URL + "/send/",
                rutaAprobar: this.URL + "/alerta/aprobar/",
                rutaRechazar: this.URL + "/alerta/rechazar/",
                icono: "redo"
            }
        });
        // Subscribe to update on changes
        this._pedidoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
				this.tablaArticulos = [];
                this.pedido = datos.pedido || new Pedido();

                (this.pedido?.detalles || []).forEach(detalle => {
                    this.articulosUsadosIds[detalle.articuloId] = true;
                });

                this.fechaPedido = datos.pedido ? datos.pedido.fecha.split(" ")[0] : this.fechaActual;

                this.localidades = datos.localidades.filter(loc => loc?.localidadGeneral);
                this.listadoLocalidadesOrigen = this.localidades;

                this.cedis = datos.localidades_todas.filter(loc => loc?.almacen?.esCedi && loc?.localidadGeneral);
                this.listadoLocalidadesCEDIS = this.cedis;

                this.listadoArticulosCedi = datos.articulosLocGeneral;

                if (this.pageType == 'ver') {
                    this.titulo = this.pedido.codigo;
                    this.form = this.createForm();
                    this.form.disable({ emitEvent: false });
                    if (this.pedido.estatusId == 2000260) {
                        this.pageType = 'editable';
                        this.form.enable();
                    }

                    if (!this.pedido?.id || this.pedido?.estatusId != 2000260) {
                        this.columnasTabla.pop();
                        this.displayedColumns.pop();
                    }
                } else if (this.pageType == 'alerta') {
                    this.titulo = this.translate.instant('TITULO');
                    this._pedidoService.datos = [];
                    this.form = this.createForm();
                    this.form.disable({ emitEvent: false });
                    this.form.controls['fecha'].disable();
                    if (this.listadoLocalidadesOrigen.length == 1)
                        this.form.controls['localidadOrigen'].setValue(this.listadoLocalidadesOrigen[0]);
                }
                else {
                    this.titulo = this.translate.instant('TITULO');
                    this._pedidoService.datos = [];
                    this.form = this.createForm();
                    this.form.enable({ emitEvent: false });

                    this.form.controls['fecha'].disable();

                    if (this.listadoLocalidadesOrigen.length == 1)
                        this.form.controls['localidadOrigen'].setValue(this.listadoLocalidadesOrigen[0]);
                }

                this.movimientos = datos.movimientos;
				this.dataSourceMovimientos.data = datos.movimientos;

                this.historial = datos.historial || [];
				if (!!this.pedido?.localidadOrigen){
            		this._pedidoService.getArticulos(this.URL + '/products/', this.pedido.localidadOrigen.id + '/localidad');
				}
            });

        this._pedidoService.onArticulosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos.articulos) {
                    this.articulos = [...new Map(datos.articulos.map(item => [item['id'], item])).values()];
                    this.temporada = datos.temporada;
                    this.existencia = datos.existencia;
                    this.existenciaPaquetes = datos.existenciaPaquetes || {};

                    let art_temporada_ids = this.temporada.map(temporada => temporada.articuloId);
                    this.listadoArticulosTemporada = this.articulos.filter(articulo => art_temporada_ids.includes(articulo.id));
                    this.articulosUsadosIds = {};
                }

                if (!!this.pedido.id) {
                    this.pedido.detalles.forEach(detalle => {
                        if (detalle.estatusId != 1000003) {
                            let articulo = this.listadoArticulosTemporada.filter(articulo => articulo.id == detalle.articuloId)[0];
                            if (!!articulo) {
                                let articuloVer: any = {};
                                articuloVer.articulo = articulo;

                                let id = articuloVer.articulo.id;
                                let temporada: any = this.temporada.filter(temporada => temporada.articuloId == id)[0];

                                articuloVer.articuloId = id;
                                articuloVer.pedidoId = id;
                                articuloVer.unidadMedidaId = articuloVer.articulo.unidadMedidaInventario.id;
                                articuloVer.unidadMedida = articuloVer.articulo.unidadMedidaInventario.nombre;
                                articuloVer.minimo = Number(temporada?.minimo);
                                articuloVer.maximo = Number(temporada?.maximo);
                                articuloVer.existencia = Number(detalle.existencia);
                                articuloVer.cantidadPedida = Number(detalle.cantidadPedida);

                                this.onAceptarDialog(articuloVer);
                            }
                        }
                    });

                    this.detalles = this.pedido.detalles;
                }
            });

    }

    ngAfterViewInit(): void {
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        this.localidadOrigenControl = new FormControl(this.pedido.localidadOrigen, [Validators.required]);
        this.localidadCEDISControl = new FormControl(this.pedido.localidadCEDIS, [Validators.required]);
        this.articuloControl = new FormControl(null, [Validators.required]);

        this.localidadOrigenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if (data) {
                this.tablaArticulos = [];
                this.listadoLocalidadesCEDIS = [].concat(this.cedis.filter(cedi => cedi.id != data.id));
                if (this.localidadCEDISSelect)
                    this.localidadCEDISSelect.setDatos(this.listadoLocalidadesCEDIS);
                if (this.listadoLocalidadesCEDIS.length == 1)
                    this.localidadCEDISControl.setValue(this.listadoLocalidadesCEDIS[0]);
                this._pedidoService.getArticulos(this.URL + '/products/', data?.almacen?.id + '/almacen');
            }
        });

        let form = this._formBuilder.group({
            id: [this.pedido.id],
            codigo: [this.pedido.codigo],
            fecha: [this.fechaPedido, Validators.required],
            localidadOrigen: this.localidadOrigenControl,
            localidadCEDIS: this.localidadCEDISControl,
            comentario: [this.pedido.comentario],
        });

        return form;
    }

    getExistencia(localidadId: number, articuloId: number) {
        let existencia = this.existencia.filter(exs => exs.articuloId == articuloId && exs.localidadId == localidadId)[0];
        return articuloId && localidadId ? (existencia ? existencia.cantidad : 0) : null;
    }

    isRequired(campo: string) {
        let form_field = this.form.get(campo);

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
        this._pedidoService.cargando = true;

        if (this.form.valid) {

            if (this.tablaArticulos.length == 0) {
                this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });
                this._pedidoService.cargando = false;
                return;
            }
            this.form.disable({ emitEvent: false });

            let pedidoDetalles: PedidoDetalleProjection[] = [];

            this.tablaArticulos.forEach(registro => {
                pedidoDetalles.push(new PedidoDetalleProjection(registro));
            });

            let pedido = new PedidoProjection(this.form.value, pedidoDetalles);

            if (this.detalles && this.detalles.length > 0) {
                this.detalles.forEach((detalle) => {
                    let e = pedido.detalles.find((d) => { return d.articuloId == detalle.articuloId });
                    if (!e) {
                        detalle.estatusId = 1000003;
                        pedido.detalles.push(detalle);
                    } else
                        e.id = detalle.id;
                });
            }

            this._pedidoService.guardar(pedido, this.URL + '/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO') + ' Pedido: ' + result.data, 'OK', { duration: 10000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._pedidoService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._pedidoService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    enviar() {
        this._pedidoService.cargando = true;

        if (this.form.valid) {

            if (this.tablaArticulos.length == 0) {
                this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });
                this._pedidoService.cargando = false;
                return;
            }
            this.form.disable({ emitEvent: false });

            let pedidoDetalles: PedidoDetalleProjection[] = [];

            this.tablaArticulos.forEach(registro => {
                pedidoDetalles.push(new PedidoDetalleProjection(registro));
            });

            let pedido = new PedidoProjection(this.form.value, pedidoDetalles);

            if (this.detalles && this.detalles.length > 0) {
                this.detalles.forEach((detalle) => {
                    let e = pedido.detalles.find((d) => { return d.articuloId == detalle.articuloId });
                    if (!e) {
                        detalle.estatusId = 1000003;
                        pedido.detalles.push(detalle);
                    } else
                        e.id = detalle.id;
                });
            }

            this._pedidoService.guardar(pedido, this.URL + '/send').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO') + ' Pedido: ' + result.data, 'OK', { duration: 10000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._pedidoService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._pedidoService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    agregarArticulo() {
        this.articuloControl.setValue(null);
        this.modalShow(null);
    }

    onEditar(articuloId: number) {
        if (this.pageType == 'ver')
            return;
        let articuloEditar = this.tablaArticulos[this.getRowIndex(articuloId)];
        this.articuloControl.setValue(articuloEditar);
        this.modalShow(articuloEditar);
    }

    onAceptarDialog(articulo: any) {
        this._detalleService.setDatos(this.tablaArticulos);
        let tablaArticulos: any[] = this._detalleService.getDatos();

        let articuloEditar: any = {};
        Object.assign(articuloEditar, articulo);

        let articuloId = articuloEditar.articulo.id;
        this.articulosUsadosIds[articuloId] = true;
        let index = this.getRowIndex(articuloId);

        if (index != null) {
            tablaArticulos[index].cantidadPedida = articuloEditar.cantidadPedida;
        } else {
            // articuloEditar.id = articuloId;
            articuloEditar.articuloId = articuloId;
            tablaArticulos.push(articuloEditar);
        }

        this.tablaArticulos = [].concat(tablaArticulos);
        this._detalleService.setDatos(this.tablaArticulos)

    }

    modalShow(articulo: any): void {
        
        let articulosTmp = this.listadoArticulosTemporada.filter(at => !this.articulosUsadosIds[at.id]);
        let articulos = articulosTmp.filter(at => !!this.listadoArticulosCedi.find(art => art.id) );
        if (articulo && articulo?.articulo)
            articulos.push(articulo?.articulo);

        //Call to createDialogFields function before show Dialog to get tralated labels.
        this.createDialogFields({ articulos: articulos });

        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            articuloControl: this.articuloControl,
            // camposListado: this.camposListado,
            onAceptar: this.onAceptarDialog.bind(this),
            localidadId: this.localidadOrigenControl.value ? this.localidadOrigenControl.value.id : null,
            articulos: articulos || this.listadoArticulosTemporada,
            existencias: this.existencia,
            existenciasPaquetes: this.existenciaPaquetes,
            temporada: this.temporada
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '50%',
            data: dialogData
        });
    }

    getRowIndex(articuloId: number) {
        let index: number = null;
        this.tablaArticulos.forEach((registro, i) => { index = ((registro.articuloId == articuloId) ? i : index); });
        return index;
    }

    private createDialogFields(obj) {
        this.camposListado = [
            {
                type: 'pixvsMatSelect',
                label: this.translate.instant('ARTICULO'),
                name: 'articulo',
                formControl: this.articuloControl,
                multiple: false,
                selectAll: false,
                list: obj?.articulos || this.listadoArticulosTemporada,
                campoValor: 'nombreArticulo',
                values: ['codigoArticulo', 'nombreArticulo'],
                elementsPerScroll: 100,
                validations: [],
            },
            {
                type: 'input',
                label: this.translate.instant('EXISTENCIA'),
                inputType: 'text',
                mask: "separator.4",
                name: 'existencia',
                validations: [],
                readonly: true,
            },
            {
                type: 'input',
                label: this.translate.instant('CANTIDAD'),
                inputType: 'text',
                mask: "separator.4",
                name: 'cantidadPedida',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: this.translate.instant('REQUERIDO')
                    }
                ],
            }
        ];
    }

    modalComponentesShow(articuloId: number): void {

        let dialogData: ComponentesDialogData = {
            articuloId,
			existencias: this.existencia,
            existenciasPaquetes: this.existenciaPaquetes
        };

        const dialogRef = this.dialog.open(ComponentesDialogComponent, {
            width: '50%',
            data: dialogData
        });
    }

    onIconoInfo(event) {
        if (event.idExtra == 1) {
            this.modalComponentesShow(event.element.articulo.id);
        }
    }

	onBorrarArticulo(articulo){
		this.articulosUsadosIds[articulo.articuloId] = false;
		this.tablaArticulos = this.tablaArticulos.filter(_articulo => {
			return _articulo.articuloId != articulo.articuloId;
		});
		this._detalleService.setDatos(this.tablaArticulos);
	}
}