import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { PAProfesorComboProjection } from '@app/main/modelos/paprofesor-categoria';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { TranslateService } from '@ngx-translate/core';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { takeUntil } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PrecioIncompanyService } from '../../precio-incompany.service';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarSalarioData {
	zonas: ControlMaestroMultipleComboProjection[];
	programas: any[];
	idiomas: any[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-salario',
	templateUrl: 'agregar-salario.dialog.html',
	animations: fuseAnimations
})
export class AgregarSalarioComponent {

	zonas: ControlMaestroMultipleComboProjection[];
	programas: any[];
	idiomas: any[];
	zonaControl: FormControl = new FormControl(null);
	programaControl: FormControl = new FormControl(null);
	idiomaControl: FormControl = new FormControl(null);
	modalidades: any[];
	horarios: any[];
	modalidadControl: FormControl = new FormControl(null);
	horarioControl: FormControl = new FormControl(null);
	precioVenta: number;
	porcentajeTransporte: number;

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
	@ViewChild('horarioSelect') horarioSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < AgregarSalarioComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarSalarioData,
		public validatorService: ValidatorService,
		private translate: TranslateService,
		public _precioIncompanyService: PrecioIncompanyService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.programaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			if(this.programaControl.value && this.programaControl.value.length >0 && this.idiomaControl.value && this.idiomaControl.value.length >0){
				let json ={
					programas: this.programaControl.value,
					idiomas: this.idiomaControl.value
				}
				this._precioIncompanyService.getModalidades(json).then(value =>{
					this.modalidadSelect.setDatos(value.data);
					this.horarioControl.reset();
				});
			}
		});

		this.idiomaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			if(this.programaControl.value && this.programaControl.value.length >0 && this.idiomaControl.value && this.idiomaControl.value.length >0){
				let json ={
					programas: this.programaControl.value,
					idiomas: this.idiomaControl.value
				}
				this._precioIncompanyService.getModalidades(json).then(value =>{
					this.modalidadSelect.setDatos(value.data);
					this.horarioControl.reset();
				});
			}
		});
		this.modalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
			if(this.modalidadControl.value){
				let horarios = this.modalidadControl.value.horarios;
				this.horarioSelect.setDatos(horarios);
			}
		})
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarSalarioData) {
		this.zonas = data.zonas;
		this.programas = data.programas;
		this.idiomas = data.idiomas;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.zonaControl.value && this.programaControl.value && this.idiomaControl.value 
			&& this.modalidadControl.value && this.horarioControl.value && this.precioVenta 
			&& this.porcentajeTransporte){
			let datos = new FormArray([]);
			this.programaControl.value.forEach(programa =>{
				this.idiomaControl.value.forEach(idioma =>{
					this.horarioControl.value.forEach(horario =>{
						let form: FormGroup = this._formBuilder.group({
				            id: [null],
				            tabuladorId: new FormControl(null),
				            zona: this.zonaControl,
				            precioVenta: new FormControl(this.precioVenta),
				            porcentajeTransporte: new FormControl(this.porcentajeTransporte),
				            idioma: new FormControl(idioma),
				            programa: new FormControl(programa),
				            modalidad: this.modalidadControl,
				            horario: new FormControl(horario),
				            activo: true
				        });
				        datos.push(form);
					});
							
				});
			});
			this.dialogRef.close(datos);
		}else{
			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
		}
		
	}

}