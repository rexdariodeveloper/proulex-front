import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramaIdiomaComboProjection,ProgramaIdiomaEditarProjection } from '@app/main/modelos/programa-idioma';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DescuentoService } from '../../descuento.service';
import { takeUntil } from 'rxjs/operators';

const MAX_28: number = 9999999999999999999999999999.99;

export interface VerificarRfcData {
	programas: ProgramaComboProjection[];
	modalidades: any[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'verificar-rfc',
	templateUrl: 'verificar-rfc.dialog.html',
	animations: fuseAnimations
})
export class VerificarRfcComponent {

	programas: ProgramaComboProjection[];
	cursos: ProgramaIdiomaComboProjection[];
    modalidades: PAModalidadComboProjection[];
    modalidadesHorario: any[];

    programaControl: FormControl = new FormControl();
    cursoControl: FormControl = new FormControl();
    modalidadesControl: FormControl = new FormControl();
    modalidadesHorariosControl: FormControl = new FormControl();

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('cursoSelect') cursoSelect: PixvsMatSelectComponent;
	@ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
	@ViewChild('modalidadHorarioSelect') modalidadHorarioSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < VerificarRfcComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: VerificarRfcData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		public _descuentoService: DescuentoService
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.programaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.programaControl.value) {
                this._descuentoService.getComboCursos(this.programaControl.value.id).then(value =>{
                    this.cursos = value.data;
                    this.cursoSelect?.setDatos(this.cursos);
                });
            }
        });

        /*this.cursoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.cursoControl.value) {
                this._descuentoService.getComboModalidades(this.cursoControl.value.id).then(value =>{
                    this.modalidades = value.data;
                    this.modalidadSelect?.setDatos(this.modalidades);
                });
            }
        });*/

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

	setData(data: VerificarRfcData) {
		this.programas = data.programas;
		this.modalidades = data.modalidades;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.programaControl && this.cursoControl && this.modalidadesControl && this.modalidadesHorariosControl){
			let cursosArray = new FormArray([]);
			if(this.cursoControl.value){
				this.cursoControl.value.forEach(curso =>{
					cursosArray.push(this.createCursosDetalleForm(curso));
				});
			}

			let form: FormGroup = this._formBuilder.group({
	            id: [null],
	            descuentoDetalleId: new FormControl(null),
	            programa: this.programaControl,
	            paModalidad: this.modalidadesControl,
	            paModalidadHorario: this.modalidadesHorariosControl,
	            cursos: cursosArray
	        });
			this.dialogRef.close(form);
		}else{
			this._matSnackBar.open('Datos faltantes', 'OK', {
                duration: 5000,
            });
		}
	}

	createCursosDetalleForm(curso: ProgramaIdiomaComboProjection): FormGroup {

        let form = this._formBuilder.group({
            id: [null],
            descuentoDetalleId: new FormControl(null),
            programaIdioma: new FormControl(curso)
        });
        return form;
    }

}