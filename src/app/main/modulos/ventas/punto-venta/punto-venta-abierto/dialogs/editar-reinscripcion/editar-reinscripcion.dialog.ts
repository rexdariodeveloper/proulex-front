import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { AlumnoComboProjection } from '@app/main/modelos/alumno';
import { FormControl, Validators } from '@angular/forms';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { PAModalidadHorarioComboProjection } from '@app/main/modelos/pamodalidad-horario';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { PuntoVentaAbiertoService } from '../../punto-venta-abierto.service';
import { takeUntil } from 'rxjs/operators';

export interface PuntoVentaEditarReinscripcionDialogData {
	alumno: string;
	curso: string;
	idiomaId: number;
	programaId: number;
	modalidadId: number;
	horarioId: number;
    repetirNivel: boolean;
    nivel: number;
	onAceptar: (datos: any) => void;
}

@Component({
	selector: 'punto-venta-editar-reinscripcion-dialog',
	templateUrl: 'editar-reinscripcion.dialog.html',
})
export class PuntoVentaEditarReinscripcionDialogComponent {

	alumno: string;
	curso: string;
	idiomaId: number;
	programaId: number;
	modalidadDefaultId: number;
	horarioDefaultId: number;
	repetirNivel: boolean;
	nivel: number;

    modalidadControl: FormControl = new FormControl(null,[Validators.required]);
    horarioControl: FormControl = new FormControl(null,[Validators.required]);
    comentarioControl: FormControl = new FormControl(null,[]);
    nivelControl: FormControl = new FormControl(null,[]);

    modalidades: PAModalidadComboProjection[] = [];
    horarios: PAModalidadHorarioComboProjection[] = [];

	@ViewChild('selectModalidades') selectModalidades: PixvsMatSelectComponent;
	@ViewChild('selectHorarios') selectHorarios: PixvsMatSelectComponent;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaEditarReinscripcionDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaEditarReinscripcionDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		public _puntoVentaAbiertoService: PuntoVentaAbiertoService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this._puntoVentaAbiertoService.cargando = true;

		// Subscribe to update programas on changes
		this._puntoVentaAbiertoService.onReinscripcionesModalidadesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onReinscripcionesModalidadesChanged.next(null);
					this.modalidades = datos.modalidades;
					this.selectModalidades.setDatos(this.modalidades);
					if(!!this.modalidadDefaultId){
						this.modalidadControl.setValue(this.modalidades.find(modalidad => {
							return modalidad.id == this.modalidadDefaultId;
						}));
						this.modalidadDefaultId = null;
					}
				}
			});

		// Subscribe to update programas on changes
		this._puntoVentaAbiertoService.onReinscripcionesHorariosChanged
		.pipe(takeUntil(this._unsubscribeAll))
		.subscribe(datos => {
			if(datos){
				this._puntoVentaAbiertoService.onReinscripcionesHorariosChanged.next(null);
				this.horarios = datos.horarios;
				this.selectHorarios.setDatos(this.horarios);
				if(!!this.horarioDefaultId){
					this.horarioControl.setValue(this.horarios.find(horario => {
						return horario.id = this.horarioDefaultId;
					}));
					this.horarioDefaultId = null;
				}else{
					this.horarioControl.setValue(null);
				}
			}
		});

		// Subscribe to update modalidadControl.valueChanges
		this.modalidadControl.valueChanges
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(value => {
				this._puntoVentaAbiertoService.cargando = true;
				if(!!value){
					this._puntoVentaAbiertoService.getReinscripcionesHorarios(value.id);
				}else{
					this.horarios = [];
					this.selectHorarios.setDatos(this.horarios);
					this.horarioControl.setValue(null);
					this._puntoVentaAbiertoService.cargando = false;
				}
			});

		this._puntoVentaAbiertoService.getReinscripcionesModalidades(this.idiomaId,this.programaId);
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: PuntoVentaEditarReinscripcionDialogData) {
		this.alumno = data.alumno;
        this.curso = data.curso;
		this.idiomaId = data.idiomaId;
		this.programaId = data.programaId;
        this.modalidadDefaultId = data.modalidadId;
        this.horarioDefaultId = data.horarioId;
        this.repetirNivel = data.repetirNivel;
        this.nivel = data.nivel;

		this.nivelControl.setValidators([Validators.required,Validators.min(0),Validators.max(this.nivel)]);
		this.nivelControl.setValue(this.nivel);
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!this.modalidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una modalidad', 'OK', {
                duration: 5000,
            });
		} else if (!this.horarioControl?.value?.id) {
			this._matSnackBar.open('Selecciona un horario', 'OK', {
                duration: 5000,
            });
		} else if (this.nivelControl?.invalid) {
			this._matSnackBar.open('Ingresa un nivel correcto', 'OK', {
                duration: 5000,
            });
		} else {
			this.data.onAceptar({
				modalidadId: this.modalidadControl.value.id,
				modalidad: this.modalidadControl.value.nombre,
				horarioId: this.horarioControl.value.id,
				horario: this.horarioControl.value.nombre,
				comentario: this.comentarioControl.value,
				nivel: this.nivelControl.value
			});
			this.dialogRef.close();
		}
	}

}