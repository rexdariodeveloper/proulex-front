import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { AlumnoComboProjection } from '@app/main/modelos/alumno';
import { FormControl } from '@angular/forms';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';

export interface PuntoVentaSeleccionarLocalidadDialogData {
	localidadesSucursal: LocalidadComboProjection[];
	onAceptar: (localidad: LocalidadComboProjection) => void;
}

@Component({
	selector: 'punto-venta-seleccionar-localidad-dialog',
	templateUrl: 'seleccionar-localidad.dialog.html',
})
export class PuntoVentaSeleccionarLocalidadDialogComponent {

	localidadesSucursal: LocalidadComboProjection[];

    localidadControl: FormControl = new FormControl(null,[]);

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaSeleccionarLocalidadDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaSeleccionarLocalidadDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

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

	setData(data: PuntoVentaSeleccionarLocalidadDialogData) {
		this.localidadesSucursal = data.localidadesSucursal;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!!this.localidadesSucursal?.length && !this.localidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una localidad', 'OK', {
                duration: 5000,
            });
		} else {
			this.data.onAceptar(this.localidadControl.value);
			this.dialogRef.close();
		}
	}

}