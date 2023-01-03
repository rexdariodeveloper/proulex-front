import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ValidatorService } from '@services/validators.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';

const MAX_28: number = 9999999999999999999999999999.99;

export interface PedidoComentariosDialogData {
	comentario: string;
}

@Component({
	selector: 'comentarios-dialog',
	templateUrl: 'comentarios.dialog.html',
})
export class PedidoComentariosDialogComponent {

	comentario: string;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < PedidoComentariosDialogComponent > ,
		@Inject(MAT_DIALOG_DATA) public data: PedidoComentariosDialogData,
		public validatorService: ValidatorService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService
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

	setData(data: PedidoComentariosDialogData) {
		this.comentario = data.comentario;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

}