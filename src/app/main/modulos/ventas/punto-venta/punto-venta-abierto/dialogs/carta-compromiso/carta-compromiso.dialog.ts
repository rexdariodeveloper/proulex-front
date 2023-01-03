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

export interface PuntoVentaCartaCompromisoDialogData {
	localidadesSucursal: LocalidadComboProjection[];
	onAceptar: (localidad: LocalidadComboProjection) => void;
}

@Component({
	selector: 'punto-venta-carta-compromiso-dialog',
	templateUrl: 'carta-compromiso.dialog.html',
})
export class PuntoVentaCartaCompromisoDialogComponent {

	localidadesSucursal: LocalidadComboProjection[];

    localidadControl: FormControl = new FormControl(null,[]);

    entregarCartaCompromiso: boolean = false;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaCartaCompromisoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaCartaCompromisoDialogData,
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

	setData(data: PuntoVentaCartaCompromisoDialogData) {
		this.localidadesSucursal = data.localidadesSucursal;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!this.entregarCartaCompromiso) {
			this._matSnackBar.open('Se debe entregar carta compromiso a alumnos JOBS SEMS', 'OK', {
                duration: 5000,
            });
		} else if (!!this.localidadesSucursal?.length && this.localidadesSucursal.length > 1 && !this.localidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una localidad', 'OK', {
                duration: 5000,
            });
		} else {
			this.data.onAceptar(this.localidadesSucursal.length > 1 ? this.localidadControl.value : this.localidadesSucursal[0]);
			this.dialogRef.close();
		}
	}

}