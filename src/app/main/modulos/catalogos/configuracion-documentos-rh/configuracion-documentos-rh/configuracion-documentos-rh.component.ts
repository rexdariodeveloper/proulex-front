import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { ConfiguracionDocumentosRHService } from './configuracion-documentos-rh.service';
import { fuseAnimations } from '@fuse/animations';
import { DocumentosConfiguracionRH } from '@app/main/modelos/documentos-configuracion-rh';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { defaultCoreCipherList } from 'constants';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatDialog } from '@angular/material/dialog';
import { TipoAsistenciaDialogModel, TipoOpcionDialogComponent, TipoOpcionDialogData } from './dialog/tipo-opcion.dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JsonResponse } from '@models/json-response';
import { Router } from '@angular/router';

/*
* Autor: Rene Carrillo
* Fecha: 07.03.2022 
*/

@Component({
  selector: 'app-configuracion-documentos-rh',
  templateUrl: './configuracion-documentos-rh.component.html',
  styleUrls: ['./configuracion-documentos-rh.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ConfiguracionDocumentosRHComponent implements OnInit, OnDestroy {

  // registro para el ID
  contadorRegistrosNuevos: number = -1;

  @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

  config: FichaCRUDConfig;
  titulo: String;
  pageType: string = 'ver';

  form: any[] = [];

  // Private
  private _unsubscribeAll: Subject<any>;

  // Models
  listaDocumentosConfiguracionRH: DocumentosConfiguracionRH[];
  listaTipoProcesoRH: ControlMaestroMultipleComboProjection[];
  listaTipoContrato: ControlMaestroMultipleComboProjection[];
  listaTipoDocumento: ControlMaestroMultipleComboProjection[];
  listaTipoOpcion: ControlMaestroMultipleComboProjection[];
  listaTipoVigencia: ControlMaestroMultipleComboProjection[];
  listaTipoTiempo: ControlMaestroMultipleComboProjection[];

  // DocumentosConfiguracionRH
  documentosConfiguracionRHFormArray: FormArray = new FormArray([]);

  disabled: boolean = true;

  // Listado DataSource
  listaDataSource: any[] = [];
  datas: any[];
  displayedColumns: string[] = ['TipoDocumento'];

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _translateService: TranslateService,
    public _configuracionDocumentosService: ConfiguracionDocumentosRHService,
    private _formBuilder: FormBuilder,
    public _dialog: MatDialog,
    private _matSnackBar: MatSnackBar,
    private _router: Router
  ) {
    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
    this._fuseTranslationLoaderService.loadTranslations(english, spanish);

    // Set the private defaults
    this._unsubscribeAll = new Subject();
   }

  ngOnInit(): void {

    this.config = {
      icono: 'list_alt',

    }

    this.titulo = this._translateService.instant('TITULO');

    this.serviceSubscriptions();

    //this.dataSource = this.listaMatrizDocumento;
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  serviceSubscriptions() {
		// Subscribe to update proveedor on changes
    this._configuracionDocumentosService.onDatosChanged
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(datos => {
      if(!!datos){
        this.listaDocumentosConfiguracionRH = datos.listaDocumentosConfiguracionRH;
        this.listaTipoProcesoRH = datos.listaTipoProcesoRH;
        this.listaTipoContrato = datos.listaTipoContrato;
        this.listaTipoDocumento = datos.listaTipoDocumento;
        this.listaTipoOpcion = datos.listaTipoOpcion;
        this.listaTipoVigencia = datos.listaTipoVigencia;
        this.listaTipoTiempo = datos.listaTipoTiempo;

        this.cargaMatrizDocumentos();
      }
    });
	}

  cargaMatrizDocumentos(){
    let numeroRegistro = 1;
    // Tipo de Proceso RH
    this.listaTipoProcesoRH.map(proceso => {
      // Tipo de Documento
      this.listaTipoDocumento.map(documento => {
        // Asignamos los datos para el DataSource
        this.listaDataSource.push({
          id: numeroRegistro,
          procesoId: proceso.id,
          proceso: proceso,
          documento: documento
        });
        numeroRegistro++;

        // Tipo de Contrato
        this.listaTipoContrato.map(contrato => {
          // Verificar si existe el registro si no creamos uno
          const _documentosConfiguracionRH: DocumentosConfiguracionRH = this.listaDocumentosConfiguracionRH.find(dcrh => dcrh.tipoProcesoRHId == proceso.id && dcrh.tipoDocumentoId == documento.id && dcrh.tipoContratoId == contrato.id);
          
          if(_documentosConfiguracionRH){
            // Asignamos el dato
            this.documentosConfiguracionRHFormArray.push(this._formBuilder.group(_documentosConfiguracionRH));
          }else{
            // Creamos nuevo el Documentos Configuracion RH
            let nuevoDocumentosConfiguracionRH: DocumentosConfiguracionRH = new DocumentosConfiguracionRH();
            nuevoDocumentosConfiguracionRH.id = this.contadorRegistrosNuevos;
            nuevoDocumentosConfiguracionRH.tipoProcesoRHId = proceso.id;
            nuevoDocumentosConfiguracionRH.tipoDocumentoId = documento.id;
            nuevoDocumentosConfiguracionRH.tipoContratoId = contrato.id;
            nuevoDocumentosConfiguracionRH.tipoOpcionId = ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.NO_REQUERIDO;

            // Establecer al FormArray
            this.documentosConfiguracionRHFormArray.push(this._formBuilder.group(nuevoDocumentosConfiguracionRH));
            this.documentosConfiguracionRHFormArray.controls.find(_dcrh => _dcrh.value.id == this.contadorRegistrosNuevos).markAsDirty();

            // Descontador
            this.contadorRegistrosNuevos--;
          }

        });
      });
    });
    // Asignamos el tipo de Contrato para las columnas
    this.listaTipoContrato.map(contrato => {
      this.displayedColumns.push(contrato.valor);
    });
  }

  cargaDataSource(proceso: ControlMaestroMultipleComboProjection){
    return this.listaDataSource.filter(ds => ds.procesoId == proceso.id);
  }

  getTipoDocumento(id): string{
    return this.listaTipoDocumento.find(documento => documento.id == id).valor;
  }

	setEnable(){
		this.disabled = false;
	}

  recargar() {
    this.pageType = this.fichaCrudComponent.recargar();
  }

  getColor(proceso: ControlMaestroMultipleComboProjection, contrato: ControlMaestroMultipleComboProjection, documento: ControlMaestroMultipleComboProjection): string{
    let color: string = this.getNombreColor(this.documentosConfiguracionRHFormArray.value.find(dcrh => dcrh.tipoProcesoRHId == proceso.id && dcrh.tipoContratoId == contrato.id && dcrh.tipoDocumentoId == documento.id).tipoOpcionId);
    return color;
  }

  getNombreColor(tipoOpcionId: number){
    switch(tipoOpcionId){
      case ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OPCIONAL:
        return 'grey-600';
      case ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.OBLIATORIO:
        return 'green-600';
      case ControlesMaestrosMultiples.CMM_GEN_TipoOpcion.NO_REQUERIDO:
        return 'red-600';
    }
  }

  getTipoOpcion(proceso: ControlMaestroMultipleComboProjection, contrato: ControlMaestroMultipleComboProjection, documento: ControlMaestroMultipleComboProjection): string{
    let opcion: string = this.listaTipoOpcion.find(o => o.id == this.documentosConfiguracionRHFormArray.value.find(dcrh => dcrh.tipoProcesoRHId == proceso.id && dcrh.tipoContratoId == contrato.id && dcrh.tipoDocumentoId == documento.id).tipoOpcionId).valor;
    return opcion;
  }

  getNombreId(proceso: ControlMaestroMultipleComboProjection, contrato: ControlMaestroMultipleComboProjection, documento: ControlMaestroMultipleComboProjection){
    const id = this.documentosConfiguracionRHFormArray.value.find(dcrh => dcrh.tipoProcesoRHId == proceso.id && dcrh.tipoContratoId == contrato.id && dcrh.tipoDocumentoId == documento.id).id;
    return 'button' + id + '-' + contrato.id;
  }

  openTipoOpcionModal(proceso: ControlMaestroMultipleComboProjection, contrato: ControlMaestroMultipleComboProjection, documento: ControlMaestroMultipleComboProjection): void {      
    let dialogData: TipoOpcionDialogData = {
      tipoContrato: contrato.valor,
      tipoDocumento: this.listaTipoDocumento.find(_documento => _documento.id == documento.id).valor,
      listaTipoOpcion: this.listaTipoOpcion,
      listaTipoVigencia: this.listaTipoVigencia,
      listaTipoTiempo: this.listaTipoTiempo,
      documentosConfiguracionRH: this.documentosConfiguracionRHFormArray.value.find(dcrh => dcrh.tipoProcesoRHId == proceso.id && dcrh.tipoContratoId == contrato.id && dcrh.tipoDocumentoId == documento.id),
      onAceptar: this.aceptarTipoOpcionModal.bind(this)
    };

    const dialogRef = this._dialog.open(TipoOpcionDialogComponent, {
      width: '600px',
      data: dialogData,
      autoFocus: true
    });

    dialogRef.keydownEvents().pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
      if(event.key === "Enter"){
        event.preventDefault();
        event.stopPropagation();
        dialogRef.componentInstance.aceptar();
      }
    });
		
	}

  aceptarTipoOpcionModal(data: TipoAsistenciaDialogModel){
		event.stopPropagation();

    var actualizarDocumentosConfiguracionRH = this.documentosConfiguracionRHFormArray.controls.find(dcrh => dcrh.value.id == data.id) as FormGroup;
    actualizarDocumentosConfiguracionRH.controls.tipoOpcionId.setValue(data.tipoOpcionId);
    actualizarDocumentosConfiguracionRH.controls.tipoVigenciaId.setValue(data.tipoVigenciaId);
    actualizarDocumentosConfiguracionRH.controls.tipoTiempoId.setValue(data.tipoTiempoId);
    actualizarDocumentosConfiguracionRH.controls.vigenciaCantidad.setValue(data.vigenciaCantidad);
    actualizarDocumentosConfiguracionRH.markAsDirty();

	}

  guardar() {
    if(!this._configuracionDocumentosService.cargando){

      // Obtener los datos para saber hay los datos o no hay para guardar
      const data = this.obtenerData();

      if (data.listaDocumentosConfiguracionRH.length == 0) {
        //toast('No se puede guardar ya que no hubo cambios en la información', 'error');
        // Ocultamos Loader
        //dxLoaderPanel.hide();
        this._matSnackBar.open(this._translateService.instant('No existen cambios pendientes por guardar'), 'OK', {
          duration: 5000,
        });
        this._configuracionDocumentosService.cargando = false;
        return;
    }

			this._configuracionDocumentosService.guardar(data, '/api/v1/configuracion-documentos-rh/save').then(
				((result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
            this._router.navigateByUrl('/', { skipLocationChange: true }).then(() => this._router.navigate(['/app/catalogos/configuracion-documentos-rh']) )
						//this._router.navigate(['/app/catalogos/configuracion-documentos-rh/']);
					} else {
						this._configuracionDocumentosService.cargando = false;
					}
				}).bind(this)
			);
		}
  }

  obtenerData(){
    let data = {
      listaDocumentosConfiguracionRH: []
    };

    // Documentos Configuracion RH
    this.documentosConfiguracionRHFormArray.controls.map(documento => {
      if(documento.dirty){
        data.listaDocumentosConfiguracionRH.push(documento.value);
      }
    });

    return data;
  }
}
