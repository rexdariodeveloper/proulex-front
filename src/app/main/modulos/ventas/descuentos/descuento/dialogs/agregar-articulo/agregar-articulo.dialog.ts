import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramaIdiomaComboProjection,ProgramaIdiomaEditarProjection } from '@app/main/modelos/programa-idioma';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { PADescuentoArticuloEditarProjection } from '@app/main/modelos/padescuento-articulo';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DescuentoService } from '../../descuento.service';
import { takeUntil } from 'rxjs/operators';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarArticuloData {
	familias: ArticuloFamiliaComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-articulo',
	templateUrl: 'agregar-articulo.dialog.html',
	animations: fuseAnimations
})
export class AgregarArticuloComponent {

	familias: ArticuloFamiliaComboProjection[];
	categorias: ArticuloCategoriaComboProjection[];
    articulos: ArticuloComboProjection[];

    familiaControl: FormControl = new FormControl();
    categoriaControl: FormControl = new FormControl();
    articuloControl: FormControl = new FormControl();

	private _unsubscribeAll: Subject < any > ;

	@ViewChild('categoriaSelect') categoriaSelect: PixvsMatSelectComponent;
	@ViewChild('articuloSelect') articuloSelect: PixvsMatSelectComponent;

	constructor(
		public dialogRef: MatDialogRef < AgregarArticuloComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarArticuloData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		public _descuentoService: DescuentoService
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this.familiaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.familiaControl.value) {
                this._descuentoService.getComboCategorias(this.familiaControl.value.id).then(value =>{
                    this.categorias = value.data;
                    this.categoriaSelect?.setDatos(this.categorias);
                });
            }
        });

        this.categoriaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.categoriaControl.value) {
                this._descuentoService.getArticulosByCategoria(this.categoriaControl.value.id).then(value =>{
                    this.articulos = value.data;
                    this.articuloSelect?.setDatos(this.articulos);
                });
            }
        });

	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarArticuloData) {
		this.familias = data.familias;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.articuloControl){
			let cursosArray = new FormArray([]);
			if(this.articuloControl.value){
				this.articuloControl.value.forEach(curso =>{
					cursosArray.push(this.createCursosDetalleForm(curso));
				});
			}
			this.dialogRef.close(cursosArray.value);
		}else{
			this._matSnackBar.open('Debes elegir al menos 1 artículo', 'OK', {
                duration: 5000,
            });
		}
	}

	createCursosDetalleForm(articulo: ArticuloComboProjection): FormGroup {
        let form = this._formBuilder.group({
            id: [null],
            descuentoId: new FormControl(null),
            articulo: new FormControl(articulo),
            activo: new FormControl(true)
        });
        return form;
    }

}