import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GrupoService } from '@app/main/modulos/programacion-academica/incompany/grupo/grupo.service';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { FechasHabilesService } from '@services/fechas-habiles.service';

export interface DialogData {
	registro: any;
	mostrarAsistencias: boolean;
	mostrarCalificaciones: boolean;
}

@Component({
	selector: 'calificaciones-asistencias-dialog',
	templateUrl: './calificaciones-asistencias.dialog.html',
	styleUrls: ['./calificaciones-asistencias.dialog.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class DialogComponent {

	registro;
	mostrarCalificaciones = true;
	mostrarAsistencias = true;

	_unsubscribeAll: Subject<any>;

	constructor(
		public dialogRef: MatDialogRef<DialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public _grupoService: GrupoService,
		public fechasHabilesService: FechasHabilesService,
		@Inject(MAT_DIALOG_DATA) public data: DialogData
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	setData(data: DialogData) {
		this.registro = data.registro;
		this.mostrarCalificaciones = data.mostrarCalificaciones;
		this.mostrarAsistencias = data.mostrarAsistencias;

		setTimeout(() => {

		});
	}

	cerrar(): void {
		this.dialogRef.close();
	}
}