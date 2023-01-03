import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { LocalidadComboProjection } from "@app/main/modelos/localidad";
import { PuntoVentaSeleccionarLocalidadDialogComponent, PuntoVentaSeleccionarLocalidadDialogData } from "../../dialogs/seleccionar-localidad/seleccionar-localidad.dialog";
import { AlumnoInscripcionPendientePCPProjection } from "@app/main/modelos/alumno";
import { InfiniteScrollController, OrdenVentaDetalleDatasource } from "../../punto-venta-abierto.clases";

@Component({
    selector: 'punto-venta-pcp',
    templateUrl: './pcp.component.html',
    styleUrls: ['./pcp.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaPCPComponent {

	// @Inputs
	@Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

	// FormControls
	filtroControl: FormControl = new FormControl('',[]);

	// Tabla alumnos
	@ViewChild("tablaAlumnos") tablaAlumnos: any;
	dataSourceAlumnos: MatTableDataSource<AlumnoInscripcionPendientePCPProjection> = new MatTableDataSource([]);
	displayedColumnsAlumnos: string[] = [
		'codigo',
		'folio',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'dependencia',
		'curso',
		'grupo',
		'check',
		'agregar'
	];

	// Misc public
	alumnosSeleccionados: {[alumnoId:string]: {[grupoId:string]: boolean}} = {};
	alumnosSeleccionadosCont: number = 0;
	alumnosSeleccionadosTodos: boolean = false;
	buscandoAlumnos: boolean = false;

	// Misc private
	private _unsubscribeAll: Subject < any > ;
	private lowestPositionYAlumnos: number = 0;
	private alumnosScrollController: InfiniteScrollController;
	private rutaEditarAlumno = '/app/control-escolar/alumnos/ver/';

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

		this.alumnosScrollController = null;
		this.filtroControl.setValue('');
		this.alumnosSeleccionadosTodos = false;
		this.alumnosSeleccionadosCont = 0;
		this.alumnosSeleccionadosTodos = false;
		this.alumnosSeleccionados = {};

		// Set the private defaults
		this._unsubscribeAll = new Subject();
    }

	ngOnInit(): void {

		// Subscribe to update alumnos on changes
		this._puntoVentaAbiertoService.onAlumnosPCPChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				this.buscandoAlumnos = false;
				if(datos){
					this._puntoVentaAbiertoService.onAlumnosPCPChanged.next(null);
					this.alumnosScrollController?.scrollToStart();
					this.alumnosScrollController?.registrosRecuperados(datos.alumnos?.length || 0);
					this.dataSourceAlumnos.data = this.dataSourceAlumnos.data.concat(datos.alumnos);
					this.dataSourceAlumnos.data.forEach(alumno => {
						if(!this.alumnosSeleccionados[alumno.id]){
							this.alumnosSeleccionados[alumno.id] = {};
						}
						this.alumnosSeleccionados[alumno.id][alumno.grupoId] = !!this.alumnosSeleccionados[alumno.id][alumno.grupoId];
					});
					if(!this.alumnosScrollController){
						setTimeout(() => {
							this.alumnosScrollController = new InfiniteScrollController(this.tablaAlumnos._elementRef,this.onGetRegistrosAlumnos.bind(this));
						});
					}
				}
			});

		// Subscribe to update agregarAlumnosPCP on changes
		this._puntoVentaAbiertoService.onAgregarAlumnosPCPChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onAgregarAlumnosPCPChanged.next(null);
					let nuevosDetalles: OrdenVentaDetalleDatasource[] = datos.ordenVentaDetalles;
					nuevosDetalles = nuevosDetalles.filter(detalle => {
						// Si el detalle no tiene alumno significa que no es una inscripción
						if(!detalle.alumnoId){
							return true;
						}

						// Si el detalle tiene grupo significa que es una inscripción con grupo
						if(detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma se omite el detalle
							if(this.componentePV.alumnosRepetidosController.alumnoYaInscrito(detalle.alumnoId,detalle.idiomaId)){
								return false;
							}
							this.componentePV.alumnosRepetidosController.agregar(detalle.alumnoId,detalle.idiomaId);
						}

						// Si el detalle no ttiene grupo significa que puede ser una inscripción sin grupo (también puede ser una venta de examen, pero eso ya está validado en el controlador de alumnos repetidos)
						if(!detalle.grupoId){
							// Si el alumno ya cuenta con una inscripción al idioma, programa y nivel se omite el detalle
							if(this.componentePV.alumnosRepetidosController.alumnoYaInscritoSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel)){
								return false;
							}
							this.componentePV.alumnosRepetidosController.agregarSinGrupo(detalle.alumnoId,detalle.idiomaId,detalle.programaId,detalle.nivel);
						}
						return true;
					});
					this.componentePV.dataSourceResumen.data = this.componentePV.dataSourceResumen.data.concat(nuevosDetalles);
					this.onVistaAtras();
				}
			});

		// Subscribe to update filtroControl.valueChanges
		this.filtroControl.valueChanges
			.pipe(
				tap(() => this.buscandoAlumnos = true),
				takeUntil(this._unsubscribeAll),
				debounceTime(1000)
			).subscribe(value => {
				this._puntoVentaAbiertoService.cargando = true;
				this.alumnosSeleccionados = {};
				this.alumnosSeleccionadosCont = 0;
				this.alumnosSeleccionadosTodos = false;
				this.dataSourceAlumnos.data = [];
				this.alumnosScrollController.scrollIndex = 0;
				this.getAlumnos();
			});

		if(this.componentePV.precargarFiltro){
			this.componentePV.precargarFiltro = false;
			this.filtroControl.setValue(this.componentePV.textoBusquedaPrecargar,{emitEvent: false});
		}
		this.componentePV.textoBusquedaPrecargar = '';
		this.getAlumnos();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	
	onVistaAtras(){
		this.dataSourceAlumnos.data = [];
		this.alumnosScrollController.scrollIndex = 0;
		this.alumnosSeleccionadosTodos = false;
		this.alumnosSeleccionadosCont = 0;
		this.alumnosSeleccionadosTodos = false;
		this.alumnosSeleccionados = {};
		
		this.componentePV.vistaNavegador = 'Idiomas';
	}

	onScrollDownAlumnos(e){
		if(!this._puntoVentaAbiertoService.cargando){
			this.alumnosScrollController.onScrollDown(e);
		}
	}

	getAlumnos(){
		this._puntoVentaAbiertoService.getAlumnosPCP(this.filtroControl?.value || '',this.alumnosScrollController?.scrollIndex || 0,this.alumnosScrollController?.maxBusqueda || 100)
	}

	onGetRegistrosAlumnos(){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getAlumnosPCP(this.filtroControl?.value || '',this.alumnosScrollController?.scrollIndex || 0,this.alumnosScrollController?.maxBusqueda || 100);
	}

	setAlumnosEstatus(seleccionar: boolean){
		this._puntoVentaAbiertoService.cargando = true;
		this.alumnosSeleccionadosTodos = seleccionar;
		this.dataSourceAlumnos.data.forEach(alumno => {
			if(!alumno.esCandidato){
				this.alumnosSeleccionados[alumno.id][alumno.grupoId] = seleccionar;
			}
		});
		if(seleccionar){
			this.alumnosSeleccionadosCont = this.dataSourceAlumnos.data.length;
		}else{
			this.alumnosSeleccionadosCont = 0;
		}
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	actualizarAlumnoEstatus(){
		this._puntoVentaAbiertoService.cargando = true;
		let seleccionadosCont: number = 0;
		let seleccionadosTodos: boolean = true;
		this.dataSourceAlumnos.data.forEach(alumno => {
			if(!alumno.esCandidato){
				if(this.alumnosSeleccionados[alumno.id][alumno.grupoId]){
					seleccionadosCont++;
				}else if(seleccionadosTodos){
					seleccionadosTodos = false;
				}
			}else{
				seleccionadosCont++;
			}
		});
		this.alumnosSeleccionadosCont = seleccionadosCont;
		this.alumnosSeleccionadosTodos = seleccionadosTodos;
		setTimeout(() => {
			this._puntoVentaAbiertoService.cargando = false;
		});
	}

	onEditarAlumnoCandidato(alumno: AlumnoInscripcionPendientePCPProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.componentePV.guardarLocalStorage();
		this.componentePV.guardarTextoBusqueda();
		this.router.navigate([`${this.rutaEditarAlumno}${this.hashid.encode(alumno.id)}`],{queryParams: {
			fichaVolver: 'PuntoVenta',
			vistaVolver: 'PCP'
		}});
	}

	onAgregarAlumnos(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(this.componentePV.localidadesSucursal.length == 1){
			localidad = this.componentePV.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			let alumnos: AlumnoInscripcionPendientePCPProjection[] = this.dataSourceAlumnos.data.filter(alumno => {
				return !!this.alumnosSeleccionados[alumno.id][alumno.grupoId];
			});
			for(let alumno of alumnos){
				alumno.localidadId = localidad?.id || null;
				alumno.idTmp = this.componentePV.siguienteIdTmp++;
			}
			this._puntoVentaAbiertoService.agregarAlumnosPCP(alumnos);
		}else {
			this.onSeleccionarLocalidad();
		}
	}

	onSeleccionarLocalidad(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.componentePV.localidadesSucursal,
			onAceptar: this.onAgregarAlumnos.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

}