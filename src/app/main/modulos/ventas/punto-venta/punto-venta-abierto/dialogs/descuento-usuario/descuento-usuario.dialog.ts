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

export interface PuntoVentaDescuentoUsuarioDialogData {
	ovDetalleTmpId?: number;
	onAceptar: (monto: number, ovDetalleTmpId?: number) => void;
}

@Component({
	selector: 'punto-venta-descuento-usuario-dialog',
	templateUrl: 'descuento-usuario.dialog.html',
})
export class PuntoVentaDescuentoUsuarioDialogComponent {

	montoControl: FormControl = new FormControl(null,[Validators.required,Validators.min(0)]);
    correoElectronicoControl: FormControl = new FormControl(null,[Validators.required,Validators.email]);
    contrasenaControl: FormControl = new FormControl(null,[Validators.required]);

	mostrarContrasena: boolean = false;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<PuntoVentaDescuentoUsuarioDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: PuntoVentaDescuentoUsuarioDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		public _puntoVentaAbiertoService: PuntoVentaAbiertoService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		// Subscribe to update descuentoUsuario on changes
		this._puntoVentaAbiertoService.onDescuentoUsuarioChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos != null){
					this._puntoVentaAbiertoService.onDescuentoUsuarioChanged.next(null);
					if(!datos){
						this._matSnackBar.open('El monto supera al configurado para el usuario ingresado', 'OK', {
							duration: 5000,
						});
					}else{
						this.data.onAceptar(Number(this.montoControl.value),this.data.ovDetalleTmpId || null);
						this.dialogRef.close();
					}
				}
			});
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		this.montoControl.markAsTouched();
		this.correoElectronicoControl.markAsTouched();
		this.contrasenaControl.markAsTouched();
		if (!this.montoControl?.valid) {
			this._matSnackBar.open('Ingresa un monto de descuento', 'OK', {
                duration: 5000,
            });
		} else if (!this.correoElectronicoControl?.valid) {
			this._matSnackBar.open('Ingresa un correo electrónico válido', 'OK', {
                duration: 5000,
            });
		} else if (!this.contrasenaControl?.valid) {
			this._matSnackBar.open('Ingresa tu contraseña', 'OK', {
                duration: 5000,
            });
		} else {
			this._puntoVentaAbiertoService.validarDescuentoUsuario(Number(this.montoControl.value),this.correoElectronicoControl.value,this.contrasenaControl.value);
		}
	}

	onMostrarContrasena(){
		this.mostrarContrasena = !this.mostrarContrasena;
	}

}