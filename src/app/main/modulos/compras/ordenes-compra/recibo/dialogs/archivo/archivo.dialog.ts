import { Component, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { ArticulosTipos } from '@app/main/modelos/mapeos/articulos-tipos';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ArchivoProjection } from '@models/archivo';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { ReciboOrdenCompraService } from '../../recibo.service';
import { ArrayType } from '@angular/compiler';

const MAX_28: number = 9999999999999999999999999999.99;

export interface ArchivoDialogData {
	tipos: ControlMaestroMultipleComboProjection[];
	onAceptar: (archivos: ArchivoProjection[]) => void;
}

@Component({
	selector: 'archivo-dialog',
	templateUrl: 'archivo.dialog.html',
})
export class ArchivoDialogComponent {

	CMM_OCR_TipoArchivo = ControlesMaestrosMultiples.CMM_OCR_TipoArchivo;

	archivos: ArchivoProjection[] = [];

	form: FormGroup;

	tipoControl: FormControl = new FormControl();
	tipos: ControlMaestroMultipleComboProjection[];

	archivosCargando: boolean[] = [];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ArchivoDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ArchivoDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private _reciboOrdenCompraService: ReciboOrdenCompraService
	) {
		this._unsubscribeAll = new Subject();

		this.tipos = data.tipos;
	}

	ngOnInit(): void {
		this.form = this.createForm();
		this.form.enable();
		this._reciboOrdenCompraService.onFacturaUploadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(facturaId => {
			if(facturaId){
				this._reciboOrdenCompraService.onFacturaUploadChanged.next(null);
				this._reciboOrdenCompraService.getDocumento(facturaId);
			}
		});
		this._reciboOrdenCompraService.onEvidenciaUploadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(evidenciaId => {
			if(evidenciaId){
				this._reciboOrdenCompraService.onEvidenciaUploadChanged.next(null);
				this._reciboOrdenCompraService.getDocumento(evidenciaId);
			}
		});
		this._reciboOrdenCompraService.onArchivoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivo => {
			if(archivo){
				this._reciboOrdenCompraService.onArchivoChanged.next(null);
				this.archivos.push(archivo);
				this.archivosCargando.pop();
				if(!this.archivosCargando.length){
					this.data.onAceptar(this.archivos);
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

	createForm(): FormGroup {
		
		this.tipoControl = new FormControl(null, []);

		let form = this._formBuilder.group({
			tipo: this.tipoControl
		});

		return form;
	}

	fileChangeEvent(event: any): void {
		let files: File[] = [];
		if(event?.target?.files?.length){
			files = event.target.files;
		}
		if(files.length){
			if(this.tipoControl.value?.id == this.CMM_OCR_TipoArchivo.FACTURA){
				if(files.length > 2){
					this._matSnackBar.open(this.translate.instant('MENSAJE.FACTURA'), 'OK', {
						duration: 5000,
					});
					return;
				}
				let pdfAdjunto: boolean = false;
				let xmlAdjunto: boolean = false;
				for(let file of files){
					let extension: string = file.name.substr(file.name.lastIndexOf('.')).toLocaleLowerCase();
					if(extension == '.pdf' && pdfAdjunto){
						this._matSnackBar.open(this.translate.instant('MENSAJE.FACTURA'), 'OK', {
							duration: 5000,
						});
						return;
					}else if(extension == '.pdf'){
						pdfAdjunto = true;
					}
					if(extension == '.xml' && xmlAdjunto){
						this._matSnackBar.open(this.translate.instant('MENSAJE.FACTURA'), 'OK', {
							duration: 5000,
						});
						return;
					}else if(extension == '.xml'){
						xmlAdjunto = true;
					}
				}
				this.archivosCargando = new Array(files.length).fill(true)
				for(let file of files){
					this._reciboOrdenCompraService.subirFactura(file);
				}
			}else if(this.tipoControl.value?.id == this.CMM_OCR_TipoArchivo.EVIDENCIA){
				this.archivosCargando = new Array(files.length).fill(true)
				for(let file of files){
					this._reciboOrdenCompraService.subirEvidencia(file);
				}
			}
		}
    }

}