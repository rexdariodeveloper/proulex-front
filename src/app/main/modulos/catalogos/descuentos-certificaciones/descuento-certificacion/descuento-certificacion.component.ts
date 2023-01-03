import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { DescuentoCertificacionService } from './descuento-certificacion.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { HashidsService } from '@services/hashids.service';
import { ProgramaIdiomaComboDescuentoCertificacionProjection, ProgramaIdiomaEditarProjection } from '@app/main/modelos/programa-idioma';
import { ProgramaIdiomaCertificacionDescuentoEditarProjection } from '@app/main/modelos/programa-idioma-certificacion-descuento';
import { takeUntil } from 'rxjs/operators';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection } from '@app/main/modelos/programa-idioma-certificacion-descuento-detlle';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ProgramaIdiomaCertificacionComboProjection } from '@app/main/modelos/programa-idioma-certificacion';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DescuentoCertificacionDescuentoDialog } from './dialogs/descuento-certificacion-descuento.dialog';
import { JsonResponse } from '@models/json-response';

@Component({
  selector: 'app-descuento-certificacion',
  templateUrl: './descuento-certificacion.component.html',
  styleUrls: ['./descuento-certificacion.component.scss']
})
export class DescuentoCertificacionComponent implements OnInit {

  @ViewChild('listaCertificacionSelect') listaCertificacionSelect: PixvsMatSelectComponent;

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
  //esLectura: boolean = false;

  // Ficha
  programaIdiomaCertificacionDescuento: ProgramaIdiomaCertificacionDescuentoEditarProjection;
  programaIdioma: ProgramaIdiomaComboDescuentoCertificacionProjection = null;
  listaCurso: ProgramaIdiomaComboDescuentoCertificacionProjection[] = [];
  listaCertificacion: ProgramaIdiomaCertificacionComboProjection[] = [];
  
  // Tabla de descuentos
  displayedColumnsDescuentos: string[] = ['numeroNivel', 'porcentajeDescuento', 'boton'];

  // Formularios
  form: FormGroup;
  listaDescuentoFormArray: FormArray = new FormArray([]);

  // Otros
  maxNumeroNivel: number = 0;

  // Set the private defaults
	private _unsubscribeAll: Subject <any> = new Subject();

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _translateService: TranslateService,
    public _descuentoCertificacionService: DescuentoCertificacionService,
    private _route: ActivatedRoute,
    private _hashid: HashidsService,
    private _formBuilder: FormBuilder,
    public _dialog: MatDialog,
    private _matSnackBar: MatSnackBar,
    private _el: ElementRef,
    private _router: Router,
  ) { 
    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
    this._fuseTranslationLoaderService.loadTranslations(english,spanish);
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      this.pageType = params.get("handle");
      let id: string = params.get("id");

      this.currentId = this._hashid.decode(id);
      if (this.pageType == 'ver') {
        //this.esLectura = true;
      }

      this.config = {
          rutaAtras: "/app/catalogos/descuentos-certificaciones",
          icono: "store"
      }
    });

    // Subscribe to update datos on changes
    this._descuentoCertificacionService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos && datos.programaIdiomaCertificacionDescuento) {
        this.deshabilitarBotones = false;
        this.programaIdiomaCertificacionDescuento = datos.programaIdiomaCertificacionDescuento;
        this.programaIdioma = datos.programaIdioma;
        this.listaCertificacion = datos.listaCertificacion;

        this.maxNumeroNivel = this.programaIdioma.numeroNiveles;
        this.titulo = 'editar'
      } else {
        this.programaIdiomaCertificacionDescuento = new ProgramaIdiomaCertificacionDescuentoEditarProjection();
        this.programaIdiomaCertificacionDescuento.id = this.contadorRegistrosNuevos;
        this.programaIdiomaCertificacionDescuento.estatusId = ControlesMaestrosMultiples.CMM_Estatus.ACTIVO;

        // Descontador
        this.contadorRegistrosNuevos--;
      }

      this.listaCurso = datos.listaCurso;

      this.createProgramaIdiomaCertificacionDescuentoForm();

    });

    // get lista de certificacion
    this._descuentoCertificacionService.onListaCertificacionChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((listaCertificacion: ProgramaIdiomaCertificacionComboProjection[]) => {
      this.isLoading = false;

      if(listaCertificacion){
        this.listaCertificacion = listaCertificacion;
        this.listaCertificacionSelect.setDatos(this.listaCertificacion);
      }
    });
  }

  ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

  // Descuento Certificacion
  createProgramaIdiomaCertificacionDescuentoForm(){

    if(this.programaIdiomaCertificacionDescuento.listaDescuento){
      this.programaIdiomaCertificacionDescuento.listaDescuento.filter(descuento => descuento.activo == true).map(descuento => {
        this.listaDescuentoFormArray.push(this.createProgramaIdiomaCertificacionDescuentoDetalleForm(descuento));
      });
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(this.programaIdiomaCertificacionDescuento.id),
      programaIdioma: new FormControl(this.programaIdioma, [Validators.required]),
      programaIdiomaCertificacion: new FormControl(this.programaIdiomaCertificacionDescuento.programaIdiomaCertificacion, [Validators.required]),
      estatusId: new FormControl(this.programaIdiomaCertificacionDescuento.estatusId),
      listaDescuento: this.listaDescuentoFormArray
      
    });

    form.controls['programaIdioma'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((curso: ProgramaIdiomaComboDescuentoCertificacionProjection) => {
      if(curso){
        this.isLoading = true;
        this.maxNumeroNivel = curso.numeroNiveles;
        this.programaIdioma = curso;
        this._descuentoCertificacionService.getListaCertificacion(curso.id);
      }
    });

    this.form = form;
  }

  // Descuento Certificacion Descuento
  createProgramaIdiomaCertificacionDescuentoDetalleForm(descuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection): FormGroup{

    descuento = descuento ? descuento : new ProgramaIdiomaCertificacionDescuentoEditarProjection();

    if(descuento.id == null){
      descuento.id = this.contadorRegistrosNuevos;
      descuento.activo = true;

      //Descontador
      this.contadorRegistrosNuevos--;
    }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(descuento.id),
      numeroNivel: new FormControl(descuento.numeroNivel, [Validators.required, Validators.min(0), Validators.max(this.maxNumeroNivel)]),
      porcentajeDescuento: new FormControl(descuento.porcentajeDescuento, [Validators.required, Validators.min(0), Validators.max(100)]),
      activo: new FormControl(descuento.activo)
    });

    return form;
  }

  deshabilitarCampos(){
    this.deshabilitarBotones = true;
  }

  // Tabla de Descuentos //
  getListaDescuentoActivo(): ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection[]{
    return this.listaDescuentoFormArray.value.filter(comision => comision.activo == true);
  }

  abrirModalDescuento(esNuevo: boolean, descuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection){
    if(!this.deshabilitarBotones)
      return;

    if(this.form.controls.programaIdioma.invalid){
      this._matSnackBar.open(this._translateService.instant('Selecciones el curso, por favor'), 'OK', {
        duration: 5000,
      });
      return;
    }

    let descuentoForm: FormGroup = this.createProgramaIdiomaCertificacionDescuentoDetalleForm(descuento);

    const dialogRef = this._dialog.open(DescuentoCertificacionDescuentoDialog, {
      width: '600px',
      data: {
        esNuevo: esNuevo,
        form: descuentoForm,
        listaDescuento: (this.listaDescuentoFormArray.value as []).filter((_descuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection) => _descuento.activo == true)
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((_descuentoForm: FormGroup) => {
      if (_descuentoForm) {
        if(esNuevo)
          this.agregarDescuento(_descuentoForm);
        else
          this.modificarDescuento(_descuentoForm);
      }
    });
  }

  agregarDescuento(descuentoForm: FormGroup){
    this.listaDescuentoFormArray.push(descuentoForm);
  }

  modificarDescuento(descuentoForm: FormGroup){
    var descuentoActualizar = this.listaDescuentoFormArray.controls.find((descuento: FormGroup) => descuento.controls.id.value == descuentoForm.controls.id.value);
    descuentoActualizar.patchValue(descuentoForm.value);
  }

  borrarDescuento(descuento: ProgramaIdiomaCertificacionDescuentoDetalleEditarProjection): void{
    if(!this.deshabilitarBotones)
      return;

    let descuentoForm: FormGroup = this.listaDescuentoFormArray.controls.find((_descuento: FormGroup) => _descuento.value.id == descuento.id) as FormGroup;
    if(descuento.id > 0){
        descuentoForm.controls.activo.setValue(false);
    }else{
        this.listaDescuentoFormArray.removeAt(this.listaDescuentoFormArray.controls.findIndex((_descuento: FormGroup) => _descuento.value.id == descuento.id));
    }
}
  /////////////////////////

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  guardar(){
    // Verificar si estan validaciones del Form
    if (!this.esValidaForm()) {
      return;
    } 

    this._descuentoCertificacionService.cargando = true;
    this._descuentoCertificacionService.guardar(this.form.getRawValue(), '/api/v1/descuentos-certificaciones/save').then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
            duration: 5000,
          });
          this._router.navigate([this.config.rutaAtras])
        } else {
          this._descuentoCertificacionService.cargando = false;
          this.form.enable();
          this._matSnackBar.open(this._translateService.instant(result.message), 'OK', {
            duration: 5000,
          });
        }
      }).bind(this)
    );
  }

  esValidaForm(): boolean{
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

}
