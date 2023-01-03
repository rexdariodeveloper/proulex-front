import { Component, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { fuseAnimations } from "@fuse/animations";
import { ArchivoProjection } from "@models/archivo";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { GruposService } from "../../../grupos/grupos.service";

export interface EvidenciaDialogData {
    grupoCodigo: string;
    onAceptar: (nombre: string, archivo: ArchivoProjection) => void;
}

@Component({
    selector: 'app-evidencia-dialog',
    templateUrl: 'evidencia.dialog.html',
    animations: fuseAnimations
})

export class EvidenciaDialogComponent {

    archivo: ArchivoProjection = null;
    archivosCargando: boolean[] = [];

    form: FormGroup;

    // PDF y los imagenes
    fileExtensions = ['.jpg', '.jpeg', '.png'];

    private _unsubscribeAll: Subject<any>;

    constructor(
        public _dialogRef: MatDialogRef<EvidenciaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: EvidenciaDialogData,
        public _validatorService: ValidatorService,
        private _matSnackBar: MatSnackBar,
        private _gruposService: GruposService,
        private _translate: TranslateService,
        private _formBuilder: FormBuilder
    ) {
        this._unsubscribeAll = new Subject();

        this.createForm();
        this.form.enable();
    }

    ngOnInit(): void {
        this._gruposService.onEvidenciaUploadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivoId => {
            if (archivoId) {
                this._gruposService.onEvidenciaUploadChanged.next(null);
                this._gruposService.getEvidencia(archivoId);
            }
        });

        this._gruposService.onEvidenciaChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivo => {
            if (archivo) {
                this._gruposService.onEvidenciaChanged.next(null);
                this.archivosCargando.pop();

                if (!this.archivosCargando.length) {
                    this.archivo = archivo;
                }
            }
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): void {
        this.form = this._formBuilder.group({
            nombre: new FormControl(null, [Validators.required])
        });
    }

    fileChangeEvent(event: any): void {
        let archivo: File = null;

        if (event?.target?.files?.length) {
            for (let file of event.target.files) { archivo = file; }

            let extension: string = archivo.name.substr(archivo.name.lastIndexOf('.')).toLocaleLowerCase();

            if (!(this.fileExtensions.includes(extension))) {
                this._matSnackBar.open('Solo es posible adjuntar imágenes.', 'OK', {
                    duration: 5000,
                });

                return;
            }
        }

        if (!!archivo) {
            this.archivosCargando = new Array(1).fill(true)

            this._gruposService.subirEvidencia(archivo, this.data.grupoCodigo);
        }
    }

    aceptar(): void {
        if (!this.archivo) {
            this._matSnackBar.open('Favor de adjuntar una imágen.', 'OK', { duration: 5000, });

            return;
        }

        if (this.form.valid) {
            this.data.onAceptar(this.form.controls['nombre'].value, this.archivo);
            this._dialogRef.close();
        }
    }

    cancelar(): void {
        this._dialogRef.close();
    }
}