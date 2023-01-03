import { Component, HostListener, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import * as moment from 'moment';

import { AsistenciaService } from './asistencia.service';
import { TipoAsistenciaDialogComponent, TipoAsistenciaDialogData } from './dialogs/tipo-asistencia/tipo-asistencia.dialog';
import { ComentarioDialogComponent, ComentarioDialogData } from './dialogs/comentario/comentario.dialog';
import { AlumnoAsistencia } from '@app/main/modelos/alumno-asistencia';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { FechasHabilesService } from '@services/fechas-habiles.service';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { ProgramaGrupoCapturaEditarProjection } from '@app/main/modelos/programa-grupo';
import { MatTable, MatTableDataSource } from '@angular/material/table';

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
    selector: 'asistencia',
    templateUrl: './asistencia.component.html',
    styleUrls: ['./asistencia.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AsistenciaComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		//return !this.hasChanges;
		return true;
	}

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

	fechaActual: Date = null;
	grupo: ProgramaGrupoCapturaEditarProjection = null;
	horario: any[] = null;
	historial: any[] = [];
	asistencias: any[] = [];
	fechas: Map<string,Date> = new Map<string,Date>();
	diasSemana: string = null;
	editable: boolean = false;
	columnsSchema: any[] = [];
	displayedColumns: string[] = [];
	currentIndex: number = 0;
	tableMode: 'detail' | 'resume' = 'detail';
	minutosCurso: number = 0;
	bloquearForm: boolean = true;
	extemporanea: boolean = false;

	columnsResume: any[] = [];
	displayedColumnsResume: string[] = [];

	@ViewChildren(MatTable)
    public tables: QueryList<MatTable<any>>
	
	private _unsubscribeAll: Subject <any>;
	private _pageReload: Subject<any>;
	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public asistenciaService: AsistenciaService,
		public fechasHabilesService: FechasHabilesService,
		private router: Router
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);
		this._unsubscribeAll = new Subject();
		this._pageReload = new Subject();
	}

	isLoading: boolean = false;
	ngOnInit(): void {

		this.route.paramMap.subscribe(params => {
			this.pageConfig.pageType = params.get("handle");
			this.pageConfig.title = this.translate.instant('TITULO');
            this.pageConfig.currentId = Number(this.hashid.decode(params.get("id")));
			this.pageConfig.crudConfig = { rutaAtras: "/app/control-escolar/asistencias", icono: "assignment_turned_in" };
			// this.pageConfig.acciones = [
			// 	{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.ARCHIVO_BY_ID, url: '/api/v1/captura_asistencia/excel/'}
			// ];			
		});

		this.asistenciaService.onDatosChanged
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((datos) => {
			if(!!datos){
				this.isLoading = true;
				this.grupo = datos?.grupo;
				this.historial = datos?.historial;
				this.asistencias = datos?.asistencias;
				this.horario = JSON.parse(this.grupo.horario);
				this.getDiasSemana();
				//Mapeo de permisos
				let permisos: Object = datos?.permisos || new Object();
				let capturaExtemporanea: boolean = (datos?.permisos || {}).hasOwnProperty('CAPTURA_EXTEMPORANEA_ASISTENCIAS') || (datos?.permisos || {}).hasOwnProperty('USUARIO_RESPONSABLE');
				//Determinar el estado del grupo
				let fecha = moment(moment().format('YYYY-MM-DD'));
				this.fechaActual = fecha.toDate();
				let finGrupo: boolean   = fecha.diff(moment(this.grupo.fechaFin), 'day') >= 0;
				let finToler: boolean   = fecha.diff(moment(this.grupo.fechaFinTolerancia),'day') > 0;
				let finalizado: boolean = this.grupo.estatusId == ControlesMaestrosMultiples.CMM_PROGRU_Estatus.FINALIZADO;
				this.editable = !finToler && !finalizado; //Permite editar siempre que no se haya exedido la tolerancia y el grupo no esté finalizado
				this.editable = this.editable || capturaExtemporanea;
				this.extemporanea = capturaExtemporanea;
				this.pageConfig.form = new FormGroup({});
				if(!this.grupo.jobs && !this.grupo.sems)
					this.studentCols.delete('codigoUDG');
				let formArray: FormArray = new FormArray([]);
				(datos?.alumnos || []).forEach( student => {
					let minutosTotal: number = 0;
					let form: FormGroup = new FormGroup({});
					//Add student fields
					this.studentCols.forEach((v,k) => {
						form.addControl(k, new FormControl(student[k]));
						if(v != null){
							this.addToSchema({label: v, type: 'text', name: k, class: 'w-10-p', sticky: false, tooltip: (k === 'codigo')});
							this.addToResume({label: v, type: 'text', name: k, class: 'cell px-8', sticky: true, tooltip: (k === 'codigo')});
						}
					});
					datos?.fechas.forEach((fecha, index) => {
						let dow = moment(fecha.fecha).isoWeekday() + 1;
						let h = this.horario.find( item => item.dia == dow );
						if ( h != null ) { minutosTotal += h.horas * 60; }
						this.fechas.set('a_'+index, fecha.fecha);
						let attendance: any = datos?.asistencias.find( session => session?.alumnoId == student?.alumnoId && session?.fecha == fecha?.fecha);
						let isNew: boolean = false;
						if( attendance == null ){
							attendance = new AlumnoAsistencia();
							attendance.alumno = student;
							attendance.alumnoId = student.alumnoId
							attendance.fecha = moment(fecha.fecha, 'YYYY-MM-DD').toDate();
							attendance.grupoId = this.grupo.id;
							if(attendance.fecha.getTime() === this.fechaActual.getTime()){
								let asistencia = datos?.tipos.find(item => item.id === ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.ASISTENCIA);
								attendance.tipoAsistencia = asistencia;
								attendance.tipoAsistenciaId = asistencia.id;
								isNew = true;
							}
						}
						form.addControl('a_'+index, new FormControl(attendance));
						if(isNew)
							form.get('a_'+index).markAsDirty();
						this.addToSchema({label: attendance?.fecha, type: 'date', name:'a_'+index, class: 'w-10-p text-center'});
						this.addToResume({label: attendance?.fecha, type: 'date', name:'a_'+index, class: 'w-100 p-8 text-center'});
					});
					form.addControl('resumen', new FormControl(null));
					this.addToSchema({label: 'Resumen', type: 'resume', name: 'resumen'});
					form.valueChanges.pipe(takeUntil(this._pageReload)).subscribe((value) => {
						let minutosFalta: number = 0;
						(this.columnsSchema.filter( schema => schema.type === 'date') || []).forEach(schema => {
							let v = value[schema.name];
							let dow = moment(v.fecha).isoWeekday() + 1;
							let h = this.horario.find( item => item.dia == dow );
							if ( h !== null ) { 
								if (v.tipoAsistenciaId == ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.FALTA)
									minutosFalta += h.horas * 60;
								if (v.tipoAsistenciaId == ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.RETARDO)
									minutosFalta += v.minutosRetardo;
							}
						});
						form.get('resumen').setValue(minutosFalta, { emitEvent: false });
					});
					form.addControl('comentario', new FormControl(null));
					this.addToSchema({label: 'Comentarios', type: 'custom', name: 'comentario', class: 'w-10-p text-center'});
					formArray.push(form);
					this.minutosCurso = minutosTotal;
				});
				this.pageConfig.form = formArray;
				this.pageConfig.form.markAsPristine();
				if(this.bloquearForm)
					this.pageConfig.form.disable();
				let ci = datos?.fechas.findIndex(item => moment(item.fecha, 'YYYY-MM-DD').toDate().getTime() === this.fechaActual.getTime());
				if (ci >= 0){
					this.changeDate(ci);
					this.currentIndex = ci;
				} else
					this.changeDate(0);
				// Permisos
				if (permisos.hasOwnProperty('EXPORTAR_EXCEL_ASISTENCIAS')){
					this.pageConfig.acciones = [
						{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.ARCHIVO_BY_ID, url: '/api/v1/captura_asistencia/excel/'}
					];	
				}
				this.isLoading = false;
			}
		});
	}

	ngAfterViewInit(): void {
		this.tables.changes.pipe(takeUntil(this._unsubscribeAll)).subscribe((tables: QueryList <MatTable<any>>) => {
			tables.forEach( (table: MatTable<any>) => {
				table.updateStickyColumnStyles();
			} )
        });
	}

	ngOnDestroy(): void {
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
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

	addToSchema(entry: any){
		if(this.columnsSchema.findIndex(item => {return item?.name === entry?.name}) < 0){
			this.columnsSchema.push(entry);
			this.displayedColumns.push(entry.name);
		}
	}

	addToResume(entry: any){
		if(this.columnsResume.findIndex(item => {return item?.name === entry?.name}) < 0){
			this.columnsResume.push(entry);
			this.displayedColumnsResume.push(entry.name);
		}
	}

	changeDate(dir: number){
		let ix = this.displayedColumns.indexOf('nombre') + 1;
		let columns = this.displayedColumns.filter((item) => !item.includes('a_'));
		if (!this.pageConfig.form.pristine)
			this.openConfirm(dir);
		else {
			this.currentIndex = this.currentIndex + dir;
			if(this.currentIndex < 0) this.currentIndex = 0;
			if(this.currentIndex >= this.fechas.size) this.currentIndex = this.fechas.size - 1;
			columns.splice(ix,0,'a_' + this.currentIndex);
			this.displayedColumns = columns;
			(this.pageConfig.form.controls as FormGroup[]).forEach((form: FormGroup) => {
				let comment = form.get('a_'+this.currentIndex).value?.comentario;
				form.get('comentario').setValue(comment, { emitEvent: false });
			});
		}
	}

	inicializar(){

	}

	toogleView(){
		this.tableMode = this.tableMode === 'detail' ? 'resume' : 'detail';
	}

	getTooltip(minutos: number): string {
		if ( minutos === null )
			return '0 ' + this.translate.instant('TABLE.MINUTOS');
		let horas = Math.floor(minutos / 60);
		let restante = minutos - (horas * 60);
		return horas + ' ' + this.translate.instant('TABLE.HORAS') + ' ' + restante + ' ' + this.translate.instant('TABLE.MINUTOS');
	}

	getSize(minutos: number): number {
		if ( minutos === null ) return 0;
		let l = this.minutosCurso * (this.grupo.faltasPermitidas / 100);//Limite de faltas
		if ( minutos > l) return 100;
		let pf = Math.ceil( minutos * ( 95 / l ));
		if ( pf > 100 ) return 100;
		if ( pf < 0 ) return 0;
		return pf;
	}

	openTipoAsistenciaModal(asistencia): void {
		let esFalta: boolean = 	asistencia.tipoAsistenciaId == ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.FALTA || 
								asistencia.tipoAsistenciaId == ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.FALTA_JUSTIFICADA;
		let esFechaActual: boolean = moment().startOf('day').diff(moment(asistencia?.fecha), 'days') == 0;
		if(this.editable && (esFalta || esFechaActual || this.extemporanea)){
			let h = this.horario.find( item => item.dia === moment(asistencia?.fecha).isoWeekday() + 1);
			let dialogData: TipoAsistenciaDialogData = {
				tienePermiso: this.editable || esFechaActual,
				row: asistencia,
				horasDia: h?.horas,
				onAceptar: this.aceptarTipoAsistenciaModal.bind(this)
			};
			const dialogRef = this.dialog.open(TipoAsistenciaDialogComponent, {
				width: '600px',
				data: dialogData,
				autoFocus: true
			});
			dialogRef.keydownEvents().pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
				if(event.key === "Enter"){
					event.preventDefault();
					event.stopPropagation();
					dialogRef.componentInstance.aceptar();
				}
			});
		}
	}

	aceptarTipoAsistenciaModal(form: FormGroup){
		event.stopPropagation();
		if(!form.pristine){
			let f: FormGroup = (this.pageConfig.form.controls as FormGroup[]).find((cf: FormGroup) => cf.value?.alumnoId === form.value?.alumnoId );
			f.get('a_'+this.currentIndex).setValue(form.value);
			f.get('a_'+this.currentIndex).markAsDirty();
		}
	}

	openComentarioModal(asistencia: AlumnoAsistencia): void {
		let dialogData: ComentarioDialogData = {
			row: asistencia,
			onAceptar: this.aceptarComentarioModal.bind(this)
		};
		const dialogRef = this.dialog.open(ComentarioDialogComponent, {
			width: '600px',
			data: dialogData
		});
	}

	aceptarComentarioModal(form: FormGroup){
		event.stopPropagation();
		if(!form.pristine){
			let f: FormGroup = (this.pageConfig.form.controls as FormGroup[]).find((cf: FormGroup) => cf.value?.alumnoId === form.value?.alumnoId );
			f.get('a_'+this.currentIndex).setValue(form.value);
			f.get('a_'+this.currentIndex).markAsDirty();
			f.get('comentario').setValue(form.value?.comentario);
			f.get('comentario').markAsDirty();
		}
	}

	openConfirm(dir: number): void {
		let fecha = this.fechas.get('a_'+this.currentIndex);
		let dialogData: any = {
			titulo: this.translate.instant('CONFIRM.TITLE'),
			mensaje: this.translate.instant('CONFIRM.MESSAGE',{fecha: moment(fecha).format('DD/MM/YYYY')}),
			aceptar: this.translate.instant('CONFIRM.CONFIRM'),
			cancelar: this.translate.instant('CONFIRM.REJECT'),
		};
		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '600px',
			data: dialogData,
			autoFocus: true
		});
		dialogRef.beforeClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(!!data) {//If confirmation is affirmative
				this.guardar(dir);
			} else {
				this.pageConfig.form.markAsPristine();
				this.changeDate(dir);
			}
		});
	}

	guardar(dir: number){
		if(!this.asistenciaService.cargando){
			(this.pageConfig.form.controls as FormGroup[]).forEach((form: FormGroup) => {
				let control: AbstractControl = form.get("a_"+this.currentIndex);
				let fecha: Date = control.value?.fecha;
				if(fecha !== this.fechaActual && this.grupo.estatusId !== ControlesMaestrosMultiples.CMM_PROGRU_Estatus.FINALIZADO){
					let aa = control.value;
					aa.tipoAsistenciaId = (aa.tipoAsistenciaId === null ? ControlesMaestrosMultiples.CMM_AA_TipoAsistencia.ASISTENCIA : aa.tipoAsistenciaId);
					form.get("a_"+this.currentIndex).setValue(aa);
					form.get("a_"+this.currentIndex).markAsDirty();
				}
			});
			let forms: FormGroup[] = (this.pageConfig.form.controls as FormGroup[]).filter((form: FormGroup) => !form.pristine);
			//let to_send: any = { grupoId : this.grupo.id, alumnos: [] };
			let to_send: Object[] = [];
			forms.forEach((form: FormGroup) => {
				Object.keys(form.controls).forEach((key: string) => {
					let control: AbstractControl = form.get(key);
					if(!control.pristine){
						let aa = Object.assign({}, control.value);
						delete aa.alumno;
						delete aa.grupo;
						delete aa.tipoAsistencia;
						let obj = {
							alumnoId: aa.alumnoId,
							asistencia: aa
						};
						if(aa?.id){
							to_send.push(aa);
						}
						//to_send.alumnos.push(obj);
					}
				})
			});
			this.bloquearForm = false;
			this.asistenciaService.guardar(to_send, '/api/v1/captura_asistencia/save').then(
				((result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.asistenciaService.getDatos().then((data) => {
							this.router.navigate(['/app/control-escolar/asistencias/ver/'+this.hashid.encode(this.pageConfig.currentId)]);
							//this.pageConfig.form.markAsPristine();
							if(dir != 0)
								this.changeDate(dir);
						});
					} else
						this.asistenciaService.cargando = false;
				}).bind(this)
			);
		}
	}
}