import { Component, ElementRef, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { PuntoVentaAbiertoService } from "./punto-venta-abierto.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { FormControl, Validators } from "@angular/forms";
import { ClienteCardProjection, ClienteComboProjection } from "@app/main/modelos/cliente";
import { MatTableDataSource } from "@angular/material/table";
import { ControlMaestroMultipleCardProjection } from "@models/control-maestro-multiple";
import { OrdenVentaDetalleHistorialPVResumenProjection } from "@app/main/modelos/orden-venta-detalle";
import { environment } from '@environments/environment';
import { ProgramaCardProjection, ProgramaComboProjection } from "@app/main/modelos/programa";
import { PAModalidadCardProjection } from "@app/main/modelos/pamodalidad";
import { ProgramaGrupoCardProjection, ProgramaGrupoComboProjection } from "@app/main/modelos/programa-grupo";
import { AlumnoComboProjection, AlumnoEntregarLibrosProjection, AlumnoInscripcionesPendientesJOBSProjection, AlumnoInscripcionesPendientesJOBSSEMSProjection, AlumnoReinscripcionProjection } from "@app/main/modelos/alumno";
import { PuntoVentaAlumnoDialogComponent, PuntoVentaAlumnoDialogData } from "./dialogs/alumno/alumno.dialog";
import { ArticuloFamiliaCardProjection } from "@app/main/modelos/articulo-familia";
import { ArticuloCategoriaCardProjection } from "@app/main/modelos/articulo-categoria";
import { ArticuloSubcategoriaCardProjection } from "@app/main/modelos/articulo-subcategoria";
import { ArticuloCardProjection } from "@app/main/modelos/articulo";
import { MedioPagoPVComboProjection } from "@app/main/modelos/medio-pago-pv";
import { MediosPagoPV } from "@app/main/modelos/mapeos/medios-pago-pv";
import { FuseConfirmDialogComponent } from "@fuse/components/confirm-dialog/confirm-dialog.component";
import { PuntoVentaEditarReinscripcionDialogComponent, PuntoVentaEditarReinscripcionDialogData } from "./dialogs/editar-reinscripcion/editar-reinscripcion.dialog";
import { InscripcionSinGrupoListadoProjection } from "@app/main/modelos/inscripcion-sin-grupo";
import { ControlesMaestrosMultiples } from "@app/main/modelos/mapeos/controles-maestros-multiples";
import { PuntoVentaAlumnoSinGrupoDialogComponent, PuntoVentaAlumnoSinGrupoDialogData } from "./dialogs/alumno-sin-grupo/alumno-sin-grupo.dialog";
import { LocalidadComboProjection } from "@app/main/modelos/localidad";
import { PuntoVentaSeleccionarLocalidadDialogComponent, PuntoVentaSeleccionarLocalidadDialogData } from "./dialogs/seleccionar-localidad/seleccionar-localidad.dialog";
import { PuntoVentaCartaCompromisoDialogComponent, PuntoVentaCartaCompromisoDialogData } from "./dialogs/carta-compromiso/carta-compromiso.dialog";
import { BecaUDGListadoProjection } from "@app/main/modelos/becas-udg";
import { PuntoVentaCobroExitosoDialogComponent, PuntoVentaCobroExitosoDialogData } from "./dialogs/cobro-exitoso/cobro-exitoso.dialog";
import { PuntoVentaCerrarTurnoDialogComponent, PuntoVentaCerrarTurnoDialogData } from "./dialogs/cerrar-turno/cerrar-turno.dialog";
import { Usuario } from "@models/usuario";
import { Moment } from "moment";
import * as moment from "moment";
import { OrdenVentaHistorialPVProjection, OrdenVentaHistorialPVResumenProjection } from "@app/main/modelos/orden-venta";
import { ArticulosSubtipos } from "@app/main/modelos/mapeos/articulos-subtipos";
import { PuntoVentaDescuentoUsuarioDialogComponent, PuntoVentaDescuentoUsuarioDialogData } from "./dialogs/descuento-usuario/descuento-usuario.dialog";
import { OrdenVentaDetalleDatasource, InfiniteScrollController, CardExtra, AlumnosRepetidosController } from "./punto-venta-abierto.clases";

@Component({
    selector: 'punto-venta-abierto',
    templateUrl: './punto-venta-abierto.component.html',
    styleUrls: ['./punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaAbiertoComponent {

    // Propiedades de configuración de la ficha
	private rutaPuntoVentaInicio = '/app/ventas/punto-venta/inicio';
	private rutaNuevoAlumno = '/app/control-escolar/alumnos/nuevo/';
	private rutaEditarAlumno = '/app/control-escolar/alumnos/ver/';
	apiUrl: string = environment.apiUrl;

	// FormControls
	clienteControl: FormControl = new FormControl(null,[]);
	tipoCambioPagoControl: FormControl = new FormControl(null,[Validators.required]);
	referenciaPagoControl: FormControl = new FormControl(null,[]);
	correoElectronicoControl: FormControl = new FormControl(null,[]);
	filtroControl: FormControl = new FormControl('',[]);

	// Listados
	clientes: ClienteComboProjection[] = [];
	idiomas: ControlMaestroMultipleCardProjection[] = [];
	alumnos: AlumnoComboProjection[] = [];
	programas: ProgramaCardProjection[] = [];
	paModalidades: PAModalidadCardProjection[] = [];
	programasGrupos: any[] = [];
	familias: ArticuloFamiliaCardProjection[] = [];
	categorias: ArticuloCategoriaCardProjection[] = [];
	subcategorias: ArticuloSubcategoriaCardProjection[] = [];
	articulos: ArticuloCardProjection[] = [];
	listaPreciosSucursal: {[articuloId:string]: number} = {};
	listaPreciosSinDescuentoSucursal: {[articuloId:string]: number} = {};
	listaPreciosCliente: {[articuloId:string]: number} = null;
	listaPreciosSinDescuentoCliente: {[articuloId:string]: number} = null;
	mediosPagoPV: MedioPagoPVComboProjection[] = [];
	localidadesSucursal: LocalidadComboProjection[] = [];
	articuloLigarLocalidad: ArticuloCardProjection;
	programasGruposMultisede: any[] = [];
	tiposGrupos: ControlMaestroMultipleCardProjection[] = [];
	niveles: number[] = [];
	cardsExtraInicio: CardExtra;
	programaAcademy: ProgramaComboProjection = null;
	
	// Tabla resumen
	dataSourceResumen: MatTableDataSource<OrdenVentaDetalleDatasource> = new MatTableDataSource([]);
	displayedColumnsResumen: string[] = ['nombre','cantidad','precio','descuento','total','acciones'];

	// Tabla reinscripciones
	dataSourceReinscripciones: MatTableDataSource<AlumnoReinscripcionProjection> = new MatTableDataSource([]);
	displayedColumnsReinscripciones: string[] = [
		'estatus',
		'codigo',
		'becaCodigo',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'curso',
		'modalidad',
		'horario',
		'nivelReinscripcion',
		'calificacion',
		'grupoReinscripcionCodigo',
		'acciones'
	];

	// Tabla alumnos sin grupo
	dataSourceAlumnosSinGrupo: MatTableDataSource<InscripcionSinGrupoListadoProjection> = new MatTableDataSource([]);
	displayedColumnsAlumnosSinGrupo: string[] = [
		'codigo',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'curso',
		'nivel',
		'modalidad',
		'montoPago',
		'medioPago',
		'ovCodigo',
		'estatus',
		'acciones'
	];

	// Tabla alumnos entrega de libros
	dataSourceEntregaLibros: MatTableDataSource<AlumnoEntregarLibrosProjection> = new MatTableDataSource([]);
	displayedColumnsEntregaLibros: string[] = [
		'imagen',
		'codigo',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'grupo',
		'libros',
		'inscripcion',
		'notaVenta',
		'check',
		'agregar'
	];

	// Tabla alumnos jobs
	dataSourceJOBS: MatTableDataSource<AlumnoInscripcionesPendientesJOBSProjection> = new MatTableDataSource([]);
	displayedColumnsJOBS: string[] = [
		'codigo',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'centroUniversitario',
		'carrera',
		'grupo',
		'check',
		'agregar'
	];

	// Tabla alumnos jobs sems
	dataSourceJOBSSEMS: MatTableDataSource<AlumnoInscripcionesPendientesJOBSSEMSProjection> = new MatTableDataSource([]);
	displayedColumnsJOBSSEMS: string[] = [
		'codigo',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'preparatoria',
		'bachilleratoTecnologico',
		'grupo',
		'check',
		'agregar'
	];

	// Tabla historial
	dataSourceHistorial: MatTableDataSource<OrdenVentaHistorialPVProjection> = new MatTableDataSource([]);
	displayedColumnsHistorial: string[] = [
		'fecha',
		'codigo',
		'monto',
		'estatus',
		'acciones'
	];

	// Tabla becas sindicato
	dataSourceBecasSindicato: MatTableDataSource<BecaUDGListadoProjection> = new MatTableDataSource([]);
	displayedColumnsBecasSindicato: string[] = [
		'codigoProulex',
		'codigoBeca',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'descuento',
		'curso',
		'nivel',
		'modalidad',
		'acciones'
	];

	// Tabla resumen OVD
	dataSourceResumenOVD: MatTableDataSource<OrdenVentaDetalleHistorialPVResumenProjection> = new MatTableDataSource([]);
	displayedColumnsResumenOVD: string[] = ['nombre','cantidad','precio','descuento','total'];

	// Misc
	vistaNavegador:
		'Idiomas'|'Programas'|'Modalidades'|'Tipos de grupo'|'Niveles'|'Grupos'
		|'Categorias'|'Subcategorias'|'Articulos'
		|'Pagar'|'Reinscripciones'|'Grupos reinscripcion reprobado'|'Alumnos sin grupo'
		|'Vales de certificacion'
		|'Entrega de libros'|'JOBS'|'JOBS SEMS'
		|'Becas sindicato'|'Becas sindicato grupos'|'Becas proulex'|'Becas proulex grupos'
		|'Historial'|'PCP'
		|'Clientes In Company'|'Grupos In Company'|'Academy'
		= 'Idiomas';
	vistaResumen:
		'Venta'|'Historial'
		= 'Venta';
	detalleSeleccionado: OrdenVentaDetalleDatasource = null;
	idiomaSeleccionado: ControlMaestroMultipleCardProjection = null;
	programaSeleccionado: ProgramaCardProjection = null;
	paModalidadSeleccionado: PAModalidadCardProjection = null;
	programaGrupoSeleccionado: ProgramaGrupoCardProjection = null;
	familiaSeleccionado: ArticuloFamiliaCardProjection = null;
	categoriaSeleccionado: ArticuloCategoriaCardProjection = null;
	subcategoriaSeleccionado: ArticuloSubcategoriaCardProjection = null;
	articuloSeleccionado: ArticuloCardProjection = null;
	certificacionSeleccionada: ArticuloCardProjection = null;
	siguienteIdTmp: number = 1;
	idiomasRelleno: any[] = [];
	programasRelleno: any[] = [];
	categoriasRelleno: any[] = [];
	subcategoriasRelleno: any[] = [];
	articulosRelleno: any[] = [];
	paModalidadesRelleno: any[] = [];
	programasGruposRelleno: any[] = [];
	localStorageParams = {
		detalles: 'detallesPuntoVentaPrevio',
		localidadAsignarId: 'localidadAsignarId',
		textoBusqueda: 'textoBusquedaPV'
	};
	listaPreciosSucursalId: number = null;
	listaPreciosClienteId: number = null;
	medioPagoSeleccionado: MedioPagoPVComboProjection = null;
	MediosPagoPV = MediosPagoPV;
	@ViewChild('inputReferenciaPago') inputReferenciaPago: ElementRef;
	@ViewChild('inputCorreoElectronico') inputCorreoElectronico: ElementRef;
	ligaCentroPagos: string = null;
	reinscripcionesSeleccionadas: {[alumnoId:string]: {[idiomaId:string]: boolean}} = {};
	reinscripcionesSeleccionadasCont: number = 0;
	reinscripcionesSeleccionadasTodas: boolean = false;
	clienteActual: ClienteComboProjection = null;
	buscandoReinscripciones: boolean = false;
	reinscripcionesScrollIndex: number = 0;
	reinscripcionesMaxBusqueda: number = 100;
	@ViewChild("tablaReinscripciones") tablaReinscripciones: any;
	reinscripcionesScrollFinalizado: boolean = false;
	reinscripcionEditar: AlumnoReinscripcionProjection = null;
	CMM_INS_Estatus = ControlesMaestrosMultiples.CMM_INS_Estatus;
	CMM_INSSG_Estatus = ControlesMaestrosMultiples.CMM_INSSG_Estatus;
	inscripcionSinGrupoRelacionar: InscripcionSinGrupoListadoProjection = null;
	ovdLigasInscripcionesSinGrupoIds: {[ovdIdTmp:number]: number} = {};
	inscripcionSinGrupoLigasOVDIdsTmp: {[inssgId:number]: number} = {};
	entregaLibrosSeleccionadas: {[alumnoId:string]: {[tieneGrupo:string]: {[inscripcionId:string]: boolean}}} = {};
	entregaLibrosSeleccionadasCont: number = 0;
	entregaLibrosSeleccionadasTodas: boolean = false;
	@ViewChild("tablaEntregaLibros") tablaEntregaLibros: any;
	entregaLibrosScrollIndex: number = 0;
	entregaLibrosMaxBusqueda: number = 100;
	entregaLibrosScrollFinalizado: boolean = false;
	jobsSeleccionadas: {[alumnoId:string]: {[grupoId:string]: boolean}} = {};
	jobsSeleccionadasCont: number = 0;
	jobsSeleccionadasTodas: boolean = false;
	@ViewChild("tablaJOBS") tablaJOBS: any;
	jobsScrollIndex: number = 0;
	jobsMaxBusqueda: number = 100;
	jobsScrollFinalizado: boolean = false;
	jobsSemsSeleccionadas: {[alumnoId:string]: {[grupoId:string]: boolean}} = {};
	jobsSemsSeleccionadasCont: number = 0;
	jobsSemsSeleccionadasTodas: boolean = false;
	@ViewChild("tablaJOBSSEMS") tablaJOBSSEMS: any;
	jobsSemsScrollIndex: number = 0;
	jobsSemsMaxBusqueda: number = 100;
	jobsSemsScrollFinalizado: boolean = false;
	@ViewChild("tablaBecasSindicato") tablaBecasSindicato: any;
	becasSindicatoScrollController: InfiniteScrollController;
	alumnoBecaSindicatoGrupos: AlumnoComboProjection;
	gruposBecaSindicatoGrupos: any[] = [];
	tituloBecasSindicatoGrupos: string;
	becaSindicatoAplicarId: number;
	grupoBecaSindicatoAplicar: ProgramaGrupoCardProjection;
	tipoGrupoIdBecaSindicatoAplicar: number;
	nombreSucursal: string;
	nombrePlantel: string;
	alumnosRepetidosController: AlumnosRepetidosController = new AlumnosRepetidosController();
	ordenesVentaImprimirIds: number[] = [];
	usuarioActual: Usuario;
	fechaHistorialControl: FormControl = new FormControl(moment(),[]);
	@ViewChild("tablaHistorial") tablaHistorial: any;
	historialScrollController: InfiniteScrollController;
	ordenVentaHistorial: OrdenVentaHistorialPVResumenProjection = null;
	textoBusquedaPrecargar: string = '';
	gruposMultisedeBecaSindicatoGrupos: any[] = [];
	programasGruposMultisedeRelleno: any[] = [];
	tipoGrupoSeleccionado: ControlMaestroMultipleCardProjection = null;
	nivelSeleccionado: number = null;
	colorModalidad: string = null;
	precargarFiltro: boolean = false;
	vistaVolver: string = null;
	permisosMenu: any = {};
	nivelPrecargar: number = null;
	becaProulexAplicarId: number;
	fechaPagoControl: FormControl = new FormControl(moment(),[]);
	@ViewChild("tablaAlumnosSinGrupo") tablaAlumnosSinGrupo: any;
	alumnosSinGrupoScrollController: InfiniteScrollController;
	reinscripcionAgregarTmp: AlumnoReinscripcionProjection;
	cardExtraInicioSeleccionada: CardExtra;
	clienteInCompanySeleccionado: ClienteCardProjection;
	simboloMonedaSucursal: string;
	simboloMoneda: string = '$';
	prefijoMonedaSucursal: string;
	tipoCambioSucursal: number;
	prefijoMoneda: string = 'MXN';
	tipoCambio: number = 1;
	tipoGrupoIdReinscripcion: number = null;
	valeCertificacionAplicarId: number;

    // Private
	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public _puntoVentaAbiertoService: PuntoVentaAbiertoService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {

		this.route.queryParamMap.subscribe(qParams => {
			if(qParams.get("precargarPrevio") == 'true'){
				this.recuperarLocalStorage();
			}else{
				this.eliminarLocalStorage();
			}
			this.recuperarTextoBusqueda();

			this.vistaVolver = qParams.get('vistaVolver');

			if(this.vistaVolver == 'Becas sindicato'){
				this._puntoVentaAbiertoService.cargando = true;
				this.becaSindicatoAplicarId = this.hashid.decode(qParams.get('becaSindicato'));
				this._puntoVentaAbiertoService.getDatosBecaSindicato(this.hashid.decode(qParams.get('alumno')),this.becaSindicatoAplicarId);
			}else if(this.vistaVolver == 'Becas proulex'){
				this.onVistaBecasProulex(true);
			}else if(this.vistaVolver == 'JOBS SEMS'){
				this.onVistaJOBSSEMES(true);
			}else if(this.vistaVolver == 'PCP'){
				this.onVistaPCP(true);
			}else if(qParams.get("alumno")){
				let alumnoId: number = this.hashid.decode(qParams.get("alumno"));
				if(qParams.get("clienteInCompany")){
					let grupoId: number = this.hashid.decode(qParams.get("grupoInCompany"));
					let localidadAsignarId = Number(localStorage.getItem(this.localStorageParams.localidadAsignarId));
					this._puntoVentaAbiertoService.inscripcionInCompany(
						alumnoId,
						grupoId,
						localidadAsignarId,
						this.siguienteIdTmp++
					);
				}else if(!!qParams.get("grupo") || (!!qParams.get("idioma") && !!qParams.get("programa") && !!qParams.get("modalidad"))){
					let idiomaId: number = this.hashid.decode(qParams.get("idioma"));
					let programaId: number = this.hashid.decode(qParams.get("programa"));
					let modalidadId: number = this.hashid.decode(qParams.get("modalidad"));
					let tipoGrupoId: number = this.hashid.decode(qParams.get("tipoGrupo"));
					let grupoId: number = this.hashid.decode(qParams.get("grupo"));
					this.nivelPrecargar = this.hashid.decode(qParams.get("nivel"));
					this._puntoVentaAbiertoService.getDatosAlumno(idiomaId,programaId,modalidadId,tipoGrupoId,alumnoId,grupoId);
				}else if(!!qParams.get("certificacion")){
					let certificacionId: number = this.hashid.decode(qParams.get("certificacion"));
					let cantidad: number = this.hashid.decode(qParams.get("cantidad"));
					let listaPreciosId: number = this.hashid.decode(qParams.get("listaPreciosId"));
					let localidadAsignarId = localStorage.getItem(this.localStorageParams.localidadAsignarId);
					this._puntoVentaAbiertoService.getDatosAlumnoCertificacion(certificacionId,alumnoId,cantidad,listaPreciosId,Number(localidadAsignarId),this.siguienteIdTmp++);
				}
			}
		});

		this.dataSourceAlumnosSinGrupo.filterPredicate = this.filtrarDatasourceAlumnosSinGrupo.bind(this);

		// Subscribe to update datos on changes
		this._puntoVentaAbiertoService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				// Inicializar listados
				this.clienteActual = {
					id: 0,
					nombre: 'Sede ' + datos.nombreSucursal
				};
				this.clientes = [this.clienteActual].concat(datos.clientes);
				this.idiomas = datos.idiomas;
				this.familias = datos.familias;
				this.idiomasRelleno = new Array(4-((((this.idiomas?.length || 0) + (this.familias?.length || 0))+1)%4));
				this.alumnos = datos.alumnos;
				this.listaPreciosSucursal = JSON.parse(datos.listaPreciosMapStr || '{}');
				this.listaPreciosSinDescuentoSucursal = JSON.parse(datos.listaPreciosSinDescuentoMapStr || '{}');
				this.listaPreciosSucursalId = datos.listaPreciosSucursalId;
				this.mediosPagoPV = datos.mediosPagoPV;
				this.localidadesSucursal = datos.localidadesSucursal;
				this.nombreSucursal = datos.nombreSucursal;
				this.nombrePlantel = datos.nombrePlantel;
				this.permisosMenu = datos.permisosMenu;
				this.cardsExtraInicio = datos.cardsExtra;
				this.simboloMonedaSucursal = datos.simboloMonedaSucursal;
				this.simboloMoneda = this.simboloMonedaSucursal;
				this.prefijoMonedaSucursal = datos.prefijoMonedaSucursal;
				this.prefijoMoneda = this.prefijoMonedaSucursal;
				this.tipoCambioSucursal = datos.tipoCambioSucursal;
				this.tipoCambio = this.tipoCambioSucursal;
				this.programaAcademy = datos?.programaAcademy;

				this.clienteControl = new FormControl({
					id: 0,
					nombre: 'Sede ' + datos.nombreSucursal
				},[]);
				
				if(!this.vistaVolver){
					this.vistaNavegador = 'Idiomas';
				}

			});

		// Subscribe to update programas on changes
		this._puntoVentaAbiertoService.onProgramasChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onProgramasChanged.next(null);
					this.programas = datos.programas;
					this.programasRelleno = new Array(4-((this.programas.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Programas';
				}
			});

		// Subscribe to update modalidades on changes
		this._puntoVentaAbiertoService.onModalidadesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onModalidadesChanged.next(null);
					this.paModalidades = datos.paModalidades;
					this.paModalidadesRelleno = new Array(4-((this.paModalidades.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Modalidades';
				}
			});

		// Subscribe to update tipos de grupo on changes
		this._puntoVentaAbiertoService.onTiposGruposChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onTiposGruposChanged.next(null);
					this.tiposGrupos = datos.tiposGrupos;
					this.colorModalidad = datos.colorModalidad;
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Tipos de grupo';
				}
			});

		// Subscribe to update modalidades on changes
		this._puntoVentaAbiertoService.onNivelesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onNivelesChanged.next(null);
					this.niveles = datos.niveles;
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Niveles';
				}
			});

		// Subscribe to update grupos on changes
		this._puntoVentaAbiertoService.onGruposChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onGruposChanged.next(null);
					this.programasGrupos = datos.gruposCabeceras;
					this.programasGruposRelleno = new Array(4-((this.programasGrupos.length)%4));
					this.programasGruposMultisede = datos.gruposMultisedeCabeceras;
					this.programasGruposMultisedeRelleno = new Array(4-((this.programasGruposMultisede.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Grupos';
				}
			});

		// Subscribe to update categorias on changes
		this._puntoVentaAbiertoService.onCategoriasChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onCategoriasChanged.next(null);
					this.categorias = datos.categorias;
					this.categoriasRelleno = new Array(4-((this.categorias.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Categorias';
				}
			});

		// Subscribe to update subcategorias on changes
		this._puntoVentaAbiertoService.onSubcategoriasChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onSubcategoriasChanged.next(null);
					this.subcategorias = datos.subcategorias;
					if(!!this.subcategorias?.length){
						this.categoriasRelleno = new Array(4-((this.categorias.length)%4));
						this.filtroControl.setValue('');
						this.vistaNavegador = 'Subcategorias';
					}else{
						this.categoriasRelleno = [];
						this.articulos = datos.articulos;
						this.articulosRelleno = new Array(4-((this.articulos.length)%4));
						this.filtroControl.setValue('');
						this.vistaNavegador = 'Articulos';
					}
				}
			});

		// Subscribe to update articulos on changes
		this._puntoVentaAbiertoService.onArticulosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onArticulosChanged.next(null);
					this.articulos = datos.articulos;
					this.articulosRelleno = new Array(4-((this.articulos.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Articulos';
				}
			});

		// Subscribe to update listaPreciosCliente on changes
		this._puntoVentaAbiertoService.onListaPreciosClienteChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onListaPreciosClienteChanged.next(null);
					this.listaPreciosCliente = JSON.parse(datos.listaPreciosMapStr || '{}');
					this.listaPreciosSinDescuentoCliente = JSON.parse(datos.listaPreciosSinDescuentoMapStr || '{}');
					this.listaPreciosClienteId = datos.listaPreciosClienteId;
					this.simboloMoneda = datos.simboloMoneda;
					this.prefijoMoneda = datos.prefijoMoneda;
					this.tipoCambio = datos.tipoCambio;
				}
			});

		// Subscribe to update datosAlumno on changes
		this._puntoVentaAbiertoService.onDatosAlumnoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosAlumnoChanged.next(null);
					this._puntoVentaAbiertoService.cargando = true;
					let localidadAsignarId = localStorage.getItem(this.localStorageParams.localidadAsignarId);
					this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
						datos.articuloId,
						null,
						1,
						this.getListaPreciosId(),
						0,
						this.siguienteIdTmp++,
						datos.programa.id,
						datos.idioma.id,
						datos.paModalidad.id,
						datos.tipoGrupo.id,
						datos.programaGrupo?.id,
						datos.programaGrupo?.numeroGrupo,
						datos.alumno.id,
						null,
						null,
						!!localidadAsignarId ? Number(localidadAsignarId) : null,
						null,
						this.nivelPrecargar
					);
				}
			});

		// Subscribe to update datosReinscripciones on changes
		this._puntoVentaAbiertoService.onDatosReinscripcionesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosReinscripcionesChanged.next(null);
					this.buscandoReinscripciones = false;
					if(this.tablaReinscripciones?._elementRef && this.reinscripcionesScrollIndex == 0){
						this.tablaReinscripciones._elementRef.nativeElement.scrollTo(0,0);
					}
					if(this.reinscripcionesScrollIndex != 0 && (datos.alumnosReinscripcion?.length || 0) < this.reinscripcionesMaxBusqueda){
						this.reinscripcionesScrollFinalizado = true;
					}else{
						this.reinscripcionesScrollFinalizado = false;
					}
					this.dataSourceReinscripciones.data = this.dataSourceReinscripciones.data.concat(datos.alumnosReinscripcion);
					this.dataSourceReinscripciones.data.forEach(reinscripcion => {
						if(!this.reinscripcionesSeleccionadas[reinscripcion.id]){
							this.reinscripcionesSeleccionadas[reinscripcion.id] = {};
						}
						this.reinscripcionesSeleccionadas[reinscripcion.id][reinscripcion.idiomaId] = !!this.reinscripcionesSeleccionadas[reinscripcion.id][reinscripcion.idiomaId];
					});
					this.vistaNavegador = 'Reinscripciones';
				}
			});

		// Subscribe to update grupos reinscripcion reprobado on changes
		this._puntoVentaAbiertoService.onGruposReinscripcionReprobadoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onGruposReinscripcionReprobadoChanged.next(null);
					this.programasGrupos = datos.gruposCabeceras;
					this.programasGruposRelleno = new Array(4-((this.programasGrupos.length)%4));
					this.programasGruposMultisede = datos.gruposMultisedeCabeceras;
					this.programasGruposMultisedeRelleno = new Array(4-((this.programasGruposMultisede.length)%4));
					this.filtroControl.setValue('');
					this.vistaNavegador = 'Grupos reinscripcion reprobado';
				}
			});

		// Subscribe to update ovd on changes
		this._puntoVentaAbiertoService.onOVDChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onOVDChanged.next(null);
					let nuevosDetalles: OrdenVentaDetalleDatasource[] = datos.ordenVentaDetalles;
					
					// Validar inscripciones repetidas
					nuevosDetalles = nuevosDetalles.filter(detalle => {
						// Si el detalle no tiene alumno significa que no es una inscripción
						if(!detalle.alumnoId){
							return true;
						}

						// Si el detalle tiene grupo significa que es una inscripción con grupo
						if(detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscrito(detalle.alumnoId,detalle.idiomaId)){
								return false;
							}
							this.alumnosRepetidosController.agregar(detalle.alumnoId,detalle.idiomaId);
						}

						// Si el detalle no ttiene grupo significa que puede ser una inscripción sin grupo (también puede ser una venta de examen, pero eso ya está validado en el controlador de alumnos repetidos)
						if(!detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma, programa y nivel se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscritoSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel)){
								return false;
							}
							this.alumnosRepetidosController.agregarSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel);
						}
						return true;
					});
					
					this.dataSourceResumen.data = this.dataSourceResumen.data.concat(nuevosDetalles);
					if(!!this.inscripcionSinGrupoRelacionar){
						nuevosDetalles.forEach((ovd: OrdenVentaDetalleDatasource) => {
							this.ovdLigasInscripcionesSinGrupoIds[ovd.idTmp] = this.inscripcionSinGrupoRelacionar.id;
							this.inscripcionSinGrupoLigasOVDIdsTmp[this.inscripcionSinGrupoRelacionar.id] = ovd.idTmp;
						});
						this.dataSourceAlumnosSinGrupo.filter = `${this.dataSourceAlumnosSinGrupo.filter} `;
						this.inscripcionSinGrupoRelacionar = null;
					}
				}
			});

		// Subscribe to update cobrar on changes
		this._puntoVentaAbiertoService.onCobrarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onCobrarChanged.next(null);
					this.dataSourceResumen.data = [];
					this.ordenesVentaImprimirIds = datos.ordenesVentaImprimirIds;
					this.alumnosRepetidosController.limpiar();
					this.onVistaAtras();
					this.onCobroExitoso(datos.codigosOV);
				}
			});

		// Subscribe to update cobrar con entrega pendiente on changes
		this._puntoVentaAbiertoService.onCobrarEntregaPendienteChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onCobrarEntregaPendienteChanged.next(false);

					const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
						width: '400px',
						data: {
							mensaje: 'Hay libros sin existencia en las inscripciones a pagar, todas las inscripcionees se crearan con libro pendiente de entrega. ¿Desea continuar?'
						}
					});
		
					dialogRef.afterClosed().subscribe(confirm => {
						if (confirm) {
							let total: number = this.getSumaTotal();
							this._puntoVentaAbiertoService.cobrar(
								this.clienteControl.value?.id || null,
								this.medioPagoSeleccionado?.id || null,
								this.tipoCambioPagoControl.value || this.tipoCambio || 1,
								this.referenciaPagoControl.value || null,
								this.dataSourceResumen.data,
								this.getListaPreciosId(),
								this.correoElectronicoControl.value,
								total,
								this.fechaPagoControl.value,
								true
							);
						}else{
							this.clienteControl.setValue(this.clienteActual);
						}
					});
				}
			});

		// Subscribe to update alumnosSinGrupo on changes
		this._puntoVentaAbiertoService.onAlumnosSinGrupoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAlumnosSinGrupoChanged.next(null);
					this.alumnosSinGrupoScrollController?.scrollToStart();
					this.alumnosSinGrupoScrollController?.registrosRecuperados(datos.inscripcionesSinGrupo?.length || 0);
					this.dataSourceAlumnosSinGrupo.data = (this.dataSourceAlumnosSinGrupo.data || []).concat(datos.inscripcionesSinGrupo);
					this.vistaNavegador = 'Alumnos sin grupo';
					if(!this.alumnosSinGrupoScrollController){
						setTimeout(() => {
							this.alumnosSinGrupoScrollController = new InfiniteScrollController(this.tablaAlumnosSinGrupo._elementRef,this.onGetRegistrosAlumnosSinGrupo.bind(this));
						});
					}
				}
			});

		// Subscribe to update datosAlumnoSinGrupo on changes
		this._puntoVentaAbiertoService.onDatosTiposGrupoAlumnoSinGrupoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosTiposGrupoAlumnoSinGrupoChanged.next(null);
					
					let dialogData: PuntoVentaAlumnoSinGrupoDialogData = {
						inscripcionSinGrupo: this.inscripcionSinGrupoRelacionar,
						localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.localidadesSucursal,
						tiposGrupo: datos.tiposGrupo,
						onAceptar: this.onAceptarAlumnoSinGrupoDialog.bind(this)
					};
			
					const dialogRef = this.dialog.open(PuntoVentaAlumnoSinGrupoDialogComponent, {
						width: '500px',
						data: dialogData
					});
				}
			});

		// Subscribe to update relacionarAlumnoSinGrupo on changes
		this._puntoVentaAbiertoService.onRelacionarAlumnoSinGrupoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.inscripcionRelacionada){
					this._puntoVentaAbiertoService.onRelacionarAlumnoSinGrupoChanged.next(null);
					
					this.inscripcionSinGrupoLigasOVDIdsTmp = {};
					this.ovdLigasInscripcionesSinGrupoIds = {};
					this.dataSourceAlumnosSinGrupo.data = [];

					this.onVistaAtras();
				}
			});

		// Subscribe to update alumnosEntregaLibros on changes
		this._puntoVentaAbiertoService.onAlumnosEntregaLibrosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAlumnosEntregaLibrosChanged.next(null);
					if(this.tablaEntregaLibros?._elementRef && this.entregaLibrosScrollIndex == 0){
						this.tablaEntregaLibros._elementRef.nativeElement.scrollTo(0,0);
					}
					if(this.entregaLibrosScrollIndex != 0 && (datos.alumnos?.length || 0) < this.entregaLibrosMaxBusqueda){
						this.entregaLibrosScrollFinalizado = true;
					}else{
						this.entregaLibrosScrollFinalizado = false;
					}
					this.dataSourceEntregaLibros.data = this.dataSourceEntregaLibros.data.concat(datos.alumnos);
					this.dataSourceEntregaLibros.data.forEach(alumno => {
						if(!this.entregaLibrosSeleccionadas[alumno.id]){
							this.entregaLibrosSeleccionadas[alumno.id] = {};
						}
						if(!this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)]){
							this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)] = {};
						}
						this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)][String(alumno.inscripcionId || alumno.inscripcionSinGrupoId)] = !!this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)][String(alumno.inscripcionId || alumno.inscripcionSinGrupoId)];
					});
					this.vistaNavegador = 'Entrega de libros';
				}
			});

		// Subscribe to update entregarLibros on changes
		this._puntoVentaAbiertoService.onEntregarLibrosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onEntregarLibrosChanged.next(null);
					this.onVistaAtras();
				}
			});

		// Subscribe to update alumnosJOBS on changes
		this._puntoVentaAbiertoService.onAlumnosJOBSChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAlumnosJOBSChanged.next(null);
					if(this.tablaJOBS?._elementRef && this.jobsScrollIndex == 0){
						this.tablaJOBS._elementRef.nativeElement.scrollTo(0,0);
					}
					if(this.jobsScrollIndex != 0 && (datos.alumnos?.length || 0) < this.jobsMaxBusqueda){
						this.jobsScrollFinalizado = true;
					}else{
						this.jobsScrollFinalizado = false;
					}
					let alumnos: AlumnoInscripcionesPendientesJOBSProjection[] = datos.alumnos;
					alumnos = alumnos.filter(alumno => {
						return !this.alumnosRepetidosController.alumnoYaInscrito(alumno.id,alumno.idiomaId);
					});
					this.dataSourceJOBS.data = this.dataSourceJOBS.data.concat(alumnos);
					this.dataSourceJOBS.data.forEach(alumno => {
						if(!this.jobsSeleccionadas[alumno.id]){
							this.jobsSeleccionadas[alumno.id] = {};
						}
						this.jobsSeleccionadas[alumno.id][alumno.grupoId] = !!this.jobsSeleccionadas[alumno.id][alumno.grupoId];
					});
					this.vistaNavegador = 'JOBS';
				}
			});

		// Subscribe to update agregarAlumnosJOBS on changes
		this._puntoVentaAbiertoService.onAgregarAlumnosJOBSChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAgregarAlumnosJOBSChanged.next(null);
					let nuevosDetalles: OrdenVentaDetalleDatasource[] = datos.ordenVentaDetalles;
					nuevosDetalles = nuevosDetalles.filter(detalle => {
						// Si el detalle no tiene alumno significa que no es una inscripción
						if(!detalle.alumnoId){
							return true;
						}

						// Si el detalle tiene grupo significa que es una inscripción con grupo
						if(detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscrito(detalle.alumnoId,detalle.idiomaId)){
								return false;
							}
							this.alumnosRepetidosController.agregar(detalle.alumnoId,detalle.idiomaId);
						}

						// Si el detalle no ttiene grupo significa que puede ser una inscripción sin grupo (también puede ser una venta de examen, pero eso ya está validado en el controlador de alumnos repetidos)
						if(!detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma, programa y nivel se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscritoSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel)){
								return false;
							}
							this.alumnosRepetidosController.agregarSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel);
						}
						return true;
					});
					this.dataSourceResumen.data = this.dataSourceResumen.data.concat(nuevosDetalles);
					this.onVistaAtras();
				}
			});

		// Subscribe to update alumnosJOBSSEMS on changes
		this._puntoVentaAbiertoService.onAlumnosJOBSSEMSChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAlumnosJOBSSEMSChanged.next(null);
					if(this.tablaJOBSSEMS?._elementRef && this.jobsSemsScrollIndex == 0){
						this.tablaJOBSSEMS._elementRef.nativeElement.scrollTo(0,0);
					}
					if(this.jobsSemsScrollIndex != 0 && (datos.alumnos?.length || 0) < this.jobsSemsMaxBusqueda){
						this.jobsSemsScrollFinalizado = true;
					}else{
						this.jobsSemsScrollFinalizado = false;
					}
					let alumnos: AlumnoInscripcionesPendientesJOBSProjection[] = datos.alumnos;
					alumnos = alumnos.filter(alumno => {
						return !this.alumnosRepetidosController.alumnoYaInscrito(alumno.id,alumno.idiomaId);
					});
					this.dataSourceJOBSSEMS.data = this.dataSourceJOBSSEMS.data.concat(alumnos);
					this.dataSourceJOBSSEMS.data.forEach(alumno => {
						if(!this.jobsSemsSeleccionadas[alumno.id]){
							this.jobsSemsSeleccionadas[alumno.id] = {};
						}
						this.jobsSemsSeleccionadas[alumno.id][alumno.grupoId] = !!this.jobsSemsSeleccionadas[alumno.id][alumno.grupoId];
					});
					this.vistaNavegador = 'JOBS SEMS';
				}
			});

		// Subscribe to update agregarAlumnosJOBSSEMS on changes
		this._puntoVentaAbiertoService.onAgregarAlumnosJOBSSEMSChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAgregarAlumnosJOBSSEMSChanged.next(null);
					let nuevosDetalles: OrdenVentaDetalleDatasource[] = datos.ordenVentaDetalles;
					nuevosDetalles = nuevosDetalles.filter(detalle => {
						// Si el detalle no tiene alumno significa que no es una inscripción
						if(!detalle.alumnoId){
							return true;
						}

						// Si el detalle tiene grupo significa que es una inscripción con grupo
						if(detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscrito(detalle.alumnoId,detalle.idiomaId)){
								return false;
							}
							this.alumnosRepetidosController.agregar(detalle.alumnoId,detalle.idiomaId);
						}

						// Si el detalle no ttiene grupo significa que puede ser una inscripción sin grupo (también puede ser una venta de examen, pero eso ya está validado en el controlador de alumnos repetidos)
						if(!detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma, programa y nivel se omite el detalle
							if(this.alumnosRepetidosController.alumnoYaInscritoSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel)){
								return false;
							}
							this.alumnosRepetidosController.agregarSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel);
						}
						return true;
					});
					this.dataSourceResumen.data = this.dataSourceResumen.data.concat(nuevosDetalles);
					this.onVistaAtras();
				}
			});

		// Subscribe to update becasSindicato on changes
		this._puntoVentaAbiertoService.onBecasSindicatoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onBecasSindicatoChanged.next(null);
					this.becasSindicatoScrollController?.scrollToStart();
					this.becasSindicatoScrollController?.registrosRecuperados(datos.becas?.length || 0);
					this.dataSourceBecasSindicato.data = this.dataSourceBecasSindicato.data.concat(datos.becas);
					this.vistaNavegador = 'Becas sindicato';
					if(!this.becasSindicatoScrollController){
						setTimeout(() => {
							this.becasSindicatoScrollController = new InfiniteScrollController(this.tablaBecasSindicato._elementRef,this.onGetRegistrosBecasSindicato.bind(this));
						});
					}
				}
			});

		// Subscribe to update datosBecaSindicato on changes
		this._puntoVentaAbiertoService.onDatosBecaSindicatoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosBecaSindicatoChanged.next(null);
					if(!!datos.procesarReinscripcion){
						this._matSnackBar.open('El alumno cuenta con una reinscripción, estamos procesándola.', 'OK', {
							duration: 10000,
						});

						let alumnoId = datos.alumnoId;
						let grupoId = datos.grupoId;
						let becaId = datos.becaId;

						let localidad: LocalidadComboProjection = null;

						if(this.localidadesSucursal.length == 1){
							localidad = this.localidadesSucursal[0];
						}

						let fnProcesarReinscripcion = (localidad: LocalidadComboProjection) => {
							let detallAprobado: {
								id: number,
								grupoId?: number,
								localidadId?: number,
								idTmp: number,
								becaId: number,
								cambioGrupo: boolean,
								listaPreciosId: number
							} = {
								id: alumnoId,
								grupoId,
								localidadId: localidad?.id,
								idTmp: this.siguienteIdTmp++,
								becaId,
								cambioGrupo: false,
								listaPreciosId: this.getListaPreciosId()
							};
							this._puntoVentaAbiertoService.agregarAlumnoAprobadoReinscripciones(detallAprobado);
						}

						if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
							fnProcesarReinscripcion(localidad);
						}else {
							let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
								localidadesSucursal: this.localidadesSucursal,
								onAceptar: fnProcesarReinscripcion.bind(this)
							};
					
							const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
								width: '500px',
								data: dialogData
							});
						}
					}else{
						this.onVistaBecasSindicatoGrupos(datos.alumno,datos.gruposCabeceras,datos.gruposMultisedeCabeceras,datos.idioma,datos.programa,datos.modalidad);
					}
				}
			});

		// Subscribe to update datosBecaSindicato on changes
		this._puntoVentaAbiertoService.onDatosBecaProulexChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosBecaProulexChanged.next(null);
					if(!!datos.procesarReinscripcion){
						this._matSnackBar.open('El alumno cuenta con una reinscripción, estamos procesándola.', 'OK', {
							duration: 10000,
						});

						let alumnoId = datos.alumnoId;
						let grupoId = datos.grupoId;
						let becaId = datos.becaId;

						let localidad: LocalidadComboProjection = null;

						if(this.localidadesSucursal.length == 1){
							localidad = this.localidadesSucursal[0];
						}

						let fnProcesarReinscripcion = (localidad: LocalidadComboProjection) => {
							let detallAprobado: {
								id: number,
								grupoId?: number,
								localidadId?: number,
								idTmp: number,
								becaId: number,
								cambioGrupo: boolean,
								listaPreciosId: number
							} = {
								id: alumnoId,
								grupoId,
								localidadId: localidad?.id,
								idTmp: this.siguienteIdTmp++,
								becaId,
								cambioGrupo: false,
								listaPreciosId: this.getListaPreciosId()
							};
							this._puntoVentaAbiertoService.agregarAlumnoAprobadoReinscripciones(detallAprobado);
						}
						
						if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
							fnProcesarReinscripcion(localidad);
						}else {
							let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
								localidadesSucursal: this.localidadesSucursal,
								onAceptar: fnProcesarReinscripcion.bind(this)
							};
					
							const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
								width: '500px',
								data: dialogData
							});
						}
					}else{
						this.onVistaBecasProulexGrupos(datos.alumno,datos.gruposCabeceras,datos.gruposMultisedeCabeceras,datos.idioma,datos.programa,datos.modalidad);
					}
				}
			});

		// Subscribe to update aplicarBecaSindicato on changes
		this._puntoVentaAbiertoService.onAplicarBecaSindicatoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAplicarBecaSindicatoChanged.next(null);
					let nuevoDetalle: OrdenVentaDetalleDatasource = datos.ordenVentaDetalle;
					let alumnoEnIdioma: boolean = false;
					if(!!nuevoDetalle.alumnoId){
						if(!!nuevoDetalle.grupoId){
							alumnoEnIdioma = this.alumnosRepetidosController.alumnoYaInscrito(nuevoDetalle.alumnoId,nuevoDetalle.idiomaId);
							if(!alumnoEnIdioma){
								this.alumnosRepetidosController.agregar(nuevoDetalle.alumnoId,nuevoDetalle.idiomaId);
							}
						}else{
							alumnoEnIdioma = this.alumnosRepetidosController.alumnoYaInscritoSinGrupo(nuevoDetalle.alumnoId,nuevoDetalle.idiomaId,nuevoDetalle.programaId,nuevoDetalle.nivel);
							if(!alumnoEnIdioma){
								this.alumnosRepetidosController.agregarSinGrupo(nuevoDetalle.alumnoId,nuevoDetalle.idiomaId,nuevoDetalle.programaId,nuevoDetalle.nivel);
							}
						}
					}
					if(!alumnoEnIdioma){
						this.dataSourceResumen.data = this.dataSourceResumen.data.concat(nuevoDetalle);
					}
					this.onVistaInicio();
				}
			});

		// Subscribe to update historial on changes
		this._puntoVentaAbiertoService.onHistorialChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onHistorialChanged.next(null);
					this.historialScrollController?.scrollToStart();
					this.historialScrollController?.registrosRecuperados(datos.ordenesVenta?.length || 0);
					this.dataSourceHistorial.data = this.dataSourceHistorial.data.concat(datos.ordenesVenta);
					this.vistaNavegador = 'Historial';
					if(!this.historialScrollController){
						setTimeout(() => {
							this.historialScrollController = new InfiniteScrollController(this.tablaHistorial._elementRef,this.getHistorial.bind(this));
						});
					}
				}
			});

		// Subscribe to update historial on changes
		this._puntoVentaAbiertoService.onHistorialResumenChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onHistorialResumenChanged.next(null);
					this.ordenVentaHistorial = datos.ordenVenta;
					this.dataSourceResumenOVD.data = datos.detalles;
				}
			});
		

		// Subscribe to update clienteControl.valueChanges
		this.clienteControl.valueChanges
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(value => {
				if(this.clienteActual?.id != value?.id){
					const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
						width: '400px',
						data: {
							mensaje: 'Se borrarán los artículos marcados, ¿deseas continuar?'
						}
					});
		
					dialogRef.afterClosed().subscribe(confirm => {
						if (confirm) {
							this.clienteActual = value;
							this.dataSourceResumen.data = [];
							if(value?.id){
								if(value.id > 0){
									this._puntoVentaAbiertoService.cargando = true;
									this._puntoVentaAbiertoService.getListaPreciosCliente(value.id)
								}
							}else if(value?.id === 0){
								this.listaPreciosCliente = null;
								this.listaPreciosSinDescuentoCliente = null;
								this.listaPreciosClienteId = null;
								this.simboloMoneda = this.simboloMonedaSucursal;
								this.prefijoMoneda = this.prefijoMonedaSucursal;
								this.tipoCambio = this.tipoCambioSucursal;
							}
						}else{
							this.clienteControl.setValue(this.clienteActual);
						}
					});
				}
			});

			// Subscribe to update datosBecaSindicato on changes
			this._puntoVentaAbiertoService.onAplicarValeCertificacionChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(datos => {
					if(datos){
						this._puntoVentaAbiertoService.onAplicarValeCertificacionChanged.next(null);
						this.dataSourceResumen.data = this.dataSourceResumen.data.concat(datos.ordenVentaDetalles);
						this.onVistaInicio();
					}
				});

		// Subscribe to update filtroControl.valueChanges
		this.filtroControl.valueChanges
			.pipe(
				tap(() => this.buscandoReinscripciones = true),
				takeUntil(this._unsubscribeAll),
				debounceTime(1000)
			).subscribe(value => {
				if(this.vistaNavegador == 'Reinscripciones'){
					this._puntoVentaAbiertoService.cargando = true;
					this.reinscripcionesSeleccionadas = {};
					this.reinscripcionesSeleccionadasCont = 0;
					this.reinscripcionesSeleccionadasTodas = false;
					this.dataSourceReinscripciones.data = [];
					this.reinscripcionesScrollIndex = 0;
					this.getReinscripciones();
				}else if(this.vistaNavegador == 'Entrega de libros'){
					this._puntoVentaAbiertoService.cargando = true;
					this.entregaLibrosSeleccionadas = {};
					this.entregaLibrosSeleccionadasCont = 0;
					this.entregaLibrosSeleccionadasTodas = false;
					this.dataSourceEntregaLibros.data = [];
					this.entregaLibrosScrollIndex = 0;
					this.getAlumnosEntregaLibros();
				}else if(this.vistaNavegador == 'JOBS'){
					this._puntoVentaAbiertoService.cargando = true;
					this.jobsSeleccionadas = {};
					this.jobsSeleccionadasCont = 0;
					this.jobsSeleccionadasTodas = false;
					this.dataSourceJOBS.data = [];
					this.jobsScrollIndex = 0;
					this.getAlumnosJOBS();
				}else if(this.vistaNavegador == 'JOBS SEMS'){
					this._puntoVentaAbiertoService.cargando = true;
					this.jobsSemsSeleccionadas = {};
					this.jobsSemsSeleccionadasCont = 0;
					this.jobsSemsSeleccionadasTodas = false;
					this.dataSourceJOBSSEMS.data = [];
					this.jobsSemsScrollIndex = 0;
					this.getAlumnosJOBSSEMS();
				}else if(this.vistaNavegador == 'Becas sindicato'){
					this._puntoVentaAbiertoService.cargando = true;
					this.dataSourceBecasSindicato.data = [];
					this.becasSindicatoScrollController.scrollIndex = 0;
					this.getBecasSindicato();
				}else if(this.vistaNavegador == 'Historial'){
					this._puntoVentaAbiertoService.cargando = true;
					this.dataSourceHistorial.data = [];
					this.historialScrollController.scrollIndex = 0;
					this.getHistorial();
				}else if(this.vistaNavegador == 'Alumnos sin grupo'){
					this._puntoVentaAbiertoService.cargando = true;
					this.inscripcionSinGrupoLigasOVDIdsTmp = {};
					this.ovdLigasInscripcionesSinGrupoIds = {};
					this.dataSourceAlumnosSinGrupo.data = [];
					this.alumnosSinGrupoScrollController.scrollIndex = 0;
					this._puntoVentaAbiertoService.getAlumnosSinGrupo(this._puntoVentaAbiertoService.getSucursalPuntoVentaId(),this.filtroControl?.value || '',this.alumnosSinGrupoScrollController?.scrollIndex || 0,this.alumnosSinGrupoScrollController?.maxBusqueda || 100);
				}else{
					this.buscandoReinscripciones = false;
				}
			});
		
		this.fechaHistorialControl.valueChanges
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((fecha: Moment) => {
				if(this.vistaNavegador == 'Historial'){
					this._puntoVentaAbiertoService.cargando = true;
					this.dataSourceHistorial.data = [];
					this.historialScrollController.scrollIndex = 0;
					this.getHistorial();
				}
			});

		setTimeout(() => {
			this._puntoVentaAbiertoService.toggleSidebarFold();
		});

	}

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	onEliminarDetalle(detalleBorrar: OrdenVentaDetalleDatasource) {
		if(!!this.ovdLigasInscripcionesSinGrupoIds[detalleBorrar.idTmp]){
			delete this.inscripcionSinGrupoLigasOVDIdsTmp[this.ovdLigasInscripcionesSinGrupoIds[detalleBorrar.idTmp]];
			delete this.ovdLigasInscripcionesSinGrupoIds[detalleBorrar.idTmp];
			this.dataSourceAlumnosSinGrupo.filter = `${this.dataSourceAlumnosSinGrupo.filter} `;
		}
		this.dataSourceResumen.data = this.dataSourceResumen.data.filter(detalle => {
			return detalle.idTmp != detalleBorrar.idTmp;
		});
		if(!!detalleBorrar.grupoId){
			this.alumnosRepetidosController.eliminar(detalleBorrar.alumnoId,detalleBorrar.idiomaId);
		}else{
			this.alumnosRepetidosController.eliminarSinGrupo(detalleBorrar.alumnoId,detalleBorrar.idiomaId,detalleBorrar.programaId,detalleBorrar.nivel);
		}
	}

	onVistaAtras(){
		this.filtroControl.setValue('');
		this.clearQueryParams();
		switch(this.vistaNavegador){
			case 'Programas':
				this.vistaNavegador = 'Idiomas';
				this.programas = [];
				this.idiomaSeleccionado = null;
				break;
			case 'Modalidades':
				this.vistaNavegador = 'Programas';
				this.paModalidades = [];
				this.programaSeleccionado = null;
				break;
			case 'Tipos de grupo':
				this.vistaNavegador = 'Modalidades';
				this.tiposGrupos = [];
				this.paModalidadSeleccionado = null;
				break;
			case 'Niveles':
				this.vistaNavegador = 'Tipos de grupo';
				this.niveles = [];
				this.tipoGrupoSeleccionado = null;
				break;
			case 'Grupos':
				this.vistaNavegador = 'Niveles';
				this.programasGrupos = [];
				this.programasGruposMultisede = [];
				this.nivelSeleccionado = null;
				break;
			case 'Categorias':
				this.vistaNavegador = 'Idiomas';
				this.categorias = [];
				this.familiaSeleccionado = null;
				break;
			case 'Subcategorias':
				this.vistaNavegador = 'Categorias';
				this.subcategorias = [];
				this.categoriaSeleccionado = null;
				break;
			case 'Articulos':
				if(!!this.subcategoriaSeleccionado){
					this.vistaNavegador = 'Subcategorias';
					this.articulos = [];
					this.subcategoriaSeleccionado = null;
				}else{
					this.vistaNavegador = 'Categorias';
					this.articulos = [];
					this.categoriaSeleccionado = null;
				}
				break;
			case 'Pagar':
				this.vistaNavegador = 'Idiomas';
				this.medioPagoSeleccionado = null;
				this.tipoCambioPagoControl.setValue(null);
				this.referenciaPagoControl.setValue(null);
				break;
			case 'Reinscripciones':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				this.reinscripcionesSeleccionadasCont = 0;
				this.reinscripcionesSeleccionadasTodas = false;
				this.reinscripcionesSeleccionadas = {};
				this.dataSourceReinscripciones.data = [];
				break;
			case 'Grupos reinscripcion reprobado':
				this.vistaNavegador = 'Reinscripciones';
				this.programasGrupos = [];
				this.programasGruposMultisede = [];
				this.nivelSeleccionado = null;
				break;
			case 'Alumnos sin grupo':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Entrega de libros':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				this.entregaLibrosSeleccionadasCont = 0;
				this.entregaLibrosSeleccionadasTodas = false;
				this.entregaLibrosSeleccionadas = {};
				this.dataSourceEntregaLibros.data = [];
				break;
			case 'JOBS':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				this.jobsSeleccionadasCont = 0;
				this.jobsSeleccionadasTodas = false;
				this.jobsSeleccionadas = {};
				this.dataSourceJOBS.data = [];
				break;
			case 'JOBS SEMS':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				this.jobsSemsSeleccionadasCont = 0;
				this.jobsSemsSeleccionadasTodas = false;
				this.jobsSemsSeleccionadas = {};
				this.dataSourceJOBSSEMS.data = [];
				break;
			case 'Becas sindicato':
				this.limpiarCardsSeleccionados();
				this.vistaNavegador = 'Idiomas';
				this.dataSourceBecasSindicato.data = [];
				break;
			case 'Becas sindicato grupos':
				this.limpiarCardsSeleccionados();
				this.alumnoBecaSindicatoGrupos = null;
				this.gruposBecaSindicatoGrupos = [];
				this.gruposMultisedeBecaSindicatoGrupos = [];
				this.tituloBecasSindicatoGrupos = null;
				this.onVistaBecasSindicato();
				break;
			case 'Historial':
				this.limpiarCardsSeleccionados();
				this.vistaResumen = 'Venta';
				this.vistaNavegador = 'Idiomas';
				this.fechaHistorialControl.setValue(moment());
				this.dataSourceHistorial.data = [];
				break;
		}
	}

	onVistaInicio(){
		this.limpiarCardsSeleccionados();
		this.medioPagoSeleccionado = null;
		this.filtroControl.setValue('');
		this.clearQueryParams();
		switch(this.vistaNavegador){
			case 'Becas sindicato grupos':
				this.alumnoBecaSindicatoGrupos = null;
				this.gruposBecaSindicatoGrupos = [];
				this.gruposMultisedeBecaSindicatoGrupos = [];
				this.tituloBecasSindicatoGrupos = null;
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Becas sindicato':
				this.vistaNavegador = 'Idiomas';
				this.dataSourceBecasSindicato.data = [];
				break;
			case 'JOBS SEMS':
				this.vistaNavegador = 'Idiomas';
				this.jobsSemsSeleccionadasCont = 0;
				this.jobsSemsSeleccionadasTodas = false;
				this.jobsSemsSeleccionadas = {};
				this.dataSourceJOBSSEMS.data = [];
				break;
			case 'JOBS':
				this.vistaNavegador = 'Idiomas';
				this.jobsSeleccionadasCont = 0;
				this.jobsSeleccionadasTodas = false;
				this.jobsSeleccionadas = {};
				this.dataSourceJOBS.data = [];
				break;
			case 'Entrega de libros':
				this.vistaNavegador = 'Idiomas';
				this.entregaLibrosSeleccionadasCont = 0;
				this.entregaLibrosSeleccionadasTodas = false;
				this.entregaLibrosSeleccionadas = {};
				this.dataSourceEntregaLibros.data = [];
				break;
			case 'Alumnos sin grupo':
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Reinscripciones':
				this.vistaNavegador = 'Idiomas';
				this.reinscripcionesSeleccionadasCont = 0;
				this.reinscripcionesSeleccionadasTodas = false;
				this.reinscripcionesSeleccionadas = {};
				this.dataSourceReinscripciones.data = [];
				break;
			case 'Pagar':
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Articulos':
				this.articulos = [];
			case 'Subcategorias':
				this.subcategorias = [];
			case 'Categorias':
				this.categorias = [];
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Grupos':
				this.programasGrupos = [];
				this.programasGruposMultisede = [];
			case 'Niveles':
				this.niveles = [];
			case 'Tipos de grupo':
				this.tiposGrupos = [];
			case 'Modalidades':
				this.paModalidades = [];
			case 'Programas':
				this.programas = [];
				this.vistaNavegador = 'Idiomas';
				break;
			case 'Grupos reinscripcion reprobado':
				this.programasGrupos = [];
				this.programasGruposMultisede = [];
		}
	}

	onIdioma(idioma: ControlMaestroMultipleCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.idiomaSeleccionado = idioma;
		this._puntoVentaAbiertoService.getProgramas(this.idiomaSeleccionado.id);
	}

	onPrograma(programa: ProgramaCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.programaSeleccionado = programa;
		this._puntoVentaAbiertoService.getModalidades(this.idiomaSeleccionado.id, this.programaSeleccionado.id);
	}

	onModalidad(paModalidad: PAModalidadCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.paModalidadSeleccionado = paModalidad;
		this._puntoVentaAbiertoService.getTiposGrupos(this.idiomaSeleccionado.id, this.programaSeleccionado.id, this.paModalidadSeleccionado.id);
	}

	onTipoGrupo(tipoGrupo: ControlMaestroMultipleCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.tipoGrupoSeleccionado = tipoGrupo;
		this._puntoVentaAbiertoService.getNiveles(this.idiomaSeleccionado.id, this.programaSeleccionado.id, this.paModalidadSeleccionado.id,this.tipoGrupoSeleccionado.id);
	}

	onNivel(nivel: number){
		this._puntoVentaAbiertoService.cargando = true;
		this.nivelSeleccionado = nivel;
		this._puntoVentaAbiertoService.getGrupos(this.idiomaSeleccionado.id, this.programaSeleccionado.id, this.paModalidadSeleccionado.id,this.tipoGrupoSeleccionado.id,this.nivelSeleccionado);
	}

	onGrupo(grupo: ProgramaGrupoCardProjection, articuloId?: number){
		if(!!grupo && !grupo.permiteInscripcion){
			this._matSnackBar.open('El grupo tiene cupo lleno', 'OK', {
				duration: 5000,
			});
			return;
		}
		
		if(!!grupo){
			this.programaGrupoSeleccionado = grupo;
		}else{
			this.programaGrupoSeleccionado = {
				articuloId
			};
		}
		
		let dialogData: PuntoVentaAlumnoDialogData = {
			grupoId: grupo?.id || null,
			grupoEsJobsSems: !!this.programaSeleccionado.jobsSems,
			articuloId: null,
			alumnos: this.alumnos,
			localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.localidadesSucursal,
			activarBecas: true,
			activarValesCertificacion: false,
			pedirCantidad: false,
			onAceptar: this.onAceptarAlumnoDialog.bind(this),
			onNuevoAlumno: this.onNuevoAlumnoDialog.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaAlumnoDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onFamilia(familia: ArticuloFamiliaCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.familiaSeleccionado = familia;
		this._puntoVentaAbiertoService.getCategorias(this.familiaSeleccionado.id);
	}

	onCategoria(categoria: ArticuloCategoriaCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.categoriaSeleccionado = categoria;
		this._puntoVentaAbiertoService.getSubcategorias(this.categoriaSeleccionado.id);
	}

	onSubcategoria(subcategoria: ArticuloSubcategoriaCardProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.subcategoriaSeleccionado = subcategoria;
		this._puntoVentaAbiertoService.getArticulos(this.subcategoriaSeleccionado.id);
	}

	onArticulo(articulo: ArticuloCardProjection){
		this.articuloSeleccionado = articulo;
		this.certificacionSeleccionada = null;
		if(articulo.articuloSubtipoId == ArticulosSubtipos.EXAMEN || articulo.articuloSubtipoId == ArticulosSubtipos.CERTIFICACION || articulo.articuloSubtipoId == ArticulosSubtipos.CONSTANCIA || articulo.articuloSubtipoId == ArticulosSubtipos.TUTORIA){
			this.certificacionSeleccionada = articulo;
			let dialogData: PuntoVentaAlumnoDialogData = {
				grupoId: null,
				grupoEsJobsSems: false,
				articuloId: articulo.id,
				alumnos: this.alumnos,
				localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.localidadesSucursal,
				activarBecas: false,
				activarValesCertificacion: articulo.articuloSubtipoId == ArticulosSubtipos.CERTIFICACION,
				pedirCantidad: articulo.pedirCantidadPV,
				onAceptar: this.onAceptarAlumnoArticuloDialog.bind(this),
				onNuevoAlumno: this.onNuevoAlumnoArticuloDialog.bind(this)
			};
	
			const dialogRef = this.dialog.open(PuntoVentaAlumnoDialogComponent, {
				width: '500px',
				data: dialogData
			});
		}else{
			this._puntoVentaAbiertoService.cargando = true;
			if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId()){
				this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
					articulo.id,
					articulo.articuloSubtipoId,
					1,
					this.getListaPreciosId(),
					0,
					this.siguienteIdTmp++
				);
			}else if(this.localidadesSucursal?.length == 1){
				this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
					articulo.id,
					articulo.articuloSubtipoId,
					1,
					this.getListaPreciosId(),
					0,
					this.siguienteIdTmp++,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					null,
					this.localidadesSucursal[0].id
				);
			}else{
				this.articuloLigarLocalidad = articulo;
				this.onSeleccionarLocalidad();
			}
		}
	}

	onAceptarAlumnoDialog(alumno: AlumnoComboProjection, becaUDGId: number, programaIdiomaCertificacionValeId: number, localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
			this.programaGrupoSeleccionado?.articuloId || this.articuloSeleccionado?.id,
			this.articuloSeleccionado?.articuloSubtipoId,
			1,
			this.getListaPreciosId(),
			0,
			this.siguienteIdTmp++,
			this.programaSeleccionado?.id || null,
			this.idiomaSeleccionado?.id || null,
			this.paModalidadSeleccionado?.id || null,
			this.tipoGrupoSeleccionado?.id || null,
			this.programaGrupoSeleccionado?.id || null,
			this.programaGrupoSeleccionado?.numeroGrupo || null,
			alumno.id,
			becaUDGId,
			programaIdiomaCertificacionValeId,
			localidad?.id || null,
			null,
			this.nivelSeleccionado
		);
	}
	
	onNuevoAlumnoDialog(localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.guardarLocalStorage(localidad);
		this.router.navigate([this.rutaNuevoAlumno],{queryParams: {
			fichaVolver: 'PuntoVenta',
			idioma: this.hashid.encode(this.idiomaSeleccionado?.id),
			programa: this.hashid.encode(this.programaSeleccionado?.id),
			modalidad: this.hashid.encode(this.paModalidadSeleccionado?.id),
			tipoGrupo: this.hashid.encode(this.tipoGrupoSeleccionado?.id),
			grupo: this.hashid.encode(this.programaGrupoSeleccionado?.id),
			certificacion: this.hashid.encode(this.certificacionSeleccionada?.id),
			listaPreciosId: this.hashid.encode(this.getListaPreciosId()),
			nivel: this.hashid.encode(this.nivelSeleccionado),
			sede: this.hashid.encode(this._puntoVentaAbiertoService.getSucursalPuntoVentaId())
		}});
	}

	onAceptarAlumnoArticuloDialog(alumno: AlumnoComboProjection, becaUDGId: number, programaIdiomaCertificacionValeId: number, localidad: LocalidadComboProjection, cantidad: number){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
			this.articuloSeleccionado?.id,
			this.articuloSeleccionado?.articuloSubtipoId,
			cantidad,
			this.getListaPreciosId(),
			0,
			this.siguienteIdTmp++,
			null,
			null,
			null,
			null,
			null,
			null,
			alumno.id,
			becaUDGId,
			programaIdiomaCertificacionValeId,
			localidad?.id || null,
			null,
			null
		);
	}
	
	onNuevoAlumnoArticuloDialog(localidad: LocalidadComboProjection, cantidad: number){
		this._puntoVentaAbiertoService.cargando = true;
		this.guardarLocalStorage(localidad);
		this.router.navigate([this.rutaNuevoAlumno],{queryParams: {
			fichaVolver: 'PuntoVenta',
			certificacion: this.hashid.encode(this.certificacionSeleccionada?.id),
			cantidad: this.hashid.encode(cantidad),
			listaPreciosId: this.hashid.encode(this.getListaPreciosId()),
			sede: this.hashid.encode(this._puntoVentaAbiertoService.getSucursalPuntoVentaId())
		}});
	}

	guardarLocalStorage(localidad?: LocalidadComboProjection){
		localStorage.setItem(this.localStorageParams.detalles,JSON.stringify(this.dataSourceResumen.data));
		if(!!localidad){
			localStorage.setItem(this.localStorageParams.localidadAsignarId,JSON.stringify(localidad.id));
		}
	}

	guardarTextoBusqueda(){
		localStorage.setItem(this.localStorageParams.textoBusqueda,this.filtroControl.value || '');
	}

	recuperarLocalStorage(){
		let detallesStr: string = localStorage.getItem(this.localStorageParams.detalles);

		if(!!detallesStr){
			this.dataSourceResumen.data = JSON.parse(detallesStr);
		}
	}

	recuperarTextoBusqueda(){
		this.textoBusquedaPrecargar = localStorage.getItem(this.localStorageParams.textoBusqueda);
		localStorage.removeItem(this.localStorageParams.textoBusqueda);
	}

	eliminarLocalStorage(){
		localStorage.removeItem(this.localStorageParams.detalles);
	}

	onPagar(){
		if(!this.dataSourceResumen.data.length){
			this._matSnackBar.open('No tienes artículos por cobrar', 'OK', {
				duration: 5000,
			});
			return
		}
		this.fechaPagoControl.setValue(moment());
		this.vistaNavegador = 'Pagar';
	}

	onSeleccionarTipoPago(medioPago: MedioPagoPVComboProjection){
		if(this.getSumaTotal() == 0){
			return;
		}
		this._puntoVentaAbiertoService.cargando = true;
		if(medioPago.id == MediosPagoPV.EFECTIVO){
			this._matSnackBar.open('Funcionalidad pendiente de implementar', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		this.medioPagoSeleccionado = medioPago;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
			this.tipoCambioPagoControl.setValue(this.tipoCambio);
			if([MediosPagoPV.TRANSFERENCIA_BANCARIA,MediosPagoPV.TARJETA_DE_CREDITO,MediosPagoPV.TARJETA_DE_DEBITO,MediosPagoPV.ORDEN_DE_PAGO,MediosPagoPV.PAGO_EN_VENTANILLA].includes(medioPago.id)){
				this.referenciaPagoControl.setValidators([Validators.required]);
				this.correoElectronicoControl.setValidators([]);
			}else if([MediosPagoPV.CENTRO_DE_PAGOS].includes(medioPago.id)){
				this.referenciaPagoControl.setValidators([]);
				this.correoElectronicoControl.setValidators([Validators.required,Validators.email]);
			}else{
				this.referenciaPagoControl.setValidators([]);
				this.correoElectronicoControl.setValidators([]);
			}
			this.referenciaPagoControl.updateValueAndValidity();
			this.referenciaPagoControl.setValue(null);
			this.correoElectronicoControl.updateValueAndValidity();
			this.correoElectronicoControl.setValue(null);
			if([MediosPagoPV.TRANSFERENCIA_BANCARIA,MediosPagoPV.TARJETA_DE_CREDITO,MediosPagoPV.TARJETA_DE_DEBITO,MediosPagoPV.ORDEN_DE_PAGO,MediosPagoPV.PAGO_EN_VENTANILLA].includes(medioPago.id) && this.inputReferenciaPago?.nativeElement?.focus){
				this.inputReferenciaPago.nativeElement.focus();
			}else if([MediosPagoPV.CENTRO_DE_PAGOS].includes(medioPago.id) && this.inputCorreoElectronico?.nativeElement?.focus){
				this.inputCorreoElectronico.nativeElement.focus();
			}
		});
	}

	onCobrar(){
		this._puntoVentaAbiertoService.cargando = true;
		let total: number = this.getSumaTotal();
		if(total != 0 && !this.medioPagoSeleccionado){
			this._matSnackBar.open('Selecciona una forma de pago', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		if(total != 0 && !this.tipoCambioPagoControl.value){
			this._matSnackBar.open('Ingresa el tipo de cambio', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		if([MediosPagoPV.TRANSFERENCIA_BANCARIA,MediosPagoPV.TARJETA_DE_CREDITO,MediosPagoPV.TARJETA_DE_DEBITO,MediosPagoPV.PAGO_EN_VENTANILLA].includes(this.medioPagoSeleccionado?.id) && !this.referenciaPagoControl.value){
			this._matSnackBar.open('Ingresa la referencia del pago', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		if([MediosPagoPV.CENTRO_DE_PAGOS].includes(this.medioPagoSeleccionado?.id) && !this.correoElectronicoControl.value){
			this._matSnackBar.open('Ingresa un correo electrónico', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		if(!!this.correoElectronicoControl.invalid){
			this._matSnackBar.open('Ingresa un coreo electrónico válido', 'OK', {
				duration: 5000,
			});
			this._puntoVentaAbiertoService.cargando = false;
			return;
		}
		this._puntoVentaAbiertoService.cobrar(
			this.clienteControl.value?.id || null,
			this.medioPagoSeleccionado?.id || null,
			this.tipoCambioPagoControl.value || this.tipoCambio || 1,
			this.referenciaPagoControl.value || null,
			this.dataSourceResumen.data,
			this.getListaPreciosId(),
			this.correoElectronicoControl.value,
			total,
			this.fechaPagoControl.value,
			false
		);
	}

	onVistaReinscripciones(){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Venta';
		this.reinscripcionesSeleccionadasCont = 0;
		this.reinscripcionesSeleccionadasTodas = false;
		this.reinscripcionesSeleccionadas = {};
		this.dataSourceReinscripciones.data = [];
		this.reinscripcionesScrollIndex = 0;
		this.getReinscripciones();
	}

	actualizarReinscripcionesEstatus(){
		this._puntoVentaAbiertoService.cargando = true;
		let seleccionadasCont: number = 0;
		let seleccionadasTodas: boolean = true;
		this.dataSourceReinscripciones.data.forEach(reinscripciones => {
			if(this.reinscripcionesSeleccionadas[reinscripciones.id][reinscripciones.idiomaId]){
				seleccionadasCont++;
			}else if(seleccionadasTodas){
				seleccionadasTodas = false;
			}
		});
		this.reinscripcionesSeleccionadasCont = seleccionadasCont;
		this.reinscripcionesSeleccionadasTodas = seleccionadasTodas;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	setReinscripcionesEstatus(seleccionar: boolean){
		this._puntoVentaAbiertoService.cargando = true;
		this.reinscripcionesSeleccionadasTodas = seleccionar;
		this.dataSourceReinscripciones.data.forEach(reinscripciones => {
			this.reinscripcionesSeleccionadas[reinscripciones.id][reinscripciones.idiomaId] = seleccionar;
		});
		if(seleccionar){
			this.reinscripcionesSeleccionadasCont = this.dataSourceReinscripciones.data.length;
		}else{
			this.reinscripcionesSeleccionadasCont = 0;
		}
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	onAceptarReinscripciones(localidad?: LocalidadComboProjection){
		if(this.reinscripcionAgregarTmp.aprobado){
			this._puntoVentaAbiertoService.cargando = true;
			if(!!this.reinscripcionAgregarTmp.jsonEdicionInscripcion){
				this._puntoVentaAbiertoService.getGruposAlumnoReinscripcion(
					this.reinscripcionAgregarTmp.idiomaId,
					this.reinscripcionAgregarTmp.programaId,
					this.reinscripcionAgregarTmp.jsonEdicionInscripcion.modalidadId,
					this.reinscripcionAgregarTmp.jsonEdicionInscripcion.horarioId,
					this.reinscripcionAgregarTmp.jsonEdicionInscripcion.nivel
				);
			}else{
				if(this.localidadesSucursal.length == 1){
					localidad = this.localidadesSucursal[0];
				}
				if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
					let detallAprobado: {
						id: number,
						grupoId?: number,
						localidadId?: number,
						idTmp: number,
						becaId: number,
						cambioGrupo: boolean,
						listaPreciosId: number
					} = {
						id: this.reinscripcionAgregarTmp.id,
						grupoId: this.reinscripcionAgregarTmp.grupoReinscripcionId,
						localidadId: localidad?.id,
						idTmp: this.siguienteIdTmp++,
						becaId: this.reinscripcionAgregarTmp.becaId || null,
						cambioGrupo: false,
						listaPreciosId: this.getListaPreciosId()
					};
					this._puntoVentaAbiertoService.agregarAlumnoAprobadoReinscripciones(detallAprobado);
				}else {
					this.onSeleccionarLocalidadReinscripciones();
				}
			}
		}else{
			this._puntoVentaAbiertoService.cargando = true;
			this._puntoVentaAbiertoService.getGruposAlumnoReinscripcion(
				this.reinscripcionAgregarTmp.idiomaId,
				this.reinscripcionAgregarTmp.programaId,
				this.reinscripcionAgregarTmp.modalidadId,
				this.reinscripcionAgregarTmp.horarioId,
				this.reinscripcionAgregarTmp.nivelReasignado || this.reinscripcionAgregarTmp.nivelReinscripcion
			);
		}
	}

	private lowestPositionYReinscripciones: number = 0;
	onScrollDownReinscripciones(e){
		const scrollLocation = e.target.scrollTop; // how far user scrolled
		if(this.vistaNavegador == 'Reinscripciones' && !this._puntoVentaAbiertoService.cargando && !this.reinscripcionesScrollFinalizado && this.lowestPositionYReinscripciones < scrollLocation){
			this.lowestPositionYReinscripciones = scrollLocation;
			const tableViewHeight = e.target.offsetHeight // viewport: ~500px
			const tableScrollHeight = e.target.scrollHeight // length of all table
	
			// If the user has scrolled within 500px of the bottom, add more data
			const buffer = 500;
			const limit = tableScrollHeight - tableViewHeight - buffer;
			if (scrollLocation > limit) {
				this._puntoVentaAbiertoService.cargando = true;
				this.reinscripcionesScrollIndex += this.reinscripcionesMaxBusqueda;
				this._puntoVentaAbiertoService.getDatosReinscripciones(this.filtroControl?.value || '',this.reinscripcionesScrollIndex,this.reinscripcionesMaxBusqueda);
			}
		}
	}

	getReinscripciones(){
		this._puntoVentaAbiertoService.getDatosReinscripciones(this.filtroControl?.value || '',this.reinscripcionesScrollIndex,this.reinscripcionesMaxBusqueda);
	}

	onEditarReinscripcion(reinscripcion: AlumnoReinscripcionProjection){
		this.reinscripcionEditar = reinscripcion;
		
		let dialogData: PuntoVentaEditarReinscripcionDialogData = {
			alumno: `${reinscripcion.nombre} ${reinscripcion.primerApellido}` + (reinscripcion.segundoApellido ? ` ${reinscripcion.segundoApellido}` : ''),
			curso: reinscripcion.curso,
			idiomaId: reinscripcion.idiomaId,
			programaId: reinscripcion.programaId,
			modalidadId: reinscripcion.modalidadId,
			horarioId: reinscripcion.horarioId,
			repetirNivel: !reinscripcion.aprobado,
			nivel: reinscripcion.nivelReinscripcion,
			onAceptar: this.onAceptarEdicionReinscripcionDialog.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaEditarReinscripcionDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarEdicionReinscripcionDialog(datos: any){
		this._puntoVentaAbiertoService.cargando = true;

		if(!!this.reinscripcionEditar?.aprobado){
			this.reinscripcionEditar.jsonEdicionInscripcion = {
				nivel: datos.nivel,
				modalidadId: datos.modalidadId,
				modalidad: datos.modalidad,
				horarioId: datos.horarioId,
				horario: datos.horario,
				comentario: datos.comentario
			};
		}else{
			this.reinscripcionEditar.modalidadId = datos.modalidadId;
			this.reinscripcionEditar.modalidad = datos.modalidad;
			this.reinscripcionEditar.horarioId = datos.horarioId;
			this.reinscripcionEditar.horario = datos.horario;
			this.reinscripcionEditar.comentario = datos.comentario;
			this.reinscripcionEditar.nivelReasignado = datos.nivel;
		}

		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	onVistaAlumnosSinGrupo(){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Venta';
		// this.vistaNavegador = 'Alumnos sin grupo';
		this._puntoVentaAbiertoService.getAlumnosSinGrupo(this._puntoVentaAbiertoService.getSucursalPuntoVentaId(),this.filtroControl?.value || '',this.alumnosSinGrupoScrollController?.scrollIndex || 0,this.alumnosSinGrupoScrollController?.maxBusqueda || 100);
	}

	onRelacionarAlumnoSinGrupo(inscripcionSinGrupo: InscripcionSinGrupoListadoProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.inscripcionSinGrupoRelacionar = inscripcionSinGrupo;
		this._puntoVentaAbiertoService.getDatosAlumnoSinGrupo(this.inscripcionSinGrupoRelacionar.id);
	}

	onAceptarAlumnoSinGrupoDialog(grupo: ProgramaGrupoComboProjection, localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;

		this._puntoVentaAbiertoService.relacionarAlumnoSinGrupo(
			this.inscripcionSinGrupoRelacionar.id,
			grupo.id
		);
	}

	filtrarDatasourceAlumnosSinGrupo(inscripcionSinGrupo: InscripcionSinGrupoListadoProjection){
		return !this.inscripcionSinGrupoLigasOVDIdsTmp[inscripcionSinGrupo.id];
	}

	onSeleccionarLocalidad(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.localidadesSucursal,
			onAceptar: this.onAceptarSeleccionarLocalidadDialog.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarSeleccionarLocalidadDialog(localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.crearOrdenVentaDetalle(
			this.articuloLigarLocalidad.id,
			this.articuloLigarLocalidad.articuloSubtipoId,
			1,
			this.getListaPreciosId(),
			0,
			this.siguienteIdTmp++,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			null,
			localidad?.id || null
		);
	}

	onSeleccionarLocalidadReinscripciones(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.localidadesSucursal,
			onAceptar: this.onAceptarReinscripciones.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	getSumaTotal(): number {
        let sumaTotal: number = 0;

        for(let detalle of this.dataSourceResumen.data){
            sumaTotal += detalle.total;
        }

        return sumaTotal;
    }

	onVistaEntregaLibros(){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Venta';
		this.entregaLibrosSeleccionadasCont = 0;
		this.entregaLibrosSeleccionadasTodas = false;
		this.entregaLibrosSeleccionadas = {};
		this.dataSourceEntregaLibros.data = [];
		this.entregaLibrosScrollIndex = 0;
		this.getAlumnosEntregaLibros();
	}

	actualizarEntregaLibrosEstatus(){
		this._puntoVentaAbiertoService.cargando = true;
		let seleccionadasCont: number = 0;
		let seleccionadasTodas: boolean = true;
		this.dataSourceEntregaLibros.data.forEach(alumno => {
			if(alumno.inscripcionEstatusId == this.CMM_INS_Estatus.PAGADA){
				if(this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)][String(alumno.inscripcionId || alumno.inscripcionSinGrupoId)]){
					seleccionadasCont++;
				}else if(seleccionadasTodas){
					seleccionadasTodas = false;
				}
			}else{
				seleccionadasCont++;
			}
		});
		this.entregaLibrosSeleccionadasCont = seleccionadasCont;
		this.entregaLibrosSeleccionadasTodas = seleccionadasTodas;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	setEntregaLibrosEstatus(seleccionar: boolean){
		this._puntoVentaAbiertoService.cargando = true;
		this.entregaLibrosSeleccionadasTodas = seleccionar;
		this.dataSourceEntregaLibros.data.forEach(alumno => {
			if(alumno.inscripcionEstatusId == this.CMM_INS_Estatus.PAGADA){
				this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)][String(alumno.inscripcionId || alumno.inscripcionSinGrupoId)] = seleccionar;
			}
		});
		if(seleccionar){
			this.entregaLibrosSeleccionadasCont = this.dataSourceEntregaLibros.data.length;
		}else{
			this.entregaLibrosSeleccionadasCont = 0;
		}
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	getAlumnosEntregaLibros(){
		this._puntoVentaAbiertoService.getAlumnosEntregaLibros(this.filtroControl?.value || '',this.entregaLibrosScrollIndex,this.entregaLibrosMaxBusqueda);
	}

	private lowestPositionYEntregaLibros: number = 0;
	onScrollDownEntregaLibros(e){
		const scrollLocation = e.target.scrollTop; // how far user scrolled
		if(this.vistaNavegador == 'Entrega de libros' && !this._puntoVentaAbiertoService.cargando && !this.entregaLibrosScrollFinalizado && this.lowestPositionYEntregaLibros < scrollLocation){
			this.lowestPositionYEntregaLibros = scrollLocation;
			const tableViewHeight = e.target.offsetHeight // viewport: ~500px
			const tableScrollHeight = e.target.scrollHeight // length of all table
	
			// If the user has scrolled within 500px of the bottom, add more data
			const buffer = 500;
			const limit = tableScrollHeight - tableViewHeight - buffer;    
			if (scrollLocation > limit) {
				this._puntoVentaAbiertoService.cargando = true;
				this.entregaLibrosScrollIndex += this.entregaLibrosMaxBusqueda;
				this._puntoVentaAbiertoService.getAlumnosEntregaLibros(this.filtroControl?.value || '',this.entregaLibrosScrollIndex,this.entregaLibrosMaxBusqueda);
			}
		}
	}

	onAceptarEntregaLibros(){
		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '400px',
			data: {
				titulo: 'Entrega de libros',
				mensaje: 'Se afectará el inventario de los libros seleccionados'
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if (confirm) {
				let localidad: LocalidadComboProjection = null;
				if(this.localidadesSucursal.length == 1){
					localidad = this.localidadesSucursal[0];
				}
				if(!!localidad?.id){
					this.onAceptarEntregaLibrosLocalidad(localidad);
				}else{
					let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
						localidadesSucursal: this.localidadesSucursal,
						onAceptar: this.onAceptarEntregaLibrosLocalidad.bind(this)
					};
			
					const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
						width: '500px',
						data: dialogData
					});
				}
			}
		});
	}

	onAceptarEntregaLibrosLocalidad(localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		let alumnos: AlumnoEntregarLibrosProjection[] = this.dataSourceEntregaLibros.data.filter(alumno => {
			return !!this.entregaLibrosSeleccionadas[alumno.id][String(!!alumno.inscripcionId)][String(alumno.inscripcionId || alumno.inscripcionSinGrupoId)];
		});
		this._puntoVentaAbiertoService.entregarLibros(alumnos,localidad.id);
	}

	onVistaJOBS(){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Venta';
		this.jobsSeleccionadasCont = 0;
		this.jobsSeleccionadasTodas = false;
		this.jobsSeleccionadas = {};
		this.dataSourceJOBS.data = [];
		this.jobsScrollIndex = 0;
		this.getAlumnosJOBS();
	}

	actualizarAlumnoJOBSEstatus(){
		this._puntoVentaAbiertoService.cargando = true;
		let seleccionadasCont: number = 0;
		let seleccionadasTodas: boolean = true;
		this.dataSourceJOBS.data.forEach(alumno => {
			if(this.jobsSeleccionadas[alumno.id][alumno.grupoId]){
				seleccionadasCont++;
			}else if(seleccionadasTodas){
				seleccionadasTodas = false;
			}
		});
		this.jobsSeleccionadasCont = seleccionadasCont;
		this.jobsSeleccionadasTodas = seleccionadasTodas;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}
	
	setAlumnosJOBSEstatus(seleccionar: boolean){
		this._puntoVentaAbiertoService.cargando = true;
		this.jobsSeleccionadasTodas = seleccionar;
		this.dataSourceJOBS.data.forEach(alumno => {
			this.jobsSeleccionadas[alumno.id][alumno.grupoId] = seleccionar;
		});
		if(seleccionar){
			this.jobsSeleccionadasCont = this.dataSourceJOBS.data.length;
		}else{
			this.jobsSeleccionadasCont = 0;
		}
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	getAlumnosJOBS(){
		this._puntoVentaAbiertoService.getAlumnosJOBS(this.filtroControl?.value || '',this.jobsScrollIndex,this.jobsMaxBusqueda);
	}

	private lowestPositionYAlumnosJOBS: number = 0;
	onScrollDownAlumnosJOBS(e){
		const scrollLocation = e.target.scrollTop; // how far user scrolled
		if(this.vistaNavegador == 'JOBS' && !this._puntoVentaAbiertoService.cargando && !this.jobsScrollFinalizado && this.lowestPositionYAlumnosJOBS < scrollLocation){
			this.lowestPositionYAlumnosJOBS = scrollLocation;
			const tableViewHeight = e.target.offsetHeight // viewport: ~500px
			const tableScrollHeight = e.target.scrollHeight // length of all table
	
			// If the user has scrolled within 500px of the bottom, add more data
			const buffer = 500;
			const limit = tableScrollHeight - tableViewHeight - buffer;    
			if (scrollLocation > limit) {
				this._puntoVentaAbiertoService.cargando = true;
				this.jobsScrollIndex += this.jobsMaxBusqueda;
				this._puntoVentaAbiertoService.getAlumnosJOBS(this.filtroControl?.value || '',this.jobsScrollIndex,this.jobsMaxBusqueda);
			}
		}
	}

	onAgregarAlumnosJOBS(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(this.localidadesSucursal.length == 1){
			localidad = this.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			let alumnos: AlumnoInscripcionesPendientesJOBSProjection[] = this.dataSourceJOBS.data.filter(alumno => {
				return !!this.jobsSeleccionadas[alumno.id][alumno.grupoId];
			});
			for(let alumno of alumnos){
				alumno.localidadId = localidad?.id || null;
				alumno.idTmp = this.siguienteIdTmp++;
			}
			this._puntoVentaAbiertoService.agregarAlumnosJOBS(alumnos);
		}else {
			this.onSeleccionarLocalidadJOBS();
		}
	}

	onSeleccionarLocalidadJOBS(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.localidadesSucursal,
			onAceptar: this.onAgregarAlumnosJOBS.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}
	
	onVistaJOBSSEMES(precargarFiltro: boolean = false){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Venta';
		this.jobsSemsSeleccionadasCont = 0;
		this.jobsSemsSeleccionadasTodas = false;
		this.jobsSemsSeleccionadas = {};
		this.dataSourceJOBSSEMS.data = [];
		this.jobsSemsScrollIndex = 0;
		if(precargarFiltro){
			this.filtroControl.setValue(this.textoBusquedaPrecargar,{emitEvent: false});
		}
		this.textoBusquedaPrecargar = '';
		this.getAlumnosJOBSSEMS();
	}

	actualizarAlumnoJOBSSEMSEstatus(){
		this._puntoVentaAbiertoService.cargando = true;
		let seleccionadasCont: number = 0;
		let seleccionadasTodas: boolean = true;
		this.dataSourceJOBSSEMS.data.forEach(alumno => {
			if(!alumno.esCandidato){
				if(this.jobsSemsSeleccionadas[alumno.id][alumno.grupoId]){
					seleccionadasCont++;
				}else if(seleccionadasTodas){
					seleccionadasTodas = false;
				}
			}else{
				seleccionadasCont++;
			}
		});
		this.jobsSemsSeleccionadasCont = seleccionadasCont;
		this.jobsSemsSeleccionadasTodas = seleccionadasTodas;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	setAlumnosJOBSSEMSEstatus(seleccionar: boolean){
		this._puntoVentaAbiertoService.cargando = true;
		this.jobsSemsSeleccionadasTodas = seleccionar;
		this.dataSourceJOBSSEMS.data.forEach(alumno => {
			if(!alumno.esCandidato){
				this.jobsSemsSeleccionadas[alumno.id][alumno.grupoId] = seleccionar;
			}
		});
		if(seleccionar){
			this.jobsSemsSeleccionadasCont = this.dataSourceJOBSSEMS.data.length;
		}else{
			this.jobsSemsSeleccionadasCont = 0;
		}
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}
	
	getAlumnosJOBSSEMS(){
		this._puntoVentaAbiertoService.getAlumnosJOBSSEMS(this.filtroControl?.value || '',this.jobsSemsScrollIndex,this.jobsSemsMaxBusqueda);
	}

	private lowestPositionYAlumnosJOBSSEMS: number = 0;
	onScrollDownAlumnosJOBSSEMS(e){
		const scrollLocation = e.target.scrollTop; // how far user scrolled
		if(this.vistaNavegador == 'JOBS SEMS' && !this._puntoVentaAbiertoService.cargando && !this.jobsSemsScrollFinalizado && this.lowestPositionYAlumnosJOBSSEMS < scrollLocation){
			this.lowestPositionYAlumnosJOBSSEMS = scrollLocation;
			const tableViewHeight = e.target.offsetHeight // viewport: ~500px
			const tableScrollHeight = e.target.scrollHeight // length of all table
	
			// If the user has scrolled within 500px of the bottom, add more data
			const buffer = 500;
			const limit = tableScrollHeight - tableViewHeight - buffer;    
			if (scrollLocation > limit) {
				this._puntoVentaAbiertoService.cargando = true;
				this.jobsSemsScrollIndex += this.jobsSemsMaxBusqueda;
				this._puntoVentaAbiertoService.getAlumnosJOBSSEMS(this.filtroControl?.value || '',this.jobsSemsScrollIndex,this.jobsSemsMaxBusqueda);
			}
		}
	}

	onAgregarAlumnosJOBSSEMS(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(!localidad && this.localidadesSucursal.length == 1){
			localidad = this.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			let alumnos: AlumnoInscripcionesPendientesJOBSSEMSProjection[] = this.dataSourceJOBSSEMS.data.filter(alumno => {
				return !!this.jobsSemsSeleccionadas[alumno.id][alumno.grupoId];
			});
			for(let alumno of alumnos){
				alumno.localidadId = localidad?.id || null;
				alumno.idTmp = this.siguienteIdTmp++;
			}
			this._puntoVentaAbiertoService.agregarAlumnosJOBSSEMS(alumnos);
		}else {
			this.onCartaCompromisoJOBSSEMS();
		}
	}

	onCartaCompromisoJOBSSEMS(){
		let dialogData: PuntoVentaCartaCompromisoDialogData = {
			localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.localidadesSucursal,
			onAceptar: this.onAgregarAlumnosJOBSSEMS.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaCartaCompromisoDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onEditarAlumnoCandidato(alumno: AlumnoInscripcionesPendientesJOBSSEMSProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.guardarLocalStorage();
		this.guardarTextoBusqueda();
		this.router.navigate([`${this.rutaEditarAlumno}${this.hashid.encode(alumno.id)}`],{queryParams: {
			fichaVolver: 'PuntoVenta',
			vistaVolver: 'JOBS SEMS'
		}});
	}

	onVistaBecasSindicato(){
		this.becaSindicatoAplicarId = null;
		this.becaProulexAplicarId = null;
		this._puntoVentaAbiertoService.cargando = true;
		this.dataSourceBecasSindicato.data = [];
		this.becasSindicatoScrollController = null;
		this.vistaResumen = 'Venta';
		this.getBecasSindicato();
	}

	getBecasSindicato(){
		this._puntoVentaAbiertoService.getBecasSindicato(this.filtroControl?.value || '',this.becasSindicatoScrollController?.scrollIndex || 0,this.becasSindicatoScrollController?.maxBusqueda || 100)
	}

	onScrollDownBecasSindicato(e){
		if(this.vistaNavegador == 'Becas sindicato' && !this._puntoVentaAbiertoService.cargando){
			this.becasSindicatoScrollController.onScrollDown(e);
		}
	}

	onGetRegistrosBecasSindicato(){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getBecasSindicato(this.filtroControl?.value || '',this.becasSindicatoScrollController?.scrollIndex || 0,this.becasSindicatoScrollController?.maxBusqueda || 100);
	}

	onAplicarBecaSindicato(beca: BecaUDGListadoProjection){
		if(!beca.codigoProulex){
			this._puntoVentaAbiertoService.cargando = true;
			this.guardarLocalStorage();
			this.router.navigate([this.rutaNuevoAlumno],{queryParams: {
				fichaVolver: 'PuntoVenta',
				vistaVolver: 'Becas sindicato',
				becaSindicato: this.hashid.encode(beca.id)
			}});
		}else{
			this.becaSindicatoAplicarId = beca.id;
			this._puntoVentaAbiertoService.getDatosBecaSindicato(beca.alumnoId,beca.id);
		}
	}

	onVistaBecasSindicatoGrupos(alumno: AlumnoComboProjection, grupos: any[], gruposMultisede: any[], idioma: string, programa: string, modalidad: string){
		this.alumnoBecaSindicatoGrupos = alumno;
		this.gruposBecaSindicatoGrupos = grupos;
		this.gruposMultisedeBecaSindicatoGrupos = gruposMultisede;
		this.tituloBecasSindicatoGrupos = `Inicio / ${idioma} / ${programa} / ${modalidad}`
		this.vistaNavegador = 'Becas sindicato grupos';
	}

	onGrupoBecaSindicato(grupo: ProgramaGrupoCardProjection, tipoGrupoId: number){
		if(grupo != null && !grupo.permiteInscripcion){
			this._matSnackBar.open('El grupo tiene cupo lleno', 'OK', {
				duration: 5000,
			});
			return;
		}
		this._puntoVentaAbiertoService.cargando = true;
		this.grupoBecaSindicatoAplicar = grupo;
		this.tipoGrupoIdBecaSindicatoAplicar = tipoGrupoId;
		this.onAceptarGrupoBecaSindicato();
	}

	onAceptarGrupoBecaSindicato(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(this.localidadesSucursal.length == 1){
			localidad = this.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			this._puntoVentaAbiertoService.aplicarBecaSindicato(this.alumnoBecaSindicatoGrupos.id,this.becaSindicatoAplicarId || this.becaProulexAplicarId,this.grupoBecaSindicatoAplicar?.id || null,this.tipoGrupoIdBecaSindicatoAplicar || null,this.getListaPreciosId(),localidad?.id || null,this.siguienteIdTmp++);
		}else {
			this.onSeleccionarLocalidadBecasSindicato();
		}
	}

	onSeleccionarLocalidadBecasSindicato(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.localidadesSucursal,
			onAceptar: this.onAceptarGrupoBecaSindicato.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	clearQueryParams(){
		this.router.navigate(['.'], { relativeTo: this.route });
	}

	getListaPreciosId(): number{
		return this.listaPreciosClienteId != null ? this.listaPreciosClienteId : this.listaPreciosSucursalId;
	}

	onCancelar(){
		this._puntoVentaAbiertoService.cargando = true;
		this.dataSourceResumen.data = [];
		this.alumnosRepetidosController.limpiar();
		this.onVistaInicio();
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	onCobroExitoso(codigosOV: string[]){
		let dialogData: PuntoVentaCobroExitosoDialogData = {
			codigosOV,
			onCerrar: this.onCerrarCobroExitoso.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaCobroExitosoDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onCerrarCobroExitoso(codigosOV: string[]){
		this._puntoVentaAbiertoService.imprimirNotaVenta(this.ordenesVentaImprimirIds);
	}

	onCerrarTurno(){
		let dialogData: PuntoVentaCerrarTurnoDialogData = {
			onAceptar: this.onAceptarCerrarTurno.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaCerrarTurnoDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarCerrarTurno(){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getExcelConFiltros("/api/v1/cortes/resumen/xls", {usuarioId: this.usuarioActual.id}).then(() => {
			this._puntoVentaAbiertoService.aplicarCierreTurno();
		});
	}

	onVistaHistorial(){
		this.fechaHistorialControl.setValue(moment());
		this.dataSourceHistorial.data = [];
		this.historialScrollController = null;
		this.ordenVentaHistorial = null;
		this.dataSourceResumenOVD.data = [];
		this.vistaNavegador = 'Historial';
		this.getHistorial();
	}

	getHistorial(){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getHistorial(this.fechaHistorialControl.value,this.filtroControl?.value || '',this.historialScrollController?.scrollIndex || 0,this.historialScrollController?.maxBusqueda || 100);
	}

	onScrollDownHistorial(e){
		if(this.vistaNavegador == 'Historial' && !this._puntoVentaAbiertoService.cargando){
			this.historialScrollController.onScrollDown(e);
		}
	}

	onVerOrdenVentaHistorial(ordenVenta: OrdenVentaHistorialPVProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.vistaResumen = 'Historial';
		this._puntoVentaAbiertoService.getHistorialResumen(ordenVenta.id);
	}

	onImprimirOVResumen(){
		this._puntoVentaAbiertoService.imprimirNotaVenta([this.ordenVentaHistorial.id]);
	}

	limpiarCardsSeleccionados(){
		this.detalleSeleccionado = null;
		this.idiomaSeleccionado = null;
		this.programaSeleccionado = null;
		this.paModalidadSeleccionado = null;
		this.tipoGrupoSeleccionado = null;
		this.nivelSeleccionado = null;
		this.programaGrupoSeleccionado = null;
		this.familiaSeleccionado = null;
		this.categoriaSeleccionado = null;
		this.subcategoriaSeleccionado = null;
		this.articuloSeleccionado = null;
		this.certificacionSeleccionada = null;
	}

	onDescuentoUsuario(ovDetalleTmpId?: number){
		if(!!ovDetalleTmpId){
			let detalle = this.dataSourceResumen.data.find(detalle => {
				return detalle.idTmp == ovDetalleTmpId;
			});

			if(!!detalle?.noAplicaDescuentos){
				return;
			} else if(!!detalle?.becaUDGId){
				this._matSnackBar.open('No es posible cambiar el descuento de una inscripción con beca', 'OK', {
					duration: 5000,
				});
				return;
			}
		}else{
			let descuentoAplicable: boolean = false;
			for(let detalle of this.dataSourceResumen.data){
				if(!detalle.descuentoSinConvertir && !detalle.noAplicaDescuentos){
					descuentoAplicable = true;
					break;
				}
			}
	
			if(!descuentoAplicable){
				this._matSnackBar.open('Selecciona artículos o realiza una inscripción antes de aplicar un descuento', 'OK', {
					duration: 5000,
				});
				return;
			}
		}

		let dialogData: PuntoVentaDescuentoUsuarioDialogData = {
			ovDetalleTmpId,
			onAceptar: this.onAceptarDescuentoUsuarioDialog.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaDescuentoUsuarioDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarDescuentoUsuarioDialog(montoDescuento: number, ovDetalleTmpId?: number){
		if(!!ovDetalleTmpId){
			let detalle = this.dataSourceResumen.data.find(detalle => {
				return detalle.idTmp == ovDetalleTmpId;
			});
			if(!!detalle){
				let montosSinDescuento = this._puntoVentaAbiertoService.getMontosCalculados(detalle.cantidad,detalle.precioSinConvertir,0,!!detalle.ivaExento ? 0 : detalle.iva,detalle.ieps,detalle.iepsCuotaFija);
				if(montosSinDescuento.total <= montoDescuento){
					detalle.descuentoSinConvertir = Number((detalle.precioSinConvertir * detalle.cantidad).toFixed(6));
					detalle.montoIva = 0;
					detalle.montoIeps = 0;
					detalle.montoSubtotal = 0;
					detalle.total = 0;
				}else{
					let porcentajeDescuento: number = montoDescuento * 100 / montosSinDescuento.total;
					detalle.descuentoSinConvertir = Number(((Number((detalle.precioSinConvertir * detalle.cantidad).toFixed(6)) * porcentajeDescuento)/100).toFixed(6));
					let montos = this._puntoVentaAbiertoService.getMontosCalculados(detalle.cantidad,detalle.precioSinConvertir,detalle.descuentoSinConvertir,!!detalle.ivaExento ? 0 : detalle.iva,detalle.ieps,detalle.iepsCuotaFija);
					detalle.montoIva = montos.iva;
					detalle.montoIeps = montos.ieps;
					detalle.montoSubtotal = montos.subtotal;
					detalle.total = montos.total;
				}
			}
		}else{
			for(let detalle of this.dataSourceResumen.data){
				if(!detalle.descuentoSinConvertir && !detalle.noAplicaDescuentos){
					let montoRestar: number = 0;
					if(detalle.total <= montoDescuento){
						montoRestar = detalle.total;
						detalle.descuentoSinConvertir = Number((detalle.precioSinConvertir * detalle.cantidad).toFixed(6));
						detalle.montoIva = 0;
						detalle.montoIeps = 0;
						detalle.montoSubtotal = 0;
						detalle.total = 0;
					}else{
						montoRestar = montoDescuento;
						let porcentajeDescuento: number = montoDescuento * 100 / detalle.total;
						detalle.descuentoSinConvertir = Number(((Number((detalle.precioSinConvertir * detalle.cantidad).toFixed(6)) * porcentajeDescuento)/100).toFixed(6));
						let montos = this._puntoVentaAbiertoService.getMontosCalculados(detalle.cantidad,detalle.precioSinConvertir,detalle.descuentoSinConvertir,!!detalle.ivaExento ? 0 : detalle.iva,detalle.ieps,detalle.iepsCuotaFija);
						detalle.montoIva = montos.iva;
						detalle.montoIeps = montos.ieps;
						detalle.montoSubtotal = montos.subtotal;
						detalle.total = montos.total;
					}
					montoDescuento -= montoRestar;
				}
				if(montoDescuento <= 0){
					break;
				}
			}
		}
		this.dataSourceResumen.data = [].concat(this.dataSourceResumen.data);
	}

	onVistaPCP(precargarFiltro: boolean = false){
		this.vistaResumen = 'Venta';
		this.precargarFiltro = precargarFiltro;
		this.vistaNavegador = 'PCP';
	}

	onVistaBecasProulex(precargarFiltro: boolean = false){
		this.becaSindicatoAplicarId = null;
		this.becaProulexAplicarId = null;
		this.vistaResumen = 'Venta';
		this.precargarFiltro = precargarFiltro;
		this.vistaNavegador = 'Becas proulex';
	}

	onVistaBecasProulexGrupos(alumno: AlumnoComboProjection, grupos: any[], gruposMultisede: any[], idioma: string, programa: string, modalidad: string){
		this.alumnoBecaSindicatoGrupos = alumno;
		this.gruposBecaSindicatoGrupos = grupos;
		this.gruposMultisedeBecaSindicatoGrupos = gruposMultisede;
		this.tituloBecasSindicatoGrupos = `Inicio / ${idioma} / ${programa} / ${modalidad}`
		this.vistaNavegador = 'Becas proulex grupos';
	}

	onGetRegistrosAlumnosSinGrupo(){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getAlumnosSinGrupo(this._puntoVentaAbiertoService.getSucursalPuntoVentaId(),this.filtroControl?.value || '',this.alumnosSinGrupoScrollController?.scrollIndex || 0,this.alumnosSinGrupoScrollController?.maxBusqueda || 100);
	}

	onScrollDownAlumnosSinGrupo(e){
		if(this.vistaNavegador == 'Alumnos sin grupo' && !this._puntoVentaAbiertoService.cargando){
			this.alumnosSinGrupoScrollController.onScrollDown(e);
		}
	}

	onAgregarReinscripcion(reinscripcion: AlumnoReinscripcionProjection){
		this.reinscripcionAgregarTmp = reinscripcion;
		this.onAceptarReinscripciones();
	}

	onGrupoReinscripcion(grupo: ProgramaGrupoCardProjection, articuloId?: number, tipoGrupoId?: number){
		if(!!grupo && !grupo.permiteInscripcion){
			this._matSnackBar.open('El grupo tiene cupo lleno', 'OK', {
				duration: 5000,
			});
			return;
		}
		
		if(!!grupo){
			this.programaGrupoSeleccionado = grupo;
		}else{
			this.programaGrupoSeleccionado = {
				articuloId
			};
			this.tipoGrupoIdReinscripcion = tipoGrupoId;
		}

		this.onAceptarGrupoReinscripcion();
	}

	onAceptarGrupoReinscripcion(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(this.localidadesSucursal.length == 1){
			localidad = this.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			if(!!this.reinscripcionAgregarTmp.aprobado){
				let detallAprobado: {
					id: number,
					grupoId?: number,
					localidadId?: number,
					idTmp: number,
					becaId: number,
					cambioGrupo: boolean,
					nuevoGrupoId?: number,
					nuevaModalidadId?: number,
					nuevoHorarioId?: number,
					nuevoNivel?: number,
					comentario?: string,
					listaPreciosId: number
				} = {
					id: this.reinscripcionAgregarTmp.id,
					grupoId: this.reinscripcionAgregarTmp.grupoReinscripcionId,
					localidadId: this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || localidad?.id,
					idTmp: this.siguienteIdTmp++,
					becaId: this.reinscripcionAgregarTmp.becaId,
					cambioGrupo: true,
					nuevoGrupoId: this.programaGrupoSeleccionado.id,
					nuevaModalidadId: this.reinscripcionAgregarTmp.jsonEdicionInscripcion.modalidadId,
					nuevoHorarioId: this.reinscripcionAgregarTmp.jsonEdicionInscripcion.horarioId,
					nuevoNivel: this.reinscripcionAgregarTmp.jsonEdicionInscripcion.nivel,
					comentario: this.reinscripcionAgregarTmp.jsonEdicionInscripcion.comentario,
					listaPreciosId: this.getListaPreciosId()
				};
				this._puntoVentaAbiertoService.agregarAlumnoAprobadoReinscripciones(detallAprobado);
			}else{
				if(!!this.programaGrupoSeleccionado?.id){
					this._puntoVentaAbiertoService.agregarAlumnoReprobadoReinscripcionesConGrupo(
						this.reinscripcionAgregarTmp.id,
						this.programaGrupoSeleccionado.id,
						this.programaGrupoSeleccionado.articuloId,
						this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || localidad.id,
						this.getListaPreciosId(),
						this.reinscripcionAgregarTmp.comentario,
						this.siguienteIdTmp++
					);
				}else{
					this._puntoVentaAbiertoService.agregarAlumnoReprobadoReinscripcionesSinGrupo(
						this.reinscripcionAgregarTmp.id,
						this.reinscripcionAgregarTmp.programaId,
						this.reinscripcionAgregarTmp.idiomaId,
						this.reinscripcionAgregarTmp?.nivelReasignado || this.reinscripcionAgregarTmp?.nivelReinscripcion,
						this.reinscripcionAgregarTmp.modalidadId,
						this.tipoGrupoIdReinscripcion,
						this.reinscripcionAgregarTmp.horarioId,
						this.programaGrupoSeleccionado.articuloId,
						this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || localidad.id,
						this.getListaPreciosId(),
						this.reinscripcionAgregarTmp.comentario,
						this.siguienteIdTmp++
					);
				}
			}
		}else {
			this.onSeleccionarLocalidadGrupoReinscripcion();
		}
	}

	onSeleccionarLocalidadGrupoReinscripcion(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.localidadesSucursal,
			onAceptar: this.onAceptarGrupoReinscripcion.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onCardExtraInicio(card: CardExtra){
		this._puntoVentaAbiertoService.cargando = true;
		this.cardExtraInicioSeleccionada = card;
		if(this.cardExtraInicioSeleccionada.id == 'IN_COMPANY'){
			this.onCardExtraInCompany();
		}
		if(this.cardExtraInicioSeleccionada.id == 'ACADEMY'){
			this.onCardExtraAcademy()
		}
	}
	
	onCardExtraInCompany(){
		this.vistaNavegador = 'Clientes In Company';
	}

	onCardExtraAcademy(){
		this._puntoVentaAbiertoService.cargando = false;
		this.vistaNavegador = 'Academy';
	}

	onVistaValesCertificacion(precargarFiltro: boolean = false){
		this.becaSindicatoAplicarId = null;
		this.becaProulexAplicarId = null;
		this.vistaResumen = 'Venta';
		this.precargarFiltro = precargarFiltro;
		this.vistaNavegador = 'Vales de certificacion';
	}

}