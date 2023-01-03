import { Component, Input, QueryList, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ProgramaGrupoCapturaEditarProjection } from "@app/main/modelos/programa-grupo";
import { CalificacionesService } from "@app/main/modulos/control-escolar/calificaciones/calificaciones/calificaciones.service";
import { environment } from "@environments/environment";
import { fuseAnimations } from "@fuse/animations";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import * as moment from 'moment';
import { ControlesMaestrosMultiples } from "@app/main/modelos/mapeos/controles-maestros-multiples";
import { FormArray, FormControl, FormGroup } from "@angular/forms";
import { MatTable } from "@angular/material/table";

@Component({
    selector: 'tab-calificaciones',
    templateUrl: './tab-calificaciones.component.html',
    styleUrls: ['./tab-calificaciones.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TabCalificacionesComponent {
    @Input() grupoId: number = null;
	@Input() alumnoId: number = null;
    apiUrl: string = environment.apiUrl;
    private _unsubscribeAll: Subject<any>;
    
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
		['estatus',null],
		['estatusId',null]
	]);
    
    form: FormArray = null;
    grupo: ProgramaGrupoCapturaEditarProjection = null;
    calificaciones: any[] = [];

    headerGroups: any[] = [];
	displayedGroups: string[] = [];
	columnsSchema: any[] = [];
	displayedColumns: string[] = [];

    @ViewChildren(MatTable)
    public tables: QueryList<MatTable<any>>

    constructor(
        public calificacionesService: CalificacionesService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.calificacionesService.setUrl('/api/v1/captura_calificaciones/detalle/');
        // Subscribe to update proveedor on changes
        this.calificacionesService.onDatosChanged
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe( datos => {
            if(!!datos){
                this.grupo = datos?.grupo;
				this.calificaciones = datos?.calificaciones;
				//Determinar el estado del grupo
				let fecha = moment(moment().format('YYYY-MM-DD'));
				let finGrupo: boolean   = fecha.diff(moment(this.grupo.fechaFin), 'day') >= 0;
				let finToler: boolean   = fecha.diff(moment(this.grupo.fechaFinTolerancia),'day') > 0;
				let finalizado: boolean = this.grupo.estatusId == ControlesMaestrosMultiples.CMM_PROGRU_Estatus.FINALIZADO;
				if(!this.grupo.jobs && !this.grupo.sems)
					this.studentCols.delete('codigoUDG');

				let alumnos = (datos?.alumnos || []).filter(x => x.alumnoId === this.alumnoId);

				let formArray: FormArray = new FormArray([]);
				(alumnos).forEach( student => {
					let form: FormGroup = new FormGroup({});
					//Add student fields
					this.studentCols.forEach((v,k) => {
						form.addControl(k, new FormControl(student[k]));
						if(v != null)
							this.addToSchema({label: v, type: null, name: k, class: null, tooltip: (k === 'codigo'), sticky: true});
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
					this.addToSchema({label: 'Calificación final', type: null, name: 'final', class: 'accent', stickyEnd: true, acciones: acciones});
					this.addToHeader({label: '', name:'gt', span: 1, stickyEnd: true});
					form.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
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
				this.form = formArray;
            }
        });
        this.calificacionesService.getListados(this.grupoId);
    }

    ngAfterViewInit(): void {
        this.tables.changes.pipe(takeUntil(this._unsubscribeAll)).subscribe((tables: QueryList <MatTable<any>>) => {
            let table: MatTable<any> = tables.first;
            table.updateStickyColumnStyles();
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

    descargarBoleta(event: Event, form: FormGroup){
		event.preventDefault();
		let query: any = {
			alumnoId: form.get('alumnoId').value,
			grupoId: this.grupoId
		}
		this.calificacionesService.imprimirPDFConFiltros('/api/v1/captura_calificaciones/boleta', query);
	}

    toFixed(value){
		if(value === null)
			return 0.00;
		if(value < 0.00)
			return 0.00;
		let v = Number(value);
		return Math.round(v * 100) / 100;
	}

    roundGrade(grade: number){
        if(grade === null) return 0;
        if(grade === 79.00) return 80.00;
        if(grade > 79.00  && grade <= 80.00) return Math.ceil(grade);
        if(grade >= 78.00 && grade < 79.00 ) return Math.floor(grade);
        if(grade % 1 <= 0.5) return Math.floor(grade);
        return Math.ceil(grade);
    }
}