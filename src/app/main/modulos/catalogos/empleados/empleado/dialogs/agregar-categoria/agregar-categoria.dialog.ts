import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PAProfesorComboProjection } from '@app/main/modelos/paprofesor-categoria';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EmpleadoService } from '../../empleado.service';
import { takeUntil, take } from 'rxjs/operators';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarCategoriaData {
	idiomas: ControlMaestroMultipleComboProjection[];
	categorias: PAProfesorComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-categoria',
	templateUrl: 'agregar-categoria.dialog.html',
	animations: fuseAnimations
})
export class AgregarCategoriaComponent {

	categorias: PAProfesorComboProjection[];
	categoriaControl: FormControl = new FormControl(null, [Validators.required]);
	idiomas: ControlMaestroMultipleComboProjection[];
	idiomaControl: FormControl = new FormControl(null, [Validators.required]);

	form: FormGroup; 

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('programaSelect') programaSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < AgregarCategoriaComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarCategoriaData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private el: ElementRef,
		public _empleadoService: EmpleadoService
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.form = this._formBuilder.group({
			id: [null],
            empleadoId: new FormControl(null),
            idioma: this.idiomaControl,
            categoria: this.categoriaControl,
            activo: new FormControl(true)
		});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarCategoriaData) {
		this.idiomas = data.idiomas;
		this.categorias = data.categorias;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid){
			this.dialogRef.close(this.form.value);
		}else{
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
		}
		
	}

}