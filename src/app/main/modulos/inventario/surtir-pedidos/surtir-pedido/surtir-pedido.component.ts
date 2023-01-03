import { Location, registerLocaleData } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation, TemplateRef, ElementRef } from '@angular/core';
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
import { ArticuloDialogComponent, ArticuloDialogData } from './dialogs/articulo.dialog';

import { Pedido } from '@app/main/modelos/pedido';
import { PedidoDetalleMovimiento } from '@app/main/modelos/pedido-detalle';
import * as moment from 'moment';
import { SurtirPedidoService } from './surtir-pedido.service';
import { FichasDataService } from '@services/fichas-data.service';
import { ListadoMenuOpciones } from '@models/ficha-listado-config';
import { PixvsTablaSimpleComponent } from '@pixvs/componentes/tablas/simple/tabla-simple.component';
import { PedidoService } from './pedido.service';
import { PedidoComentariosDialogComponent, PedidoComentariosDialogData } from './dialogs/comentarios/comentarios.dialog';
import { SurtirPedidosComponentesDialogComponent, SurtirPedidosComponentesDialogData } from './dialogs/componentes/componentes.dialog';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { InvoicePrintComponent, PedidoInvoiceData } from './prints/invoice.print';

@Component({
    selector: 'surtir-pedido',
    templateUrl: './surtir-pedido.component.html',
    styleUrls: ['./surtir-pedido.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class SurtirPedidoComponent {

    private URL: string = '/api/v1/pedidos';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    @ViewChild('localidadOrigenSelect') localidadOrigenSelect: PixvsMatSelectComponent;
    @ViewChild('localidadCEDISSelect')  localidadCEDISSelect:  PixvsMatSelectComponent;

    @ViewChild('printButton') printButton: ElementRef;
    @ViewChild('tablaArticulos') tabla: PixvsTablaSimpleComponent;

    @ViewChild(InvoicePrintComponent) invoice: InvoicePrintComponent;
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
    formSurtir: FormGroup;
    currentId: number;
    fechaPedido: any;
    fechaActual: string = moment().format('YYYY-MM-DD');

    // Private
    private pedido: Pedido;
    private _unsubscribeAll: Subject<any>;

    // Listados
    localidades: any[] = [];
    cedis: any[] = [];
    movimientos: any[] = [];
    articulos: any[] = [];
    temporada: any[] = [];
    existencia: any[] = [];
	existenciaPaquetes: any[] = [];

    localidadesAlmacen: any[] = [];

    // Listados filtrados
    listadoLocalidadesOrigen: any[] = [];
    listadoLocalidadesCEDIS: any[] = [];
    listadoArticulosTemporada: any[] = [];

    // Cbo Controls    
    articuloControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
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
            name: 'origen.nombre',
            values: ['origen.nombre'],
            title: this.translate.instant('LOCALIDAD'),
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: true
        },
        {
            name: 'existencia',
            title: this.translate.instant('EXISTENCIA'),
            class: "text-right",
            centrado: true,
            type: 'decimal2',
            tooltip: false,
            dir: 'rtl'
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
            name: 'requerida',
            title: this.translate.instant('REQUERIDA'),
            class: "text-right",
            centrado: true,
            type: 'decimal2',
            tooltip: false,
            dir: 'rtl'
        },
        {
            name: 'enviada',
            title: this.translate.instant('ENVIADA'),
            class: "w-100-p text-right",
            centrado: true,
            type: 'decimal2',
            tooltip: false,
            dir: 'rtl'
        },
        {
            name: 'surtir',
            title: this.translate.instant('SURTIR'),
            class: "mat-column-flex",
            centrado: true,
            type: 'decimal2',
            tooltip: false,
            dir: 'rtl'
        },
        {
            name: 'comentario',
            title: '',
            class: "mat-column-flex",
            centrado: false,
            type: 'acciones',
            listadoAcciones: [
                {
                    title: 'Comentarios',
                    tipo: '',
                    icon: 'message',
                    accion: this.onModalComentarios.bind(this)
                }
            ]
        },
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['articulo.codigoArticulo','origen.nombre', 'existencia', 'unidadMedida', 'requerida','enviada', 'surtir', 'comentario'];
    camposListado: FieldConfig[] = [];

    // Tabla Enviados
    enviados:any = {
        datos: [],
        columnasTabla: [
            {
                name: 'articulo.codigoArticulo',
                values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
                title: this.translate.instant('ARTICULO'),
                class: "mat-column-flex",
                centrado: false,
                type: null,
                tooltip: true
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
                name: 'fecha',
                title: this.translate.instant('FECHA'),
                class: "mat-column-flex",
                centrado: false,
                type: 'fecha-hora',
                tooltip: false
            },
            {
                name: 'enviada',
                title: this.translate.instant('ENVIADA'),
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false
            },
            {
                name: 'comentario',
                title: this.translate.instant('COMENTARIO'),
                class: "mat-column-flex",
                centrado: false,
                type: 'text',
                tooltip: false
            }
        ],
        columnasFechas: ['fecha'],
        displayedColumns: ['fecha','articulo.codigoArticulo', 'unidadMedida','enviada', 'comentario'],

    };

    // Tabla Imprimir
    imprimir: any = {
        datos: [],
        columns: ['codigo','descripcion','cantidad','costo','importe']
        //columns: ['articulo','um','existencia','requerida', 'surtir']
    };

    acciones: ListadoMenuOpciones[] = [
        {
            title:  'CERRAR',
            tipo:   null,
            icon:   'lock'
        }
    ];

    ocultarTablas: boolean = false;

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
        public _surtirPedidoService: SurtirPedidoService,
        public _auxService: FichasDataService,
        public _pedidoService: PedidoService,
        public validatorService: ValidatorService,
        public fechaPipe: FechaPipe,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    action(event){
        if(event?.option.title == "CERRAR")
            this._surtirPedidoService.updateStatus(this.URL+'/status',event.id);
    }

    ngOnInit(): void {
        this._surtirPedidoService.onStatusChanged.next({});

        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/inventario/surtir",
                rutaBorrar: this.URL + "/surtir/delete/",
                icono: "archive",
				rutaAprobar: this.URL + "/supply/alerta/aprobar/",
                rutaRechazar: this.URL + "/supply/alerta/rechazar/"
            };
			if(this.pageType == 'alerta'){
				this.acciones = [];
			}
        });
        // Subscribe to update on changes
        this._surtirPedidoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    this.pedido = datos.pedido || new Pedido();
                    this.fechaPedido = datos.pedido? datos.pedido.fecha.split(" ")[0] : this.fechaActual;
                    
                    this.localidades = datos.localidades_todas;
                    this.movimientos = datos.movimientos;
                    this.listadoLocalidadesOrigen = datos.localidades;
                    
                    this.cedis = datos.localidades_todas.filter( loc => loc?.almacen?.esCedi);
                    this.listadoLocalidadesCEDIS = this.cedis;

                    this.titulo = this.pedido?.codigo;
                    this.subTitulo = 'Estatus: ' + this.pedido?.estatus?.valor;
                    this._pedidoService.datos = [];
                    this.form = this.createForm();
                    this.formSurtir = this.createFormSurtir();

                    this.form.disable({ emitEvent: false });
                    this.formSurtir.disable({ emitEvent: false }); 
                    this.tablaArticulos = [];
                    this._surtirPedidoService.getArticulos(this.URL+'/products/',this.pedido.localidadCEDIS.id+'/localidad');
                }
            );

        this._surtirPedidoService.onStatusChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    if(datos.datos){
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                        this.router.navigate([this.config.rutaAtras])
                    }
                }
            );
        
        this._surtirPedidoService.onArticulosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe( datos => {
                
                if(datos.articulos){

                    if(!this.enEdicion){
                        this.articulos = datos.articulos;
                        this.temporada = datos.temporada;
                        this.existencia = datos.existencia;
						this.existenciaPaquetes = datos.existenciaPaquetes || {};

                        let art_temporada_ids = this.temporada.map( temporada => temporada.articuloId);
                        this.listadoArticulosTemporada = this.articulos.filter( articulo => art_temporada_ids.includes(articulo.id));
                    }
                }

                if(!!this.pedido.id && this.formSurtir.disabled){

                    this.pedido.detalles.forEach( detalle => {

                        if(detalle.estatusId == 1000001){
                            let articulo = this.listadoArticulosTemporada.filter( articulo => articulo.id == detalle.articuloId)[0];
                        
                            if(!!articulo){

                                let articuloVer: any = this.createArticuloVer(articulo,detalle,this.pedido.fechaModificacion);
                                if(this.pageType == 'alerta' || (articuloVer.requerida != articuloVer.enviada))
                                    this.onAceptarDialog(articuloVer);
                            }
                        }
                    });

                    let enviados = [];
                    this.movimientos.forEach( mov => {
                        let articulo = this.articulos.filter( articulo => articulo.id == mov.IM_ART_ArticuloId)[0];
                        if(!!articulo){
                            let articuloMovimiento: any = this.createArticuloMovimiento(articulo, mov);
                            enviados.push(articuloMovimiento);
                            this.enviados.datos = [].concat(enviados);
                            this._auxService.datos = [...this.enviados.datos];
                        }
                    });
                }
                this.ocultarTablas = true;
                setTimeout(() => {
                    this.ocultarTablas = false;
                });
            });
    }

    createArticuloVer(articulo,detalle, fechaModificacion){
        let row: any = {};
        row.articulo = articulo;
                            
        let id = row.articulo.id;
        let temporada: any = this.temporada.filter( temporada => temporada.articuloId == id)[0];
        let existencia: number = this.existenciaPaquetes[id] || this.existencia.filter( exs => exs.articuloId == id)[0]?.existencia;

        row.id = detalle.id;
        row.codigo = this.pedido.codigo;
        row.articuloId = id;
        row.pedidoId = detalle.pedidoId;
        row.fechaModificacion = fechaModificacion;
        row.unidadMedidaId = row.articulo.unidadMedidaInventario.id;
        row.unidadMedida = row.articulo.unidadMedidaInventario.nombre;
        row.minimo = Number(temporada?.minimo);
        row.maximo = Number(temporada?.maximo);
        row.existencia = Number(existencia);
        row.requerida = Number(detalle.cantidadPedida);
        row.enviada = Number(detalle.cantidadSurtida)
        row.comentario = '';
        row.origenId = this.pedido.localidadCEDISId;
        row.origen = this.pedido.localidadCEDIS;
        row.destinoId = this.pedido.localidadOrigenId;
        row.destino = this.pedido.localidadOrigen;

        if(row.requerida - row.enviada > row.existencia)
            row.surtir = row.existencia;
        else
            row.surtir = row.requerida - row.enviada;
        
        return row;
    }

    createArticuloMovimiento(articulo,mov){
        let row: any = {};

        row.articulo = articulo;
        row.articuloId = articulo.id;
        row.unidadMedidaId = row.articulo.unidadMedidaInventario.id;
        row.unidadMedida = row.articulo.unidadMedidaInventario.nombre;
        row.fecha = mov.IM_FechaCreacion;
        row.enviada = Number(mov.IM_Cantidad);
        row.comentario = mov.IM_Razon;
        
        return row;
    }

    calculateSendedAmount(articuloId): number {
        let sended:number = 0;
        let movs = this.movimientos.filter(mov => mov.IM_ART_ArticuloId == articuloId);
        movs.forEach( mov => sended += mov.IM_Cantidad);
        return Number(sended * -1);
    }

    ngAfterViewInit(): void {
        // if(!!this.pedido?.localidadOrigen)
        //     this._surtirPedidoService.getArticulos(this.URL+'/products/',this.pedido.localidadCEDIS.id+'/localidad');
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        this.localidadOrigenControl = new FormControl({value: this.pedido.localidadOrigen, disabled: true}, [Validators.required]);
        this.localidadCEDISControl  = new FormControl({value: this.pedido.localidadCEDIS, disabled: true},  [Validators.required]);
        this.articuloControl = new FormControl({value: null, disabled: true}, [Validators.required]);
        
        this.localidadOrigenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.tablaArticulos = [];
            this.listadoLocalidadesCEDIS = [].concat(this.cedis.filter(cedi => cedi.id != data.id));
            this.localidadCEDISSelect.setDatos(this.listadoLocalidadesCEDIS);
        });

        let form = this._formBuilder.group({
            id: [this.pedido.id],
            codigo: [this.pedido.codigo],
            fecha: [{value: this.fechaPedido, disabled: true}, Validators.required],
            localidadOrigen: this.localidadOrigenControl,
            localidadCEDIS: this.localidadCEDISControl,
            comentario: [{value: this.pedido.comentario, disabled: true}],
        });

        return form;
    }

    createFormSurtir(): FormGroup {

        let form = this._formBuilder.group({
            detalles: []
        });

        return form;
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
        this._surtirPedidoService.cargando = true;
            
        if (this.tablaArticulos.length == 0){
            this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });
            this._surtirPedidoService.cargando = false;
            return;
        }

        this.formSurtir.disable({ emitEvent: false });            

        let movimientosDetalles: PedidoDetalleMovimiento[] = [];

        let zeros: boolean = true;
        this.tablaArticulos.forEach(registro => {
            let movimiento = new PedidoDetalleMovimiento(registro);
            if(movimiento.surtir > 0){
                movimientosDetalles.push(movimiento);
                zeros = false;
            }
        });

        if(zeros){
            this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });
            this._surtirPedidoService.cargando = false;
            return;
        }

        this._surtirPedidoService.guardar(movimientosDetalles, this.URL + '/supply').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
					this._surtirPedidoService.cargando = true;
                    //this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                    //this.router.navigate([this.config.rutaAtras])
                    this.onPrint();
                } else {
                    this._surtirPedidoService.cargando = false;
                    this.formSurtir.enable({ emitEvent: false });
                }
            }.bind(this)
        );
    }

    agregarArticulo() {
        this.articuloControl.setValue(null);
        this.modalShow(null);
    }

    enEdicion = null;
    onEditar(articulo: any) {
        if(this.formSurtir.enabled){
            this.enEdicion = articulo?.id;
            let articuloEditar = this.tablaArticulos[this.getRowIndex(articulo?.id)];
            this.articuloControl.setValue(articuloEditar);
            this.modalShow(articuloEditar);
        }
    }

    onAceptarDialog(articulo: any) {
		this._pedidoService.datos = [];
        let articuloEditar: any = {};
        Object.assign(articuloEditar, articulo);

        let articuloId = articuloEditar.articulo.id;
        let index = this.getRowIndex(articuloId);

        if (index != null) {
            if (articuloEditar?.localidad?.id){
                this.tablaArticulos[index].origenId = articuloEditar?.localidad.id;
                this.tablaArticulos[index].origen = articuloEditar?.localidad;
            }
            this.tablaArticulos[index].existencia = articuloEditar.existencia;

            if(articuloEditar.surtir > (this.tablaArticulos[index].requerida - this.tablaArticulos[index].enviada))
                articuloEditar.surtir = (this.tablaArticulos[index].requerida - this.tablaArticulos[index].enviada);

            if(articuloEditar.existencia >= articuloEditar.surtir)
                this.tablaArticulos[index].surtir = articuloEditar.surtir;
            else
                this.tablaArticulos[index].surtir = articuloEditar.existencia;
            this.tablaArticulos[index].comentario = articuloEditar.comentario;
        } else {
            articuloEditar.id = articuloId;
            this.tablaArticulos.push(articuloEditar);
        }
        this.tablaArticulos = [].concat(this.tablaArticulos);
        this.enEdicion = null;
        //this._pedidoService.datos = [...this.tablaArticulos];
    }

    modalShow(articulo: any): void {
        //Call to createDialogFields function before show Dialog to get tralated labels.
        let almacenId = this.pedido?.localidadCEDIS?.almacen?.id;
        if(almacenId)
            this.localidadesAlmacen = this.localidades.filter(localidad => localidad.almacen.id == almacenId);

        this.createDialogFields();

        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            articuloControl: this.articuloControl,
            localidadControl: this.localidadControl,
            onAceptar: this.onAceptarDialog.bind(this),
            localidadId: this.localidadOrigenControl.value ? this.localidadOrigenControl.value.id : null,
            articulos: [articulo.articulo],
            localidades: this.localidadesAlmacen,
            existencias: this.existencia,
			existenciasPaquetes: this.existenciaPaquetes,
            temporada: this.temporada,
            origen: articulo?.origen || null
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '50%',
            data: dialogData
        });
    }

    getRowIndex(articuloId: number) {
        let index: number = null;
        this.tablaArticulos.forEach((registro, i) => { index = registro.id == articuloId ? i : index; });
        return index;
    }

    private createDialogFields() {
        this.localidadControl.setValue(null);
        this.camposListado = [
            {
                type: 'pixvsMatSelect',
                label: this.translate.instant('ARTICULO'),
                name: 'articulo',
                formControl: this.articuloControl,
                multiple: false,
                selectAll: false,
                list: this.listadoArticulosTemporada,
                campoValor: 'nombreArticulo',
                values: ['codigoArticulo', 'nombreArticulo'],
                elementsPerScroll: 100,
                validations: [],
                readonly: true,
            },
            {
                type: 'pixvsMatSelect',
                label: this.translate.instant('LOCALIDAD'),
                name: 'localidad',
                formControl: this.localidadControl,
                multiple: false,
                selectAll: false,
                list: this.localidadesAlmacen,
                campoValor: 'codigoLocalidad',
                values: ['nombre', 'codigoLocalidad'],
                elementsPerScroll: 100,
                validations: [],
                readonly: true,
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
                label: this.translate.instant('REQUERIDA'),
                inputType: 'text',
                mask: "separator.4",
                name: 'requerida',
                validations: [],
                readonly: true,
            },
            {
                type: 'input',
                label: this.translate.instant('SURTIR'),
                inputType: 'text',
                mask: "separator.4",
                name: 'surtir',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: this.translate.instant('REQUERIDO')
                    }
                ],
            },
            {
                type: 'input',
                label: this.translate.instant('COMENTARIO'),
                inputType: 'text',
                name: 'comentario',
                validations: [],
            }
        ];
    }

    onModalComentarios(partida){
		let dialogData: PedidoComentariosDialogData = {
			comentario: partida.comentario || 'Partida sin comentarios'
		};
		const dialogRef = this.dialog.open(PedidoComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onIconoInfo(event){
		if(event.idExtra == 1){
			this.modalComponentesShow(event.element.articulo.id);
		}
	}

	modalComponentesShow(articuloId: number): void {

        let dialogData: SurtirPedidosComponentesDialogData = {
            articuloId,
			existencias: this.existencia,
            existenciasPaquetes: this.existenciaPaquetes
        };

        const dialogRef = this.dialog.open(SurtirPedidosComponentesDialogComponent, {
            width: '50%',
            data: dialogData
        });
    }

    onPrint(){
        let data: PedidoInvoiceData = {
            codigo: this.pedido?.codigo,
            destinoSede: this.pedido?.localidadOrigen?.almacen?.sucursal,
            destinoAlmacen: this.pedido?.localidadOrigen?.almacen,
            cedisSede: this.pedido?.localidadCEDIS?.almacen?.sucursal,
            cedisAlmacen: this.pedido?.localidadCEDIS?.almacen?.sucursal,
            fecha: moment().format('DD/MM/YYYY hh:mm A'),
            usuario: JSON.parse(localStorage.getItem('usuario')),
            modulo: 'Surtir pedido',
            data: this.tablaArticulos,
            columns: this.imprimir.columns
        };
        this.invoice.setData(data);
        setTimeout(function(){ 
            window.print();
            this.router.navigate([this.config.rutaAtras]);
        }.bind(this) , 1000);
    }
}