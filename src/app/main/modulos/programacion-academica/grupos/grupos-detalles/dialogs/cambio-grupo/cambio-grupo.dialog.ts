import { Component, Inject, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import * as moment from 'moment';
import { GruposService } from '../../../grupos/grupos.service';
import { ProgramaGrupoComboProjection } from '@app/main/modelos/programa-grupo';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { I } from '@angular/cdk/keycodes';


const MAX_28: number = 9999999999999999999999999999.99;


export interface CambioGrupoData {
	sucursales: SucursalComboProjection[];
	tiposGrupo: ControlMaestroMultipleComboSimpleProjection[];
	grupos: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
	alumno: string;
	grupoActual: string;
	gruposMultisede: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
	esJobs: boolean;
	grupoId: number;
	alumnoId: number;
}

@Component({
	selector: 'cambio-grupo',
	templateUrl: 'cambio-grupo.dialog.html',
	animations: fuseAnimations
})
export class CambioGrupoComponent {
	@ViewChild('grupoMultisedeSelect') grupoMultisedeSelect: PixvsMatSelectComponent;
	@ViewChild('grupoSelect') grupoSelect: PixvsMatSelectComponent;
	@ViewChild('sucursalesSelect') sucursalesSelect: PixvsMatSelectComponent;
	alumno: string;
	grupoActual: string;
	grupoMultisede: boolean = false;
	comentario: string;

	sucursalesControl: FormControl = new FormControl();
	grupoMultisedeControl: FormControl = new FormControl();
	grupoControl: FormControl = new FormControl();
	tipoGrupoControl: FormControl = new FormControl();

	sucursales: SucursalComboProjection[];
	gruposMap: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
	gruposMultisedeMap: {[tipoGrupoId:string]: ProgramaGrupoComboProjection[]};
	esJobs: boolean;
	tiposGrupo: ControlMaestroMultipleComboSimpleProjection[];
	grupos: ProgramaGrupoComboProjection[];
	gruposMultisede: ProgramaGrupoComboProjection[];

	grupoId: number;
	alumnoId: number;

	gruposMultisedeMostrar: any[];
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < CambioGrupoComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: CambioGrupoData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		public _grupoService: GruposService,
		private cdRef:ChangeDetectorRef
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this._grupoService.getSucursalesTotales().then(value =>{
			if(value.data){
				this.sucursales = value.data;	
			}else{
				this.sucursales = [];
			}
			this.sucursales = this.sucursales.filter(suc =>{
				return suc.nombre !='JOBS ' && suc.nombre !='JOBS SEMS'
			});
			let asignarGruposMultisedeMostrar = () => {
				if(this.sucursalesControl?.value?.id && this.tipoGrupoControl?.value?.id){
					this.gruposMultisedeMostrar = (this.gruposMultisede || []).filter(grupo =>{
						return grupo.sucursalId == this.sucursalesControl.value.id;
					});
					if(!!this.grupoMultisedeSelect){
						this.grupoMultisedeControl.setValue(null);
						this.grupoMultisedeSelect.setDatos(this.gruposMultisedeMostrar);
					}
				}
			}
			this.sucursalesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((sucursal: SucursalComboProjection) => {
				asignarGruposMultisedeMostrar();
			});
			this.tipoGrupoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(tipoGrupo => {
				this.grupos = this.gruposMap[tipoGrupo.id];
				this.gruposMultisede = this.gruposMultisedeMap[tipoGrupo.id];
				if(!!this.grupoSelect){
					this.grupoControl.setValue(null);
					this.grupoSelect.setDatos(this.grupos);
				}
				asignarGruposMultisedeMostrar();
			});
			if(this.tipoGrupoControl?.value?.id){
				this.grupos = this.gruposMap[this.tipoGrupoControl.value.id];
				this.gruposMultisede = this.gruposMultisedeMap[this.tipoGrupoControl.value.id];
				if(!!this.grupoSelect){
					this.grupoControl.setValue(null);
					this.grupoSelect.setDatos(this.grupos);
				}
				asignarGruposMultisedeMostrar();
			}
		});

	}

	ngAfterViewInit(){
		this.cdRef.detectChanges();
		this._grupoService.alumnoExamenCertificacion(this.alumnoId,this.grupoId).then(value =>{
            if(value.data){
            	console.log("Es por examen");
                let grupos = value.data.gruposParaCambio;
                let gruposMultisede = value.data.gruposMultisede;
                this.grupoSelect?.setDatos(grupos);
                this.grupoMultisedeSelect?.setDatos(gruposMultisede);
                this.gruposMultisedeMap = gruposMultisede;
                this.gruposMap = grupos;
            } else{
            	console.log("No es por examen");
            }
        });
		if(!!this.sucursalesSelect){
			this.sucursalesSelect.setDatos(this.sucursales);
		}
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: CambioGrupoData) {
		this.gruposMap = data.grupos;
		this.alumno = data.alumno;
		this.grupoActual = data.grupoActual;
		this.gruposMultisedeMap = data.gruposMultisede;
		this.esJobs = data.esJobs;
		this.grupoId = data.grupoId;
		this.alumnoId = data.alumnoId;
		this.tiposGrupo = data.tiposGrupo;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(
			(!this.grupoMultisede && !this.grupoControl?.value?.id)
			|| (this.grupoMultisede && !this.grupoMultisedeControl?.value?.id)
		){
			this._matSnackBar.open('Selecciona un grupo', 'OK', {
				duration: 5000,
			});
			return;
		}
		let json = null;
		if(this.grupoMultisede){
			json ={
				comentario : this.comentario,
				idNuevoGrupo : this.grupoMultisedeControl.value.id,
				//codigoGrupo: this.grupoActual
			}
		}else{
			json = {
				comentario: this.comentario,
				idNuevoGrupo : this.grupoControl.value.id
			}
		}
		this.dialogRef.close(json);
	}

}