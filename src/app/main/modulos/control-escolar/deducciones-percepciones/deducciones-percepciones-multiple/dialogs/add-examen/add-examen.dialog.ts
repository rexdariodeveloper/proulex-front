import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, Validators, FormGroup, FormArray, AbstractControl } from '@angular/forms';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { DeduccionComboProjection } from '@app/main/modelos/deduccion-percepcion';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { DeduccionesPercepcionesService } from '../../../deducciones-percepciones/deducciones-percepciones.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { takeUntil, take } from 'rxjs/operators';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AddExamenData {
	empleados: EmpleadoComboProjection[];
	tipos: ControlMaestroMultipleComboProjection[];
	deducciones: DeduccionComboProjection[];
	percepciones: DeduccionComboProjection[];
	sucursales: SucursalComboProjection[];
	esModificarSueldoHora: boolean;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-examen',
	templateUrl: 'add-examen.dialog.html',
	animations: fuseAnimations
})
export class AddExamenComponent {
	form: FormGroup;
	documentos: FormArray;

	private _unsubscribeAll: Subject < any > ;

	empleados: EmpleadoComboProjection[];
	tipos: ControlMaestroMultipleComboProjection[];
	deducciones: DeduccionComboProjection[];
	percepciones: DeduccionComboProjection[];
	sucursales: SucursalComboProjection[];
	deduccionesPercepciones: any[] = [];
	esModificarSueldoHora: boolean = false;

	@ViewChild('conceptoSelect') conceptoSelect: PixvsMatSelectComponent;

	archivos = [];
	archivosFormArray: FormArray = new FormArray([]);

	constructor(
		public dialogRef: MatDialogRef < AddExamenComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddExamenData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		public _deduccionesPercepcionesService: DeduccionesPercepcionesService,
		private el: ElementRef
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.form = this.createFormGroup();
		this.form.get('deduccionPercepcion').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('deduccionPercepcion').value && this.form.get('empleado').value){
            	this._deduccionesPercepcionesService.getDatosSueldo(this.form.get('empleado').value.id,this.form.get('deduccionPercepcion').value.id).then(result =>{
	            	this.form.get('valorFijo').setValue(Number(result.data.sueldo * (this.form.get('deduccionPercepcion').value.porcentaje/100)).toFixed(2));
	            });
            }
        });

        this.form.get('empleado').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('deduccionPercepcion').value && this.form.get('empleado').value){
            	this._deduccionesPercepcionesService.getDatosSueldo(this.form.get('empleado').value.id,this.form.get('deduccionPercepcion').value.id).then(result =>{
	            	this.form.get('valorFijo').setValue(Number(result.data.sueldo * (this.form.get('deduccionPercepcion').value.porcentaje/100)).toFixed(2));
	            });
            }
        });

        this.form.get('tipoMovimiento').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('tipoMovimiento').value){
            	if(this.form.get('tipoMovimiento').value.id == 2000605){
            		this.conceptoSelect.setDatos(this.deducciones);
            	}else{
            		this.conceptoSelect.setDatos(this.percepciones);
            	}
            }
        });

        this.form.get('cantidadHoras').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('cantidadHoras').value){
            	this.form.get('total').setValue(Number(this.form.get('valorFijo').value * this.form.get('cantidadHoras').value).toFixed(2))
            }
        });
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddExamenData) {
		this.empleados = data.empleados;
		this.tipos = data.tipos;
		this.deducciones = data.deducciones;
		this.percepciones = data.percepciones;
		this.sucursales = data.sucursales;
		this.esModificarSueldoHora = data.esModificarSueldoHora;
	}

	isRequired(campo: string, form: FormGroup) {

        let form_field = form.get(campo);
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);

    }

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.form.valid){
			if(this.archivos && this.archivos.length>0){
				this.setArchivos(this.archivos);
				this.form.addControl('documentos',this.archivosFormArray);
			}
			this.dialogRef.close(this.form);
		}else{
			for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._deduccionesPercepcionesService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
		}
		
	}

	createFormGroup() : FormGroup{
		this.documentos = new FormArray([]);
		let form = this._formBuilder.group({
			id:[null],
			codigo: new FormControl(null),
			empleado: new FormControl(null, [Validators.required]),
			fecha: new FormControl(null, [Validators.required]),
			tipoMovimiento: new FormControl(null, [Validators.required]),
			deduccionPercepcion: new FormControl(null, [Validators.required]),
			valorFijo: new FormControl(null, [Validators.required]),
			cantidadHoras: new FormControl(null, [Validators.required]),
			total: new FormControl(null, [Validators.required]),
			activo: new FormControl(true, [Validators.required]),
			sucursal: new FormControl(null, [Validators.required])
			//documentos: this.documentos
		});

		if(!this.esModificarSueldoHora)
			form.controls['valorFijo'].disable()
		
		return form;
	}

	pdfChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){ archivo = file; }
		}
		if(!!archivo){
			this._deduccionesPercepcionesService.subirArchivo(archivo,"").then(archivoResponse =>{
				this.archivos.push({
					nombreOriginal: archivo.name,
					id:archivoResponse.data
				});
			});
		}
	}

	descargarPDF(archivo: any){
		if(archivo){
			this._deduccionesPercepcionesService.verArchivo(archivo);
		}
	}

	setArchivos(archivos: any[]){
		archivos.forEach(archivo =>{
			let form = this._formBuilder.group({
				id:[null],
				empleadoDeduccionpercepcionId: new FormControl(null),
				archivo: new FormControl(archivo)
			})
			this.archivosFormArray.push(form);
		});
	}

	removeArchivo(index: number){
		this.archivos.splice(index,1);
	}

}