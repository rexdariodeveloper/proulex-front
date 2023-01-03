import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Moment } from 'moment';
import * as moment from 'moment';
import { AlumnoEditarProjection } from '@app/main/modelos/alumno';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AlumnoContactoEditarProjection } from '@app/main/modelos/alumno-contacto';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ClienteRemisionEditarProjection } from '@app/main/modelos/cliente-remision';
import { ClienteComboProjection } from '@app/main/modelos/cliente';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { RemisionService } from './remision.service';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { ArticuloComboListaPreciosProjection } from '@app/main/modelos/articulo';
import { MatTableDataSource } from '@angular/material/table';
import { ClienteRemisionDetalleEditarProjection } from '@app/main/modelos/cliente-remision-detalle';
import { ClienteRemisionDetalleDialogComponent, ClienteRemisionDetalleDialogData } from './dialogs/detalle/detalle.dialog';

@Component({
    selector: 'remision',
    templateUrl: './remision.component.html',
    styleUrls: ['./remision.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RemisionComponent {

	// Propiedades de configuración de la ficha
	pageType: string = 'nuevo';
	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    currentId: number;

	// Propiedades de edición de la ficha
	clienteRemision: ClienteRemisionEditarProjection;
	
	// Propiedades de formulario principal
	form: FormGroup;
	clienteControl: FormControl = new FormControl();
	monedaControl: FormControl = new FormControl();
	almacenOrigenControl: FormControl = new FormControl();
	almacenDestinoControl: FormControl = new FormControl();
	@ViewChild('almacenDestinoSelect') almacenDestinoSelect: PixvsMatSelectComponent;

	// Listados
	clientes: ClienteComboProjection[] = [];
	monedas: MonedaComboProjection[] = [];
	almacenesOrigen: AlmacenComboProjection[] = [];
	almacenesDestino: AlmacenComboProjection[] = [];
	articulos: ArticuloComboListaPreciosProjection[] = [];

	// Tabla detalles
	dataSourceDetalles: MatTableDataSource<ClienteRemisionDetalleEditarProjection> = new MatTableDataSource([]);
	displayedColumnsTablaDetalles: string[] = ['articulo.codigoArticulo','articulo.nombreArticulo','articulo.unidadMedidaInventario.nombre','cantidad','articulo.precioVenta'];
	
	// Misc
	detalleEditar: ClienteRemisionDetalleEditarProjection;
	articulosOmitirModalIds: number[] = [];
	contadorDetalles: number = 0;

	// Private
	private _unsubscribeAll: Subject < any > ;

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
		public _remisionService: RemisionService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the default
		this.clienteRemision = new ClienteRemisionEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.clienteRemision = new ClienteRemisionEditarProjection();
			}

			this.config = {
				rutaAtras: "/app/ventas/remisiones",
				icono: "assignment"
			}

		});

		// Subscribe to update datos on changes
		this._remisionService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.clienteRemision) {
					this.clienteRemision = datos.clienteRemision;
					this.titulo = this.clienteRemision.codigo;
					let articulosMapId = {};
					datos.articulos.forEach(articulo => {
						articulosMapId[articulo.id] = articulo;
					});
					this.clienteRemision.detalles.forEach(detalle => {
						detalle.articulo = articulosMapId[detalle.articulo.id];
					});
				} else {
					this.clienteRemision = new ClienteRemisionEditarProjection();
				}

				// Inicializar listados
				this.clientes = datos.clientes;
				this.monedas = datos.monedas;
				this.almacenesOrigen = datos.almacenesOrigen;
				this.almacenesDestino = datos.almacenesDestino;
				this.articulos = datos.articulos;
				this.dataSourceDetalles.data = this.clienteRemision.detalles;

                // Inicializar form
				this.form = this.createClienteRemisionForm();

				if (this.pageType == 'ver') {
					this.form.disable({emitEvent: false});
				} else {
					this.form.enable({emitEvent: false});
				}

			});

		// Subscribe to update almacenesCliente on changes
		this._remisionService.onDatosClienteChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((datos: any) => {
				if (datos != null) {
					this.almacenesDestino = datos.almacenesCliente;
					if(!!this.almacenDestinoSelect){
						this.almacenDestinoSelect.setDatos(this.almacenesDestino);
					}
					this.articulos = datos.articulos;
				}
			});

	}

	createClienteRemisionForm(): FormGroup {

		// Inicializar FormControls
		this.clienteControl = new FormControl(this.clienteRemision.cliente,[Validators.required]);
		this.monedaControl = new FormControl(this.clienteRemision.moneda,[Validators.required]);
		this.almacenOrigenControl = new FormControl(this.clienteRemision.almacenOrigen,[Validators.required]);
		this.almacenDestinoControl = new FormControl(this.clienteRemision.almacenDestino,[Validators.required]);
		
		// Subscripciones FormControl.valueChanges
		this.clienteControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((cliente: ClienteComboProjection) => {
			if(!!cliente){
				this._remisionService.getDatosCliente(cliente.id);
			}
		});

		// Inicializar Form
		let form = this._formBuilder.group({
			id: [this.clienteRemision.id],
			cliente: this.clienteControl,
			fecha: new FormControl(this.clienteRemision.fecha ? moment(this.clienteRemision.fecha) : moment(),[Validators.required]),
			moneda: this.monedaControl,
			almacenOrigen: this.almacenOrigenControl,
			almacenDestino: this.almacenDestinoControl,
			comentario: new FormControl(this.clienteRemision.comentario, [Validators.maxLength(255)]),
			estatusId: new FormControl(this.clienteRemision.estatus?.id || null, []),
			fechaModificacion: this.clienteRemision.fechaModificacion
		});

		return form;
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	isRequired(campo: string, form: FormGroup = this.form) {

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

	guardar() {
		if (this.form.valid) {
			if(!this.clienteRemision.detalles){
				this._matSnackBar.open('Es necesario ingresar al menos un artículo para continuar', 'OK', {
					duration: 5000,
				});
				return;
			}

			this._remisionService.cargando = true;
			this.form.disable({emitEvent: false});

			this.clienteRemision.detalles.forEach(detalle => {
				delete detalle.idTmp;
			});

			let formRaw = this.form.getRawValue();
			formRaw.fecha = moment(this.clienteRemision.fecha).format('YYYY-MM-DD HH:mm:ss.SSS');
			formRaw.detalles = this.clienteRemision.detalles;

			this._remisionService.guardar(JSON.stringify(formRaw), `/api/v1/remisiones/save`).then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._programacionAcademicaComercialService.cargando = false;
						this.form.enable();
					}
				}.bind(this)
			);
		} else {
			for (const key of Object.keys(this.form.controls)) {
				this.form.controls[key].markAsTouched();
			}
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

			this._remisionService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}

	}

	onEditarDetalle(detalle: ClienteRemisionDetalleEditarProjection) {
		this.detalleEditar = detalle;
        if(this.form.enabled)
		    this.abrirModalDetalle(this.detalleEditar);
	}

	onNuevoDetalle(){
		this.detalleEditar = null;
		this.abrirModalDetalle(null);
	}

	abrirModalDetalle(detalle: ClienteRemisionDetalleEditarProjection): void {

		if(!this.almacenOrigenControl?.value?.id){
			this._matSnackBar.open('Selecciona un almacen origen', 'OK', {
				duration: 5000,
			});
			return;
		}

		let dialogData: ClienteRemisionDetalleDialogData = {
			esNuevo: !detalle,
			detalle,
			articulos: this.articulos,
			articulosOmitirIds: this.articulosOmitirModalIds,
			almacenOrigenId: this.almacenOrigenControl?.value?.id,
			onAceptar: this.onAceptarArticuloDialog.bind(this)
		};

		const dialogRef = this.dialog.open(ClienteRemisionDetalleDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarArticuloDialog(detalle: ClienteRemisionDetalleEditarProjection) {
		this.form.markAsDirty();
		this.articulosOmitirModalIds.push(detalle.articulo.id);
		let detalleEditar: any = {
			...this.detalleEditar
		};
		Object.assign(detalleEditar, detalle);
		if(detalleEditar['idTmp']){	
			this.clienteRemision.detalles = this.clienteRemision.detalles.map(detalleComparar => {
				if(detalleComparar['idTmp'] == detalleEditar['idTmp']){
					return detalleEditar;
				}
				return detalleComparar;
			});
		}else{
			detalleEditar['idTmp'] = ++this.contadorDetalles;
			this.clienteRemision.detalles = [...(this.clienteRemision.detalles || [])].concat(detalleEditar);
		}
		this.dataSourceDetalles.data = this.clienteRemision.detalles;
		this.detalleEditar = null;
	}

	onBorrarDetalle(detalle: ClienteRemisionDetalleEditarProjection){
		this.form.markAsDirty();
		this.articulosOmitirModalIds = this.articulosOmitirModalIds.filter(articuloId => {
			return articuloId != detalle.articulo.id;
		});
		this.clienteRemision.detalles = this.clienteRemision.detalles.filter(detalleComparar => {
			return detalleComparar != detalle;
		});
		this.dataSourceDetalles.data = this.clienteRemision.detalles;
	}

}