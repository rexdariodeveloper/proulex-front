import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';

export interface PuntoVentaCobroExitosoDialogData {
	codigosOV: string[];
	onCerrar: () => void;
}

@Component({
	selector: 'punto-venta-cobro-exitoso-dialog',
	templateUrl: 'cobro-exitoso.dialog.html',
})
export class PuntoVentaCobroExitosoDialogComponent {

	codigosOV: string = '';

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaCobroExitosoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaCobroExitosoDialogData,
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

	setData(data: PuntoVentaCobroExitosoDialogData) {
		this.codigosOV = data.codigosOV.join(',');
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		this.dialogRef.close();
		this.data.onCerrar();
	}

}