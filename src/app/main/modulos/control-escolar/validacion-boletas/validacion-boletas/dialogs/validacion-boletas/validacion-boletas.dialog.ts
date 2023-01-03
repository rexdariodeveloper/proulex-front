import { Component, Inject } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { AlumnoComboProjection } from "@app/main/modelos/alumno";
import { AlumnorGupoBoletaProjection } from "@app/main/modelos/alumno-grupo";
import { fuseAnimations } from "@fuse/animations";

export interface ValidacionBoletasDialogData {
    esValidar?: boolean;
    alumnoGrupoBoleta?: AlumnorGupoBoletaProjection;
}

@Component({
    selector: 'app-validacion-boletas-dialog',
    templateUrl: 'validacion-boletas.dialog.html',
    styleUrls: ['validacion-boletas.dialog.scss'],
    animations: fuseAnimations
})
export class ValidacionBoletasDialogComponent {

    constructor(
        public _dialogRef: MatDialogRef <ValidacionBoletasDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: ValidacionBoletasDialogData
    ) { 
    }

    cerrarModal(){
        this._dialogRef.close();
    }
}