import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from 'moment';
import { ProgramaGrupoIncompanyCriterioEvaluacionEditarProjection } from '@app/main/modelos/programa-grupo-incompany-criterio-evaluacion';

const MAX_28: number = 9999999999999999999999999999.99;
const dias: string[] = ['Lunes','Martes','Miercoles','Jueves','Viernes','Sabado'];

export interface ModifyCriterioData {
	grupoIncompany: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'modalidad-personalizada',
	templateUrl: 'modalidad-personalizada.dialog.html',
	animations: fuseAnimations
})
export class ModalidadPersonalizadaComponent {

	horarios: FormArray;
	grupoIncompany: number;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ModalidadPersonalizadaComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ModifyCriterioData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
	) {
		dialogRef.disableClose = true;
		this._unsubscribeAll = new Subject();
		this.setData(data);
		this.horarios = new FormArray([]);
		for(var i=0;i<dias.length;i++){
			let form = this._formBuilder.group({
				id: [null],
				grupoId: new FormControl(this.grupoIncompany),
				dia: new FormControl(dias[i]),
				horaInicioString: new FormControl(null),
				horaFinString: new FormControl(null),
				seleccionado: new FormControl(false)
			});
			this.horarios.push(form);
			console.log(this.horarios);
		}
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ModifyCriterioData) {
		this.grupoIncompany = data.grupoIncompany;
	}

	cancelar(): void {
		this.dialogRef.close(false);
	}

	aceptar(): void {
		this.dialogRef.close(this.horarios);
	}

}