import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DocumentosConfiguracionRH } from '@app/main/modelos/documentos-configuracion-rh';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { fuseAnimations } from '@fuse/animations';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ValidatorService } from '@services/validators.service';
import { Subject } from 'rxjs';

export interface TipoAsistenciaDialogModel {
    id: number,
    tipoOpcionId: number,
    tipoVigenciaId: number,
    tipoTiempoId: number,
    vigenciaCantidad: number
}

export interface TipoOpcionDialogData {
    tipoContrato: string,
    tipoDocumento: string,
    listaTipoOpcion: ControlMaestroMultipleComboProjection[],
    listaTipoVigencia: ControlMaestroMultipleComboProjection[],
    listaTipoTiempo: ControlMaestroMultipleComboProjection[],
	documentosConfiguracionRH: DocumentosConfiguracionRH,
	onAceptar: (data: TipoAsistenciaDialogModel) => void;
}

@Component({
    selector: 'app-tipo-opcion-dialog',
    templateUrl: 'tipo-opcion.dialog.html',
    styleUrls: ['tipo-opcion.dialog.scss'],
    animations: fuseAnimations
})
export class TipoOpcionDialogComponent {

    tipoContrato: string;
    tipoDocumento: string;
    listaTipoOpcion: ControlMaestroMultipleComboProjection[];
    listaTipoVigencia: ControlMaestroMultipleComboProjection[];
    listaTipoTiempo: ControlMaestroMultipleComboProjection[];
    documentosConfiguracionRH: DocumentosConfiguracionRH;

    form: FormGroup;

    private _unsubscribeAll: Subject < any >;

    constructor(
        public _dialogRef: MatDialogRef <TipoOpcionDialogComponent>,
        private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: TipoOpcionDialogData,
        public validatorService: ValidatorService
    ) {
        this._unsubscribeAll = new Subject();
        this.tipoContrato = data.tipoContrato;
        this.tipoDocumento = data.tipoDocumento;
        this.listaTipoOpcion = data.listaTipoOpcion;
        this.listaTipoVigencia = data.listaTipoVigencia;
        this.listaTipoTiempo = data.listaTipoTiempo;
        this.documentosConfiguracionRH = data.documentosConfiguracionRH;

        this.form = this.createForm();
        this.form.enable();
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    cancelar(): void {
		this._dialogRef.close();
	}

    aceptar(): void {
        // Verificar si estan validaciones del Form
        if (this.form.valid) {
            this.data.onAceptar(this.form.getRawValue());
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

    onChangeTipoOpcion(){
        // Obtenemos el ID de Tipo de Opcion desde FORM
        const tipoOpcionId = this.form.get('tipoOpcionId').value;

        // Limpiamos los datos
        this.form.controls.tipoVigenciaId.setValue(null);
        this.form.controls.tipoTiempoId.setValue(null);
        this.form.controls.vigenciaCantidad.setValue(null);
        
        if(tipoOpcionId == ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OPCIONAL || tipoOpcionId == ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OBLIATORIO){
            // Agregamos las validaciones
            this.form.controls.tipoVigenciaId.setValidators(Validators.required);
            
        }else{
            // Limpiamos las validaciones
            this.form.controls.tipoVigenciaId.clearValidators();
            this.form.controls.tipoTiempoId.clearValidators();
            this.form.controls.vigenciaCantidad.clearValidators();

            // Actualizamos los datos de las validaciones
            this.form.controls.tipoVigenciaId.updateValueAndValidity();
            this.form.controls.tipoTiempoId.updateValueAndValidity();
            this.form.controls.vigenciaCantidad.updateValueAndValidity();
        }
    }

    onChangeTipoVigencia(){
        // Obtenemos el ID de Tipo de Vigencia desde FORM
        const tipoVigenciaId = this.form.get('tipoVigenciaId').value;

        // Limpiamos los datos
        this.form.controls.tipoTiempoId.setValue(null);
        this.form.controls.vigenciaCantidad.setValue(null);
        
        if(tipoVigenciaId == ControlesMaestrosMultiples.CMM_GEN_TipoVigencia.VIGENCIA){
            // Agregamos las validaciones
            this.form.controls.tipoTiempoId.setValidators(Validators.required);
            this.form.controls.vigenciaCantidad.setValidators([Validators.required, Validators.min(0)]);
            
        }else{
            // Limpiamos las validaciones
            this.form.controls.tipoTiempoId.clearValidators();
            this.form.controls.vigenciaCantidad.clearValidators();

            // Actualizamos los datos de las validaciones
            this.form.controls.tipoTiempoId.updateValueAndValidity();
            this.form.controls.vigenciaCantidad.updateValueAndValidity();
        }
    }

    onChangeTipoTiempo(){
        // Obtenemos el ID de Tipo de Tiempo desde FORM
        const tipoTiempoId = this.form.get('tipoTiempoId').value;

        // Limpiamos los datos
        this.form.controls.vigenciaCantidad.setValue(null);
    }

    createForm(): FormGroup {
		let form = this._formBuilder.group({
            id: [this.documentosConfiguracionRH.id],
			tipoOpcionId: [this.documentosConfiguracionRH.tipoOpcionId],
			tipoVigenciaId: [this.documentosConfiguracionRH.tipoVigenciaId],
			tipoTiempoId: [this.documentosConfiguracionRH.tipoTiempoId],
            vigenciaCantidad: [this.documentosConfiguracionRH.vigenciaCantidad]
		});

		return form;
	}
}
