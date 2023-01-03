import { Component, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from '@ngx-translate/core';

import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { RolService } from "../rol.service";

export interface RestriccionDialogData {
	data: any;
	onAceptar: (registro: any) => void;
}

@Component({
	selector: 'restriccion-dialog',
	templateUrl: 'restriccion.dialog.html',
})
export class RestriccionDialogComponent {

	form: FormGroup;
    currentIndex: number;
    registro: any;

	private _unsubscribeAll: Subject <any> ;

	constructor(
		public dialogRef: MatDialogRef <RestriccionDialogComponent> ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: RestriccionDialogData,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
        public _rolService: RolService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
        this._rolService.onPermisosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(this.currentIndex != null){
                if(data)
                    this.data.data.rolMenuPermisos[this.currentIndex].id = data?.id;
                else
                    this.data.data.rolMenuPermisos[this.currentIndex].id = null; 
            }
            
            this.currentIndex = null;
        })
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: RestriccionDialogData) {
		this.form = this.createForm(data?.data?.rolMenuPermisos || []);
		this.form.enable();
	}

	aceptar(): void {
        this.data.onAceptar(this.registro);
		this.dialogRef.close();
	}

	createForm(data: any[]): FormGroup {

        let formBody = {};
        data.forEach((restriccion,index) => {
            formBody['control_'+String(index)] = new FormControl(restriccion?.id != null? true : false, []);
        });
		let form = this._formBuilder.group(formBody);

		return form;
	}

    toggleCheckbox(value:any, index: number){
        let to_send = this.data.data.rolMenuPermisos[index];
        if(!!!to_send.rolId){
            this.registro = to_send;
            return;
        }
        this._rolService.togglePermiso(this.data.data.rolMenuPermisos[index],'/api/v1/roles/permiso');
        this.currentIndex = index;
    }
}