import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { PAProfesorComboProjection } from '@app/main/modelos/paprofesor-categoria';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarSalarioData {
	categorias: PAProfesorComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-salario',
	templateUrl: 'agregar-salario.dialog.html',
	animations: fuseAnimations
})
export class AgregarSalarioComponent {

	categorias: PAProfesorComboProjection[];
	salario: number;
	categoriaControl: FormControl = new FormControl(null);

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AgregarSalarioComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarSalarioData,
		public validatorService: ValidatorService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarSalarioData) {
		this.categorias = data.categorias;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.categoriaControl.value && this.salario && this.salario >0){
			let form: FormGroup = this._formBuilder.group({
	            id: [null],
	            tabuladorId: new FormControl(null),
	            profesorCategoria: this.categoriaControl,
	            sueldo: new FormControl(this.salario),
	            activo: new FormControl(true),
	        });
			this.dialogRef.close(form);
		}else{
			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
		}
		
	}

}