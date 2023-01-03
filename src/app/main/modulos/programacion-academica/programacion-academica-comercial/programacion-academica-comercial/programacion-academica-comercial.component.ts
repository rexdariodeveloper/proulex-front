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
import { ProgramacionAcademicaComercialService } from './programacion-academica-comercial.service';
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
import { ProgramacionAcademicaComercial, ProgramacionAcademicaComercialEditarProjection } from '@app/main/modelos/programacion-academica-comercial';
import { PACicloFechaProjection } from '@app/main/modelos/paciclo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ProgramacionDialogComponent, ProgramacionDialogData } from './dialogs/programacion/programacion.dialog';
import { PAModalidadComboProjection, PAModalidadDiasProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaCalcularDiasProjection, ProgramaComboProjection } from '@app/main/modelos/programa';
import { Moment } from 'moment';
import { EmpresaDiaNoLaboralEditarProjection } from '@models/empresa-dia-no-laboral';
import { EmpresaDiaNoLaboralFijoEditarProjection } from '@models/empresa-dia-no-laboral-fijo';
import * as moment from 'moment';
import { isDefined } from '@angular/compiler/src/util';
import { ProgramacionAcademicaComercialDetalleEditarProjection } from '@app/main/modelos/programacion-academica-comercial-detalle';
import { MatTableDataSource } from '@angular/material/table';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { MatTabGroup } from '@angular/material/tabs';
import { ProgramacionEditarDetalleDialogComponent, ProgramacionEditarDetalleDialogData } from './dialogs/editar-detalle/editar-detalle.dialog';
import { ThrowStmt } from '@angular/compiler';
import CalendarDataSourceElement from 'js-year-calendar/dist/interfaces/CalendarDataSourceElement';
import { ProgramacionEditarDetalleCalendarioDialogComponent, ProgramacionEditarDetalleCalendarioDialogData } from './dialogs/editar-detalle-calendario/editar-detalle-calendario.dialog';

class DiaNoLaboral {
	fecha: Moment;
	diaSemana: number;
	diaMes: number;
	mes: number;
	anio: number;
}

class ProgramacionAcademicaComercialDetalleResumen {
	idioma: ControlMaestroMultipleComboProjection;
	paModalidad: PAModalidadDiasProjection;
	programas: ProgramaCalcularDiasProjection[];
	programasStr: string;
	numeroClases: number;
	fechaInicio: string;
	fechaInicioMoment: Moment;
	comentarios: string;
}

@Component({
    selector: 'programacion-academica-comercial',
    templateUrl: './programacion-academica-comercial.component.html',
    styleUrls: ['./programacion-academica-comercial.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ProgramacionAcademicaComercialComponent {

	@ViewChild('idiomasMatTabGroup') private idiomasMatTabGroup: MatTabGroup;

	pageType: string = 'nuevo';

	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;

	programacionAcademicaComercial: ProgramacionAcademicaComercialEditarProjection;
	form: FormGroup;

	paCicloControl: FormControl = new FormControl();
	idiomaControl: FormControl = new FormControl();
	fechaInicioControl: FormControl = new FormControl();
	fechaFinControl: FormControl = new FormControl();

	paCiclos: PACicloFechaProjection[] = [];
	idiomas: ControlMaestroMultipleComboProjection[] = [];
	paModalidades: PAModalidadDiasProjection[] = [];
	programas: ProgramaComboProjection[] = [];
	diasNoLaborales: EmpresaDiaNoLaboralEditarProjection[] = [];
	diasNoLaboralesFijos: EmpresaDiaNoLaboralFijoEditarProjection[] = [];
	diasNoLaboralesCiclo: DiaNoLaboral[] = [];

	// FormControls de filtros
	paModalidadFiltrarControlMapIdioma: {[idiomaId:string]: FormControl} = {}
	programaFiltrarControlMapIdioma: {[idiomaId:string]: FormControl} = {}
	fechaInicioFiltrarControlMapIdioma: {[idiomaId:string]: FormControl} = {}

	detallesMapIdioma: {[idiomaId:string]: {[paModalidadId:string]: ProgramacionAcademicaComercialDetalleEditarProjection[]}} = {}

	dataSourceResumen: {[idiomaId:string]: MatTableDataSource<ProgramacionAcademicaComercialDetalleResumen>} = {};
	displayedColumnsResumen: string[] = [
		'modalidad',
		'programas',
		'numeroClases',
		'fechaInicio',
		'acciones'
	];
	dataSourceDetalles: {[idiomaId:string]: MatTableDataSource<ProgramacionAcademicaComercialDetalleEditarProjection>} = {};
	displayedColumnsDetalles: string[] = [
		'modalidad',
		'programas',
		'fechaInicio',
		'fechaFin',
		'acciones'
	];

	fechaInicioCiclo: Date = null;
	fechaFinCiclo: Date = null;
	datasourceCalendarioMapIdioma: {[idiomaId:string]: CalendarDataSourceElement[]} = {};

	fichaInicializada: boolean = false;

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */
	rolControl: FormControl;

	fechaActual: Date = new Date();

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;


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
		public _programacionAcademicaComercialService: ProgramacionAcademicaComercialService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the default
		this.programacionAcademicaComercial = new ProgramacionAcademicaComercialEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.programacionAcademicaComercial = new ProgramacionAcademicaComercialEditarProjection();
			}

			this.config = {
				rutaAtras: "/app/programacion-academica/programacion-academica-comercial",
				rutaBorrar: "/api/v1/programacion-academica-comercial/delete/",
				icono: "calendar_today"
			}

		});

		// Subscribe to update programacionAcademicaComercial on changes
		this._programacionAcademicaComercialService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				let fechaInicioCabecera: string = null;
				let fechaFinCabecera: string = null;

				if (datos && datos.programacionAcademicaComercial) {
					this.programacionAcademicaComercial = datos.programacionAcademicaComercial;
					this.titulo = this.programacionAcademicaComercial.codigo;

					this.detallesMapIdioma = {};

					for(let detalle of this.programacionAcademicaComercial.detalles){
						if(!this.detallesMapIdioma[detalle.idioma.id]){
							this.detallesMapIdioma[detalle.idioma.id] = this.detallesMapIdioma[detalle.idioma.id] || {};
							this.dataSourceResumen[detalle.idioma.id] = this.dataSourceResumen[detalle.idioma.id] || new MatTableDataSource([]);
							this.initIdioma(detalle.idioma);
						}
						if(!this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id]){
							this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id] = [];
						}
						this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id] = this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id].concat(detalle);
					}
					for(let idiomaId in this.detallesMapIdioma){
						for(let paModalidadId in this.detallesMapIdioma[idiomaId]){
							let idTmp: number = 0;
							for(let detalle of this.detallesMapIdioma[idiomaId][paModalidadId]){
								detalle.idTmp = ++idTmp;
								detalle.programasStr = detalle.programas.map(programa => programa.nombre).join(', ');
								this.agregarDetalle(detalle);
							}
						}
					}
					for(let idiomaId in this.detallesMapIdioma){
						for(let paModalidadId in this.detallesMapIdioma[idiomaId]){
							let idioma: ControlMaestroMultipleComboProjection;
							let paModalidad: PAModalidadDiasProjection;
							let programas: ProgramaCalcularDiasProjection[];
							let numeroClases: number;
							let comentarios: string;
							let fechaInicio: string = '999999999999999999999999999';
							this.detallesMapIdioma[idiomaId][paModalidadId].sort((detalle1,detalle2) => {
								return detalle1.fechaInicio > detalle2.fechaInicio ? 1 : -1;
							});
							this.detallesMapIdioma[idiomaId][paModalidadId].forEach(detalle => {
								idioma = detalle.idioma;
								paModalidad = detalle.paModalidad;
								programas = detalle.programas;
								numeroClases = detalle.numeroClases;
								comentarios = detalle.comentarios;
								if(detalle.fechaInicio < fechaInicio){
									fechaInicio = detalle.fechaInicio;
								}
								if(!fechaInicioCabecera || detalle.fechaInicio < fechaInicioCabecera){
									fechaInicioCabecera = detalle.fechaInicio;
								}
								if(!fechaFinCabecera || detalle.fechaFin > fechaFinCabecera){
									fechaFinCabecera = detalle.fechaFin;
								}
							});
							this.dataSourceDetalles[idiomaId].data = this.dataSourceDetalles[idiomaId].data.concat(this.detallesMapIdioma[idiomaId][paModalidadId]);
							
							let programasStr: string = programas.map(programa => programa.nombre).join(', ');
							this.dataSourceResumen[idiomaId].data = this.dataSourceResumen[idioma.id].data.concat({
								idioma,
								paModalidad,
								programas,
								programasStr,
								numeroClases,
								fechaInicio: moment(fechaInicio).format('MMM D, YYYY'),
								fechaInicioMoment: moment(fechaInicio),
								comentarios
							});
						}
					}
				} else {
					this.programacionAcademicaComercial = new ProgramacionAcademicaComercialEditarProjection();
				}

				this.paCiclos = datos.paCiclos;
				this.idiomas = datos.idiomas;
				this.paModalidades = datos.paModalidades;
				this.programas = datos.programas;
				this.diasNoLaborales = datos.diasNoLaborales;
				this.diasNoLaboralesFijos = datos.diasNoLaboralesFijos;

				let fechaInicioMoment: Moment = null;
				if(!!fechaInicioCabecera){
					fechaInicioMoment = moment(fechaInicioCabecera);
				}
				let fechaFinMoment: Moment = null;
				if(!!fechaInicioCabecera){
					fechaFinMoment = moment(fechaFinCabecera);
				}

				this.form = this.createProgramacionAcademicaComercialForm(fechaInicioMoment,fechaFinMoment);

				if (this.pageType == 'ver') {
					this.form.disable();
				} else {
					this.form.enable();
				}

			});

	}

	createProgramacionAcademicaComercialForm(fechaInicio: Moment, fechaFin: Moment): FormGroup {

		let idiomasValue: ControlMaestroMultipleComboProjection[] = [];
		let idiomasAgragadosMap: {[idiomaId:string]:boolean} = {};
		if(!!this.programacionAcademicaComercial?.detalles?.length){
			for(let detalle of this.programacionAcademicaComercial.detalles){
				if(!idiomasAgragadosMap[detalle.idioma.id]){
					idiomasAgragadosMap[detalle.idioma.id] = true;
					idiomasValue = idiomasValue.concat(detalle.idioma);
				}
			}
		}

		// Inicializar FormControls
		this.fechaInicioControl = new FormControl(fechaInicio,[]);
		this.fechaFinControl = new FormControl(fechaFin,[]);
		this.paCicloControl = new FormControl(this.programacionAcademicaComercial.paCiclo, [Validators.required]);
		if(this.paCicloControl.value){
			this.fechaInicioCiclo = new Date(this.paCicloControl.value.fechaInicio);
			this.fechaFinCiclo = new Date(this.paCicloControl.value.fechaFin);
		}
		this.idiomaControl = new FormControl(idiomasValue);
		
		// Subscripciones FormControl.valueChanges
		this.paCicloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: PACicloFechaProjection) => {
			this.limpiarOnCiclo();
			if(isDefined(value)){
				let fechaInicioCiclo: Moment = moment(value.fechaInicio);
				let fechaFinCiclo: Moment = moment(value.fechaFin);
				fechaFinCiclo.add(1,'year');
				this.diasNoLaboralesCiclo = this.diasNoLaborales.filter(diaNoLaboral => {
					let fecha: Moment = moment(diaNoLaboral.fecha);
					return fecha >= fechaInicioCiclo && fecha <= fechaFinCiclo;
				}).map(diaNoLaboral => {
					let fecha: Moment = moment(diaNoLaboral.fecha);
					return {
						fecha: fecha,
						diaSemana: fecha.day(),
						diaMes: fecha.date(),
						mes: fecha.month(),
						anio: fecha.year()
					};
				});
				let anio: number = fechaInicioCiclo.year();
				while(anio <= (fechaFinCiclo.year())){
					this.diasNoLaboralesCiclo = this.diasNoLaboralesCiclo.concat(
						this.diasNoLaboralesFijos.filter(diaNoLaboral => {
							let fecha: Moment = moment(`${anio}-${diaNoLaboral.mes}-${diaNoLaboral.dia}`,'YYYY-MM-DD');
							return fecha >= fechaInicioCiclo && fecha <= fechaFinCiclo;
						}).map(diaNoLaboral => {
							let fecha: Moment = moment(`${anio}-${diaNoLaboral.mes}-${diaNoLaboral.dia}`,'YYYY-MM-DD');
							return {
								fecha,
								diaSemana: fecha.day(),
								diaMes: fecha.date(),
								mes: fecha.month(),
								anio: fecha.year()
							};
						})
					);
					anio++;
				};
				this.diasNoLaboralesCiclo.sort((dia1,dia2) => {
					return Number(dia1.fecha) - Number(dia2.fecha);
				});
				this.fechaInicioCiclo = new Date(value.fechaInicio);
				this.fechaFinCiclo = new Date(value.fechaFin);
			}else{
				this.diasNoLaboralesCiclo = [];
				this.idiomaControl.setValue([]);
				this.fechaInicioCiclo = null;
				this.fechaFinCiclo = null;
			}
		});
		this.idiomaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: ControlMaestroMultipleComboProjection[]) => {
			if(isDefined(value)){
				for(let idioma of value){
					this.detallesMapIdioma[idioma.id] = this.detallesMapIdioma[idioma.id] || {};
					this.dataSourceResumen[idioma.id] = this.dataSourceResumen[idioma.id] || new MatTableDataSource([]);
					if(!isDefined(this.dataSourceDetalles[idioma.id])){
						this.initIdioma(idioma);
					}
				}
			}
		});

		// Inicializar Form
		let form = this._formBuilder.group({
			id: [this.programacionAcademicaComercial.id],
			nombre: new FormControl(this.programacionAcademicaComercial.nombre, [Validators.required, Validators.maxLength(150), ]),
			paCiclo: this.paCicloControl,
			fechaModificacion: this.programacionAcademicaComercial.fechaModificacion
		});

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

	guardar() {

		if (this.form.valid) {

			this._programacionAcademicaComercialService.cargando = true;
			
			let detalles: ProgramacionAcademicaComercialDetalleEditarProjection[] = [];
			for(let idioma of this.idiomaControl.value){
				for(let paProgramacionId in this.detallesMapIdioma[idioma.id]){
					detalles = detalles.concat(this.detallesMapIdioma[idioma.id][paProgramacionId]);
				}
			}
			if(!detalles.length){
				this._matSnackBar.open('No has programado ningún curso', 'OK', {
					duration: 5000,
				});
				this._programacionAcademicaComercialService.cargando = false;
				return;
			}
			this.form.disable({
				emitEvent: false
			});

			let formRaw = this.form.getRawValue();

			for(let detalle of detalles){
				delete detalle.idTmp;
				detalle.numeroClases = Number(detalle.numeroClases);
				detalle.paModalidad = {id: detalle.paModalidad.id, nombre: detalle.paModalidad.nombre};
				detalle.idioma = {id: detalle.idioma.id};
				detalle.programas = detalle.programas.map(programa => {return {id:programa.id}});
			}

			let programacionAcademicaComercial: ProgramacionAcademicaComercialEditarProjection = {
				id: this.programacionAcademicaComercial.id,
				activo: true,
				codigo: this.programacionAcademicaComercial.codigo,
				nombre: formRaw.nombre,
				paCiclo: {id: formRaw.paCiclo.id},
				detalles,
				fechaModificacion: this.programacionAcademicaComercial.fechaModificacion
			};

			this._programacionAcademicaComercialService.guardar(JSON.stringify(programacionAcademicaComercial), '/api/v1/programacion-academica-comercial/save').then(
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

			this._programacionAcademicaComercialService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	nuevaProgramacion(idioma: ControlMaestroMultipleComboProjection){
		if(this.form?.disabled){
			return;
		}
		if(!this.paCicloControl.value){
			this._matSnackBar.open(this.translate.instant('MENSAJE.SIN_CICLO'), 'OK', {
				duration: 5000,
			});
			return;
		}
		let dialogData: ProgramacionDialogData = {
			idioma,
			ciclo: this.paCicloControl.value,
			paModalidades: this.paModalidades,
			onAceptar: this.onProgramacionAceptar.bind(this)
		};

		const dialogRef = this.dialog.open(ProgramacionDialogComponent, {
			width: '800px',
			data: dialogData,
			panelClass: 'modal-titulo-bg'
		});
	}

	onProgramacionAceptar(idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, programas: ProgramaCalcularDiasProjection[], numeroClases: number, fechaInicio: Moment, comentarios: string){
		if(!!this.detallesMapIdioma[idioma.id][paModalidad.id]?.length){
			const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				width: '400px',
				data: {
					mensaje: this.translate.instant('CONFIRMACION_REEMPLAZAR_PROGRAMACION')
				}
			});
	
			dialogRef.afterClosed().subscribe(confirm => {
				if (confirm) {
					this.crearProgramacionAcademicaDetalles(idioma,paModalidad,programas,numeroClases,fechaInicio,comentarios);
				}
			});
		}else{
			this.crearProgramacionAcademicaDetalles(idioma,paModalidad,programas,numeroClases,fechaInicio,comentarios);
		}
	}

	crearProgramacionAcademicaDetalles(idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, programas: ProgramaCalcularDiasProjection[], numeroClases: number, fechaInicio: Moment, comentarios: string){
		let fechaFinCiclo: Moment = moment(this.paCicloControl.value.fechaFin);
		let fecha: Moment = moment(fechaInicio);
		let diasNoLaboralesCicloFiltrados: DiaNoLaboral[] = this.diasNoLaboralesCiclo.filter(diaNoLaboral => {
			return paModalidad.diasSemanaActivos[diaNoLaboral.diaSemana];
		});
		let diasSemanaBuscar: number[] = paModalidad.diasSemanaActivos.map((diaActivo,diaSemana) => {
			if(diaActivo){
				return diaSemana;
			}else{
				return null;
			}
		}).filter(diaSemana => {
			return isDefined(diaSemana);
		});
		if(fecha.day() > diasSemanaBuscar[0]){
			diasSemanaBuscar = diasSemanaBuscar.slice(1).concat(diasSemanaBuscar[0] + 7);
		}
		while(fecha.day() > diasSemanaBuscar[0]){
			diasSemanaBuscar = diasSemanaBuscar.slice(1).concat(diasSemanaBuscar[0]);
		}
		let clasesRestantes: number = numeroClases;
		let fechaInicioDetalle: Moment = null;
		let idTmp: number = 0;
		let programasStr: string = programas.map(programa => programa.nombre).join(', ');
		let detalles: ProgramacionAcademicaComercialDetalleEditarProjection[] = [];
		let ultimoDetalleCreado: boolean = false;
		while(!ultimoDetalleCreado){
			let fechaEvaluar: Moment = moment(fecha);
			let fechaFinEvaluar: Moment = moment(fecha);
			fechaFinEvaluar.add(6,'day');
			// if(fechaFinEvaluar > fechaFinCiclo){
			// 	fechaFinEvaluar = moment(fechaFinCiclo);
			// }
			for(let diaSemana of diasSemanaBuscar){
				if(diaSemana > fechaEvaluar.day()){
					fechaEvaluar.day(diaSemana);
				}
				while(isDefined(diasNoLaboralesCicloFiltrados[0]) && diasNoLaboralesCicloFiltrados[0].fecha < fechaEvaluar){
					diasNoLaboralesCicloFiltrados = diasNoLaboralesCicloFiltrados.slice(1);
				}
				if(!isDefined(diasNoLaboralesCicloFiltrados[0]) || diasNoLaboralesCicloFiltrados[0].fecha > fechaEvaluar){
					clasesRestantes--;
					if(fechaInicioDetalle == null){
						fechaInicioDetalle = moment(fechaEvaluar);
						if(!this.fechaInicioControl.value || Number(this.fechaInicioControl.value) > Number(fechaInicioDetalle)){
							this.fechaInicioControl.setValue(fechaInicioDetalle);
						}
					}
					if(clasesRestantes == 0){
						let detalle: ProgramacionAcademicaComercialDetalleEditarProjection = {
							idioma,
							paModalidad,
							fechaInicio: fechaInicioDetalle.format('YYYY-MM-DD HH:mm:ss'),
							fechaFin: fechaEvaluar.format('YYYY-MM-DD HH:mm:ss'),
							numeroClases,
							comentarios: comentarios,
							programas,
							
							idTmp: ++idTmp,
							programasStr
						};
						fechaInicioDetalle = null;
						clasesRestantes = numeroClases;
						detalles = detalles.concat(detalle);
						if(fecha >= fechaFinCiclo){
							ultimoDetalleCreado = true;
							if(!this.fechaFinControl.value || Number(this.fechaFinControl.value) < Number(fechaEvaluar)){
								this.fechaFinControl.setValue(fechaEvaluar);
							}
						}
					}
				}
			}
			fecha = moment(fechaFinEvaluar);
			fecha.add(1,'day');
		}
		this.detallesMapIdioma[idioma.id][paModalidad.id] = detalles;
		this.dataSourceResumen[idioma.id].data = this.dataSourceResumen[idioma.id].data.filter(datosResumen => {
			return datosResumen.paModalidad.id != paModalidad.id;
		});
		this.dataSourceResumen[idioma.id].data = this.dataSourceResumen[idioma.id].data.concat({
			idioma,
			paModalidad,
			programas,
			programasStr,
			numeroClases,
			fechaInicio: moment(detalles[0].fechaInicio).format('MMM D, YYYY'),
			fechaInicioMoment: moment(detalles[0].fechaInicio),
			comentarios
		});
		this.dataSourceDetalles[idioma.id].data = this.dataSourceDetalles[idioma.id].data.filter(detalle => {
			return detalle.paModalidad.id != paModalidad.id;
		});
		this.dataSourceDetalles[idioma.id].data = this.dataSourceDetalles[idioma.id].data.concat(detalles);
		this.datasourceCalendarioMapIdioma[idioma.id] = [];
		this.dataSourceDetalles[idioma.id].data.forEach(detalle => {
			this.agregarDetalle(detalle);
		});
	}

	filtrarDatasourceDetalles(detalle: ProgramacionAcademicaComercialDetalleEditarProjection, filtro: string): boolean{
		let filtrosArr: string[] = (filtro || '||').split('|');
		let paModalidadFiltrarId: Number = !!filtrosArr[0] ? Number(filtrosArr[0]) : null;
		let programaFiltrarId: Number = !!filtrosArr[1] ? Number(filtrosArr[1]) : null;
		let fechaInicioFiltrar: string = filtrosArr[2] || null;

		if(isDefined(paModalidadFiltrarId) && detalle.paModalidad.id != paModalidadFiltrarId){
			return false;
		}
		if(isDefined(programaFiltrarId)){
			let programaIncluido: boolean = false;
			for(let programa of detalle.programas){
				if(programa.id == programaFiltrarId){
					programaIncluido = true;
					break;
				}
			}
			if(!programaIncluido){
				return false;
			}
		}
		if(isDefined(fechaInicioFiltrar) && moment(detalle.fechaInicio).format() != moment(fechaInicioFiltrar).format()){
			return false;
		}

		return true;
	}

	onResumen(datosResumen: ProgramacionAcademicaComercialDetalleResumen){
		if(this.form?.disabled){
			return;
		}
		if(!this.paCicloControl.value){
			this._matSnackBar.open(this.translate.instant('MENSAJE.SIN_CICLO'), 'OK', {
				duration: 5000,
			});
			return;
		}
		debugger;
		let dialogData: ProgramacionDialogData = {
			idioma: datosResumen.idioma,
			ciclo: this.paCicloControl.value,
			paModalidades: this.paModalidades,
			paModalidad: datosResumen.paModalidad,
			programas: datosResumen.programas,
			numeroClases: datosResumen.numeroClases,
			fechaInicio: datosResumen.fechaInicioMoment,
			comentarios: datosResumen.comentarios,
			onAceptar: this.onProgramacionAceptar.bind(this)
		};

		const dialogRef = this.dialog.open(ProgramacionDialogComponent, {
			width: '800px',
			data: dialogData,
			panelClass: 'modal-titulo-bg'
		});
	}

	setFiltrosDetalles(){
		if(this.idiomasMatTabGroup?.selectedIndex || this.idiomasMatTabGroup?.selectedIndex == 0){
			let idiomaSeleccionado: ControlMaestroMultipleComboProjection = this.idiomas.find(i => i.valor == (this.idiomasMatTabGroup._tabs as any)._results[this.idiomasMatTabGroup.selectedIndex].textLabel);
	
			this.dataSourceDetalles[idiomaSeleccionado.id].filter = String(this.paModalidadFiltrarControlMapIdioma[idiomaSeleccionado.id].value?.id || '') + '|' + String(this.programaFiltrarControlMapIdioma[idiomaSeleccionado.id].value?.id || '') + '|' + String(this.fechaInicioFiltrarControlMapIdioma[idiomaSeleccionado.id].value?.format('YYYY-MM-DD HH:mm:ss') || '');
		}
	}

	onDetalle(detalle: ProgramacionAcademicaComercialDetalleEditarProjection){
		if(this.form?.disabled || (this.programacionAcademicaComercial?.id && ((moment(detalle.fechaFin).format('YYYY/MM/DD')) < (moment(this.fechaActual).format('YYYY/MM/DD'))))){
			return;
		}
		if(!this.paCicloControl.value){
			this._matSnackBar.open(this.translate.instant('MENSAJE.SIN_CICLO'), 'OK', {
				duration: 5000,
			});
			return;
		}
		let fechaMinima: Moment = moment(this.paCicloControl.value.fechaInicio);
		if(detalle.idTmp > 0){
			for(let i=0 ; i<this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id].length ; i++){
				let detalleComparar: ProgramacionAcademicaComercialDetalleEditarProjection = this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id][i];
				if(detalleComparar.idTmp == detalle.idTmp-1){
					fechaMinima = moment(detalleComparar.fechaFin);
					fechaMinima.add(1,'day');
					break;
				}
			}
		}

		let diasNoLaboralesCicloFiltrados: DiaNoLaboral[] = this.diasNoLaboralesCiclo.filter(diaNoLaboral => {
			return detalle.paModalidad.diasSemanaActivos[diaNoLaboral.diaSemana];
		});

		let dialogData: ProgramacionEditarDetalleDialogData = {
			idTmp: detalle.idTmp,
			idioma: detalle.idioma,
			ciclo: this.paCicloControl.value,
			paModalidad: detalle.paModalidad,
			programas: detalle.programas,
			numeroClases: detalle.numeroClases,
			fechaMinima,
			fechaInicio: moment(detalle.fechaInicio),
			fechaFin: moment(detalle.fechaFin),
			comentarios: detalle.comentarios,
			diasNoLaboralesCicloFiltrados,
			onAceptar: this.onDetalleAceptar.bind(this)
		};

		const dialogRef = this.dialog.open(ProgramacionEditarDetalleDialogComponent, {
			width: '800px',
			data: dialogData,
			panelClass: 'modal-titulo-bg'
		});
	}

	onDetalleAceptar(idioma: ControlMaestroMultipleComboProjection, paModalidad: PAModalidadDiasProjection, idTmp: number, numeroClases: number, fechaInicio: Moment, fechaFin: Moment, comentarios: string){
		let diferenciaClases: number = 0;
		let diasNoLaboralesCicloFiltrados: DiaNoLaboral[] = this.diasNoLaboralesCiclo.filter(diaNoLaboral => {
			return paModalidad.diasSemanaActivos[diaNoLaboral.diaSemana];
		});
		let diasNoLaboralesMap: {[fecha:string]: boolean} = {};
		if(!this.fechaInicioControl.value || Number(this.fechaInicioControl.value) > Number(fechaInicio)){
			this.fechaInicioControl.setValue(fechaInicio);
		}
		for(let diaNoLaboral of diasNoLaboralesCicloFiltrados){
			diasNoLaboralesMap[diaNoLaboral.fecha.format('YYYY-MM-DD')] = true;
		}
		for(let i=0 ; i<this.detallesMapIdioma[idioma.id][paModalidad.id].length ; i++){
			let detalle: ProgramacionAcademicaComercialDetalleEditarProjection = this.detallesMapIdioma[idioma.id][paModalidad.id][i];
			if(detalle.idTmp == idTmp){
				let fecha: Moment = moment(detalle.fechaFin);
				if(Number(fecha) < Number(fechaFin)){
					while(Number(fecha) < Number(fechaFin)){
						fecha.add(1,'day');
						if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
							diferenciaClases++;
						}
					}
				}else if(Number(fecha) > Number(fechaFin)){
					while(Number(fecha) > Number(fechaFin)){
						fecha.subtract(1,'day');
						if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
							diferenciaClases--;
						}
					}
				}
				detalle.numeroClases = numeroClases;
				detalle.fechaInicio = fechaInicio.format('YYYY-MM-DD HH:mm:ss');
				detalle.fechaFin = fechaFin.format('YYYY-MM-DD HH:mm:ss');
				detalle.comentarios = comentarios;
			}else if(detalle.idTmp > idTmp){
				let fecha: Moment = moment(detalle.fechaInicio);
				let diferenciaClasesRestantes: number = diferenciaClases;
				while(diferenciaClasesRestantes > 0){
					fecha.add(1,'day');
					if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
						diferenciaClasesRestantes--;
					}
				}
				while(diferenciaClasesRestantes < 0){
					fecha.subtract(1,'day');
					if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
						diferenciaClasesRestantes++;
					}
				}
				detalle.fechaInicio = fecha.format('YYYY-MM-DD HH:mm:ss');

				fecha = moment(detalle.fechaFin);
				diferenciaClasesRestantes = diferenciaClases;
				while(diferenciaClasesRestantes > 0){
					fecha.add(1,'day');
					if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
						diferenciaClasesRestantes--;
					}
				}
				while(diferenciaClasesRestantes < 0){
					fecha.subtract(1,'day');
					if(paModalidad.diasSemanaActivos[fecha.day()] && !diasNoLaboralesMap[fecha.format('YYYY-MM-DD')]){
						diferenciaClasesRestantes++;
					}
				}
				detalle.fechaFin = fecha.format('YYYY-MM-DD HH:mm:ss');
				if(!this.fechaFinControl.value || Number(this.fechaFinControl.value) > Number(fecha)){
					this.fechaFinControl.setValue(fecha);
				}
			}
			console.log('Number(this.fechaFinControl.value) < Number(detalle.fechaFin)',this.fechaFinControl.value,detalle.fechaFin);
			if(!this.fechaFinControl.value || Number(this.fechaFinControl.value) < Number(moment(detalle.fechaFin))){
				this.fechaFinControl.setValue(moment(detalle.fechaFin));
			}
		}
		this.dataSourceDetalles[idioma.id].data = this.dataSourceDetalles[idioma.id].data.filter(detalle => {
			return detalle.paModalidad.id != paModalidad.id;
		});
		this.dataSourceDetalles[idioma.id].data = this.dataSourceDetalles[idioma.id].data.concat(this.detallesMapIdioma[idioma.id][paModalidad.id]);
		this.datasourceCalendarioMapIdioma[idioma.id] = [];
		this.dataSourceDetalles[idioma.id].data.forEach(detalle => {
			this.agregarDetalle(detalle);
		});
	}

	initIdioma(idioma: ControlMaestroMultipleComboProjection){
		this.dataSourceDetalles[idioma.id] = new MatTableDataSource([]);
		this.dataSourceDetalles[idioma.id].filterPredicate = this.filtrarDatasourceDetalles.bind(this);
		this.dataSourceDetalles[idioma.id].filter = '||';
		this.paModalidadFiltrarControlMapIdioma[idioma.id] = new FormControl(null, []);
		this.paModalidadFiltrarControlMapIdioma[idioma.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: PAModalidadDiasProjection) => {
			this.setFiltrosDetalles();
		});
		this.programaFiltrarControlMapIdioma[idioma.id] = new FormControl(null, []);
		this.programaFiltrarControlMapIdioma[idioma.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: PAModalidadDiasProjection) => {
			this.setFiltrosDetalles();
		});
		this.fechaInicioFiltrarControlMapIdioma[idioma.id] = new FormControl(null, []);
		this.fechaInicioFiltrarControlMapIdioma[idioma.id].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value: Moment) => {
			this.setFiltrosDetalles();
		});
		this.datasourceCalendarioMapIdioma[idioma.id] = [];
	}

	agregarDetalle(detalle: ProgramacionAcademicaComercialDetalleEditarProjection){
		this.datasourceCalendarioMapIdioma[detalle.idioma.id] = this.datasourceCalendarioMapIdioma[detalle.idioma.id].concat({
			startDate: new Date(detalle.fechaInicio),
			endDate: new Date(detalle.fechaInicio),
			color: detalle.paModalidad.color,
			name: String(detalle.paModalidad.id)+'.'+String(detalle.idTmp)
		});
	}

	limpiarOnCiclo(){
		if(this.fichaInicializada){
			this.idiomaControl.setValue([]);
			this.fechaInicioControl.setValue(null);
			this.fechaFinControl.setValue(null);
			this.dataSourceResumen = {};
			this.dataSourceDetalles = {};
			this.datasourceCalendarioMapIdioma = {};
			this.detallesMapIdioma = {};
		}else{
			this.fichaInicializada = true;
		}
	}

	onDetalleCalendario(idioma: ControlMaestroMultipleComboProjection, detallesCalendario: CalendarDataSourceElement[]){
		if(this.form?.disabled){
			return;
		}
		if(!!detallesCalendario.length){
			let detallesIdsTmpMapPaModalidadId: {[paModalidadId:string]: number[]} = {};
			detallesCalendario.forEach(detalleCalendario => {
				let ids: string[] = detalleCalendario.name.split('.');
				detallesIdsTmpMapPaModalidadId[ids[0]] = (detallesIdsTmpMapPaModalidadId[ids[0]] ||[]).concat(Number(ids[1]));
			});
			let detalles: ProgramacionAcademicaComercialDetalleEditarProjection[] = [];
			for(let detalle of this.dataSourceDetalles[idioma.id].data){
				if(detallesIdsTmpMapPaModalidadId[detalle.paModalidad.id]?.includes(detalle.idTmp)){
					if(this.programacionAcademicaComercial?.id && ((moment(detalle.fechaFin).format('YYYY/MM/DD')) < (moment(this.fechaActual).format('YYYY/MM/DD')))){
						return;
					}
					detalles.push(detalle);
				}
			}

			let fechasMinimasMapDetalleIdTmp: {[detalleIdTmp:string]: Moment} = {};
			for(let detalle of detalles){
				let fechaMinima: Moment = moment(this.paCicloControl.value.fechaInicio);
				if(detalle.idTmp > 0){
					for(let i=0 ; i<this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id].length ; i++){
						let detalleComparar: ProgramacionAcademicaComercialDetalleEditarProjection = this.detallesMapIdioma[detalle.idioma.id][detalle.paModalidad.id][i];
						if(detalleComparar.idTmp == detalle.idTmp-1){
							fechaMinima = moment(detalleComparar.fechaFin);
							fechaMinima.add(1,'day');
							break;
						}
					}
				}
				fechasMinimasMapDetalleIdTmp[detalle.idTmp] = fechaMinima;
			}

			let dialogData: ProgramacionEditarDetalleCalendarioDialogData = {
				detalles: detalles,
				idioma: idioma,
				ciclo: this.paCicloControl.value,
				fechasMinimasMapDetalleIdTmp,
				onAceptar: this.onDetalleAceptar.bind(this)
			};
	
			const dialogRef = this.dialog.open(ProgramacionEditarDetalleCalendarioDialogComponent, {
				width: '800px',
				data: dialogData,
				panelClass: 'modal-titulo-bg'
			});
		}
	}

	limpiarFechaFiltrar(fechaInicioFiltrarControl: FormControl){
		fechaInicioFiltrarControl.setValue(null);
	}

	borrarProgramacion(datosResumenBorrar: ProgramacionAcademicaComercialDetalleResumen){
		this.dataSourceResumen[datosResumenBorrar.idioma.id].data = this.dataSourceResumen[datosResumenBorrar.idioma.id].data.filter(datosResumen => {
			return datosResumen.paModalidad.id != datosResumenBorrar.paModalidad.id;
		});
		this.detallesMapIdioma[datosResumenBorrar.idioma.id][datosResumenBorrar.paModalidad.id] = [];
		this.dataSourceDetalles[datosResumenBorrar.idioma.id].data = this.dataSourceDetalles[datosResumenBorrar.idioma.id].data.filter(detalle => {
			return detalle.paModalidad.id != datosResumenBorrar.paModalidad.id;
		});
		this.datasourceCalendarioMapIdioma[datosResumenBorrar.idioma.id] = [];
		this.dataSourceDetalles[datosResumenBorrar.idioma.id].data.forEach(detalle => {
			this.agregarDetalle(detalle);
		});
	}

	borrarDetalle(detalleBorrar: ProgramacionAcademicaComercialDetalleEditarProjection){
		this.detallesMapIdioma[detalleBorrar.idioma.id][detalleBorrar.paModalidad.id] = this.detallesMapIdioma[detalleBorrar.idioma.id][detalleBorrar.paModalidad.id].filter(detalle => {
			return detalle.idTmp != detalleBorrar.idTmp;
		});
		this.dataSourceDetalles[detalleBorrar.idioma.id].data = this.dataSourceDetalles[detalleBorrar.idioma.id].data.filter(detalle => {
			return detalle.idTmp != detalleBorrar.idTmp;
		});
		this.datasourceCalendarioMapIdioma[detalleBorrar.idioma.id] = [];
		this.dataSourceDetalles[detalleBorrar.idioma.id].data.forEach(detalle => {
			this.agregarDetalle(detalle);
		});
		if(!this.dataSourceDetalles[detalleBorrar.idioma.id].data.length){
			this.dataSourceResumen[detalleBorrar.idioma.id].data = this.dataSourceResumen[detalleBorrar.idioma.id].data.filter(datosResumen => {
				return datosResumen.paModalidad.id != detalleBorrar.paModalidad.id;
			});
		}
	}

}