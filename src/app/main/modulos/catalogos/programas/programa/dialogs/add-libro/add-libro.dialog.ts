import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { ProgramaIdiomaLibroMaterialEditarProjection } from '@app/main/modelos/programa-idioma-libro-material';
import { ProgramaIdiomaLibroMaterialReglaEditarProjection } from '@app/main/modelos/programa-idioma-libro-material-regla';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { takeUntil, take } from 'rxjs/operators';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AddlibroData {
	articulos: any[];
	nivel: number;
	carreras: any[];
	programaIdioma: number;
	//codigoProveedor: string;
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'add-libro',
	templateUrl: 'add-libro.dialog.html',
	animations: fuseAnimations
})
export class AddlibroComponent {

	articulos: any[];
	articuloControl: FormControl = new FormControl();
	nivelControl: FormControl = new FormControl();
	aplicaReglas = false;
	articuloFormArray: FormArray;
	form: FormGroup;
	niveles = [];
	nivel: number;
	carreras: any[];
	programaIdioma: number;
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AddlibroComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AddlibroData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
		console.log(data);
		for(var i=0;i<this.nivel;i++){
			this.niveles.push({
				id: (i+1),
				nombre: 'Nivel '+(i+1)
			});
		};

		this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.articuloFormArray = new FormArray([]);
            this.articuloControl.value.forEach(articulo =>{
            	this.articuloFormArray.push(this.createIdiomaLibrosMaterialesForm(articulo));
            });
            console.log(this.articuloFormArray.value);
        });

	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AddlibroData) {
		this.articulos = data.articulos;
		this.nivel = data.nivel;
		this.carreras = data.carreras;
		this.programaIdioma = data.programaIdioma;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		this.articuloFormArray.controls.forEach(articulo =>{
			let reglasArray = new FormArray([]);
			if(articulo.get('reglas').value){
				articulo.get('reglas').value.forEach( regla =>{
					reglasArray.push(this.createReglasForm(regla))
				});
				(articulo as FormGroup).removeControl('reglas');
				(articulo as FormGroup).addControl('reglas',reglasArray);
			}
		});
		if(this.articuloFormArray.valid){
			this.dialogRef.close(this.articuloFormArray);
		}else{
			if(this.aplicaReglas){
				this.articuloFormArray.controls.forEach(articulo =>{
					this.markFormGroupTouched((articulo as FormGroup));
				});
			}else{
				this.dialogRef.close(this.articuloFormArray);
			}
			
		}
		console.log(this.articuloFormArray);
		//this.dialogRef.close(this.articuloFormArray);
	}

	markFormGroupTouched(formGroup: FormGroup) {
	    (<any>Object).values(formGroup.controls).forEach(control => {
	      control.markAsTouched();

	      if (control.controls) {
	        this.markFormGroupTouched(control);
	      }
	    });
	}


	createIdiomaLibrosMaterialesForm(articulo: any): FormGroup {
        //libroMaterial = libroMaterial ? libroMaterial : new ProgramaIdiomaLibroMaterialEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [null],
            programaIdiomaId: new FormControl(this.programaIdioma),
            nivel: new FormControl(this.nivelControl.value.id),
            articulo: new FormControl(articulo),
            borrado: new FormControl(false),
            reglas: new FormControl(null, [Validators.required])
        })
        return form;
    }

    createReglasForm(carrera: any){
    	let form: FormGroup = this._formBuilder.group({
    	id: [null],
	    programaLibroMateriallId: new FormControl(null),
	    carrera: new FormControl(carrera),
	    borrado: new FormControl(false)
		});
		return form;
    }

}