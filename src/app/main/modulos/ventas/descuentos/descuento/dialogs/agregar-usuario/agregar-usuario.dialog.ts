import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormArray, FormGroup } from '@angular/forms';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramaIdiomaComboProjection,ProgramaIdiomaEditarProjection } from '@app/main/modelos/programa-idioma';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { PADescuentoArticuloEditarProjection } from '@app/main/modelos/padescuento-articulo';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { UsuarioComboProjection } from '@pixvs/models/usuario';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { Moment } from 'moment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DescuentoService } from '../../descuento.service';
import { takeUntil } from 'rxjs/operators';

const MAX_28: number = 9999999999999999999999999999.99;

export interface AgregarUsuarioData {
	usuarios: UsuarioComboProjection[];
	//sucursales: SucursalComboProjection[];
	onAceptar: (aceptar: boolean) => void;
}

@Component({
	selector: 'agregar-usuario',
	templateUrl: 'agregar-usuario.dialog.html',
	animations: fuseAnimations
})
export class AgregarUsuarioComponent {

	usuarios: UsuarioComboProjection[];
	sucursales: SucursalComboProjection[];
	@ViewChild('sucursalSelect') sucursalSelect: PixvsMatSelectComponent;

    usuarioControl: FormControl = new FormControl();
    sucursalControl: FormControl = new FormControl();

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AgregarUsuarioComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: AgregarUsuarioData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		public _descuentoService: DescuentoService
	) {
		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {

	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: AgregarUsuarioData) {
		this.usuarios = data.usuarios;
		//this.sucursales = data.sucursales;
		this.usuarioControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.usuarioControl.value){
				this._descuentoService.getSucursalesByUsuario(this.usuarioControl.value.id).then(value =>{
                    this.sucursales = value.data;
                    this.sucursalSelect.setDatos(this.sucursales);
                });
			}
		});
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		if(this.usuarioControl.value != null && this.sucursalControl.value != null){
			let formUsuario: FormGroup;
			if(this.usuarioControl.value){
				formUsuario = this.createCursosDetalleForm(this.usuarioControl.value, this.sucursalControl.value);
			}
			this.dialogRef.close(formUsuario.value);
		}else{
			this._matSnackBar.open('Datos Faltantes', 'OK', {
                duration: 5000,
            });
		}
	}

	createCursosDetalleForm(usuario: UsuarioComboProjection, sucursal: SucursalComboProjection): FormGroup {
        let form = this._formBuilder.group({
            id: [null],
            descuentoId: new FormControl(null),
            usuario: new FormControl(usuario),
            sucursal: new FormControl(sucursal),
            activo: new FormControl(true)
        });
        return form;
    }

}