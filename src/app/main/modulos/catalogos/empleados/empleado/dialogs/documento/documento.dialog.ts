import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fuseAnimations } from '@fuse/animations';
import { ArchivoProjection } from '@models/archivo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EmpleadoService } from '../../empleado.service';

export interface DocumentoDialogData {
  listaTipoDocumento?: ControlMaestroMultipleComboProjection[];
	onAceptar: (tipoDocumento: ControlMaestroMultipleComboProjection, fechaVencimiento: Date, archivos: ArchivoProjection[]) => void;
}


@Component({
  selector: 'app-documento-dialog',
  templateUrl: 'documento.dialog.html',
  styleUrls: ['documento.dialog.scss'],
  animations: fuseAnimations
})
export class DocumentoDialogComponent {

  empleadoDocumentoForm: FormGroup;
  listaTipoDocumento: ControlMaestroMultipleComboProjection[];

  archivos: ArchivoProjection[] = [];
  archivosCargando: boolean[] = [];

  form: FormGroup;

  // PDF y los imagenes
  fileExtensions = ['.pdf','.jpeg','.png','.jpg'];

  private _unsubscribeAll: Subject < any >;

  constructor(
    public _dialogRef: MatDialogRef <DocumentoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: DocumentoDialogData,
    public _validatorService: ValidatorService,
    private _matSnackBar: MatSnackBar,
    private _empleadoService: EmpleadoService,
    private _translate: TranslateService,
    private _formBuilder: FormBuilder
  ) { 
    this._unsubscribeAll = new Subject();
    this.listaTipoDocumento = data.listaTipoDocumento;

    this.createForm();
    this.form.enable();
  }

  ngOnInit(): void {

    this._empleadoService.onDocumentoUploadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivoId => {
			if(archivoId){
				this._empleadoService.onDocumentoUploadChanged.next(null);
        this._empleadoService.getDocumento(archivoId);
			}
		});

    this._empleadoService.onArchivoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivo => {
			if(archivo){
				this._empleadoService.onArchivoChanged.next(null);
				this.archivos.push(archivo);
				this.archivosCargando.pop();
				if(!this.archivosCargando.length){
					this.data.onAceptar(this.form.controls['tipoDocumento'].value,this.form.controls['fechaVencimiento'].value, this.archivos);
					this._dialogRef.close();
				}
			}
		});
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  createForm(): void {
		this.form = this._formBuilder.group({
			tipoDocumento: new FormControl(null, [Validators.required]),
			fechaVencimiento: new FormControl(null, [])
		});
	}

  fileChangeEvent(event: any): void {
		let files: File[] = [];
		if(event?.target?.files?.length){
			files = event.target.files;
		}
		if(files.length){
      for(let file of files){
        let extension: string = file.name.substr(file.name.lastIndexOf('.')).toLocaleLowerCase();
        if(!(this.fileExtensions.includes(extension))){
          this._matSnackBar.open(this._translate.instant('MENSAJE.DOCUMENTO'), 'OK', {
            duration: 5000,
          });
          return;
        }
      }
      this.archivosCargando = new Array(files.length).fill(true)
      for(let file of files){
        this._empleadoService.subirDocumento(file);
      }
		}
  }

  cancelar(): void {
		this._dialogRef.close();
	}

}
