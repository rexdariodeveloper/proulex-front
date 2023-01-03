import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExamenesCertificacionesService } from '../../examenes-certificaciones.service';
import { takeUntil } from 'rxjs/operators';
import { AlumnoExamenCertificacion } from '@app/main/modelos/alumno-examen-certificacion';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';

export interface DetailDialogData {
	id: number,
	onAceptar: (param) => void;
}

@Component({
	selector: 'detail-dialog',
	templateUrl: 'detail.dialog.html',
    styleUrls: ['./detail.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})
export class DetailDialogComponent {

	private _unsubscribeAll: Subject < any > ;
	public form: FormGroup = null;
	public alumnoExamenCertificacion: AlumnoExamenCertificacion = null;
	public isExamen: boolean = false;
	public currentId: number;
	public cursos: ProgramaIdiomaComboProjection[];
	public nivelMaximo: number = 0;
	public isLoading: boolean = true;
	public isDisabled: boolean = true;

	constructor(
		public _examenesCertiicacionesService: ExamenesCertificacionesService,
		public dialogRef: MatDialogRef<DetailDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DetailDialogData,
		public validatorService: ValidatorService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._unsubscribeAll = new Subject();
		this.currentId = data?.id;
	}

	ngOnInit(): void {
		this._examenesCertiicacionesService.getDetalle(this.currentId)
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe( (datos: any) => {
				if(!!datos && datos?.status == 200){
					this.alumnoExamenCertificacion = datos?.data?.detalle;
					this.cursos = datos?.data?.cursos;
					this.isExamen = this.alumnoExamenCertificacion?.tipoId == ControlesMaestrosMultiples.CMM_ALUEC_Tipo.EXAMEN;
					this.form = this.createForm();
					let estatusEdicion: number[] = [];
					estatusEdicion.push(ControlesMaestrosMultiples.CMM_ALUEC_Estatus.EN_PROCESO);
					estatusEdicion.push(ControlesMaestrosMultiples.CMM_ALUEC_Estatus.FINALIZADO);
					this.isDisabled = !estatusEdicion.includes(this.alumnoExamenCertificacion.estatusId);
					if(this.isDisabled)
						this.form.disable({emitEvent: false});
					this.isLoading = false;
				} else {
					this._snackBar.open('No fue posible recuperar la información.', 'OK', {duration: 5000,});
					this.dialogRef.close();
				}
			});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	createForm(): FormGroup {
		let form: FormGroup = new FormGroup({});

		Object.keys(this.alumnoExamenCertificacion).forEach((item) => {
			form.addControl(item, new FormControl(this.alumnoExamenCertificacion[item], []));
		});

		form.addControl('alumnoMostrar', new FormControl({value: this.alumnoExamenCertificacion?.alumno?.nombre, disabled: true}, []));
		form.addControl('articuloMostrar', new FormControl({value: this.alumnoExamenCertificacion?.articulo?.nombreArticulo, disabled: true}, []));
		form.addControl('fecha', new FormControl({value: this.alumnoExamenCertificacion?.ordenVentaDetalle?.ordenVenta?.fechaOV, disabled: true}, []));
		form.addControl('codigo', new FormControl({value: this.alumnoExamenCertificacion?.ordenVentaDetalle?.ordenVenta?.codigo, disabled:true} , []));

		form.get('curso').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data: ProgramaIdiomaComboProjection) => {
			if(!!data){
				this.nivelMaximo = data?.numeroNiveles;
				form.get('cursoId').setValue(data?.id);
			}
		});

		if(this.cursos.length === 1)
			form.get('curso').setValue(this.cursos[0]);
			
		let curso = form.get('curso').value;
		if(!!curso){
			this.nivelMaximo = curso?.numeroNiveles;
			form.get('cursoId').setValue(curso?.id);
		}

		return form;
	}

	isRequired(field: string) {
        let form_field = this.form.get(field);
        if (!form_field.validator)
            return false;
        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);
    }

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		let calificacion = Number(this.form.get('calificacion').value);
		let nivel = Number(this.form.get('nivel').value);
		
		if(calificacion > 100.00){
			this._snackBar.open('La calificación máxima es 100.00', 'OK', {duration: 5000,});
			return;
		}
		if(nivel > this.nivelMaximo){
			this._snackBar.open(`El nivel máximo es ${this.nivelMaximo}`, 'OK', {duration: 5000,});
			return;
		}
		if(nivel == null || nivel == 0){
			this._snackBar.open(`El nivel es obligatorio`, 'OK', {duration: 5000,});
			return;	
		}
        this.dialogRef.close();
		this.form.get('calificacion').setValue(calificacion > 0 ? calificacion : null);
		this.form.get('nivel').setValue(nivel > 0 ? nivel : null);
		this.data.onAceptar(this.form.getRawValue());
	}

}