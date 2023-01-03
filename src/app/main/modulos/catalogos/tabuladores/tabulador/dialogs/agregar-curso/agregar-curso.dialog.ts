import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TabuladorService } from '../../tabulador.service';
import { takeUntil } from 'rxjs/operators';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarCursoData {
	programas: ProgramaComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-curso',
	templateUrl: 'agregar-curso.dialog.html',
	animations: fuseAnimations
})
export class AgregarCursoComponent {

	programas: ProgramaComboProjection[];
	modalidades: PAModalidadComboProjection[];
	cursos: any[];
	modalidadesHorario: any[];
	programaControl: FormControl = new FormControl(null);
	modalidadesControl: FormControl = new FormControl(null);
	cursoControl: FormControl = new FormControl(null);
	modalidadHorarioControl: FormControl = new FormControl(null);

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('cursoSelect') cursoSelect: PixvsMatSelectComponent;
	@ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
	@ViewChild('modalidadHorarioSelect') modalidadHorarioSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < AgregarCursoComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarCursoData,
		public validatorService: ValidatorService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public _tabuladorService: TabuladorService
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.programaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.programaControl.value) {
                this._tabuladorService.getComboCursos(this.programaControl.value.id).then(value =>{
                    this.cursos = value.data;
                    this.cursoSelect?.setDatos(this.cursos);
                });
            }
        });

        this.cursoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.cursoControl.value) {
                this._tabuladorService.getComboModalidades(this.cursoControl.value.id).then(value =>{
                    this.modalidades = value.data;
                    this.modalidades.sort(function(a, b){
		                if(a.nombre < b.nombre) { return -1; }
		                if(a.nombre > b.nombre) { return 1; }
		                return 0;
		            });
                    const uniqueObjects = [...new Map(this.modalidades.map(item => [item.nombre, item])).values()];;
                    this.modalidadSelect?.setDatos(uniqueObjects);
                });
            }
        });

        this.modalidadesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
        	if(this.modalidadesControl){
        		this.modalidadesHorario = this.modalidadesControl.value.horarios;
        		this.modalidadHorarioSelect.setDatos(this.modalidadesHorario);
        	}
        });
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarCursoData) {
		this.programas = data.programas;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.programaControl.value && this.cursoControl.value && this.modalidadesControl.value && this.modalidadHorarioControl.value){
			let arrayTemp = new FormArray([]);
			this.modalidadHorarioControl.value.forEach(horario =>{
				let form: FormGroup = this._formBuilder.group({
		            id: [null],
		            tabuladorId: new FormControl(null),
		            programa: this.programaControl,
		            modalidad: this.modalidadesControl,
		            modalidadHorario: new FormControl(horario),
		            programaIdioma: this.cursoControl,
		            activo: new FormControl(true),
		        });
		        arrayTemp.push(form);
			})
			
			this.dialogRef.close(arrayTemp);
		}else{
			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            this.programaControl.markAsTouched();
            this.cursoControl.markAsTouched();
            this.modalidadesControl.markAsTouched();
            this.modalidadHorarioControl.markAsTouched();
		}
		
	}

}