import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';

export interface PuntoVentaDetalleDialogData {
	nombreArticulo: string;
	onEliminar: () => void;
}

@Component({
	selector: 'punto-venta-detalle-dialog',
	templateUrl: 'detalle.dialog.html',
})
export class PuntoVentaDetalleDialogComponent {

	nombreArticulo: string;

    eliminar: boolean = false;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaDetalleDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaDetalleDialogData,
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

	setData(data: PuntoVentaDetalleDialogData) {
		this.nombreArticulo = data.nombreArticulo;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onEliminar(): void {
		if (!this.eliminar) {
			this.eliminar = true;
		} else {
			this.data.onEliminar();
			this.dialogRef.close();
		}
	}

}