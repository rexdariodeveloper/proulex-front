import { Component, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { fuseAnimations } from "@fuse/animations";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { ListadoValeCertificacionService } from "../../listado-vale-certificacion.service";

export interface ListadoValeCertificacionReenviarDialogData {
	alumnoGrupoId: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'listado-vale-certificacion-reenviar-dialog',
	templateUrl: './listado-vale-certificacion-reenviar.dialog.html',
	animations: fuseAnimations
})
export class ListadoValeCertificacionReenviarDialog {
    alumnoGrupoId: number
    form: FormGroup;

    private _unsubscribeAll: Subject <any>;

    constructor(
		public _dialogRef: MatDialogRef <ListadoValeCertificacionReenviarDialog> ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ListadoValeCertificacionReenviarDialogData,
		public _validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _translateService: TranslateService,
		private _el: ElementRef,
        private _listadoService: ListadoValeCertificacionService
	) {
        this._unsubscribeAll = new Subject();

		this.setData(data);
	}

    ngOnInit(): void {
        //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
        //Add 'implements OnInit' to the class.
        this._listadoService.onCorreoAlumno.pipe(takeUntil(this._unsubscribeAll)).subscribe((email: string) => {
            console.log('email')
            console.log(email)
            if(email){
              this.form.controls.email.setValue(email);
            }
        });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
      }

    setData(data: ListadoValeCertificacionReenviarDialogData) {
		this.alumnoGrupoId = data.alumnoGrupoId;
		this.form = this.createForm();
        this._listadoService.getCorreoAlumno(this.alumnoGrupoId);
	}

    createForm(): FormGroup{
        let form: FormGroup = this._formBuilder.group({
            email: new FormControl(null, [Validators.required, Validators.email])
        });
        return form;
    }

    cancelar(): void {
		this._dialogRef.close();
	}

	enviar(): void {
		if(this.form.valid){
            this._matSnackBar.open(this._translateService.instant('Estamos en proceso (Aproximadamente)'), 'OK', {
				duration: 5000,
			});
			this._dialogRef.close();
        }
		else{
			let campoKey = '';
			for (const key of Object.keys(this.form.controls)) {
				if(this.form.controls[key].invalid){
					this.form.controls[key].markAsTouched();
					if(campoKey == '')
					  	campoKey = key;
				}
			}

			const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
			if (invalidControl) {
				invalidControl.focus();
			}

			this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}
}