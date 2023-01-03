import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import * as moment from 'moment';
import { AlumnoEditarProjection } from '@app/main/modelos/alumno';
import { AlumnoService } from './alumno.service';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { ControlMaestroMultipleComboProjection, ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { AlumnoContactoEditarProjection } from '@app/main/modelos/alumno-contacto';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { AlumnosRepetidosDialogComponent, AlumnosRepetidosDialogData } from './dialogs/alumnos-repetidos/alumnos-repetidos.dialog';
import { MunicipioComboProjection } from '@app/main/modelos/municipio';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { ListadoMenuOpciones } from '@models/ficha-listado-config';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { SATRegimenFiscalComboProjection } from '@models/sat-regimen-fiscal';
import { KardexAlumnoService } from '../../kardex-alumno/kardex-alumno/kardex-alumno.service';
import { AlumnoDatosFacturacion } from '@app/main/modelos/alumno-datos-facturacion';

@Component({
    selector: 'alumno',
    templateUrl: './alumno.component.html',
    styleUrls: ['./alumno.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AlumnoComponent {
	@HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }
    
    isLoading: boolean = false;

	// Propiedades de configuración de la ficha
	pageType: string = 'nuevo';
	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    currentId: number;
	acciones: ListadoMenuOpciones[] = [];
	deshabilitarBotones: boolean = true;

	// Propiedades de edición de la ficha
	alumno: AlumnoEditarProjection;
	permiteEditar: boolean = false;
	
	// Propiedades de formulario principal
	form: FormGroup;
	@ViewChild('estadoNacimientoSelect') estadoNacimientoSelect: PixvsMatSelectComponent;
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
	@ViewChild('municipioNacimientoSelect') municipioNacimientoSelect: PixvsMatSelectComponent;
	@ViewChild('municipioSelect') municipioSelect: PixvsMatSelectComponent;
	@ViewChild('carreraSelect') carreraSelect: PixvsMatSelectComponent;
	@ViewChild('medioEnteradoProulexSelect') medioEnteradoProulexSelect: PixvsMatSelectComponent;
	@ViewChild('razonEleccionProulexSelect') razonEleccionProulexSelect: PixvsMatSelectComponent;
	
	// Propiedades de formulario contacto
	formContacto: FormGroup;
	parentescoControl: FormControl = new FormControl();
	telefonoFijoContactoControl: FormControl = new FormControl();
	telefonoMovilContactoControl: FormControl = new FormControl();
	telefonoTrabajoContactoControl: FormControl = new FormControl();
	telefonoTrabajoExtensionContactoControl: FormControl = new FormControl();
	telefonoMensajeriaInstantaneaContactoControl: FormControl = new FormControl();

	// Propiedades de formulario contacto
	formFacturacion: FormGroup;
	tipoPersonaFacturacionControl: FormControl = new FormControl();
	paisFacturacionControl: FormControl = new FormControl();
	estadoFacturacionControl: FormControl = new FormControl();
	@ViewChild('estadoFacturacionSelect') estadoFacturacionSelect: PixvsMatSelectComponent;
	@ViewChild('municipioFacturacionSelect') municipioFacturacionSelect: PixvsMatSelectComponent;
	telefonoFijoFacturacionControl: FormControl = new FormControl();
	telefonoMovilFacturacionControl: FormControl = new FormControl();
	telefonoTrabajoFacturacionControl: FormControl = new FormControl();
	telefonoTrabajoExtensionFacturacionControl: FormControl = new FormControl();
	telefonoMensajeriaInstantaneaFacturacionControl: FormControl = new FormControl();
	regimenFiscalControl: FormControl = new FormControl();

	// Listados
	paises: PaisComboProjection[] = [];
	estadosNacimiento: EstadoComboProjection[] = [];
	estados: EstadoComboProjection[] = [];
	estadosFacturacion: EstadoComboProjection[] = [];
	municipiosNacimiento: MunicipioComboProjection[] = [];
	municipios: MunicipioComboProjection[] = [];
	municipiosFacturacion: MunicipioComboProjection[] = [];
	generos: ControlMaestroMultipleComboProjection[] = [];
	parentescos: ControlMaestroMultipleComboProjection[] = [];
	tiposPersona: ControlMaestroMultipleComboProjection[] = [];
	sucursales: SucursalComboProjection[] = [];
	programasJOBS: ControlMaestroMultipleComboProjection[] = [];
	centrosUniversitarios: ControlMaestroMultipleComboProjection[] = [];
	preparatorias: ControlMaestroMultipleComboProjection[] = [];
	carreras: ControlMaestroMultipleComboProjection[] = [];
	turnos: ControlMaestroMultipleComboProjection[] = [];
	grados: ControlMaestroMultipleComboProjection[] = [];
	mediosEnteradoProulex: ControlMaestroMultipleComboProjection[] = [];
	razonesEleccionProulex: ControlMaestroMultipleComboProjection[] = [];
	tiposAlumnos: any[] = [{id: 1, nombre: "PROULEX"}, {id: 2, nombre: "JOBS"}, {id: 3, nombre: "CURSO PERSONALIZADO"}];
	listRegimenFiscal: SATRegimenFiscalComboProjection[] = [];
	listRegimenFiscalFiltrado: SATRegimenFiscalComboProjection[] = [];
	
	// Misc
	private rfcExtranjero: string;
	pasosStepper: string[] = [
		'Datos generales',
		'Datos de contacto',
		'Datos de facturación'
	];
	pasoSeleccionado: number = 0;
	edadMostrar: string = '';
	croppedImage: any = '';
	imageChangedEvent: any = '';
	idContactoTmp: number = 1;
	idFacturacionTmp: number = 1;
	existeFacturacionPredeterminada: boolean = false;
	CMM_RFC_TipoPersona = ControlesMaestrosMultiples.CMM_RFC_TipoPersona;
	@ViewChild('contenedorFicha') contenedorFicha;
	contactoEditar: AlumnoContactoEditarProjection = null;
	facturacionEditar: AlumnoDatosFacturacion = null;
	fichaVolver: string = null;
	vistaVolver: string = null;
	qParams: any = null;
	CMM_ALU_ProgramaJOBS = ControlesMaestrosMultiples.CMM_ALU_ProgramaJOBS;
	esMayorEdad: boolean = true;
	alumnosRepetidos: AlumnoEditarProjection[] = [];
	camposNuevoRegistroSelectMedioEnterado: FieldConfig[] = [{
		type: "input",
		label: "Medio",
		inputType: "text",
		name: "valor",
		validations: [
			{name: "required", validator: Validators.required, message: "Medio requerido" },
			{name: "maxlength", validator: Validators.maxLength(255), message: "El medio no debe sobrepasar los 255 caracteres"}
		]
	}];
	camposNuevoRegistroSelectRazonEleccion: FieldConfig[] = [{
		type: "input",
		label: "Razón",
		inputType: "text",
		name: "valor",
		validations: [
			{name: "required", validator: Validators.required, message: "Razón requerida" },
			{name: "maxlength", validator: Validators.maxLength(255), message: "La razón no debe sobrepasar los 255 caracteres"}
		]
	}];
	urlKardexBlob: string = null;

	// Private
	private _unsubscribeAll: Subject < any > ;
	private puedeBorrar: boolean;

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
		public _alumnoService: AlumnoService,
		public _kardexService: KardexAlumnoService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the default
		this.alumno = new AlumnoEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.queryParamMap.subscribe(qParams => {
			this.fichaVolver = qParams.get("fichaVolver");
			this.vistaVolver = qParams.get("vistaVolver");
			this.qParams = qParams;
		});

		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.alumno = new AlumnoEditarProjection();
			}else{
				this.pasosStepper = [
					'Datos generales',
					'Datos de contacto',
					'Datos de facturación',
					'Historial académico'
				];
				this.acciones = [{
					title: 'Historial académico',
					tipo: null,
					icon: 'print'
				}];
			}

			if(this.fichaVolver == 'PuntoVenta'){
				this.config = {
					rutaAtras: "/app/ventas/punto-venta/abierto",
					queryParamsRutaAtras: {
						precargarPrevio: 'true'
					},
					rutaBorrar: `${this.apiUrl}/delete/`,
					icono: "person"
				};
			}else{
				this.config = {
					rutaAtras: "/app/control-escolar/alumnos",
					rutaBorrar: "/api/v1/alumnos/delete/",
					icono: "person"
				};
			}

		});

		// Subscribe to update datos on changes
		this._alumnoService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.alumno) {
					this.permiteEditar = datos.permiteEditar;
					this.alumno = datos.alumno;
					this._alumnoService.getKardex(this.alumno.codigo);
					this.titulo = this.alumno.codigo;
					//TODO: Mover el calculo de edad a una función
					let fechaActualMoment = moment();
					let totalMeses = fechaActualMoment.diff(moment(this.alumno.fechaNacimiento),'months');
					let anios = Math.floor(totalMeses/12);
					let meses = totalMeses%12;
					if(anios >= 18){
						this.esMayorEdad = true;
					}else{
						this.esMayorEdad = false;
					}
					this.edadMostrar = `${anios} años`;
					if(meses > 0){
						this.edadMostrar += `, ${meses} meses`;
					}
					this.alumno.contactos.forEach(contacto => {
						contacto.idTmp = this.idContactoTmp++;
					});
					this.alumno.facturacion.forEach(facturacion => {
						facturacion.idTmp = this.idFacturacionTmp++;
						if(facturacion.predeterminado){
							this.existeFacturacionPredeterminada = true;
						}
					});
				} else {
					this.alumno = new AlumnoEditarProjection();
				}

				// Inicializar listados
				this.paises = datos.paises;
				this.estadosNacimiento = datos.estadosNacimiento;
				this.estados = datos.estados;
				this.estadosFacturacion = this.estados;
				this.municipiosNacimiento = datos.municipiosNacimiento;
				this.municipios = datos.municipios;
				this.generos = datos.generos;
				this.parentescos = datos.parentescos;
				this.tiposPersona = datos.tiposPersona;
				this.sucursales = datos.sucursales;
				this.programasJOBS = datos.programasJOBS;
				this.centrosUniversitarios = datos.centrosUniversitarios;
				this.preparatorias = datos.preparatorias;
				this.carreras = datos.carreras;
				this.turnos = datos.turnos;
				this.grados = datos.grados;
				this.mediosEnteradoProulex = datos.mediosEnteradoProulex;
				this.razonesEleccionProulex = datos.razonesEleccionProulex;
				this.listRegimenFiscal = datos.listRegimenFiscal;
				this.puedeBorrar = datos.puedeBorrar;

				if(this.qParams.get('sede')){
					let sucursalId: number = this.hashid.decode(this.qParams.get('sede'));
					this.alumno.sucursal = this.sucursales.find(sucursal => {
						return sucursal.id == sucursalId;
					});
				}

				if(!!this.alumno?.centroUniversitarioJOBS){
					this._alumnoService.getCarreras(this.alumno.centroUniversitarioJOBS?.id);
				}
				
                // Inicializar Misc
                this.rfcExtranjero = datos.rfcExtranjero;

				if(!!datos?.alumno || !this.qParams.get('becaSindicato')){
					// Inicializar form
					this.form = this.createAlumnoForm();
					this.setFormContacto();
					this.setFormFacturacion();
	
					if (this.pageType == 'ver') {
						this.form.disable({emitEvent: false});
					} else {
						this.form.enable({emitEvent: false});
					}
				}else{
					this._alumnoService.cargando = true;
					this._alumnoService.getDatosBeca(this.hashid.decode(this.qParams.get('becaSindicato')));
				}

			});

		// Subscribe to update estados on changes
		this._alumnoService.onEstadosNacimientoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((estados: EstadoComboProjection[]) => {
				if (estados != null) {
					this.municipiosNacimiento = [];
					this.form.get('municipioNacimiento').setValue(null);
					this.estadosNacimiento = estados;
					if(!!this.estadoNacimientoSelect){
						this.estadoNacimientoSelect.setDatos(this.estadosNacimiento);
					}
				}
			});
		this._alumnoService.onEstadosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((estados: EstadoComboProjection[]) => {
				if (estados != null) {
					this.municipios = [];
					this.form.get('municipio').setValue(null);
					this.estados = estados;
					if(!!this.estadoSelect){
						this.estadoSelect.setDatos(this.estados);
					}
				}
			});
		this._alumnoService.onEstadosFacturacionChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((estados: EstadoComboProjection[]) => {
				if (estados != null) {
					this.municipiosFacturacion = [];
					if(!!this.formFacturacion.get('municipio')){
						this.formFacturacion.get('municipio').setValue(null);
					}
					this.estadosFacturacion = estados;
					if(!!this.estadoFacturacionSelect){
						this.estadoFacturacionSelect.setDatos(this.estadosFacturacion);
					}
				}
			});
		this._alumnoService.onMunicipiosNacimientoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((municipios: MunicipioComboProjection[]) => {
				if (municipios != null) {
					this._alumnoService.onMunicipiosNacimientoChanged.next(null);
					this.municipiosNacimiento = municipios;
					if(!!this.municipioNacimientoSelect){
						this.municipioNacimientoSelect.setDatos(this.municipiosNacimiento);
					}
					this.form.get('municipioNacimiento').setValue(null);
				}
			});
		this._alumnoService.onMunicipiosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((municipios: MunicipioComboProjection[]) => {
				if (municipios != null) {
					this._alumnoService.onMunicipiosChanged.next(null);
					this.municipios = municipios;
					if(!!this.municipioSelect){
						this.municipioSelect.setDatos(this.municipios);
					}
					this.form.get('municipio').setValue(null);
				}
			});
		this._alumnoService.onMunicipiosFacturacionChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((municipios: MunicipioComboProjection[]) => {
				if (municipios != null) {
					this._alumnoService.onMunicipiosFacturacionChanged.next(null);
					this.municipiosFacturacion = municipios;
					if(!!this.municipioFacturacionSelect){
						this.municipioFacturacionSelect.setDatos(this.municipiosFacturacion);
					}
					this.formFacturacion.get('municipio').setValue(null);
				}
			});
		this._alumnoService.onCarrerasChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((carreras: ControlMaestroMultipleComboProjection[]) => {
				if (carreras != null) {
					this.carreras = carreras;
					if(!!this.carreraSelect){
						this.carreraSelect.setDatos(this.carreras);
					}
				}
			});
		this._alumnoService.onDatosBecaChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((alumno: AlumnoEditarProjection) => {
				if (alumno != null) {
					this._alumnoService.onDatosBecaChanged.next(null);
					this.alumno = alumno;
					
					// Inicializar form
					this.form = this.createAlumnoForm();
					this.setFormContacto();
					this.setFormFacturacion();
	
					if (this.pageType == 'ver') {
						this.form.disable({emitEvent: false});
					} else {
						this.form.enable({emitEvent: false});
					}
				}
			});
		this._alumnoService.onAlumnosRepetidosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((responseBody: any) => {
				if (!!responseBody) {
					this._alumnoService.onAlumnosRepetidosChanged.next(null);
					this.alumnosRepetidos = responseBody.alumnosRepetidos || [];
					
					if(!!this.alumnosRepetidos?.length) {
						let dialogData: AlumnosRepetidosDialogData = {
							alumnosRepetidos: this.alumnosRepetidos,
							onCancelar: this.onCancelarAlumnosRepetidosDialog.bind(this)
						};
				
						const dialogRef = this.dialog.open(AlumnosRepetidosDialogComponent, {
							width: '600px',
							data: dialogData
						});
					}
				}
			});
		this._alumnoService.onMediosEnteradoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((responseBody: any) => {
				if (!!responseBody) {
					this._alumnoService.onMediosEnteradoChanged.next(null);
					this.form.get('medioEnteradoProulex').setValue(null);
					this.medioEnteradoProulexSelect.setDatos(responseBody.mediosEnteradoProulex);
					if(!!responseBody.id){
						let medio = responseBody.mediosEnteradoProulex.find(medio => {
							return medio.id == responseBody.id;
						});
						this.form.get('medioEnteradoProulex').setValue(medio);
					}
				}
			});
		this._alumnoService.onRazonesEleccionChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((responseBody: any) => {
				if (!!responseBody) {
					this._alumnoService.onRazonesEleccionChanged.next(null);
					this.form.get('razonEleccionProulex').setValue(null);
					this.razonEleccionProulexSelect.setDatos(responseBody.razonesEleccionProulex);
					if(!!responseBody.id){
						let razonEleccion = responseBody.razonesEleccionProulex.find(razonEleccion => {
							return razonEleccion.id == responseBody.id;
						});
						this.form.get('razonEleccionProulex').setValue(razonEleccion);
					}
				}
			});
		this._alumnoService.onKardexUrlChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((responseBody: any) => {
				if (!!responseBody) {
					this._alumnoService.onKardexUrlChanged.next(null);
					this.urlKardexBlob = responseBody;
				}
			});

	}

	createAlumnoForm(): FormGroup {

		//Creamos un objeto con los validadores para los campos del formulario
		let validadores = {
			nombre: [Validators.maxLength(50),Validators.required],
			primerApellido: [Validators.maxLength(50),Validators.required],
			segundoApellido: [Validators.maxLength(50)],
			sucursal: [Validators.required],
			codigoUDG: [Validators.maxLength(150)],
			codigoUDGAlterno: [Validators.maxLength(150)],
			fechaNacimiento: [Validators.required],
			genero: [Validators.required],
			curp: [Validators.maxLength(30)],
			empresaOEscuela: [Validators.maxLength(255)],
			problemaSaludOLimitante: [Validators.maxLength(255)],
			bachilleratoTecnologico: [Validators.maxLength(255)],
			domicilio: [Validators.maxLength(250)],
			colonia: [Validators.maxLength(250)],
			cp: [Validators.maxLength(10), Validators.required],
			ciudad: [Validators.maxLength(100)],
			correoElectronico: [Validators.maxLength(50), Validators.required],
			telefonoFijo: [Validators.maxLength(50)],
			telefonoMovil: [Validators.maxLength(50)],
			telefonoTrabajo: [Validators.maxLength(50)],
			telefonoTrabajoExtension: [Validators.maxLength(10)],
			telefonoMensajeriaInstantanea: [Validators.maxLength(50)],
			codigoAlumnoUDG: [Validators.minLength(9),Validators.maxLength(15)],
			grupo: [Validators.maxLength(5)],
			referencia: new FormControl()
		};

		let form = new FormGroup({});
		Object.keys(this.alumno).forEach((field) => {
			form.addControl(field, this._formBuilder.control(this.alumno[field], validadores[field] || null));
		});
		form.addControl('img64', this._formBuilder.control(null));
		form.addControl('tipo', this._formBuilder.control(null));

		if(this.pageType === 'nuevo')
			form.get('tipo').setValue(this.tiposAlumnos[0]);
		else{
			if(!!this?.alumno?.programaJOBS)
				form.get('tipo').setValue(this.tiposAlumnos[1]);
			else if(!!this?.alumno?.folio || !!this?.alumno?.dependencia)
				form.get('tipo').setValue(this.tiposAlumnos[2]);
			else
				form.get('tipo').setValue(this.tiposAlumnos[0]);
		}


		if(!!this.alumno?.fechaNacimiento)
			form.get('fechaNacimiento').setValue(moment(this.alumno?.fechaNacimiento).format('DDMMYYYY'));

		//Subscriptions
		form.get('nombre').valueChanges.pipe(distinctUntilChanged()).pipe(takeUntil(this._unsubscribeAll),debounceTime(500)).subscribe((nombre: string) => {
			if(nombre){
				form.get('nombre').patchValue(nombre.toUpperCase());
				this.validarRegistrosRepetidos();
			}
		});
		form.get('primerApellido').valueChanges.pipe(distinctUntilChanged()).pipe(takeUntil(this._unsubscribeAll),debounceTime(500)).subscribe((primerApellido: string) => {
			if(primerApellido){
				form.get('primerApellido').patchValue(primerApellido.toUpperCase());
				this.validarRegistrosRepetidos();
			}
		});
		form.get('segundoApellido').valueChanges.pipe(distinctUntilChanged()).pipe(takeUntil(this._unsubscribeAll),debounceTime(500)).subscribe((segundoApellido: string) => {
			if(segundoApellido){
				form.get('segundoApellido').patchValue(segundoApellido.toUpperCase());
				this.validarRegistrosRepetidos();
			}
		});
		form.get('fechaNacimiento').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((fecha: string) => {
			this.edadMostrar = '';
			if(fecha && fecha.length == 8){
				//TODO: Mover el calculo de edad a una función
				let f = moment(fecha,'DDMMYYYY');
				let totalMeses = moment().diff(f,'months');
				let anios = Math.floor(totalMeses/12);
				let meses = totalMeses%12;
				this.esMayorEdad = (anios >= 18);
				this.edadMostrar = `${anios} años`;
				if(meses > 0){
					this.edadMostrar += `, ${meses} meses`;
				}
				this.validarRegistrosRepetidos();
			}
		});
		form.get('paisNacimiento').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if(!!pais){
				this._alumnoService.getEstadosNacimiento(pais.id);
			}else{
				this.municipiosNacimiento = [];
				this.form.get('municipioNacimiento').setValue(null);
			}
		});
		form.get('pais').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if(!!pais){
				this._alumnoService.getEstados(pais.id);
			}else{
				this.municipios = [];
				this.form.get('municipio').setValue(null);
			}
		});
		form.get('estadoNacimiento').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((estado: EstadoComboProjection) => {
			if(!!estado){
				this._alumnoService.getMunicipiosNacimiento(estado.id);
			}else{
				this.municipiosNacimiento = [];
				this.form.get('municipioNacimiento').setValue(null);
			}
		});
		form.get('estado').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((estado: EstadoComboProjection) => {
			if(!!estado){
				this._alumnoService.getMunicipios(estado.id);
			}else{
				this.municipios = [];
				this.form.get('municipio').setValue(null);
			}
		});
		form.get('tipo').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( tipoAlumno => {
			if(!!tipoAlumno){
				let camposPROULEX = ['fechaNacimiento','cp','correoElectronico'];
				let camposJOBS = ['programaJOBS', 'codigoAlumnoUDG', 'centroUniversitarioJOBS', 'preparatoriaJOBS', 'carreraJOBS', 'turno', 'grado', 'grupo'];
				let camposPCP = ['folio', 'dependencia'];

				if(tipoAlumno?.id === 1) { //Es PROULEX
					camposJOBS.forEach( campo => {
						form.get(campo).setValue(null);
						form.get(campo).clearValidators();
					});
					camposPCP.forEach( campo => {
						form.get(campo).setValue(null);
						form.get(campo).clearValidators();
					});
					camposPROULEX.forEach( campo => {
						form.get(campo).setValidators([Validators.required]);
					});
				}
				else if(tipoAlumno?.id === 2) { //Es JOBS
					form.get('programaJOBS').setValidators([Validators.required]);
					form.get('codigoAlumnoUDG').setValidators([Validators.required]);
					camposPCP.forEach( campo => {
						form.get(campo).setValue(null);
						form.get(campo).clearValidators();
					});
					camposPROULEX.forEach( campo => {
						form.get(campo).clearValidators();
					});
				} 
				else if(tipoAlumno?.id === 3) { //Es PCP
					camposJOBS.forEach( campo => {
						form.get(campo).setValue(null);
						form.get(campo).clearValidators();
					});
					camposPROULEX.forEach( campo => {
						form.get(campo).clearValidators();
					});
				}
				[].concat.apply([],[camposJOBS, camposPCP, camposPROULEX]).forEach( campo => {
					form.get(campo).updateValueAndValidity();
				});
			}
		});
		form.get('programaJOBS').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {

			if(!!value){
				let camposPROULEX = ['fechaNacimiento','cp','correoElectronico'];
				let camposJOBS = ['centroUniversitarioJOBS','carreraJOBS'];
				let camposSEMS = ['preparatoriaJOBS','turno','grado','grupo','fechaNacimiento'];
				switch(value?.id){
					case ControlesMaestrosMultiples.CMM_ALU_ProgramaJOBS.JOBS:
						camposSEMS.forEach(campo => { //Limpiar los campos de JOBS SEMS
							form.get(campo).setValue(null);
							form.get(campo).clearValidators();
						});

						camposPROULEX.forEach(campo => { //Marcar como no requeridos los campos de PROULEX
							form.get(campo).clearValidators();
						});

						camposJOBS.forEach(campo => { //Marcar los campos de JOBS como requeridos
							form.get(campo).setValidators([Validators.required]);
						});
					break;
					case ControlesMaestrosMultiples.CMM_ALU_ProgramaJOBS.JOBS_SEMS:
						camposJOBS.forEach(campo => { //Limipar los campos de JOBS
							form.get(campo).setValue(null);
							form.get(campo).clearValidators();
						});

						camposPROULEX.forEach(campo => { //Marcar como no requeridos los campos de PROULEX
							form.get(campo).clearValidators();
						});

						camposSEMS.forEach(campo => { //Marcar los campos de JOBS SEMS como requeridos
							form.get(campo).setValidators([Validators.required]);
						});
					break;
					default:
						camposJOBS.concat(camposSEMS).forEach(campo => { //Limipiar todos los campos de JOBS y JOBS SEMS
							form.get(campo).setValue(null);
							form.get(campo).clearValidators();
						});

						camposPROULEX.forEach(campo => { //Marcar como no requeridos los campos de PROULEX
							form.get(campo).setValidators([Validators.required]);
						});
					break;
				}
				/*
				camposJOBS.concat(camposSEMS).concat(camposPROULEX).forEach(campo => {
					form.get(campo).updateValueAndValidity();
				});*/
				form.updateValueAndValidity();
			}
			
		});
		form.get('centroUniversitarioJOBS').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((centro: ControlMaestroMultipleComboProjection) => {
			if(!!centro)
				this._alumnoService.getCarreras(centro.id);
			else
				this.carreras = [];
		});
		
		return form;
	}

	createContactoForm(): FormGroup {

		// Inicializar FormControls
		this.parentescoControl = new FormControl(this.contactoEditar?.parentesco || null,[Validators.required]);
		this.telefonoFijoContactoControl = new FormControl(this.contactoEditar?.telefonoFijo || null,[Validators.maxLength(50)]);
		this.telefonoMovilContactoControl = new FormControl(this.contactoEditar?.telefonoMovil || null,[Validators.maxLength(50)]);
		this.telefonoTrabajoContactoControl = new FormControl(this.contactoEditar?.telefonoTrabajo || null,[Validators.maxLength(50)]);
		this.telefonoTrabajoExtensionContactoControl = new FormControl(this.contactoEditar?.telefonoTrabajoExtension || null,[Validators.maxLength(10)]);
		this.telefonoMensajeriaInstantaneaContactoControl = new FormControl(this.contactoEditar?.telefonoMensajeriaInstantanea || null,[Validators.maxLength(50)]);
		
		// Subscripciones FormControl.valueChanges
		// ...

		// Inicializar Form
		let form = this._formBuilder.group({
			idTmp: [this.contactoEditar?.idTmp || this.idContactoTmp++],
			id: [this.contactoEditar?.id || null],
			nombre: new FormControl(this.contactoEditar?.nombre || null, [Validators.required,Validators.maxLength(50)]),
			primerApellido: new FormControl(this.contactoEditar?.primerApellido || null, [Validators.required,Validators.maxLength(50)]),
			segundoApellido: new FormControl(this.contactoEditar?.segundoApellido || null, [Validators.maxLength(50)]),
			parentesco: this.parentescoControl,
			telefonoFijo: this.telefonoFijoContactoControl,
			telefonoMovil: this.telefonoMovilContactoControl,
			telefonoTrabajo: this.telefonoTrabajoContactoControl,
			telefonoTrabajoExtension: this.telefonoTrabajoExtensionContactoControl,
			telefonoMensajeriaInstantanea: this.telefonoMensajeriaInstantaneaContactoControl,
			correoElectronico: new FormControl(this.contactoEditar?.correoElectronico || null, [Validators.required,Validators.email,Validators.maxLength(50)])
		});

		return form;
	}

	createFacturacionForm(): FormGroup {
		var datos = this.facturacionEditar?.datosFacturacion;

		// Inicializar FormControls
		this.tipoPersonaFacturacionControl = new FormControl(datos?.tipoPersona || null, [Validators.required])
		this.paisFacturacionControl = new FormControl(datos?.pais || null, [])
		this.estadoFacturacionControl = new FormControl(datos?.estado || null, [])
		this.telefonoFijoFacturacionControl = new FormControl(datos?.telefonoFijo || null, [])
		this.telefonoMovilFacturacionControl = new FormControl(datos?.telefonoMovil || null, [])
		this.telefonoTrabajoFacturacionControl = new FormControl(datos?.telefonoTrabajo || null, [])
		this.telefonoTrabajoExtensionFacturacionControl = new FormControl(datos?.telefonoTrabajoExtension || null, [])
		this.telefonoMensajeriaInstantaneaFacturacionControl = new FormControl(datos?.telefonoMensajeriaInstantanea || null, [])
		this.regimenFiscalControl = new FormControl(datos?.regimenFiscal || null, [Validators.required])

		switch (this.tipoPersonaFacturacionControl?.value?.id) {
			case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.FISICA:
				this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
					return model.fisica;
				});
				break;

			case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.MORAL:
				this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
					return model.moral;
				});
				break;
		}

		if (datos?.pais || null) {
			this._alumnoService.getEstadosFacturacion(datos.pais.id);
		}

		// Subscripciones FormControl.valueChanges
		this.tipoPersonaFacturacionControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoPersona: ControlMaestroMultipleComboProjection) => {
			this.updateDatosFacturacionRequired(tipoPersona);
		});

		this.paisFacturacionControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((pais: PaisComboProjection) => {
			if (!!pais) {
				this._alumnoService.getEstadosFacturacion(pais.id);
			}
		});

		// Inicializar Form
		let form = this._formBuilder.group({
			idTmp: [this.facturacionEditar?.idTmp || this.idFacturacionTmp++],
			id: [this.facturacionEditar?.id || null],
			predeterminado: new FormControl(this.facturacionEditar?.predeterminado || !this.existeFacturacionPredeterminada, []),
			datosFacturacionId: new FormControl(datos?.id || null, []),
			tipoPersona: this.tipoPersonaFacturacionControl,
			rfc: new FormControl(datos?.rfc || null, [Validators.required, Validators.maxLength(20)]),
			nombre: new FormControl(datos?.nombre || null, []),
			primerApellido: new FormControl(datos?.primerApellido || null, []),
			segundoApellido: new FormControl(datos?.segundoApellido || null, []),
			razonSocial: new FormControl(datos?.razonSocial || null, []),
			registroIdentidadFiscal: new FormControl(datos?.registroIdentidadFiscal || null, []),
			calle: new FormControl(datos?.calle || null, [Validators.maxLength(250)]),
			numeroExterior: new FormControl(datos?.numeroExterior || null, [Validators.maxLength(10)]),
			numeroInterior: new FormControl(datos?.numeroInterior || null, [Validators.maxLength(10)]),
			colonia: new FormControl(datos?.colonia || null, [Validators.maxLength(250)]),
			cp: new FormControl(datos?.cp || null, [Validators.required, Validators.maxLength(10)]),
			pais: this.paisFacturacionControl,
			estado: this.estadoFacturacionControl,
			ciudad: new FormControl(datos?.ciudad || null, []),
			correoElectronico: new FormControl(datos?.correoElectronico || null, [Validators.email, Validators.maxLength(50)]),
			telefonoFijo: this.telefonoFijoFacturacionControl,
			telefonoMovil: this.telefonoMovilFacturacionControl,
			telefonoTrabajo: this.telefonoTrabajoFacturacionControl,
			telefonoTrabajoExtension: this.telefonoTrabajoExtensionFacturacionControl,
			telefonoMensajeriaInstantanea: this.telefonoMensajeriaInstantaneaFacturacionControl,
			regimenFiscal: this.regimenFiscalControl
		});

		return form;
	}

	updateDatosFacturacionRequired(tipoPersona) {
		if (!!tipoPersona) {
			this.formFacturacion.controls['nombre'].clearValidators();
			this.formFacturacion.controls['primerApellido'].clearValidators();
			this.formFacturacion.controls['segundoApellido'].clearValidators();
			this.formFacturacion.controls['razonSocial'].clearValidators();
			this.formFacturacion.controls['regimenFiscal'].clearValidators();

			this.listRegimenFiscalFiltrado = this.listRegimenFiscal;

			switch (tipoPersona.id) {
				case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.FISICA:
					this.paisFacturacionControl.setValue(this.paises[0]);
					this.formFacturacion.controls['nombre'].setValidators([Validators.required, Validators.maxLength(50)]);
					this.formFacturacion.controls['primerApellido'].setValidators([Validators.required, Validators.maxLength(50)]);
					this.formFacturacion.controls['segundoApellido'].setValidators([Validators.maxLength(50)]);
					this.formFacturacion.controls['regimenFiscal'].setValidators([Validators.required]);

					this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
						return model.fisica;
					});
					break;

				case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.MORAL:
					this.paisFacturacionControl.setValue(this.paises[0]);
					this.formFacturacion.controls['razonSocial'].setValidators([Validators.required, Validators.maxLength(50)]);
					this.formFacturacion.controls['regimenFiscal'].setValidators([Validators.required]);

					this.listRegimenFiscalFiltrado = this.listRegimenFiscal.filter(model => {
						return model.moral;
					});
					break;

				case ControlesMaestrosMultiples.CMM_RFC_TipoPersona.EXTRANJERO:
					this.paisFacturacionControl.setValue(null);
					this.formFacturacion.controls['rfc'].setValue(this.rfcExtranjero);
					this.formFacturacion.controls['razonSocial'].setValidators([Validators.required, Validators.maxLength(50)]);
					break;
			}
		}
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

	atLeastOne(controlNames: string[], form: FormGroup = this.form): boolean {
		let hasValue: boolean = false;
		controlNames.forEach(control => {
			hasValue = hasValue || !!form.get(control).value;
		});
		return hasValue;
	}

	guardar() {
		if (!!this._alumnoService.cargando)
			return;
		if (this.form.valid) {
			if(!this.form.get('alumnoJOBS').value && !this.atLeastOne(['telefonoFijo','telefonoMovil','telefonoTrabajo','telefonoMensajeriaInstantanea'])){
				this._matSnackBar.open('Es necesario ingresar al menos un teléfono para continuar', 'OK', {
					duration: 5000,
				});
				return;
			}
			if(!this.esMayorEdad && !this.alumno.contactos?.length){
				this._matSnackBar.open('Es necesario ingresar al menos un contacto para continuar', 'OK', {
					duration: 5000,
				});
				return;
			}

			if (this.croppedImage) {
				this.form.get('img64').setValue(this.croppedImage);
			}

			this._alumnoService.cargando = true;
			this.form.disable({emitEvent: false});

			(this.alumno.contactos || []).forEach(contacto => {
				delete contacto.idTmp;
			});
			(this.alumno.facturacion || []).forEach(facturacion => {
				delete facturacion.idTmp;
			});

			if(!!this.form.get('programaJOBS')?.value)
				this.form.get('alumnoJOBS').setValue(true);

			let formRaw = this.form.getRawValue();
			formRaw.fechaNacimiento = moment(formRaw.fechaNacimiento,'DDMMYYYY').format('YYYY-MM-DD HH:mm:ss.SSS');
			//formRaw.fechaModificacion = moment(formRaw.fechaModificacion, 'YYYY-MM-DD HH:mm:ss.SSSSSSS').format('YYYY-MM-DD HH:mm:ss.SSSSSSS');
			formRaw.contactos = this.alumno.contactos || [];
			formRaw.facturacion = this.alumno.facturacion || [];

			formRaw.nombre = (formRaw.nombre || '').toUpperCase();
			formRaw.primerApellido = (formRaw.primerApellido || '').toUpperCase();
			formRaw.segundoApellido = (formRaw.segundoApellido || '').toUpperCase();

			this._alumnoService.guardar(JSON.stringify(formRaw), `/api/v1/alumnos/save`).then(
				((result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						if(this.fichaVolver == 'PuntoVenta'){
							this.router.navigate(['/app/ventas/punto-venta/abierto'],{queryParams: {
								precargarPrevio: 'true',
								idioma: this.qParams.get('idioma'),
								programa: this.qParams.get('programa'),
								modalidad: this.qParams.get('modalidad'),
								tipoGrupo: this.qParams.get('tipoGrupo'),
								grupo: this.qParams.get('grupo'),
								certificacion: this.qParams.get('certificacion'),
								cantidad: this.qParams.get('cantidad'),
								listaPreciosId: this.qParams.get('listaPreciosId'),
								nivel: this.qParams.get('nivel'),
								clienteInCompany: this.qParams.get('clienteInCompany'),
								grupoInCompany: this.qParams.get('grupoInCompany'),
								alumno: this.hashid.encode(result.data),
								vistaVolver: this.vistaVolver,
								becaSindicato: this.qParams.get('becaSindicato')
							}});
						}else if(this.fichaVolver == 'Becas'){
							this.router.navigate(['/app/programacion-academica/becas-solicitudes/nuevo'],{queryParams: {
								alumno: this.hashid.encode(result.data)
							}});
						}
						else{
							this.router.navigate([this.config.rutaAtras])
						}
					} else {
						this._alumnoService.cargando = false;
						this.form.enable();
					}
				}).bind(this)
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

			this._alumnoService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

	guardarContacto(){
		if (this.formContacto.valid) {
			if(!this.telefonoFijoContactoControl.value && !this.telefonoMovilContactoControl.value && !this.telefonoTrabajoContactoControl.value && !this.telefonoMensajeriaInstantaneaContactoControl.value){
				this._matSnackBar.open('Es necesario ingresar al menos un teléfono para continuar', 'OK', {
					duration: 5000,
				});
				return;
			}
			
			let contactoGuardar: AlumnoContactoEditarProjection = this.formContacto.getRawValue();
			let contactoEditar: AlumnoContactoEditarProjection = (this.alumno.contactos || []).find(contacto => {
				return contacto.idTmp == contactoGuardar.idTmp;
			});
			if(!!contactoEditar){
				for(let campo in contactoGuardar){
					contactoEditar[campo] = contactoGuardar[campo];
				}
				this.alumno.contactos = [].concat(this.alumno.contactos || []);
			}else{
				this.alumno.contactos = (this.alumno.contactos || []).concat(contactoGuardar);
			}
			this.contactoEditar = null;
			this.limpiarFormularioContacto();
		}
	}

	guardarFacturacion() {
		if (this.formFacturacion.valid) {
			// if (!this.telefonoFijoFacturacionControl.value && !this.telefonoMovilFacturacionControl.value && !this.telefonoTrabajoFacturacionControl.value && !this.telefonoMensajeriaInstantaneaFacturacionControl.value) {
			// 	this._matSnackBar.open('Es necesario ingresar al menos un teléfono para continuar', 'OK', {
			// 		duration: 5000,
			// 	});
			// 	return;
			// }

			let facturacionGuardar: any = this.formFacturacion.getRawValue();

			facturacionGuardar.rfc = (facturacionGuardar.rfc || '').toUpperCase();
			facturacionGuardar.nombre = facturacionGuardar.nombre ? facturacionGuardar.nombre.toUpperCase() : null;
			facturacionGuardar.primerApellido = facturacionGuardar.primerApellido ? facturacionGuardar.primerApellido.toUpperCase() : null;
			facturacionGuardar.segundoApellido = facturacionGuardar.segundoApellido ? facturacionGuardar.segundoApellido.toUpperCase() : null;
			facturacionGuardar.razonSocial = facturacionGuardar.razonSocial ? facturacionGuardar.razonSocial.toUpperCase() : null;
			facturacionGuardar.registroIdentidadFiscal = facturacionGuardar.registroIdentidadFiscal ? facturacionGuardar.registroIdentidadFiscal.toUpperCase() : null;

			if (facturacionGuardar.predeterminado && this.existeFacturacionPredeterminada && !this.facturacionEditar?.predeterminado) {
				this._matSnackBar.open('Solo se permite un registro predeterminado', 'OK', {
					duration: 5000,
				});
				return;
			}

			if (facturacionGuardar.predeterminado && !this.existeFacturacionPredeterminada) {
				this.existeFacturacionPredeterminada = true;
			}

			let facturacionEditar: AlumnoDatosFacturacion = (this.alumno.facturacion || []).find(facturacion => {
				return facturacion.idTmp == facturacionGuardar.idTmp;
			});

			let facturacion: AlumnoDatosFacturacion = {
				idTmp: facturacionGuardar.idTmp,
				id: facturacionGuardar.id,
				predeterminado: facturacionGuardar.predeterminado,
				datosFacturacion: null
			}

			facturacionGuardar.id = facturacionGuardar.datosFacturacionId;
			facturacionGuardar.datosFacturacionId = null;
			facturacionGuardar.idTmp = null;
			facturacionGuardar.predeterminado = null;

			facturacion.datosFacturacion = facturacionGuardar;

			if (!!facturacionEditar) {
				facturacionEditar.datosFacturacion = facturacion.datosFacturacion;

				this.alumno.facturacion = [].concat(this.alumno.facturacion || []);
			} else {
				this.alumno.facturacion = (this.alumno.facturacion || []).concat(facturacion);
			}

			this.facturacionEditar = null;
			this.limpiarFormularioFacturacion();
		}
	}

	imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
	}

	fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }

	cambiarVista(paso: number){
		this.pasoSeleccionado = paso;
		this.onFormDisable();
	}

	cancelarFormularioContacto(){
		this.contactoEditar = null;
		this.limpiarFormularioContacto();
	}

	cancelarFormularioFacturacion(){
		this.facturacionEditar = null;
		this.limpiarFormularioFacturacion();
	}

	limpiarFormularioContacto(){
		this.setFormContacto();
	}

	limpiarFormularioFacturacion(){
		this.setFormFacturacion();
	}

	eliminarContacto(idTmp: number){
		this.alumno.contactos = this.alumno.contactos.filter(contacto => {
			return contacto.idTmp != idTmp;
		});
		this.limpiarFormularioContacto();
	}

	eliminarFacturacion(idTmp: number){
		this.alumno.facturacion = this.alumno.facturacion.filter(facturacion => {
			if(facturacion.idTmp == idTmp && facturacion.predeterminado){
				this.existeFacturacionPredeterminada = false;
			}
			return facturacion.idTmp != idTmp;
		});
		this.limpiarFormularioFacturacion();
	}

	editarContacto(contacto: AlumnoContactoEditarProjection){
		if(this.form?.enabled){
			this.contactoEditar = contacto;
			this.limpiarFormularioContacto();
		}
	}

	editarFacturacion(facturacion: AlumnoDatosFacturacion){
		this.facturacionEditar = facturacion;
		this.limpiarFormularioFacturacion();		
	}

	setFormContacto(){
		this.formContacto = null;
		setTimeout(() => {
			this.formContacto = this.createContactoForm();
		});
	}

	setFormFacturacion() {
		this.formFacturacion = null;

		setTimeout(() => {
			this.formFacturacion = this.createFacturacionForm();
			this.updateDatosFacturacionRequired(this.facturacionEditar?.datosFacturacion?.tipoPersona);
		});
	}

	validarRegistrosRepetidos(){
		if(!this.alumno?.id && !!this.form.get('nombre').value && !!this.form.get('primerApellido').value && !!this.form.get('fechaNacimiento').value){
			this._alumnoService.cargando = true;
			this._alumnoService.getAlumnosRepetidos(this.form.get('nombre').value, this.form.get('primerApellido').value, this.form.get('segundoApellido').value, moment(this.form.get('fechaNacimiento').value,'DDMMYYYY'));
		}
	}
	
	onCancelarAlumnosRepetidosDialog(){
		this.router.navigate([this.config.rutaAtras]);
	}

	callbackGenerarRegistroMedioEnterado(cmm: ControlMaestroMultipleComboSimpleProjection){
		this._alumnoService.nuevoRegistroMedioEnterado(cmm.valor,ControlesMaestrosMultiples.CMM_CE_MedioEnteradoProulex._nombre);
	}

	callbackGenerarRegistroRazonEleccion(cmm: ControlMaestroMultipleComboSimpleProjection){
		this._alumnoService.nuevoRegistroRazonEleccion(cmm.valor,ControlesMaestrosMultiples.CMM_CE_RazonEleccionProulex._nombre);
	}

	onActionClicked(event){
		if(event.option.title == 'Historial académico'){
			this._alumnoService.imprimirPDFConFiltros('/api/v1/kardex-alumno/pdf', {codigoAlumno: this.alumno.codigo});

			this._matSnackBar.openFromComponent(IconSnackBarComponent, {
				data: {
					message: 'Descargando...',
					icon: 'cloud_download',
				},
				duration: 1 * 1000, horizontalPosition: 'right'
			});
		}
	}
	
	verSubreporte(event) {
		this._alumnoService.cargando = true;

		this._kardexService.descargarSubreporte(event).then(
			function (result: JsonResponse) {
				this._alumnoService.cargando = false;
			}.bind(this)
		);
	}

	onDeshabilitarCampos(){
		this.deshabilitarBotones = false;
		this.onFormDisable();
	}

	onFormDisable(){
		if(!this.permiteEditar && this.pasoSeleccionado != 2 && !this.deshabilitarBotones){
			if(this.form.enabled){
				this.form.disable();
			}
		}
		else{
			if(!this.deshabilitarBotones){
				if(this.form.disabled){
					this.form.enable();
				}
			}
		}
	}
}