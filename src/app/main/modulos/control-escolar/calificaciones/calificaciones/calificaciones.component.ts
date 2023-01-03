import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from "@angular/core";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { MatDialog } from "@angular/material/dialog";
//Componentes
import { FichaCrudComponent } from "@pixvs/componentes/fichas/ficha-crud/ficha-crud.component";
import { MatInput } from '@angular/material/input';
//Services
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { HashidsService } from "@services/hashids.service";
import { CalificacionesService } from "./calificaciones.service";
//Modelos
import { JsonResponse } from "@models/json-response";
import { FichaCRUDConfig } from "@models/ficha-crud-config";
import { FichaListadoConfig, ListadoMenuOpciones } from "@models/ficha-listado-config";
import { ProgramaGrupoCapturaEditarProjection } from "@app/main/modelos/programa-grupo";
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
//Traducciones
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';

import * as moment from 'moment';
import { ErroresDialogComponent, ErroresDialogData } from "./dialogs/errores/errores.dialog";

export interface PageConfig {
	pageType: string,
	title: string,
	subtitle: string,
	currentId: number,
	form: FormGroup | FormArray,
	acciones: ListadoMenuOpciones[],

	crudConfig: FichaCRUDConfig
}

@Component({
    selector: 'calificaciones',
    templateUrl: './calificaciones.component.html',
    styleUrls: ['./calificaciones.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CalificacionesComponent {	

	estatus = new Map<number, string>([
		[2000670, 'text-success'],
		[2000671, 'text-success'],
		[2000672, 'text-warning'],
		[2000673, 'text-danger'],
		[2000674, 'text-danger'],
		[2000675, 'text-success'],
		[2000676, 'text-danger'],
		[2000677, 'text-muted']
	]);

	studentCols = new Map<string, string>([
		['alumnoId',null],
		['codigo','Código'],
		['codigoUDG','Código UDG'],
		['primerApellido','Primer apellido'],
		['segundoApellido','Segundo apellido'],
		['nombre','Nombre'],
		['estatus',null],
		['estatusId',null]
	]);

	pageConfig: PageConfig = {
		pageType: null,
		title: null,
		subtitle: null,
		currentId: null,
		form: null,
		acciones: null,
		crudConfig: null
	};

	editable: boolean = false;
	enabled: boolean = false;
	headerGroups: any[] = [];
	displayedGroups: string[] = [];
	columnsSchema: any[] = [];
	displayedColumns: string[] = [];

	grupo: ProgramaGrupoCapturaEditarProjection = null;
	historial: any[] = [];
	calificaciones: any[] = [];
	diasSemana: string = null; 

	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
	@ViewChildren(MatInput, { read: ElementRef }) inputs!: QueryList<ElementRef>;

	private _unsubscribeAll: Subject <any>;
	private _pageReload: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public calificacionesService: CalificacionesService,
		public dialog: MatDialog
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
		this._pageReload = new Subject();
	}

	@HostListener('document:keydown.tab', ['$event']) keydown(event: KeyboardEvent){
		if(event.keyCode === 9){
			event.preventDefault();
			if(!this.enabled)
				return;
			let numberOfInputs = this.inputs?.length;
			if(this.inputs && this.inputs.length > 0){
				let index = this.inputs.toArray().findIndex((item: ElementRef) => {return document.activeElement === item.nativeElement; });
				this.inputs.toArray().forEach((item: ElementRef) => { item.nativeElement.disabled = true; })
				if(index === numberOfInputs - 1) { index = -1; }
				let newInput: ElementRef = this.inputs.toArray()[index + 1];
				newInput.nativeElement.disabled = false;
				newInput.nativeElement.focus();
				newInput.nativeElement.select();
			}
		}
	}
	
	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageConfig.pageType = params.get("handle");
			this.pageConfig.title = this.translate.instant('TITULO');
			//this.pageConfig.subtitle = this.translate.instant('SUBTITULO');
			let id = this.hashid.decode(params.get("id"));
            this.pageConfig.currentId = Number(id);

			this.pageConfig.crudConfig = {
                rutaAtras: "/app/control-escolar/calificaciones",
                icono: "school"	
            };
		});

		this.calificacionesService.onDatosChanged
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((datos) => {
			if(!!datos){
				this.grupo = datos?.grupo;
				this.historial = datos?.historial;
				this.calificaciones = datos?.calificaciones;
				let permisos: Object = datos?.permisos || new Object();
				this.getDiasSemana();
				this.pageConfig.acciones = [];
				// Permiso de exportar excel
				if (permisos.hasOwnProperty('EXPORTAR_EXCEL_CALIFICACIONES'))
					this.pageConfig.acciones.push({ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.ARCHIVO_BY_ID, url: '/api/v1/captura_calificaciones/excel/'});
				//Mapeo de permisos
				let capturaExtemporanea: boolean = (datos?.permisos || {}).hasOwnProperty('CAPTURA_EXTEMPORANEA_CALIFICACIONES') || (datos?.permisos || {}).hasOwnProperty('USUARIO_RESPONSABLE');
				let cerrarGrupo: boolean = (datos?.permisos || {}).hasOwnProperty('CERRAR_GRUPO');
				let descargarBoletas: boolean = (datos?.permisos || {}).hasOwnProperty('DESCARGAR_BOLETAS');
				//Determinar el estado del grupo
				let fecha = moment(moment().format('YYYY-MM-DD'));
				let finGrupo: boolean   = fecha.diff(moment(this.grupo.fechaFin), 'day') >= 0;
				let finToler: boolean   = fecha.diff(moment(this.grupo.fechaFinTolerancia),'day') > 0;
				let finalizado: boolean = this.grupo.estatusId == ControlesMaestrosMultiples.CMM_PROGRU_Estatus.FINALIZADO;
				this.editable = !finToler && !finalizado; //Permite editar siempre que no se haya exedido la tolerancia y el grupo no esté finalizado
				if(finGrupo || finalizado) {//Si el grupo cerró o está finalizado
					if(descargarBoletas)//Agregar opción de descarga masiva
						this.pageConfig.acciones.push({ title: 'Descargar boletas', icon: 'play_for_work', tipo: 'download_zip', url: '/api/v1/captura_calificaciones/boletas/'});
				}
				if(!finalizado && cerrarGrupo){ //Si no ha finalizado y tiene permiso
					//Agregar opción de cierre de grupo
					this.pageConfig.acciones.push({ title: 'Finalizar grupo', icon: 'event_available', tipo: 'CERRAR_GRUPO', url: '/api/v1/grupos/cerrar/'+this.pageConfig.currentId});
				}
				this.editable = this.editable || capturaExtemporanea;
				if(!this.grupo.jobs && !this.grupo.sems)
					this.studentCols.delete('codigoUDG');

				let formArray: FormArray = new FormArray([]);
				(datos?.alumnos || []).forEach( student => {
					let form: FormGroup = new FormGroup({});
					//Add student fields
					this.studentCols.forEach((v,k) => {
						form.addControl(k, new FormControl(student[k]));
						if(v != null)
							this.addToSchema({label: v, type: null, name: k, class: null, sticky: true, tooltip: (k === 'codigo')});
					})
					this.addToHeader({label: '', name:'g0', span: [...this.studentCols.values()].filter(v => !!v).length, sticky: true});
					//Add activities
					datos?.metricas.forEach((metrica) => {
						let activities: any[] = datos.actividades.filter(act => act?.evaluacionId == metrica?.id);
						let totalPuntos = activities.map(act => act.puntaje).reduce((pv, cv, ci, a) => pv + cv);
						activities.forEach(activity => {
							let calificacion = datos.calificaciones.find(item => item.alumnoId === student.alumnoId && item.programaGrupoExamenDetalleId === activity.id);
							form.addControl('a'+activity?.id, new FormControl(this.toFixed(calificacion?.puntaje || 0.00)));
							this.addToSchema({	label: activity?.nombre, 
												type: 'number', 
												name: 'a'+activity?.id, 
												class: null, 
												puntaje: activity?.puntaje, 
												ponderacion: metrica?.porcentaje / totalPuntos});
						});
						this.addToHeader({label: metrica?.nombre, name:'g'+metrica?.id, span: activities.length});
					});
					
					form.addControl('final', new FormControl(this.roundGrade(this.toFixed(student?.calificacion))));
					let acciones: any[] = [];
					if(finGrupo || finalizado)
						acciones.push({icon: 'assignment', tooltip: "Descargar boleta" , event: this.descargarBoleta.bind(this)});
					this.addToSchema({label: 'Calificación final', type: null, name: 'final', class: 'accent', stickyEnd: true, acciones: acciones});
					this.addToHeader({label: '', name:'gt', span: 1, stickyEnd: true});
					form.valueChanges.pipe(takeUntil(this._pageReload)).subscribe((value) => {
						let sum = 0.00;
						this.columnsSchema.forEach(schema => {
							if(schema.type === 'number'){
								let current = this.toFixed(value[schema.name]);
								let control: FormControl = (form.get(schema.name) as FormControl);
								if(String(value[schema.name]).includes("-"))
									control.setValue(current, {emitEvent: false});
								if(String(value[schema.name]).split(".")[1]?.length > 2)
									control.setValue(current, {emitEvent: false});
								if(current > schema.puntaje){
									sum += this.toFixed(schema.puntaje * schema.ponderacion);
									control.setValue(schema.puntaje, {emitEvent: false});
								} else 
									sum += this.toFixed(current * schema.ponderacion);
							}
						});
						form.get('final').setValue(this.roundGrade(this.toFixed(sum)), { emitEvent: false });
					});
					formArray.push(form);
				});
				this.pageConfig.form = formArray;
				if(this.enabled)
					this.setEnable();
			}
		});
	}

	ngAfterViewInit(): void {
		this.inputs.toArray().forEach((item: ElementRef) => {
			item.nativeElement.disabled = true;
		});
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
		this._pageReload.next();
		this._pageReload.complete();
	}

	addToSchema(entry: any){
		if(this.columnsSchema.findIndex(item => {return item?.name === entry?.name}) < 0){
			this.columnsSchema.push(entry);
			this.displayedColumns.push(entry.name);
		}
	}

	addToHeader(entry: any){
		if(this.headerGroups.findIndex(item => {return item?.name === entry?.name}) < 0){
			this.headerGroups.push(entry);
			this.displayedGroups.push(entry.name);
		}
	}

	guardar() {
		let to_send = {grupoId: this.pageConfig.currentId, alumnos: []};
		Object.keys(this.pageConfig.form.controls).forEach( formKey => {
			let form: FormGroup = (this.pageConfig.form.get(formKey) as FormGroup);
			if (!form.pristine) {
				let alumnoId: number = form.get('alumnoId').value;
				let alumno = {	alumnoId: alumnoId,
								calificacion: form.get('final').value,
								detalles: []
							};
				this.columnsSchema.forEach(schema => {
					if(!!schema?.type){
						if(!form.get(schema.name).pristine){
							let actividadId: number = Number(schema.name.replace('a',''));
							let calificacion = this.calificaciones.find( c => c.alumnoId === alumnoId && c.programaGrupoExamenDetalleId == actividadId);
							if(!!calificacion){
								calificacion.puntaje = Number(form.get(schema.name).value);
								alumno.detalles.push(calificacion);
							}
							else{
								let obj = {id: null, alumnoId: alumnoId, grupoId: this.pageConfig.currentId, programaGrupoExamenDetalleId: actividadId, puntaje: Number(form.get(schema.name).value)};
								this.calificaciones.push(obj);
								alumno.detalles.push(obj);
							}
						}
					}
				});
				to_send.alumnos.push(alumno);
			}
		});

		this.calificacionesService.guardar(to_send, '/api/v1/captura_calificaciones/save').then(
			((result: JsonResponse) => {
				if (result.status == 200) {
					if(result?.data && result?.data.length > 0){
						let dialogData: ErroresDialogData = {
							response: result?.data || [],
							onAceptar: this.aceptarDialog.bind(this)
						};
			
						const dialogRef = this.dialog.open(ErroresDialogComponent, {
							width: '800px',
							data: dialogData,
							disableClose: true
						});
					} else {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
					}
					this._pageReload.next();
					this._pageReload.complete();
					this.calificacionesService.getDatos();
				} else {
					this.calificacionesService.cargando = false;
				}
			}).bind(this)
		);
	}

	setEnable(){
		this.enabled = true;
		if(this.inputs && this.inputs.length > 0){
			this.inputs.toArray().forEach((item: ElementRef) => { item.nativeElement.disabled = true; })
		}
	}

	setFocus(event: any){
		if(!this.enabled)
			return;
		if(this.inputs && this.inputs.length > 0){
			this.inputs.toArray().forEach((item: ElementRef) => { item.nativeElement.disabled = true; })
			if(event.target.tagName === 'INPUT'){
				let newInput: any = event.target;
				newInput.disabled = false;
				newInput.focus();
				newInput.select();
			}
		}
	}

	getDiasSemana() {
		let horario: string[] = [];
		let json: any[] = JSON.parse(this.grupo.horario);
		json.forEach(item => {
			if(!horario.includes(item.horario))
				horario.push(item.horario);
		});
		this.grupo.horario = horario.join(' , ');
		let aux: string[] = [];
		let diasLetra: string[] = ['D','L','M','Mi','J','V','S'];
		diasLetra.forEach((dia, index) => {
			let i = json.findIndex( h => h.dia == index + 1);
			if(i != -1)
				aux.push(dia);
			else
				aux.push('-');
		});
		this.diasSemana = aux.join(',');
	}

	toFixed(value){
		if(value === null)
			return 0.00;
		if(value < 0.00)
			return 0.00;
		let v = Number(value);
		return Math.round(v * 100) / 100;
	}

	descargarBoleta(event: Event, form: FormGroup){
		event.preventDefault();
		let query: any = {
			alumnoId: form.get('alumnoId').value,
			grupoId: this.pageConfig.currentId
		}
		this.calificacionesService.imprimirPDFConFiltros('/api/v1/captura_calificaciones/boleta', query);
	}

	onActionClicked(event: any){
		if(event.option.tipo === 'CERRAR_GRUPO')
			this.calificacionesService.cerrar(this.pageConfig.currentId);
		if(event.option.tipo === 'download_zip')
			this.calificacionesService.downloadFile(event.option.url + event.id,'zip');
	}

	aceptarDialog(){}

	roundGrade(grade: number){
        if(grade === null) return 0;
        if(grade === 79.00) return 80.00;
        if(grade > 79.00  && grade <= 80.00) return Math.ceil(grade);
        if(grade >= 78.00 && grade < 79.00 ) return Math.floor(grade);
        if(grade % 1 <= 0.5) return Math.floor(grade);
        return Math.ceil(grade);
    }
}