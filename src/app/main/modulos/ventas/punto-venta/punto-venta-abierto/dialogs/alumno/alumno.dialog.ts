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
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { takeUntil } from 'rxjs/operators';
import { PuntoVentaAbiertoService } from '../../punto-venta-abierto.service';
import { BecaUDGListadoProjection } from '@app/main/modelos/becas-udg';
import { ProgramaIdiomaCertificacionValeListadoPVProjection } from '@app/main/modelos/programa-idioma-certificacion-vale';

export interface PuntoVentaAlumnoDialogData {
	grupoId: number;
	grupoEsJobsSems: boolean;
	articuloId: number;
	alumnos: AlumnoComboProjection[];
	localidadesSucursal: LocalidadComboProjection[];
	activarBecas: boolean;
	activarValesCertificacion: boolean;
	pedirCantidad: boolean;
	onAceptar: (alumno: AlumnoComboProjection, becaUDGId: number, programaIdiomaCertificacionValeId: number, localidad: LocalidadComboProjection, cantidad: number) => void;
	onNuevoAlumno: (localidad: LocalidadComboProjection, cantidad: number) => void;
}

@Component({
	selector: 'punto-venta-alumno-dialog',
	templateUrl: 'alumno.dialog.html',
})
export class PuntoVentaAlumnoDialogComponent {

	grupoId: number;
	articuloId: number;
	grupoEsJobsSems: boolean;
	alumnos: AlumnoComboProjection[];
	localidadesSucursal: LocalidadComboProjection[];
	activarBecas: boolean;
	activarValesCertificacion: boolean;
	pedirCantidad: boolean;

    alumnoControl: FormControl = new FormControl(null,[]);
    localidadControl: FormControl = new FormControl(null,[]);
    becaDisponibleControl: FormControl = new FormControl(null,[]);
    valeCertificacionDisponibleControl: FormControl = new FormControl(null,[]);
	entregarCartaCompromiso: boolean = false;
	cantidadControl: FormControl = new FormControl(null,[Validators.min(1)])

	becaUDG: BecaUDGListadoProjection = null;
	valeCertificacion: ProgramaIdiomaCertificacionValeListadoPVProjection = null;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaAlumnoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaAlumnoDialogData,
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
		// Subscribe to update becaAlumno on changes
		this._puntoVentaAbiertoService.onBecaAlumnoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onBecaAlumnoChanged.next(null);
					this.becaUDG = datos.beca;
					if(!!this.becaUDG){
						this.becaDisponibleControl.setValue(
							this.becaUDG.codigoBeca
							+ '-' + String(((this.becaUDG.descuento || 0)*100).toFixed(0)) + '%'
							+ '-' + this.becaUDG.curso
							+ ' ' + this.becaUDG.modalidad
							+ ' ' + this.becaUDG.nivel
						);
					}
				}
			});
		// Subscribe to update valeCertificacionAlumno on changes
		this._puntoVentaAbiertoService.onValeCertificacionAlumnoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos){
					this._puntoVentaAbiertoService.onValeCertificacionAlumnoChanged.next(null);
					this.valeCertificacion = datos.programaIdiomaCertificacionVale;
					if(!!this.valeCertificacion){
						this.valeCertificacionDisponibleControl.setValue(
							this.valeCertificacion.certificacion
							+ '-' + String(this.valeCertificacion.descuento.toFixed(0)) + '%'
						);
					}
				}
			});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: PuntoVentaAlumnoDialogData) {
		this.grupoId = data.grupoId;
		this.articuloId = data.articuloId;
		this.grupoEsJobsSems = data.grupoEsJobsSems;
		this.alumnos = data.alumnos;
		this.localidadesSucursal = data.localidadesSucursal;
		this.activarBecas = data.activarBecas;
		this.activarValesCertificacion = data.activarValesCertificacion;
		this.pedirCantidad = data.pedirCantidad;

		this.alumnoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(alumno => {
			if(this.activarBecas && !!alumno && !!this.grupoId){
				this._puntoVentaAbiertoService.getBecaAlumno(alumno.id,this.grupoId);
				this.valeCertificacion = null;
			}else if(this.activarValesCertificacion && !!alumno && !!this.articuloId){
				this._puntoVentaAbiertoService.getValeCertificacionAlumno(alumno.id,this.articuloId);
				this.becaUDG = null;
			}else{
				this.becaUDG = null;
				this.valeCertificacion = null;
			}
		})
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!this.alumnoControl?.value?.id) {
			this._matSnackBar.open('Selecciona un alumno', 'OK', {
                duration: 5000,
            });
		} else if (!!this.localidadesSucursal?.length && this.localidadesSucursal.length > 1 && !this.localidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una localidad', 'OK', {
                duration: 5000,
            });
		} else if (this.grupoEsJobsSems && !this.entregarCartaCompromiso) {
			this._matSnackBar.open('Se debe entregar carta compromiso a alumnos JOBS SEMS', 'OK', {
                duration: 5000,
            });
		} else if (this.pedirCantidad && (!this.cantidadControl?.value || this.cantidadControl.value <= 0)) {
			this._matSnackBar.open('Ingresa una cantidad positiva', 'OK', {
                duration: 5000,
            });
		} else {
			if(!!this.localidadesSucursal?.length && this.localidadesSucursal.length == 1){
				this.data.onAceptar(this.alumnoControl.value,this.becaUDG?.id || null,this.valeCertificacion?.id || null,this.localidadesSucursal[0], Number(this.cantidadControl?.value || 1));
			}else{
				this.data.onAceptar(this.alumnoControl.value,this.becaUDG?.id || null,this.valeCertificacion?.id || null,this.localidadControl.value, Number(this.cantidadControl?.value || 1));
			}
			this.dialogRef.close();
		}
	}

    onNuevoAlumno(){
		if (!!this.localidadesSucursal?.length && this.localidadesSucursal.length > 1 && !this.localidadControl?.value?.id) {
			this._matSnackBar.open('Selecciona una localidad', 'OK', {
                duration: 5000,
            });
		} else if (this.pedirCantidad && (!this.cantidadControl?.value || this.cantidadControl.value <= 0)) {
			this._matSnackBar.open('Ingresa una cantidad positiva', 'OK', {
                duration: 5000,
            });
		} else {
			this.data.onNuevoAlumno(this.localidadControl.value || this.localidadesSucursal[0], Number(this.cantidadControl?.value || 1));
			this.dialogRef.close();
		}
    }

}