import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { OrdenCompraService } from './orden-compra.service';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { OrdenCompra, OrdenCompraEditarProjection } from '@app/main/modelos/orden-compra';
import { ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { DepartamentoComboProjection } from '@models/departamento';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ArticulosService } from './articulos.service';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloDialogData, ArticuloDialogComponent } from './dialogs/articulo/articulo.dialog';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { OrdenCompraReciboListadoProjection } from '@app/main/modelos/orden-compra-recibo';
import { MatTableDataSource } from '@angular/material/table';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { Usuario } from '@models/usuario';
import { OrderReportData, OrderReportPrintComponent } from './prints/invoice.print';
import { OrdenCompraComentariosDialogComponent, OrdenCompraComentariosDialogData } from './dialogs/comentarios/comentarios.dialog';
import { ArchivoProjection } from '@models/archivo';

@Component({
	selector: 'orden-compra',
	templateUrl: './orden-compra.component.html',
	styleUrls: ['./orden-compra.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class OrdenCompraComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	@ViewChild("printBtn") printBtn: ElementRef;
	@ViewChild(OrderReportPrintComponent) invoice: OrderReportPrintComponent;

	usuarioActual: Usuario;
	fechaActual: Date = new Date();

	historial;
	acciones: ListadoMenuOpciones[] = [];

	pageType: string = 'nuevo';

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	mostrarEditar: boolean = false;

	ordenCompra: OrdenCompraEditarProjection;
	form: FormGroup;

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	proveedorControl: FormControl = new FormControl();
	proveedores: ProveedorComboProjection[];

	recepcionArticuloAlmacenControl: FormControl = new FormControl();
	almacenes: AlmacenComboProjection[];

	monedaControl: FormControl = new FormControl();
	monedas: MonedaComboProjection[];

	departamentoControl: FormControl = new FormControl();
	departamentos: DepartamentoComboProjection[];

	dataSourceDetalles: MatTableDataSource<OrdenCompraDetalleEditarProjection> = new MatTableDataSource([]);
	displayedColumnsTablaArticulos: string[] = ['articulo.codigoArticulo','articulo.nombreArticulo','unidadMedida.nombre','cantidad','precio','acciones'];

	articuloEditar: OrdenCompraDetalleEditarProjection = null;

	articulos: ArticuloComboProjection[] = [];
	articulosMiscelaneos: ArticuloComboProjection[] = [];
	unidadesMedida: UnidadMedidaComboProjection[] = [];

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;

	contadorPartidas: number = 0;

	movimientos: OrdenCompraReciboListadoProjection[] = [];
	dataSourceMovimientos: MatTableDataSource<OrdenCompraReciboListadoProjection> = new MatTableDataSource([]);
	displayedColumnsMovimientos: string[] = [
		'fechaHora',
		'tipoMovimiento',
		'codigoArticulo',
		'nombreArticulo',
		'um',
		'cantidad',
		'almacen',
		'usuario',
		'documentos'
	];

	articulosOmitirModalIds: number[] = [];

	omitirPrecargarDatosProveedor: boolean = false;

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
		public _ordenCompraService: OrdenCompraService,
		private el: ElementRef,
		public validatorService: ValidatorService,
		public _articulosService: ArticulosService
	) {

		this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the default
		this.ordenCompra = new OrdenCompraEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.ordenCompra = new OrdenCompraEditarProjection();
				this.ordenCompra.fechaOC = new Date();
			}

			this.config = {
				rutaAtras: "/app/compras/ordenes-compra",
				rutaBorrar: "/api/v1/ordenes-compra/delete/",
				icono: "assignment",
				rutaEnviar: '/api/v1/ordenes-compra/enviar'
			}

		});

		// Subscribe to update ordenCompra on changes
		this._ordenCompraService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.ordenCompra) {
					this.ordenCompra = datos.ordenCompra;
					this.titulo = this.ordenCompra.codigo
					if(this.ordenCompra.estatusId == ControlesMaestrosMultiples.CMM_OC_EstatusOC.EN_EDICION){
						this.mostrarEditar = true;
					}
					this.ordenCompra.detalles.forEach(detalle => {
						detalle['idExtra'] = ++this.contadorPartidas;
					});
					this.acciones = [
						{
							title:  'PDF',
							tipo:   FichaListadoConfig.ARCHIVO_BY_HASHID,
							icon:   'picture_as_pdf',
							url: 	'/api/v1/ordenes-compra/pdf/'
						},{
							title: 'Vista previa',
							tipo: null,
							icon: 'print'
						}
					];
					this.omitirPrecargarDatosProveedor = true;
				} else {
					this.ordenCompra = new OrdenCompraEditarProjection();
					this.ordenCompra.fechaOC = new Date();
					this.mostrarEditar = true;

					this.acciones = [
						{
							title: 'Vista previa',
							tipo: null,
							icon: 'print'
						}
					];
				}

				this.proveedores = datos.proveedores;
				this.almacenes = datos.almacenes;
				this.monedas = datos.monedas;
				this.departamentos = datos.departamentos;

				this.articulos = datos.articulos;
				this.articulosMiscelaneos = datos.articulosMiscelaneos;
				this.unidadesMedida = datos.unidadesMedida;

				this.historial = datos.historial;

				this.movimientos = datos.movimientos;
				this.dataSourceMovimientos.data = datos.movimientos;
				this.dataSourceDetalles.data = this.ordenCompra.detalles;

				this.form = this.createOrdenCompraForm();

				if (this.pageType == 'ver') {
					this.form.disable();
				} else {
					this.form.enable();
				}

			});

		this._ordenCompraService.onErrorGuardarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(error => {
				if(error){
					this._ordenCompraService.onErrorGuardarChanged.next(null);
					this.router.navigate([this.config.rutaAtras])
				}
			});

	}

	createOrdenCompraForm(): FormGroup {

		this.proveedorControl = new FormControl(this.ordenCompra.proveedor, [Validators.required]);
		this.recepcionArticuloAlmacenControl = new FormControl(this.ordenCompra.recepcionArticulosAlmacen, [Validators.required]);
		this.monedaControl = new FormControl( (this.ordenCompra.moneda), [Validators.required]);
		this.departamentoControl = new FormControl(this.ordenCompra.departamento, [Validators.required]);

		this.proveedorControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(!!this.form?.controls){
				if(this.omitirPrecargarDatosProveedor){
					this.omitirPrecargarDatosProveedor = false;
				}else{
					this.form.controls['direccionOC'].setValue(this.proveedorControl.value?.domicilio || null);
					this.form.controls['terminoPago'].setValue(this.proveedorControl.value?.diasPlazoCredito || null);
				}
			}
		});

		let form = this._formBuilder.group({
			id: [this.ordenCompra.id],
			proveedor: this.proveedorControl,
			fechaOC: new FormControl(this.ordenCompra.fechaOC, [Validators.required, ]),
			fechaRequerida: new FormControl(this.ordenCompra.fechaRequerida, [Validators.required, ]),
			direccionOC: new FormControl(this.ordenCompra.direccionOC, [Validators.maxLength(150), ]),
			remitirA: new FormControl(this.ordenCompra.remitirA, [Validators.maxLength(150), ]),
			recepcionArticulosAlmacen: this.recepcionArticuloAlmacenControl,
			moneda: this.monedaControl,
			terminoPago: new FormControl(this.ordenCompra.terminoPago, [Validators.required, Validators.min(0)]),
			departamento: this.departamentoControl,
			descuento: new FormControl(this.ordenCompra.descuento, [Validators.min(0), Validators.max(100)]),
			comentario: new FormControl(this.ordenCompra.comentario, [Validators.maxLength(3000), ]),
			fechaModificacion: this.ordenCompra.fechaModificacion
		});

		if (this.pageType == 'editar' || this.pageType == 'ver') {
            this.dataSourceDetalles.data.forEach(detalle => this.articulosOmitirModalIds.push(detalle.articulo.id));
		}

		return form;
	}


	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
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

	guardar(enviar: boolean) {

		if (this.form.valid) {

			if(!this.ordenCompra.detalles?.length){
				this._ordenCompraService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.DETALLES_REQUERIDOS'), 'OK', {
					duration: 5000,
				});
				return;
			}

			this._ordenCompraService.cargando = true;
			this.form.disable({emitEvent: false});

			let body = {...this.form.getRawValue()};
			body.fechaOC = moment(body.fechaOC).format('YYYY-MM-DD HH:mm:ss.SSS');
			body.fechaRequerida = moment(body.fechaRequerida).format('YYYY-MM-DD HH:mm:ss.SSS');
			body.detalles = this.ordenCompra.detalles;
			body.detalles.forEach(detalle => {
				delete detalle['idExtra'];
			});

			this._ordenCompraService.guardar(JSON.stringify(body), `/api/v1/ordenes-compra/${enviar ? 'enviar' : 'save'}`).then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.form.disable();
                        if(enviar){
                            this._ordenCompraService.descargarPdf(result.data);
                        }
						this.router.navigate([this.config.rutaAtras]);
					} else {
						this._ordenCompraService.cargando = false;
						this.form.enable();
					}
				}.bind(this)
			);




		} else {
			this.form.markAllAsTouched();

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

			this._ordenCompraService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	onEditarArticulo(articulo: OrdenCompraDetalleEditarProjection) {
		this.articuloEditar = articulo;
        if(this.form.enabled)
		    this.abrirModalArticulo(this.articuloEditar);
	}

	onNuevoArticulo(){
		this.articuloEditar = null;
		this.abrirModalArticulo(null);
	}

	abrirModalArticulo(articulo: OrdenCompraDetalleEditarProjection): void {

		let dialogData: ArticuloDialogData = {
			esNuevo: !articulo,
			articulo,
			articulos: this.articulos,
			articulosMiscelaneos: this.articulosMiscelaneos,
			unidadesMedida: this.unidadesMedida,
			articulosOmitirIds: this.articulosOmitirModalIds,
			onAceptar: this.onAceptarArticuloDialog.bind(this)
		};

		const dialogRef = this.dialog.open(ArticuloDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarArticuloDialog(articulo: OrdenCompraDetalleEditarProjection) {
		this.form.markAsDirty();
		this.articulosOmitirModalIds.push(articulo.articulo.id);
		let articuloEditar: any = {
			...this.articuloEditar
		};
		Object.assign(articuloEditar, articulo);
		if(articuloEditar['idExtra']){
			this.ordenCompra.detalles = this.ordenCompra.detalles.map(detalle => {
				if(detalle['idExtra'] == articuloEditar['idExtra']){
					return articuloEditar;
				}
				return detalle;
			});
		}else{
			articuloEditar['idExtra'] = ++this.contadorPartidas;
			this.ordenCompra.detalles = [...(this.ordenCompra.detalles || [])].concat(articuloEditar);
		}
		this.dataSourceDetalles.data = this.ordenCompra.detalles;
		this.articuloEditar = null;
	}

	onBorrarDetalle(detalle: OrdenCompraDetalleEditarProjection){
		this.form.markAsDirty();
		this.articulosOmitirModalIds = this.articulosOmitirModalIds.filter(articuloId => {
			return articuloId != detalle.articulo.id;
		});
		this.ordenCompra.detalles = this.ordenCompra.detalles.filter(d => {
			return d != detalle;
		});
		this.dataSourceDetalles.data = this.ordenCompra.detalles;
	}

	onActionClicked(event){
		if(event.option.title == 'Vista previa'){
			if (this.form.disabled || this.form.valid){
				this.onPrint();
			}else{
				this._matSnackBar.open('Completa el formulario', 'OK', {
					duration: 5000,
				});
			}
		}
	}

	onMostrarEvidencia(movimiento: OrdenCompraReciboListadoProjection){
		if(movimiento.evidencia.length > 1){
			let evidenciaIds: number[] = movimiento.evidencia.map(ev => {
				return Number(ev.id);
			});
			this._ordenCompraService.getEvidencia(evidenciaIds);
		}else if(movimiento.evidencia.length == 1){
			this._ordenCompraService.verArchivo(movimiento.evidencia[0]);
		}
	}

	onDescargarFactura(movimiento: OrdenCompraReciboListadoProjection){
		if(!movimiento?.facturas?.length){
			return;
		}
		let facturasIds: number[] = movimiento.facturas.map(factura => {
			return Number(factura.id);
		});
		this._ordenCompraService.getFactura(facturasIds);
	}

	onPrint(){
		let data: OrderReportData = {
			codigo: this.ordenCompra?.codigo,
			fecha: moment(this.ordenCompra?.fechaOC).format('DD/MM/YYYY hh:mm A'),
            fechaRequerida: moment(this.ordenCompra?.fechaRequerida).format('DD/MM/YYYY hh:mm A'),
			proveedor: this.proveedorControl?.value,
            departamento: this.departamentoControl?.value,
			envio: this.recepcionArticuloAlmacenControl?.value,
			terminos: this.form.get('terminoPago')?.value,
			moneda: this.monedaControl?.value,
			creador: this.usuarioActual.nombreCompleto,
			autorizador: this.ordenCompra?.autorizadoPor?.nombreCompleto,
			comentarios: this.form.get('comentario')?.value,
			data: this.ordenCompra?.detalles || [],
			columns: ["partida", "descripcion", "fecha", "um", "requerida", "precio", "subtotal"]
		};
		this.invoice.setData(data);
		setTimeout(function(){ 
            window.print();
        }.bind(this) , 1000);
	}

	onComentarios(detalle: OrdenCompraDetalleEditarProjection){
		let dialogData: OrdenCompraComentariosDialogData = {
			comentariosRequisicion: detalle.comentariosRequisicion || 'Sin comentarios',
			comentariosCompras: detalle.comentarios || 'Sin comentarios'
		};

		const dialogRef = this.dialog.open(OrdenCompraComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onMostrarImagen(imagenDescargar: ArchivoProjection){
		this._ordenCompraService.verArchivo(imagenDescargar);
	}

}