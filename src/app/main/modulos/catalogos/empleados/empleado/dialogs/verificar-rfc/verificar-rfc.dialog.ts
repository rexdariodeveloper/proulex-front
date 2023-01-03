import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { OrdenCompraDetalleRelacionarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
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

export interface VerificarRfcData {
	idiomas: ControlMaestroMultipleComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'verificar-rfc',
	templateUrl: 'verificar-rfc.dialog.html',
	animations: fuseAnimations
})
export class VerificarRfcComponent {

	programas: ProgramaComboProjection[];
	programaControl: FormControl = new FormControl(null, [Validators.required]);
	idiomas: ControlMaestroMultipleComboProjection[];
	idiomaControl: FormControl = new FormControl(null, [Validators.required]);

	form: FormGroup; 

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('programaSelect') programaSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < VerificarRfcComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: VerificarRfcData,
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
            programa: this.programaControl,
            comentarios: new FormControl(null),
            activo: new FormControl(true)
		});

		this.form.get('idioma').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.idiomaControl.value) {
                this._empleadoService.getProgramasPorIdioma(this.form.get('idioma').value.id).then(value =>{
                    this.programas = value.data;
                    this.programaSelect?.setDatos(this.programas);
                });
            }
        });
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: VerificarRfcData) {
		this.idiomas = data.idiomas;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid || this.form.get('comentarios').value !=null || this.form.get('comentarios').value !=''){
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