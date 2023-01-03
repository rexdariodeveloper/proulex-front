import { Component, OnInit, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Articulo } from '@app/main/modelos/articulo';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ArticuloTipo, ArticuloTipoComboProjection } from '@app/main/modelos/articulo-tipo';
import { ArticuloSubtipoComboProjection } from '@app/main/modelos/articulo-subtipo';
import { UnidadMedida, UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { MatTabGroup } from '@angular/material/tabs';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { Almacen } from '@app/main/modelos/almacen';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { AlmacenService } from './almacen.service';
import { UsuarioComboProjection } from '@models/usuario';
import { LocalidadService } from './localidad.service';
import { LocalidadListadoProjection } from '@app/main/modelos/localidad';
import { LocalidadDialogData, LocalidadDialogComponent } from './dialogs/localidad/localidad.dialog';
import { type } from 'os';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';

const MAX_28: number = 9999999999999999999999999999.99;

@Component({
	selector: 'almacen',
	templateUrl: './almacen.component.html',
	styleUrls: ['./almacen.component.scss']
})
export class AlmacenComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	@ViewChild('tabs') tabs: MatTabGroup;

	localeEN = english;
	localeES = spanish;

	titulo: string;
	pageType: string = 'nuevo';
	currentId: number;
	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

	form: FormGroup;

	almacen: Almacen;

	localidadesFormArray: FormArray;

	@ViewChild('sucursalSelect') sucursalSelect: PixvsMatSelectComponent;
	sucursalControl: FormControl = new FormControl();
	sucursales: SucursalComboProjection[];

	@ViewChild('responsableSelect') responsableSelect: PixvsMatSelectComponent;
	responsableControl: FormControl = new FormControl();
	usuarios: UsuarioComboProjection[];

	@ViewChild('paisSelect') paisSelect: PixvsMatSelectComponent;
	paisControl: FormControl = new FormControl();
	paises: PaisComboProjection[];

	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
	estadoControl: FormControl = new FormControl();
	estados: EstadoComboProjection[];

	activoControl: FormControl = new FormControl();
	mismaDireccionSucursalControl: FormControl = new FormControl();
	predeterminadoControl: FormControl = new FormControl();
	esCediControl: FormControl = new FormControl();

	columnasTablaLocalidadesCatalogo: any[] = [{
		name: 'codigoLocalidad',
		title: 'Código',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: true
	}, {
		name: 'nombre',
		title: 'Nombre',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: false
	}, {
		name: 'activo',
		title: 'Activo',
		class: "mat-column-80",
		centrado: false,
		type: 'boolean',
		tooltip: false
	}];
	columnasFechasTablaLocalidadesCatalogo: string[] = [];
	displayedColumnsTablaLocalidadesCatalogo: string[] = ['codigoLocalidad', 'nombre', 'activo'];

	localidadEditar: LocalidadListadoProjection = null;

	camposListado: FieldConfig[] = [];

	articulos: ArticuloTipoComboProjection[] = [];

	articulosControl: FormControl = new FormControl(null, []);

	esConsignacionCliente: boolean = false;

    localidadesArticulosActivos= [];
	// Private
	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _almacenService: AlmacenService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		public _localidadService: LocalidadService
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.almacen = new Almacen();
			}

			this.config = {
				rutaAtras: "/app/catalogos/almacenes",
				rutaBorrar: "/api/v1/almacenes/delete/",
				icono: "store"
			}

			// this._almacenService.getDatos();

		});

		this.serviceSubscriptions();
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	serviceSubscriptions() {
		this._almacenService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
			if (datos) {
				this._almacenService.onDatosChanged.next(null);

				this.almacen = datos.almacen || new Almacen();
				this.esConsignacionCliente = !!this.almacen.cliente;

				if(this.almacen?.id){
					this.titulo = this.almacen.codigoAlmacen;
                    this.localidadesArticulosActivos = datos.localidaedesArticulosActivos;
				}
				this.articulos = datos.articulos;
				this.paises = datos.paises;

				this.createForms();

				if(this.paisSelect){
					this.paisSelect.setDatos(this.paises);
				}
				this.sucursales = datos.sucursales;
				if(this.sucursalSelect){
					this.sucursalSelect.setDatos(this.sucursales);
				}
				this.usuarios = datos.usuarios;
				if(this.responsableSelect){
					this.responsableSelect.setDatos(this.usuarios);
				}
				

				this.camposListado = [{
					type: 'input',
					label: 'Código de localidad',
					inputType: 'text',
					name: 'codigoLocalidad',
					validations: [{
							name: 'required',
							validator: Validators.required,
							message: 'Código requerido'
						},
						{
							name: 'maxlength',
							validator: Validators.maxLength(15),
							message: 'El código no debe sobrepasar los 15 caracteres'
						}
					]
				}, {
					type: 'input',
					label: 'Nombre de localidad',
					inputType: 'text',
					name: 'nombre',
					validations: [{
							name: 'required',
							validator: Validators.required,
							message: 'Nombre requerido'
						},
						{
							name: 'maxlength',
							validator: Validators.maxLength(200),
							message: 'El nombre no debe sobrepasar los 200 caracteres'
						}
					]
				}, {
					type: 'pixvsMatSelect',
					label: 'Artículos',
					name: 'articulos',
					formControl: this.articulosControl,
					validations: [],
					multiple: true,
					selectAll: false,
					list: this.articulos,
					campoValor: 'nombreArticulo',
					elementsPerScroll: 100
				}, {
					type: 'checkbox',
					label: 'Activo',
					name: 'activo'
				}];

				if (this.almacen.id) {
					this._localidadService.id = `all/${this.almacen.id}`;
					this._localidadService.getDatos();
				}
			}
		});
		this._almacenService.onComboEstadosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoEstados => {
			if (listadoEstados) {
				this._almacenService.onComboEstadosChanged.next(null);
				this.estados = listadoEstados;
				this.estadoSelect.setDatos(this.estados);
			}
		});
		this._localidadService.onGuardarChanged.subscribe(exitoso => {
			if (exitoso) {
				this._localidadService.onGuardarChanged.next(null);
				this._localidadService.getDatos();
			}
		});
	}

	createForms() {
		this.form = this.createForm();

		if (this.pageType == 'ver') {
			this.form.disable({
				emitEvent: false
			});
		} else {
			this.form.enable({
				emitEvent: false
			});
		}
	}

	createForm(): FormGroup {

		this.sucursalControl = new FormControl(this.almacen.sucursal, [Validators.required]);
		this.responsableControl = new FormControl(this.almacen.responsable, [Validators.required]);
		this.mismaDireccionSucursalControl = new FormControl(this.almacen.mismaDireccionSucursal || false, []);
		this.activoControl = new FormControl(this.almacen.activo || (this.pageType == 'nuevo'), []);
		this.predeterminadoControl = new FormControl(this.almacen.predeterminado || false, []);
		this.esCediControl = new FormControl(this.almacen.esCedi || false, []);
		this.localidadesFormArray = new FormArray([]);

		let direccionRequiredValidators: any[] = [];
		if ((!this.esConsignacionCliente && !this.almacen.mismaDireccionSucursal) || (this.esConsignacionCliente && !this.almacen.mismaDireccionCliente)) {
			direccionRequiredValidators = [Validators.required];
		}

		this.paisControl = new FormControl(this.almacen.pais, direccionRequiredValidators);
		this.estadoControl = new FormControl(this.almacen.estado, direccionRequiredValidators);

		this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.almacen.pais = this.paisControl.value || null;
			this.estadoSelect.setDatos([]);
			this.estadoControl.setValue(null);
			if (this.paisControl.value) {
				this.getComboEstados(this.almacen.pais.id);

			}
		});
		this.mismaDireccionSucursalControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if (this.mismaDireccionSucursalControl.value) {
				this.cambiarValidatorsDireccion(this.mismaDireccionSucursalControl.value);
			}
		});

		if(this.almacen.localidades){
			this.almacen.localidades.forEach(localidad =>{
				this.localidadesFormArray.push(this.createLocalidadForm(localidad,this.almacen.id));
			});
		}

		if(!!this.almacen.estado){
			this.estados = [this.almacen.estado];
		}

		let form = this._formBuilder.group({
			id: [this.almacen.id],
			codigoAlmacen: new FormControl(this.almacen.codigoAlmacen, [Validators.required, Validators.maxLength(12)]),
			nombre: new FormControl(this.almacen.nombre, [Validators.required, Validators.maxLength(250)]),
			//sucursal: this.sucursalControl,
			sucursal: this.almacen.sucursal,
			sucursalId: this.almacen.sucursalId,
			responsable: this.responsableControl,
			mismaDireccionSucursal: this.mismaDireccionSucursalControl,
			mismaDireccionCliente: new FormControl(this.almacen.mismaDireccionCliente,[]),
			domicilio: new FormControl(this.almacen.domicilio, direccionRequiredValidators.concat([Validators.maxLength(250)])),
			cp: new FormControl(this.almacen.cp, direccionRequiredValidators.concat([Validators.maxLength(5),Validators.pattern('[0-9]+')])),
			colonia: new FormControl(this.almacen.colonia, direccionRequiredValidators.concat([Validators.maxLength(250)])),
			ciudad: new FormControl(this.almacen.ciudad, direccionRequiredValidators.concat([Validators.maxLength(100)])),
			pais: this.paisControl,
			estado: this.estadoControl,
			telefono: new FormControl(this.almacen.telefono, direccionRequiredValidators.concat([Validators.maxLength(100)])),
			extension: new FormControl(this.almacen.extension, [Validators.maxLength(3),Validators.pattern('[0-9]+')]),
			activo: this.activoControl,
			localidadesBandera: new FormControl(this.almacen.localidadesBandera),
			predeterminado: this.predeterminadoControl,
			esCedi: this.esCediControl,
			cliente: new FormControl(this.almacen.cliente,[]),
			localidades: this.localidadesFormArray
		});

		form.controls['mismaDireccionCliente'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if (form.controls['mismaDireccionCliente'].value) {
				this.cambiarValidatorsDireccion(form.controls['mismaDireccionCliente'].value);
			}
		});

		return form;
	}

	createLocalidadForm(localidad: LocalidadListadoProjection, idAlmacen: number){
		let art = this.articulos.filter(a => !!this.localidadesArticulosActivos.find(x => x.localidadId === localidad.id && x.articuloId === a.id))
		let form = this._formBuilder.group({
			id:[localidad.id],
			codigoLocalidad: new FormControl(localidad.codigoLocalidad),
			nombre: new FormControl(localidad.nombre),
			localidadGeneral: new FormControl(localidad.localidadGeneral),
			activo: new FormControl(localidad.activo),
			articulos: new FormControl(art)
		});
		return form;
	}

	cambiarValidatorsDireccion(required: boolean) {
		let direccionRequiredValidators: any[] = [];
		if (!required) {
			direccionRequiredValidators = [Validators.required];
		}

		this.form.controls.domicilio.setValidators(direccionRequiredValidators.concat([Validators.maxLength(250)]));
		this.form.controls.domicilio.updateValueAndValidity();
		this.form.controls.cp.setValidators(direccionRequiredValidators.concat([Validators.maxLength(10)]));
		this.form.controls.cp.updateValueAndValidity();
		this.form.controls.colonia.setValidators(direccionRequiredValidators.concat([Validators.maxLength(250)]));
		this.form.controls.colonia.updateValueAndValidity();
		this.form.controls.ciudad.setValidators(direccionRequiredValidators.concat([Validators.maxLength(100)]));
		this.form.controls.ciudad.updateValueAndValidity();
		this.form.controls.pais.setValidators(direccionRequiredValidators);
		this.form.controls.pais.updateValueAndValidity();
		this.form.controls.estado.setValidators(direccionRequiredValidators);
		this.form.controls.estado.updateValueAndValidity();
		this.form.controls.telefono.setValidators(direccionRequiredValidators.concat([Validators.maxLength(100)]));
		this.form.controls.telefono.updateValueAndValidity();
	}

	guardar(event) {

		this._almacenService.cargando = true;
		if (!this.form.valid) { this.form.markAllAsTouched(); }
		if (this.form.valid) {
			this.form.disable({emitEvent: false});
			let almacen = {fechaModificacion: this.almacen.fechaModificacion};
			Object.assign(almacen, this.form.value);

			this._almacenService.guardar(JSON.stringify(almacen), '/api/v1/almacenes/save').then(
				(result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._almacenService.cargando = false;
						this.form.enable({
							emitEvent: false
						});
					}
				}
			);
		} else {
			this._almacenService.cargando = false;
			this.form.enable({
				emitEvent: false
			});

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

	isRequired(form: FormGroup, campo: string) {

		let form_field = form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	getComboEstados(paisId: number) {
		this._almacenService.getComboEstados(paisId);
	}

	nuevaLocalidad() {
		this.localidadEditar = null;
		this.articulosControl.setValue(null);
		this.abrirModalLocalidad(null, null);
	}

	onEditarLocalidad(localidadId: number) {
		if(this.form.enabled && !this.esConsignacionCliente){
			this.localidadEditar = this._localidadService.datosMap[localidadId];
			this.articulosControl.setValue(this.localidadEditar.articulos || null);
			//this.abrirModalLocalidad(this.localidadEditar);
		}
	}

	localidadEdicionIndex: number = null;
	abrirModalLocalidad(localidad: LocalidadListadoProjection, index: number): void {
		this.localidadEdicionIndex = index;
        if(!!localidad){
            let art = this.articulos.filter(a => !!this.localidadesArticulosActivos.find(x => x.localidadId === localidad.id && x.articuloId === a.id) );
            this.articulosControl.setValue(art);

            localidad.articulos = art;
        }

		let dialogData: LocalidadDialogData = {
			esNuevo: !localidad,
			localidad,
			camposListado: this.camposListado,
			onAceptar: this.onAceptarLocalidadDialog.bind(this)
		};

		const dialogRef = this.dialog.open(LocalidadDialogComponent, {
			width: '300px',
			data: dialogData
		});
	}

	onAceptarLocalidadDialog(localidad: any) {
		//console.log('localidad',localidad);
		let articulos = new FormControl();
		let _localidadesArticulosActivos: any = [];
		if(localidad.articulos){
			let artTemp = [];
			localidad.articulos.forEach(articulo =>{
				let locArtModel: {
					localidadId: number,
					articuloId: number
				} = {
					localidadId: localidad.id,
					articuloId: articulo.id
				};
				artTemp.push(articulo);
				_localidadesArticulosActivos.push(locArtModel);
			});
			articulos = new FormControl(artTemp);
			this.localidadesArticulosActivos = _localidadesArticulosActivos;
		}
		let form = this._formBuilder.group({
			id:[localidad.id],
			codigoLocalidad: new FormControl(localidad.codigoLocalidad),
			nombre: new FormControl(localidad.nombre),
			almacenId: new FormControl(this.almacen.id),
			activo: new FormControl(!!localidad?.activo),
			articulos: articulos
		});
		if(localidad.esNuevo){
			this.localidadesFormArray.push(form);
		}else{
			let index = this.localidadEdicionIndex;
			/*
			index = this.localidadesFormArray.value.findIndex(local =>{
				return localidad.codigoLocalidad == local.codigoLocalidad
			});*/

			this.localidadesFormArray.removeAt(index);
			this.localidadesFormArray.insert(index, form);
			this.localidadEdicionIndex = null;
		}
		
		//console.log(this.localidadesFormArray);
		/*let localidadEditar: any = {
			...this.localidadEditar
		};
		Object.assign(localidadEditar, localidad);
		localidadEditar.almacenId = this.almacen.id;
		// if(!localidadEditar.articulos.length){
		// 	localidadEditar.articulos = {};
		// }
		this._localidadService.guardar(localidadEditar);*/
	}

	createLocalidadArticuloComboForm(articulo: Articulo){
		let form = this._formBuilder.group({
			id:[articulo.id],
			codigoArticulo: new FormControl(articulo.codigoArticulo),
			nombreArticulo:new FormControl(articulo.nombreArticulo),
			codigoAlterno:new FormControl(articulo.codigoAlterno),
			nombreAlterno:new FormControl(articulo.nombreAlterno),
			tipoArticuloId:new FormControl(articulo.tipoArticuloId),
			articuloSubtipoId:new FormControl(articulo.articuloSubtipoId),
			familia:new FormControl(articulo.familia),
			categoria:new FormControl(articulo.categoria),
			subcategoria:new FormControl(articulo.subcategoria),
			unidadMedidaInventario:new FormControl(articulo.unidadMedidaInventario)
		});
		return form;
	}

}