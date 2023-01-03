import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FormControl, Validators } from '@angular/forms';
import { PuntoVentaAbiertoService } from '../../punto-venta-abierto.service';
import { takeUntil } from 'rxjs/operators';
import { InscripcionSinGrupoListadoProjection } from '@app/main/modelos/inscripcion-sin-grupo';
import { ProgramaGrupoComboProjection } from '@app/main/modelos/programa-grupo';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';

export interface PuntoVentaAlumnoSinGrupoDialogData {
	inscripcionSinGrupo: InscripcionSinGrupoListadoProjection;
    tiposGrupo: ControlMaestroMultipleComboSimpleProjection[];
	localidadesSucursal: LocalidadComboProjection[];
	onAceptar: (grupo: ProgramaGrupoComboProjection, localidad: LocalidadComboProjection) => void;
}

@Component({
	selector: 'punto-venta-alumno-sin-grupo-dialog',
	templateUrl: 'alumno-sin-grupo.dialog.html',
})
export class PuntoVentaAlumnoSinGrupoDialogComponent {

	inscripcionSinGrupo: InscripcionSinGrupoListadoProjection;
    tiposGrupo: ControlMaestroMultipleComboSimpleProjection[];
    grupos: ProgramaGrupoComboProjection[];
	localidadesSucursal: LocalidadComboProjection[];

    tipoGrupoControl: FormControl = new FormControl(null,[]);
    grupoControl: FormControl = new FormControl(null,[]);
	localidadControl: FormControl = new FormControl(null,[]);

    nombreAlumno: string = '';

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaAlumnoSinGrupoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaAlumnoSinGrupoDialogData,
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
		// Subscribe to update datosAlumnoSinGrupo on changes
		this._puntoVentaAbiertoService.onDatosGruposAlumnoSinGrupoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onDatosGruposAlumnoSinGrupoChanged.next(null);
					
					this.grupos = datos.grupos;

					if(!this.grupos?.length){
						this._matSnackBar.open('No se encontraron grupos para el tipo de grupo seleccionado', 'OK', {
							duration: 10000,
						});
					}
				}
			});

		this.tipoGrupoControl.valueChanges.pipe(takeUntil( this._unsubscribeAll)).subscribe(tipoGrupo => {
			this._puntoVentaAbiertoService.getDatosAlumnoSinGrupo(this.inscripcionSinGrupo.id,tipoGrupo.id);
		});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: PuntoVentaAlumnoSinGrupoDialogData) {
		this.inscripcionSinGrupo = data.inscripcionSinGrupo;
        this.tiposGrupo = data.tiposGrupo;
        this.grupos = [];
		this.localidadesSucursal = data.localidadesSucursal;

        this.nombreAlumno = this.inscripcionSinGrupo.alumnoNombre + ' ' + this.inscripcionSinGrupo.alumnoPrimerApellido + (!!this.inscripcionSinGrupo.alumnoSegundoApellido ? (' ' + this.inscripcionSinGrupo.alumnoSegundoApellido) : '');
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!this.tipoGrupoControl?.value?.id) {
			this._matSnackBar.open('Selecciona un tipo de grupo', 'OK', {
                duration: 5000,
            });
		} if (!this.grupoControl?.value?.id) {
			this._matSnackBar.open('Selecciona un grupo', 'OK', {
                duration: 5000,
            });
		} else if (!!this.localidadesSucursal?.length && this.localidadesSucursal.length > 1 && !this.localidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una localidad', 'OK', {
                duration: 5000,
            });
		} else {
			if(!!this.localidadesSucursal?.length && this.localidadesSucursal.length == 1){
				this.data.onAceptar(this.grupoControl.value,this.localidadesSucursal[0]);
			}else{
				this.data.onAceptar(this.grupoControl.value,this.localidadControl.value);
			}
			this.dialogRef.close();
		}
	}

}