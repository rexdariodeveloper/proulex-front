import { Component, Inject } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { DocumentosConfiguracionRHEditarProjection } from "@app/main/modelos/documentos-configuracion-rh";
import { ControlesMaestrosMultiples } from "@app/main/modelos/mapeos/controles-maestros-multiples";
import { fuseAnimations } from "@fuse/animations";
import { ArchivoProjection } from "@models/archivo";
import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";
import { TranslateService } from "@ngx-translate/core";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { NuevaContratacionService } from "../../../modulos/ingreso-promocion/nuevas-contrataciones/nueva-contratacion/nueva-contratacion.service";
import * as moment from 'moment';
import { DocumentoService } from "./documento.service";

export interface DocumentoDialogData {
    listaTipoDocumento?: ControlMaestroMultipleComboProjection[];
    listaDocumentosConfiguracionRH?: DocumentosConfiguracionRHEditarProjection[];
    subCarpeta?: string;
    onAceptar: (tipoDocumento: ControlMaestroMultipleComboProjection, fechaVencimiento: Date, fechaVigencia: Date, archivos: ArchivoProjection[]) => void;
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
    documentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection;
    listaDocumentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection[];
    esFechaVencimiento: boolean = false;
    esFechaVigencia: boolean = false;

    fechaActual = moment(new Date()).format('YYYY-MM-DD');

    archivos: ArchivoProjection[] = [];
    archivosCargando: boolean[] = [];

    form: FormGroup;

    subCarpeta: string = ''

    // PDF y los imagenes
    fileExtensions = ['.pdf','.jpeg','.png','.jpg'];

    private _unsubscribeAll: Subject < any >;

    constructor(
        public _dialogRef: MatDialogRef <DocumentoDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DocumentoDialogData,
        public _validatorService: ValidatorService,
        private _matSnackBar: MatSnackBar,
        private _documentoService: DocumentoService,
        private _translate: TranslateService,
        private _formBuilder: FormBuilder
    ) { 
        this._unsubscribeAll = new Subject();
        this.listaTipoDocumento = data.listaTipoDocumento;
        this.listaDocumentosConfiguracionRH = data.listaDocumentosConfiguracionRH;
        this.subCarpeta = data.subCarpeta

        this.createForm();
        this.form.enable();
    }

    ngOnInit(): void {

        this._documentoService.onDocumentoUploadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivoId => {
            if(archivoId){
                this._documentoService.onDocumentoUploadChanged.next(null);
                this._documentoService.getDocumento(archivoId);
            }
        });

        this._documentoService.onArchivoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(archivo => {
            if(archivo){
                this._documentoService.onArchivoChanged.next(null);
                this.archivos.push(archivo);
                this.archivosCargando.pop();
                if(!this.archivosCargando.length){
                    this.data.onAceptar(this.form.controls['tipoDocumento'].value,this.form.controls['fechaVencimiento'].value, this.form.controls['fechaVigencia'].value, this.archivos);
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
			fechaVencimiento: new FormControl(null, []),
            fechaVigencia: new FormControl(null, [])
		});

        this.form.controls['tipoDocumento'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoDocumento: ControlMaestroMultipleComboProjection) => {
            if(!!tipoDocumento && tipoDocumento.id){
                // Limpiamos el campo FechaVencimiento
                this.esFechaVencimiento = false;
                this.form.controls['fechaVencimiento'].setValue(null);
                this.form.controls['fechaVencimiento'].clearValidators();
                this.esFechaVigencia = false;
                this.form.controls['fechaVigencia'].setValue(null);
                this.form.controls['fechaVigencia'].clearValidators();

                const documentosConfiguracionRH = this.listaDocumentosConfiguracionRH.find(documento => documento.tipoDocumento.id == tipoDocumento.id);
                if(documentosConfiguracionRH){
                    if(documentosConfiguracionRH.tipoOpcion.id == ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OBLIATORIO || documentosConfiguracionRH.tipoOpcion.id == ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OPCIONAL){
                        // Tipo de Vigencia -> Fecha de Vencimiento 
                        if(documentosConfiguracionRH.tipoVigencia.id == ControlesMaestrosMultiples.CMM_GEN_TipoVigencia.FECHA_DE_VENCIMIENTO){
                            this.esFechaVencimiento = true;
                            this.form.controls['fechaVencimiento'].setValidators(Validators.required);
                        }

                        // Tipo de Vigencia -> Vigencia
                        if(documentosConfiguracionRH.tipoVigencia.id == ControlesMaestrosMultiples.CMM_GEN_TipoVigencia.VIGENCIA){
                            this.esFechaVigencia = true;
                            let fechaVigencia = this.fechaActual;
                            if(documentosConfiguracionRH.tipoTiempo.id == ControlesMaestrosMultiples.CMM_UMT_TipoTiempo.DIA)
                                fechaVigencia = moment(this.fechaActual).add(documentosConfiguracionRH.vigenciaCantidad, 'days').format('YYYY-MM-DD');
                            if(documentosConfiguracionRH.tipoTiempo.id == ControlesMaestrosMultiples.CMM_UMT_TipoTiempo.MES)
                                fechaVigencia = moment(this.fechaActual).add(documentosConfiguracionRH.vigenciaCantidad, 'month').format('YYYY-MM-DD');
                            if(documentosConfiguracionRH.tipoTiempo.id == ControlesMaestrosMultiples.CMM_UMT_TipoTiempo.ANIO)
                                fechaVigencia = moment(this.fechaActual).add(documentosConfiguracionRH.vigenciaCantidad, 'years').format('YYYY-MM-DD');
                            this.form.controls['fechaVigencia'].setValue(fechaVigencia);
                        }
                    }
                }
            }
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
                this._documentoService.subirDocumento(file, this.subCarpeta);
            }
		}
    }

    cancelar(): void {
		this._dialogRef.close();
	}

}