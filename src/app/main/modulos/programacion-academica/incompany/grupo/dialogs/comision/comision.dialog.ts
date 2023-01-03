import { Component, ElementRef, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ProgramaGrupoIncompanyComisionEditarProjection } from "@app/main/modelos/programa-grupo-incompany-comision";
import { fuseAnimations } from "@fuse/animations";
import { UsuarioComboProjection } from "@models/usuario";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

const MAX_28: number = 9999999999999999999999999999.99;

export interface ComisionData {
    esNuevo: boolean;
	comisionForm: FormGroup;
	listaUsuario: UsuarioComboProjection[];
    precioVenta: number;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'comision-dialog',
	templateUrl: 'comision.dialog.html',
	animations: fuseAnimations
})
export class ComisionComponent {

    esNuevo: boolean = true;
    listaUsuario: UsuarioComboProjection[] = [];
    comisionForm: FormGroup;
    precioVenta: number;

    // Private
	private _unsubscribeAll: Subject < any > ;

    constructor(
        public _dialogRef: MatDialogRef <ComisionComponent>,
		@Inject(MAT_DIALOG_DATA) public data: ComisionData,
		public _validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _translateService: TranslateService,
		private _el: ElementRef
    ){
        // Set the private defaults
		this._unsubscribeAll = new Subject();

        this.setData(data);
    }

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

    setData(data: ComisionData) {
        this.esNuevo = data.esNuevo;
		this.listaUsuario = data.listaUsuario;
        this.comisionForm = data.comisionForm;
        this.precioVenta = data.precioVenta;
        
        this.comisionForm.controls.porcentaje.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((porcentaje: number) =>{
            if(porcentaje){
                let montoComision: number = parseFloat((this.precioVenta * (porcentaje / 100)).toFixed(2));
                this.comisionForm.controls.montoComision.setValue(montoComision);
            }
        });
	}

    // createComisionFormGroup(comision: ProgramaGrupoIncompanyComisionEditarProjection): FormGroup{
	// 	comision = comision ? comision : new ProgramaGrupoIncompanyComisionEditarProjection();

	// 	if(comision.id == null){
	// 		criterio.modalidad = this.modalidad;
	// 	}

	// 	let form: FormGroup = this._formBuilder.group({
    //         id:[criterio.id],
    //         incompanyGrupoId: new FormControl(criterio.grupoId),
    //         actividadEvaluacion: new FormControl(criterio.actividadEvaluacion, [Validators.required]),
    //         modalidad: new FormControl(criterio.modalidad),
    //         score: new FormControl(criterio.score, [Validators.required]),
    //         time: new FormControl(criterio.time, [Validators.required]),
	// 		testFormat: new FormControl(criterio.testFormat, [Validators.required]),
    //         fechaAplica: new FormControl(criterio.fechaAplica ? moment(criterio.fechaAplica).format('YYYY-MM-DD') : null),
    //         activo: new FormControl(criterio.activo != null ? criterio.activo: true),
    //         dias: new FormControl(criterio.dias)
    //     });

	// 	return form;
	// }

    cancelar(): void {
		this._dialogRef.close();
	}

	aceptar(): void {
		if(this.comisionForm.valid)
			this._dialogRef.close(this.comisionForm);
		else{
			let campoKey = '';
			for (const key of Object.keys(this.comisionForm.controls)) {
				if(this.comisionForm.controls[key].invalid){
					this.comisionForm.controls[key].markAsTouched();
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