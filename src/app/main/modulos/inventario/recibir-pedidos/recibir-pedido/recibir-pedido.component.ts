import { Location, registerLocaleData } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation, TemplateRef } from '@angular/core';
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
import { RecibirPedidoService } from './recibir-pedido.service';
import { FichasDataService } from '@services/fichas-data.service';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { PedidoReciboDetalle, PedidoReciboDetalleProjection } from '@app/main/modelos/recibo-pedido-detalle';
import { PedidoReciboProjection } from '@app/main/modelos/recibo-pedido';
import { PixvsTablaSimpleComponent } from '@pixvs/componentes/tablas/simple/tabla-simple.component';
import { PedidoComentariosDialogComponent, PedidoComentariosDialogData } from './dialogs/comentarios/comentarios.dialog';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';

@Component({
    selector: 'recibir-pedido',
    templateUrl: './recibir-pedido.component.html',
    styleUrls: ['./recibir-pedido.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RecibirPedidoComponent {

    private URL: string = '/api/v1/pedidos';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    @ViewChild('localidadOrigenSelect') localidadOrigenSelect: PixvsMatSelectComponent;
    @ViewChild('localidadCEDISSelect')  localidadCEDISSelect:  PixvsMatSelectComponent;

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
    formRecibo: FormGroup;
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

    

    // Tabla Enviados
    enviados:any = {
        datos: [],
        columnasTabla: [
            {
                name: 'articulo.codigoArticulo',
                values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
                title: 'Artículo',
                class: "mat-column-flex flex-40",
                centrado: false,
                type: null,
                tooltip: true
            },
            {
                name: 'unidadMedida.nombre',
                title: 'Unidad de medida',
                class: "mat-column-flex",
                centrado: false,
                type: null,
                tooltip: false
            },
            {
                name: 'localidad',
                values: ['localidad.nombre'],
                title: 'Localidad',
                class: "mat-column-flex",
                centrado: false,
                type: null,
                tooltip: false
            },
            {
                name: 'cantidadPedida',
                title: 'Cantidad Pedida',
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false,
                dir: 'rtl'
            },
            {
                name: 'cantidadSurtida',
                title: 'Cantidad Surtida',
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false,
                dir: 'rtl'
            },
            {
                name: 'cantidad',
                title: 'Cantidad recibida',
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false,
                dir: 'rtl'
            },
            {
                name: 'spill',
                title: 'Cantidad Spill',
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false,
                dir: 'rtl'
            },
            {
                name: 'comentarios',
                title: '',
                class: "mat-column-flex",
                centrado: false,
                type: 'acciones',
                listadoAcciones: [
                    {
                        title: 'Comentarios',
                        tipo: '',
                        icon: 'message',
                        accion: this.onModalComentarios.bind(this),
						columnaMostrar: 'observaciones'
                    }
                ]
            },
            /*{
                name: 'cantidadDevuelta',
                title: this.translate.instant('DEVOLUCION'),
                class: "mat-column-flex",
                centrado: false,
                type: 'decimal2',
                tooltip: false
            },*/
        ],
        columnasFechas: [],
    displayedColumns: ['articulo.codigoArticulo', 'localidad', 'unidadMedida.nombre', 'cantidadPedida', 'cantidadSurtida', 'cantidad', 'spill','comentarios'/*, 'cantidadDevuelta'*/],

    };

    camposListado: FieldConfig[] = [];
    recibos: any[] = [];

	localidadesAlmacenOrigen: LocalidadComboProjection[] = [];
	existenciaArticulosMapLocalidades: any = {};

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
        public _recibirPedidoService: RecibirPedidoService,
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
                rutaAtras: "/app/inventario/recibir",
                rutaBorrar: this.URL + "/recibir/delete/",
                icono: "swap_horiz"
            }
        });
        // Subscribe to update on changes
        this._recibirPedidoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {

                    if(datos.pedido){

                        if(datos.recibos){
                            datos.recibos.forEach(recibo => {
                                recibo.detalles.forEach(item => {
                                    let index = this.recibos.findIndex(r => r.articuloId == item.articuloId);
                                    let cantidadRecibida = 0;
                                    item.localidades.forEach((localidad)=>{cantidadRecibida += localidad.cantidad});
                                    let cantidad = cantidadRecibida + item.cantidadDevuelta + item.spill;
                                    if(index == -1)
                                        this.recibos.push({articuloId: item.articuloId, cantidad: cantidad});
                                    else
                                        this.recibos[index].cantidad += cantidad;
                                });
                            });
                        }

                        this.pedido = datos.pedido || new Pedido();
                        this.fechaPedido = datos.pedido? datos.pedido.fecha.split(" ")[0] : this.fechaActual;
                        
                        this.localidades = datos.localidades_todas;
                        this.movimientos = datos.movimientos;
						this.localidadesAlmacenOrigen = datos.localidadesAlmacenOrigen;
                        this.listadoLocalidadesOrigen = [this.pedido.localidadOrigen];
						this.existenciaArticulosMapLocalidades = datos.existenciaArticulosMapLocalidades
                        
                        this.cedis = datos.localidades_todas.filter( loc => loc?.almacen?.esCedi);
                        this.listadoLocalidadesCEDIS = this.cedis;

                        this.titulo = this.translate.instant('TITULO') +": "+ this.pedido?.codigo;
                        //this._recibirPedidoService.datos = [];
                        this.form = this.createForm();
                        this.formRecibo = this.createFormRecibo();

                        this.form.disable({ emitEvent: false });
                        this.formRecibo.controls['fecha'].disable();
                        //this.formRecibo.disable({ emitEvent: false }); 

                        this.pageType = 'edit';
                    }

                    
                }
            );
        
        this._recibirPedidoService.onArticulosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe( datos => {
                if(datos.articulos){
                    this.articulos = datos.articulos;
                    this.temporada = datos.temporada;
                    this.existencia = datos.existencia;
					this.existenciaPaquetes = datos.existenciaPaquetes || {};

                    let art_temporada_ids = this.temporada.map( temporada => temporada.articuloId);
                    this.listadoArticulosTemporada = this.articulos.filter( articulo => art_temporada_ids.includes(articulo.id));
                }
                
                if(!!this.pedido.id){
                    let enviados: any[] = [];
					this.pedido.detalles.forEach(detalle => {
						let partida: any = this.createPartida(detalle);
                            if (partida) enviados.push(partida);
					})
                    
                    enviados.forEach(enviado => {
                        enviado.articuloId
                        let recibo = this.recibos.find(r => r.articuloId == enviado.articuloId);
                        if(recibo){
                            enviado.cantidad -= recibo.cantidad;
                            enviado.cantidadSurtida -= recibo.cantidad;
                        }
                            
                    });
                    
                    this.enviados.datos = [...enviados.filter((partida) => partida.cantidadSurtida > 0)];
                    this._recibirPedidoService.datos = [...this.enviados.datos];
                }
            });
    }

    createPartida(detalle){
        return {
            id: detalle.articulo.id,
            pedidoReciboId: null,
            articulo: detalle.articulo,
            articuloId: detalle.articulo.id,
            unidadMedida: detalle.articulo.unidadMedidaInventario,
            unidadMedidaId: detalle.articulo.unidadMedidaInventario.id,
            cantidadPedida: Number(detalle.cantidadPedida),
            cantidadSurtida: Number(detalle.cantidadSurtida),
            cantidad: Number(detalle.cantidadSurtida),
            cantidadDevuelta: Number(null),
            spill: Number(null),
            comentario: "",
            estatusId: null,
            localidad: this.pedido.localidadOrigen,
            observaciones: detalle.comentarioSurtir
        };
    }

    ngAfterViewInit(): void {
        if(!!this.pedido?.localidadOrigen)
            this._recibirPedidoService.getArticulos(this.URL+'/products/',this.pedido.localidadOrigen.id);
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
        this.localidadControl = new FormControl({value: null}, [Validators.required]);
        
        this.localidadOrigenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            this.enviados.datos = [];
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

    createFormRecibo(): FormGroup {

        let form = this._formBuilder.group({
            id: [null],
            fecha: [this.fechaActual, Validators.required],
            pedidoId: [null],
            comentario: [null],
            estatusId: [null],
            creadoPorId: [null],
            modificadoPorId: [null],
            fechaCreacion: [null],
            fechaModificacion: [null]
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
        this._recibirPedidoService.cargando = true;

        let pedidoId = this.pedido.id;

        this.formRecibo.controls.id.setValue(null);
        this.formRecibo.controls.pedidoId.setValue(pedidoId);
        this.formRecibo.controls.estatusId.setValue(ControlesMaestrosMultiples.CMM_Estatus.ACTIVO);

        this.formRecibo.controls.creadoPorId.setValue(null);
        this.formRecibo.controls.modificadoPorId.setValue(null);
        this.formRecibo.controls.fechaCreacion.setValue(null);
        this.formRecibo.controls.fechaModificacion.setValue(null);

        if (this.formRecibo.valid) {
            
            if (this.enviados.datos.length == 0){
                this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });
                this._recibirPedidoService.cargando = false;
                return;
            }
			if(this.localidadesAlmacenOrigen.length == 1){
				this.enviados.datos.forEach(registro => {
					registro.localidades = [{
						localidadId: this.localidadesAlmacenOrigen[0].id,
						cantidad: Number(registro.cantidad)
					}];
				});
			}else{
				for(let registro of this.enviados.datos){
					if(registro.cantidad && !registro.localidades?.length){
						this._matSnackBar.open(this.translate.instant('ASIGNAR_LOCALIDADES'), 'OK', { duration: 5000 });
						this._recibirPedidoService.cargando = false;
						return;
					}
				}
			}

            this.formRecibo.disable({ emitEvent: false });            

            let detalles: PedidoReciboDetalleProjection[] = [];

            this.enviados.datos.forEach(registro => {
                
                let movimiento: PedidoReciboDetalleProjection = new PedidoReciboDetalleProjection(registro);
                movimiento.id = null;
                detalles.push(movimiento);
            });

            let recibo: PedidoReciboProjection = new PedidoReciboProjection(this.formRecibo.getRawValue(), detalles);

            this._recibirPedidoService.guardar(recibo, this.URL + '/recieve').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._recibirPedidoService.cargando = false;
                        this.formRecibo.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._recibirPedidoService.cargando = false;
            this.formRecibo.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    agregarArticulo() {
        this.articuloControl.setValue(null);
        this.localidadControl.setValue(null);
        this.modalShow(null);
    }

    onEditar(articulo: any) {
        if(this.formRecibo.enabled){
            let articuloEditar = this._recibirPedidoService.datos[this.getRowIndex(articulo.id)];
            this.articuloControl.setValue(articuloEditar);
            this.localidadControl.setValue(null);
            this.modalShow(articuloEditar);
        }
    }

    onAceptarDialog(articulo: any) {
        this._recibirPedidoService.datos = [];
        let articuloEditar: any = {};
        Object.assign(articuloEditar, articulo);

        let articuloId = articuloEditar.articulo.id;
        let index = this.getRowIndex(articuloId);

        if (index != null) {

            this.enviados.datos[index].cantidad = articuloEditar.cantidad;
            this.enviados.datos[index].spill = articuloEditar.spill;
            this.enviados.datos[index].cantidadDevuelta = articuloEditar.cantidadDevuelta;

            this.enviados.datos[index].comentario = articuloEditar.comentario;
            this.enviados.datos[index].localidad = articuloEditar.localidad;
            this.enviados.datos[index].localidades = articuloEditar.localidades;

        } else {
            articuloEditar.id = articuloId;
            this.enviados.datos.push(articuloEditar);
        }
        this.enviados.datos = [].concat(this.enviados.datos);
        this._recibirPedidoService.datos = [...this.enviados.datos];
        this._recibirPedidoService.updateDatos(this.enviados.datos);
    }

    modalShow(articulo: any): void {
        //Call to createDialogFields function before show Dialog to get tralated labels.
        let almacenId = this.pedido?.localidadOrigen?.almacen?.id;
        if(almacenId)
            this.localidadesAlmacen = this.localidades.filter(localidad => localidad.almacen.id == almacenId);

        this.createDialogFields();

		this.localidadControl.setValue(this.localidadesAlmacen[0]);
        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            articuloControl: this.articuloControl,
            localidadControl: this.localidadControl,
            onAceptar: this.onAceptarDialog.bind(this),
            articulos: [articulo.articulo],
            localidades: this.localidadesAlmacen,
            existencias: this.existencia,
            existenciasPaquetes: this.existenciaPaquetes,
            temporada: this.temporada,
			localidadesAlmacenOrigen: this.localidadesAlmacenOrigen,
			existenciaMapLocalidades: (this.existenciaArticulosMapLocalidades[this.articuloControl.value?.id] ||{}),
			almacenNombre: this.localidadOrigenControl.value.almacen.codigoAlmacen + ' ' + this.localidadOrigenControl.value.almacen.nombre
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '50%',
			maxHeight: '600px',
            data: dialogData
        });
    }

    getRowIndex(articuloId: number) {
        let index: number = null;
        this.enviados.datos.forEach((registro, i) => { index = registro.id == articuloId ? i : index; });
        return index;
    }

    private createDialogFields() {
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
                label: this.translate.instant('ENVIADA'),
                inputType: 'text',
                mask: "separator.4",
                name: 'cantidadSurtida',
                validations: [],
                readonly: true,
            },
            {
                type: 'input',
                label: this.translate.instant('RECIBIDA'),
                inputType: 'text',
                mask: "separator.4",
                name: 'cantidad',
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
                label: this.translate.instant('SPILL'),
                inputType: 'text',
                mask: "separator.4",
                name: 'spill',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: this.translate.instant('REQUERIDO')
                    }
                ],
            },
            /*{
                type: 'input',
                label: this.translate.instant('DEVOLUCION'),
                inputType: 'text',
                mask: "separator.4",
                name: 'cantidadDevuelta',
                validations: [
                    {
                        name: 'required',
                        validator: Validators.required,
                        message: this.translate.instant('REQUERIDO')
                    }
                ],
            },*/
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
			comentarios: partida.observaciones || []
        };
		const dialogRef = this.dialog.open(PedidoComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}
}