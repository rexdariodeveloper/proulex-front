import { Component, Inject, ViewEncapsulation } from "@angular/core";
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DepartamentoComboResponsabilidadProjection } from "@app/main/modelos/departamento";
import { SolicitudNuevaContratacionDetalleEditarProjection } from "@app/main/modelos/solicitud-nueva-contratacion-detalle";
import { SolicitudRenovacionContratacionEditarProjection } from "@app/main/modelos/solicitud-renovacion-contratacion";
import { fuseAnimations } from "@fuse/animations";
import { DepartamentoComboProjection } from "@models/departamento";
import { ValidatorService } from "@services/validators.service";
import * as moment from 'moment';

export interface RenovacionEditarDialogModel {
    fechaFin: Date,
    puesto: DepartamentoComboProjection,
    sueldoMensual: number
}

export interface RenovacionEditarDialogData {
    detalle: SolicitudNuevaContratacionDetalleEditarProjection;
    listaDepartamento: DepartamentoComboResponsabilidadProjection[];
    onAceptar: (detalle: SolicitudNuevaContratacionDetalleEditarProjection, empleadoContrato: RenovacionEditarDialogModel) => void;
}

@Component({
    selector: 'app-renovacion-editar-dialog',
    templateUrl: 'renovacion-editar.dialog.html',
    styleUrls: ['renovacion-editar.dialog.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})

export class RenovacionEditarDialogComponent {

    detalle: SolicitudNuevaContratacionDetalleEditarProjection;
    form: FormGroup;
    listaDepartamento: DepartamentoComboResponsabilidadProjection[] = [];

    constructor(
        public _dialogRef: MatDialogRef <RenovacionEditarDialogComponent>,
        private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: RenovacionEditarDialogData,
        public _validatorService: ValidatorService
    ) {
        this.detalle = data.detalle;
        this.listaDepartamento = data.listaDepartamento;

        this.form = this.createForm();
        this.form.enable();
    }

    cancelar(): void {
		this._dialogRef.close();
	}

    aceptar(): void {
        // Verificar si estan validaciones del Form
        if (this.form.valid) {
            this.data.onAceptar(this.detalle, this.form.getRawValue());
		    this._dialogRef.close();
        } else {
            // validate all form fields
            for (var i in this.form.controls) {
                if(this.form.controls[i].invalid){
                    this.form.controls[i].markAsTouched();
                }
            }
        }
		
	}

    createForm(): FormGroup {
		let form = this._formBuilder.group({
			fechaInicio: new FormControl(this.detalle.empleado.empleadoContrato.fechaInicio ? moment(this.detalle.empleado.empleadoContrato.fechaInicio).format('YYYY-MM-DD') : null, [Validators.required]),
			fechaFin: new FormControl(this.detalle.empleado.empleadoContrato.fechaFin ? moment(this.detalle.empleado.empleadoContrato.fechaFin).format('YYYY-MM-DD') : null, [Validators.required, this.minDateValidator(new Date(this.detalle.empleado.empleadoContrato.fechaInicio))]),
            puesto: new FormControl(this.detalle.empleado.empleadoContrato.puesto, [Validators.required]),
            sueldoMensual: new FormControl(this.detalle.empleado.empleadoContrato.sueldoMensual, [Validators.required])
		});

		return form;
	}

    minDateValidator(minDate: Date): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            // parse control value to Date
            const date = new Date(control.value);
            // check if control value is superior to date given in parameter
            if (minDate.getTime() < date.getTime()) {
                return null;
            } else {
                return { 'min': { value: control.value, expected: minDate } };
      
            }
        };
    }

    isRequired(campo: string, form: FormGroup) {
        let form_field = form.get(campo);
        if (!form_field.validator) {
            return false;
        }
    
        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);
    }
}