import { Component, EventEmitter, Input, Output, QueryList, ViewChildren, ViewEncapsulation } from "@angular/core";
import { ProgramaGrupoCapturaEditarProjection } from "@app/main/modelos/programa-grupo";
import { environment } from "@environments/environment";
import { fuseAnimations } from "@fuse/animations";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import * as moment from 'moment';
import { ControlesMaestrosMultiples } from "@app/main/modelos/mapeos/controles-maestros-multiples";
import { MatTable } from "@angular/material/table";
import { AlumnoAsistencia } from "@app/main/modelos/alumno-asistencia";
import { AsistenciaService } from "@app/main/modulos/control-escolar/asistencias/asistencias/asistencia.service";
import { FormArray, FormControl, FormGroup } from "@angular/forms";

@Component({
    selector: 'tab-asistencias',
    templateUrl: './tab-asistencias.component.html',
    styleUrls: ['./tab-asistencias.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TabAsistenciasComponent {
    @Input() grupoId: number = null;
	@Output() eventEsCargando: EventEmitter<boolean> = new EventEmitter<boolean>();
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
	tipos = new Map<number, string>([
		[0,'bg-muted'],
		[2000550, 'bg-success'],
		[2000551, 'bg-danger'],
		[2000552, 'bg-danger'],
		[2000553, 'bg-warning'],
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

	form: FormArray = null;
    grupo: ProgramaGrupoCapturaEditarProjection = null;
    asistencias: any[] = [];
	columnsSchema: any[] = [];
	displayedColumns: string[] = [];

	@ViewChildren(MatTable)
    public tables: QueryList<MatTable<any>>
    constructor(
        public asistenciaService: AsistenciaService
    ) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
		this.esCargando(true);
        this.asistenciaService.setUrl('/api/v1/captura_asistencia/detalle/');
        // Subscribe to update proveedor on changes
        this.asistenciaService.onDatosChanged
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe((datos) => {
			if(!!datos && datos.alumnos){
				this.grupo = datos?.grupo;
				this.asistencias = datos?.asistencias;
				//Determinar el estado del grupo
				let fecha = moment(moment().format('YYYY-MM-DD'));
				let finGrupo: boolean   = fecha.diff(moment(this.grupo.fechaFin), 'day') >= 0;
				let finToler: boolean   = fecha.diff(moment(this.grupo.fechaFinTolerancia),'day') > 0;
				let finalizado: boolean = this.grupo.estatusId == ControlesMaestrosMultiples.CMM_PROGRU_Estatus.FINALIZADO;
				if(!this.grupo.jobs && !this.grupo.sems)
					this.studentCols.delete('codigoUDG');
				let formArray: FormArray = new FormArray([]);
				(datos?.alumnos || []).forEach( student => {
					let form: FormGroup = new FormGroup({});
					//Add student fields
					this.studentCols.forEach((v,k) => {
						form.addControl(k, new FormControl(student[k]));
						if(v != null)
							this.addToSchema({label: v, type: null, name: k, class: null, tooltip: (k === 'codigo'), sticky: true});
						
					});
					//Add class dates
					(datos?.fechas || []).forEach((date, i) => {
						let asistencia = datos?.asistencias.find((asistencia) => { return asistencia?.alumnoId === student?.alumnoId && asistencia?.fecha === date?.fecha });
						let obj = {tipo: asistencia?.tipoAsistenciaId || 0, texto: null, comentario: asistencia?.comentario};
						if(asistencia?.tipoAsistenciaId === 2000552){ obj.texto = 'J'; }
						if(asistencia?.tipoAsistenciaId === 2000553){ obj.texto = asistencia?.minutosRetardo; }
						form.addControl('f'+i, new FormControl(obj));
						this.addToSchema({	label: date?.fecha, 
							type: 'text', 
							name: 'f'+i, 
							class: 'date-cell',
							isDate: true
						});
					});
					formArray.push(form);
				});
				this.form = formArray;
				this.esCargando(false);
			}
		});
        this.asistenciaService.getListados(this.grupoId);
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

	esCargando(esCargando: boolean) {
		setTimeout(() => {
			this.eventEsCargando.emit(esCargando);
		});	
	}
}