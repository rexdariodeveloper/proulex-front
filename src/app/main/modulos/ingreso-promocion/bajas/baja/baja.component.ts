import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { TranslateService } from '@ngx-translate/core';
import { HashidsService } from '@services/hashids.service';
import { Observable, Subject } from 'rxjs';
import { BajaService } from './baja.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { animate, style, transition, trigger } from '@angular/animations';
import { EmpleadoContratoComboEmpleadoProjection, EmpleadoContratoEditarProjection, EmpleadoContratoEmpleadoProjection } from '@app/main/modelos/empleado-contrato';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { EmpleadoBajaProjection } from '@app/main/modelos/empleado';
import { MatTableDataSource } from '@angular/material/table';
import { fuseAnimations } from '@fuse/animations';
import { ValidatorService } from '@services/validators.service';
import * as moment from 'moment';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { SolicitudBajaContratacionEditarProjection } from '@app/main/modelos/solicitud-baja-contratacion';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentoDialogComponent, DocumentoDialogData } from '@app/main/componentes/dialogs/documento/documento.dialog';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { DocumentosConfiguracionRHEditarProjection } from '@app/main/modelos/documentos-configuracion-rh';
import { MatDialog } from '@angular/material/dialog';
import { ArchivoProjection } from '@models/archivo';
import { EmpleadoDocumentoEditarProjection } from '@app/main/modelos/empleado-documento';
import { JsonResponse } from '@models/json-response';

@Component({
  selector: 'app-baja',
  templateUrl: './baja.component.html',
  styleUrls: ['./baja.component.scss'],
  animations: [
    trigger('aSeleccionaEmpleado', [
      transition(':enter', [style({
          opacity: 0,
          transform: 'translateY(-100%)'
        }),
        animate(400, style({ transform: 'translateY(0%)', 'opacity': 1 }))
      ]),
      transition(':leave', [style({
        opacity: 1,
        transform: 'translateY(0%)'
      }),
      animate(400, style({ transform: 'translateY(-100%)', 'opacity': 0 }) )
    ])
    ])
  , fuseAnimations], 
})
export class BajaComponent implements OnInit {

  // Configuracion de la Ficha
  @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
      return !this.isLoading;
  }
  contadorRegistrosNuevos: number = -1;
  pageType: string = 'nuevo';
  deshabilitarBotones: boolean = true;
  config: FichaCRUDConfig;
  titulo: String;
  currentId: number;
  isLoading: boolean = false;
  esLectura: boolean = false;

  // Ficha
  form: FormGroup;
  solicitudBajaContratacion: SolicitudBajaContratacionEditarProjection;
  listaEmpleado: EmpleadoContratoComboEmpleadoProjection[] = [];
  @ViewChild('listaEmpleadoSelect') listaEmpleadoSelect: PixvsMatSelectComponent;

  // Datos del Empleado
  empleado: EmpleadoBajaProjection = null;

  // Contratos
  listaEmpleadoContrato: EmpleadoContratoEmpleadoProjection[] = [];
  //dataSourceEmpleadoContrato = new MatTableDataSource<EmpleadoContratoEmpleadoProjection>();
  displayedColumnsEmpleadoContrato: string[] = [
    'selecciona',
    'fechaAlta',
    'tipoContrato',
    'fechaInicio',
    'fechaFin',
    'sueldoMensual',
    'ver'
  ];
  seleccionaEmpleadoContrato: EmpleadoContratoEmpleadoProjection = null;

  // Motivo
  listaTipoMotivo: ControlMaestroMultipleComboProjection[] = [];
  fechaMax = null;
  fechaMin = null;

  // Documentos
  listaTipoDocumento: ControlMaestroMultipleComboProjection[] = [];
  listaDocumentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection[] = [];
  listaEmpleadoDocumento: FormArray = new FormArray([]);
  displayedColumnsEmpleadoDocumento: string[] = [
    'archivo',
    'tipoDocumento',
    'fechaCreacion',
    'creadoPor',
    'acciones'
  ];

  // Private
	private _unsubscribeAll: Subject <any> ;

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _translateService: TranslateService,
    public _bajaService: BajaService,
    private _route: ActivatedRoute,
    private _hashid: HashidsService,
    private _formBuilder: FormBuilder,
    public _validatorService: ValidatorService,
    private _matSnackBar: MatSnackBar,
    public _dialog: MatDialog,
    private _router: Router,
    private _el: ElementRef
  ) { 
    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
    this._fuseTranslationLoaderService.loadTranslations(english,spanish);

    // Set the private defaults
		this._unsubscribeAll = new Subject();

    this.form = this._formBuilder.group({});
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      this.pageType = params.get("handle");
      let id: string = params.get("id");

      this.currentId = this._hashid.decode(id);
      if (this.pageType == 'ver') {
        this.esLectura = true;
      }

      this.config = {
          rutaAtras: "/app/ingreso-promocion/bajas",
          icono: "store"
      }

    });

    // Subscribe to update datos on changes
    this._bajaService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos && datos.solicitudBajaContratacion) {
        this.solicitudBajaContratacion = new SolicitudBajaContratacionEditarProjection(datos.solicitudBajaContratacion);
        (datos.listaEmpleadoDocumento as []).map(documento => {
          this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(documento));
        });
        this.titulo = this.solicitudBajaContratacion.codigo;
      } else {
        this.solicitudBajaContratacion = new SolicitudBajaContratacionEditarProjection();
        this.solicitudBajaContratacion.id = this.contadorRegistrosNuevos;

        // Descontador
        this.contadorRegistrosNuevos--;
      }

      this.listaEmpleado = datos.listaEmpleado;
      this.listaTipoMotivo = datos.listaTipoMotivo;
      this.listaTipoDocumento = datos.listaTipoDocumento;

      this.createSolicitudBajaContratacionForm();

    });

    // Datos del Empleado
    this._bajaService.onDatosEmpleadoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      this.isLoading = false;
      if(datos){
        this.empleado = datos.empleado;
        this.listaEmpleadoContrato = datos.listaEmpleadoContrato;
      }
    });

    // Documentos
    this._bajaService.onListaDocumentosConfiguracionRHChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((_listaDocumentosConfiguracionRH: DocumentosConfiguracionRHEditarProjection[]) => {
      if (_listaDocumentosConfiguracionRH != null) {
        this.listaDocumentosConfiguracionRH = _listaDocumentosConfiguracionRH;
        // if(_listaDocumentosConfiguracionRH.length == 0){
        //   this._matSnackBar.open('Necesitas configurar en la Matriz de Documentos. ', 'OK', {
        //     duration: 5000,
        //   });
        // }
      }
		});

    if (this.pageType == 'ver') {
      this.form.disable();
      this.deshabilitarBotones = false;
    } else {
      this.form.enable();
    }
  }

  // Solicitud Baja Contratacion
  createSolicitudBajaContratacionForm(){

    let _empleado: EmpleadoContratoEmpleadoProjection = this.solicitudBajaContratacion.empleadoContrato.empleadoId != null ? this.listaEmpleado.find(e => e.id == this.solicitudBajaContratacion.empleadoContrato.empleadoId) : null;

    this.form = this._formBuilder.group({
      empleado: new FormControl(_empleado, [Validators.required]),
      id: new FormControl(this.solicitudBajaContratacion.id),
      codigo: new FormControl(this.solicitudBajaContratacion.codigo),
      empleadoContrato: new FormControl(this.solicitudBajaContratacion.empleadoContrato, [Validators.required]),
      tipoMotivo: new FormControl(this.solicitudBajaContratacion.tipoMotivo, [Validators.required]),
      fechaSeparacion: new FormControl(this.solicitudBajaContratacion.fechaSeparacion ? moment(this.solicitudBajaContratacion.fechaSeparacion).format('YYYY-MM-DD') : null,  [Validators.required]),
      comentario: new FormControl(this.solicitudBajaContratacion.fechaSeparacion),
      estatusId: new FormControl(this.solicitudBajaContratacion.estatusId)
    });

    setTimeout(() => {
      this.form.controls['tipoMotivo'].disable();
      this.form.controls['comentario'].disable();
    }, 0);
    

    this.form.controls['empleado'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(empleado => {
      this.empleado = null;
      this.listaEmpleadoContrato = [];
      if(empleado){
        this.isLoading = true;
        if(!this.esLectura)
          this.limpiaCampos();
        this._bajaService.getDatosEmpleado(this.solicitudBajaContratacion.id, empleado.id);
      }
    });
  }

  changeSelecciona(empleadoContrato: EmpleadoContratoEmpleadoProjection){
    this.seleccionaEmpleadoContrato = empleadoContrato;
    if(!empleadoContrato){
      this.limpiaCampos();
    }else{
      this.form.controls['empleadoContrato'].setValue(empleadoContrato);
      this.form.controls['tipoMotivo'].enable();
      this.form.controls['comentario'].enable();
      this.fechaMin = moment(empleadoContrato.fechaInicio).format('YYYY-MM-DD');
      this.fechaMax = moment(empleadoContrato.fechaFin).format('YYYY-MM-DD');

      // Obtener los documentos
      this._bajaService.getListaDocumentosConfiguracionRH(ControlesMaestrosMultiples.CMM_RH_TipoProcesoRH.BAJA, empleadoContrato.tipoContrato.id);
    }
  }

  // Documentos
  createEmpleadoDocumentoForm(empleadoDocumento?: EmpleadoDocumentoEditarProjection, tipoDocumento?: ControlMaestroMultipleComboProjection, fechaVencimiento?: Date, fechaVigencia?: Date, archivo?: ArchivoProjection): FormGroup {

    empleadoDocumento = empleadoDocumento ? empleadoDocumento : new EmpleadoDocumentoEditarProjection();
    if(empleadoDocumento.id == null){
      empleadoDocumento.id = this.contadorRegistrosNuevos;
      empleadoDocumento.empleadoId = empleadoDocumento.empleadoId ? empleadoDocumento.empleadoId : this.empleado.id;
      empleadoDocumento.tipoDocumento = tipoDocumento;
      empleadoDocumento.fechaVencimiento = fechaVencimiento ? fechaVencimiento : null;
      empleadoDocumento.fechaVigencia = fechaVencimiento ? fechaVencimiento : null;
      empleadoDocumento.archivoId = archivo.id;
      empleadoDocumento.archivo = archivo;
      empleadoDocumento.activo = true;
      empleadoDocumento.tipoProcesoRHId = ControlesMaestrosMultiples.CMM_RH_TipoProcesoRH.BAJA;

      // Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoDocumento.id),
      empleadoId: new FormControl(empleadoDocumento.empleadoId),
      tipoDocumento: new FormControl(empleadoDocumento.tipoDocumento, [Validators.required]),
      archivoId: new FormControl(empleadoDocumento.archivoId, [Validators.required]),
      archivo: new FormControl(empleadoDocumento.archivo, []),
      fechaVencimiento: new FormControl(empleadoDocumento.fechaVencimiento, []),
      activo: new FormControl(empleadoDocumento.activo, [Validators.required, Validators.maxLength(50)]),
      tipoProcesoRHId: new FormControl(empleadoDocumento.tipoProcesoRHId)
    });

    if (this.pageType == 'editar' || this.pageType == 'ver') {

    }

    return form;
  }

  abrirDocumentoModal(): void {      
    let dialogData: DocumentoDialogData = {
      listaTipoDocumento: this.listaTipoDocumento,
      listaDocumentosConfiguracionRH: this.listaDocumentosConfiguracionRH,
      subCarpeta: 'baja',
      onAceptar: this.aceptarDocumentoModal.bind(this)
    };

    const dialogRef = this._dialog.open(DocumentoDialogComponent, {
      width: '600px',
      data: dialogData,
      autoFocus: true
    });
  }

  aceptarDocumentoModal(tipoDocumento: ControlMaestroMultipleComboProjection, fechaVencimiento: Date, fechaVigencia: Date, archivos: ArchivoProjection[]){
  //event.stopPropagation();
    archivos.map(archivo => {
      this.listaEmpleadoDocumento.push(this.createEmpleadoDocumentoForm(null, tipoDocumento, fechaVencimiento, fechaVigencia, archivo));
    });
  }

  cargaDataSourceListaEmpleadoDocumento(){
    return this.listaEmpleadoDocumento.value.filter(_empleadoDocumento => _empleadoDocumento.activo == true);
  }

  eliminaArchivoEmpleadoDocumento(empleadoDocumento: EmpleadoDocumentoEditarProjection): void{
    (this.listaEmpleadoDocumento.controls.find(_empleadoDocumento => _empleadoDocumento.value.id == empleadoDocumento.id) as FormGroup).controls['activo'].setValue(false);
  }

  // Cosas
  deshabilitarCampos(event){
    this.deshabilitarBotones = true;
  }

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  limpiaCampos(): void{

    // Fechas
    this.fechaMax = null;
    this.fechaMin = null;

    // Empleado Contrato
    this.form.controls['empleadoContrato'].setValue(null);
    this.form.controls['empleadoContrato'].markAsPristine();
    this.form.controls['empleadoContrato'].markAsUntouched();
    this.form.controls['empleadoContrato'].updateValueAndValidity();

    // Motivo
    this.form.controls['tipoMotivo'].setValue(null);
    this.form.controls['tipoMotivo'].markAsPristine();
    this.form.controls['tipoMotivo'].markAsUntouched();
    this.form.controls['tipoMotivo'].updateValueAndValidity();
    this.form.controls['tipoMotivo'].disable();

    // Fecha separacion
    this.form.controls['fechaSeparacion'].setValue(null);
    this.form.controls['fechaSeparacion'].markAsPristine();
    this.form.controls['fechaSeparacion'].markAsUntouched();
    this.form.controls['fechaSeparacion'].updateValueAndValidity();

    // Comentario
    this.form.controls['comentario'].setValue('');
    this.form.controls['comentario'].disable();
  }

  // Guardar, Enviar....
  guardar(): void{
    // Verificar si estan validaciones del Form
    if (!this.esValida()) {
      return;
    } 

    let json: any = {
      solicitudBajaContratacion: this.form.getRawValue(),
      listaEmpleadoDocumento: this.listaEmpleadoDocumento.getRawValue()
    }

    this._bajaService.cargando = true;
    this._bajaService.guardar(JSON.stringify(json), '/api/v1/bajas/save').then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
            duration: 5000,
          });
          this._router.navigate(['/app/ingreso-promocion/bajas/'])
        } else {
          this._bajaService.cargando = false;

          this._matSnackBar.open(this._translateService.instant('MENSAJE.ERROR_INESPERADO'), 'OK', {
            duration: 5000,
          });
        }
      }).bind(this)
    );
  }

  esValida(): boolean{
    // Verificar si estan validaciones del Form
    if (this.form.valid) {
      return true;
    } else {
      // validate all form fields
      let campoKey = '';
      for (const key of Object.keys(this.form.controls)) {
        // Normalmente Form
        if(this.form.controls[key].invalid){
          this.form.controls[key].markAsTouched();
          if(campoKey == ''){
            // Establecer la selecciona (TABS)
            // Datos Laborales
            campoKey = key;
          }
        }
      }

      const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
      if (invalidControl) {
        //let tab = invalidControl.parents('div.tab-pane').scope().tab
        //tab.select();                         
        invalidControl.focus();
      }

      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });

      return false;
    }
  }

  enviar(){
    this._matSnackBar.open('Aproximamente', 'OK', {
      duration: 5000,
    });
  }
}
