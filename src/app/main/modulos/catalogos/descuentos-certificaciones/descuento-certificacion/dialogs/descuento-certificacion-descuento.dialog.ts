import { Component, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection } from "@app/main/modelos/programa-idioma-certificacion-descuento-detlle";
import { fuseAnimations } from "@fuse/animations";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";

export interface DescuentoCertificacionDescuentoDialogData {
	esNuevo: boolean;
	form: FormGroup;
    listaDescuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'descuento-certificacion-descuento-dialog',
	templateUrl: './descuento-certificacion-descuento.dialog.html',
	animations: fuseAnimations
})
export class DescuentoCertificacionDescuentoDialog {
    esNuevo: boolean = true;
    form: FormGroup;
    listaDescuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection[] = [];

    constructor(
		public _dialogRef: MatDialogRef <DescuentoCertificacionDescuentoDialog> ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: DescuentoCertificacionDescuentoDialogData,
		public _validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _translateService: TranslateService,
		private _el: ElementRef
	) {
		this.setData(data);
	}

    setData(data: DescuentoCertificacionDescuentoDialogData) {
		this.esNuevo = data.esNuevo;
		this.form = data.form;
        this.listaDescuento = data.listaDescuento;
	}

    cancelar(): void {
		this._dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid){
            if(this.listaDescuento.some(descuento => descuento.numeroNivel == this.form.controls.numeroNivel.value && descuento.id != this.form.controls.id.value)){
                this._matSnackBar.open(this._translateService.instant('Existe el numero de niveles, eliges otro por favor.'), 'OK', {
                    duration: 5000,
                });

                return;
            }

			this._dialogRef.close(this.form);
        }
		else{
			let campoKey = '';
			for (const key of Object.keys(this.form.controls)) {
				if(this.form.controls[key].invalid){
					this.form.controls[key].markAsTouched();
					if(campoKey == '')
					  	campoKey = key;
				}
			}

			const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
			if (invalidControl) {
				invalidControl.focus();
			}

			this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}
}