import { Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { AlumnoComboProjection, AlumnoEditarProjection } from '@app/main/modelos/alumno';

export interface AlumnosRepetidosDialogData {
	alumnosRepetidos: AlumnoEditarProjection[];
	onCancelar: () => void;
}

@Component({
	selector: 'alumnos-repetidos-dialog',
	templateUrl: 'alumnos-repetidos.dialog.html',
    styleUrls: ['./alumnos-repetidos.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})
export class AlumnosRepetidosDialogComponent {

	alumnosRepetidos: AlumnoEditarProjection[];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<AlumnosRepetidosDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: AlumnosRepetidosDialogData,
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

	setData(data: AlumnosRepetidosDialogData) {
		this.alumnosRepetidos = data.alumnosRepetidos;
	}

	cancelar(): void {
        this.data.onCancelar();
		this.dialogRef.close();
	}

	onAceptar(): void {
        this.dialogRef.close();
	}

}