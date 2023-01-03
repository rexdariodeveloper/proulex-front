import { Component, ElementRef, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FormControl } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { CancelacionNotaVentaService } from '../../cancelacion-nota-venta.service';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';

export interface CancelacionNotaVentaDocumentosDialogData {
	tiposDocumentos: ControlMaestroMultipleComboSimpleProjection[];
	codigoOV: string;
	codigoCorte: string;
	onAceptar: (tipoDocumento: ControlMaestroMultipleComboSimpleProjection, valor: string, documento: any) => void;
}

@Component({
	selector: 'cancelacion-nota-venta-documentos-dialog',
	templateUrl: 'documentos.dialog.html',
	styleUrls: ['documentos.dialog.scss'],
    encapsulation: ViewEncapsulation.None
})
export class CancelacionNotaVentaDocumentosDialogComponent {

	CMM_OVC_TiposDocumento = ControlesMaestrosMultiples.CMM_OVC_TiposDocumento;

	tiposDocumentos: ControlMaestroMultipleComboSimpleProjection[] = [];

    tipoDocumentoControl: FormControl = new FormControl(null,[]);
    valorControl: FormControl = new FormControl(null,[]);

	codigoOV: string;
	codigoCorte: string;

    archivo: any;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef<CancelacionNotaVentaDocumentosDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: CancelacionNotaVentaDocumentosDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		public _cancelacionNotaVentaService: CancelacionNotaVentaService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
		this._cancelacionNotaVentaService.onDocumentoSubidoChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(archivoId => {
				if (archivoId) {
					this._cancelacionNotaVentaService.onDocumentoSubidoChanged.next(null);
					this.archivo.id = archivoId;
				}
			});
		
		this.tipoDocumentoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(value?.id == this.CMM_OVC_TiposDocumento.NOTA_DE_VENTA_O_FACTURA){
				this.valorControl.setValue(this.codigoOV);
			}else if(value?.id == this.CMM_OVC_TiposDocumento.NUMERO_DE_CORTE){
				this.valorControl.setValue(this.codigoCorte);
			}else{
				this.valorControl.setValue('');
			}
		})
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: CancelacionNotaVentaDocumentosDialogData) {
		this.tiposDocumentos = data.tiposDocumentos;
		this.codigoOV = data.codigoOV;
		this.codigoCorte = data.codigoCorte;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	onAceptar(): void {
		if (!this.tipoDocumentoControl?.value?.id) {
			this._matSnackBar.open('Selecciona el tipo de documento', 'OK', {
                duration: 5000,
            });
		} if (!this.valorControl?.value) {
			this._matSnackBar.open('Ingresa un valor', 'OK', {
                duration: 5000,
            });
		} else if (!this.archivo?.id) {
			if(!this.archivo?.nombreOriginal){
				this._matSnackBar.open('Sube el documento', 'OK', {
					duration: 5000,
				});
			}else{
				this._matSnackBar.open('Espera a que el documento se cargue por completo', 'OK', {
					duration: 5000,
				});
			}
		} else {
			this.data.onAceptar(this.tipoDocumentoControl.value,this.valorControl?.value || null,this.archivo);
			this.dialogRef.close();
		}
	}

    archivoChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){ archivo = file; }
		}
		if(!!archivo){
			this.archivo = { nombreOriginal: archivo.name };
			this._cancelacionNotaVentaService.subirDocumento(archivo);
		}else{
			this.archivo = null;
		}
	}

	borrarArchivo(archivoBtn: HTMLInputElement){
		const dt = new DataTransfer();
		archivoBtn.files = dt.files;
		this.archivo = null;
	}

}