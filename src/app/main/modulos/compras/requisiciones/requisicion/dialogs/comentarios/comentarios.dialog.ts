import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidatorService } from '@services/validators.service';
import { ArticulosService } from '../../articulos.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';

const MAX_28: number = 9999999999999999999999999999.99;

export interface RequisicionComentariosDialogData {
	comentarios: string;
}

@Component({
	selector: 'comentarios-dialog',
	templateUrl: 'comentarios.dialog.html',
})
export class RequisicionComentariosDialogComponent {

	comentarios: string;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < RequisicionComentariosDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: RequisicionComentariosDialogData,
		public validatorService: ValidatorService,
		public _articulosService: ArticulosService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
		this._articulosService.onArticuloPrecargarChanged.next(null);
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: RequisicionComentariosDialogData) {
		this.comentarios = data.comentarios;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

}