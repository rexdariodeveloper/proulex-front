import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ValidatorService } from '@services/validators.service';
import { FormControl, Validators } from '@angular/forms';

export class PixvsConfirmComentarioDialogData{
	mensaje: string;
	comentarioObligatorio: boolean;
}

@Component({
    selector: 'pixvs-confirm-dialog',
    templateUrl: './confirm-comentario-dialog.component.html',
    styleUrls: ['./confirm-comentario-dialog.component.scss']
})
export class PixvsConfirmComentarioDialogComponent {
    public confirmMessage: string;

	public comentarioControl: FormControl = new FormControl(null,[]);

    /**
     * Constructor
     *
     * @param {MatDialogRef<FuseConfirmDialogComponent>} dialogRef
     */
    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        public dialogRef: MatDialogRef<PixvsConfirmComentarioDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: PixvsConfirmComentarioDialogData,
		public _matSnackBar: MatSnackBar,
		public validatorService: ValidatorService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		if(this.data.comentarioObligatorio){
			this.comentarioControl.setValidators([Validators.required]);
		}
    }

	onConfirmar(){
		if(this.data.comentarioObligatorio && !this.comentarioControl?.value){
			this._matSnackBar.open('Por favor ingresa un comentario', 'OK', {
				duration: 5000,
			});
			return;
		}
		this.dialogRef.close(this.comentarioControl?.value || null);
	}

}
