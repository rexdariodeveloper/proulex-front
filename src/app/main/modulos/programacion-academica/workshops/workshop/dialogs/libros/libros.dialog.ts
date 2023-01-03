import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { fuseAnimations } from '@fuse/animations';


@Component({
	selector: 'libros-dialog',
	templateUrl: 'libros.dialog.html',
	animations: fuseAnimations
})
export class AddlibroComponent {

	form: FormGroup;
	articulos: any[];
	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < AddlibroComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data,
		public validatorService: ValidatorService
	) {
		this.articulos = data;
		this._unsubscribeAll = new Subject();
		this.form = this.createForm();
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	cancelar(): void {
		this.dialogRef.close(null);
	}

	aceptar(): void {
		this.dialogRef.close(this.form.getRawValue());
	}

	createForm(): FormGroup {
        let form: FormGroup = this._formBuilder.group({
            id: new FormControl(null, []),
			programaIdiomaId: new FormControl(null, []),
			nivel: new FormControl(null, []),
			articulo: new FormControl(null, []),
			borrado: new FormControl(null, []),
			reglas: new FormControl(null, [])
        })
        return form;
    }

}