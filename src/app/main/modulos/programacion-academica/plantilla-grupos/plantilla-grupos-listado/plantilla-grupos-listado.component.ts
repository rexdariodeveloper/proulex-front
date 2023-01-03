import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { HttpService } from '@services/http.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ErroresDialogComponent, ErroresDialogData } from './dialogs/errores/errores.dialog';
import { PlantillaGruposListadoService } from './plantilla-grupos-listado.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { NavigationEnd, Router } from '@angular/router';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { PAModalidadHorarioComboSimpleProjection } from '@app/main/modelos/pamodalidad-horario';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';

interface FechaModel {
	id: number,
	fecha: string
};

@Component({
  selector: 'app-plantilla-grupos-listado',
  templateUrl: './plantilla-grupos-listado.component.html',
  styleUrls: ['./plantilla-grupos-listado.component.scss']
})
export class PlantillaGruposListadoComponent {

  @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
      return !this.isLoading;
  }
  private _unsubscribeAll: Subject <any>;
  regConfig: FieldConfig[] = [];
  isLoading: boolean = false;
  uploadURL: string = null;

  config: FichaListadoConfig = {
    localeEN: english,
		localeES: spanish,
		icono: "view_list",
		columnaId: "id",
		rutaDestino: null,
    ocultarBotonNuevo:true,
    columns: [
        { name: 'codigoGrupo', title: 'Código de Grupo', class: "mat-column-flex", centrado: false, type: 'null', tooltip: true },
        { name: 'nombreGrupo', title: 'Grupo', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'plantel', title: 'Plantel', class: "mat-column-flex", centrado: false, type: null,tooltip: true },
        { name: 'fechaInicio', title: 'Fecha Inicio', class: "mat-column-flex", centrado: false, type: 'fecha', tooltip: true },
        { name: 'fechaFin', title: 'Fecha Fin', class: "mat-column-flex", centrado: false, type: 'fecha', tooltip: true },
        { name: 'nivel', title: 'Nivel', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'horario', title: 'Horario', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'cupo', title: 'Cupo', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'inscrito', title: 'Total de inscrito', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'nombreProfesor', title: 'Profesor', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'acciones', title: 'Documentos', class: "mat-column-100", centrado: false, type: 'acciones' }
    ],
    displayedColumns: ['codigoGrupo', 'nombreGrupo', 'plantel','fechaInicio', 'fechaFin', 'nivel', 'horario', 'cupo', 'inscrito', 'nombreProfesor', 'acciones'],
    columasFechas: [],
    listadoMenuOpciones: [],
    listadoAcciones: [
      { title: 'Descargar Resumen', icon: 'play_for_work', tipo: 'download', url: "/api/v1/grupos/exportar/resumen/pdf/" },
			{ title: 'Descargar Boletas', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/captura_calificaciones/boletas/" }
    ]
  };

  listaSede: SucursalComboProjection[] = [];
  listaPlantel: SucursalPlantelComboProjection[] = [];
  listaAnio: number[] = [];
  listaCurso: ProgramaIdiomaComboProjection[] = [];
  listaModalidad: PAModalidadComboSimpleProjection[] = [];
  listaFecha: FechaModel[] = [];

  private subscripcionesFiltros: Subject<any>;

  mySubscription;

  constructor(
    public _fichasDataService: FichasDataService,
		public _listadoService: PlantillaGruposListadoService,
		private _matSnackBar: MatSnackBar,
    private _httpClient: HttpService,
    public _dialog: MatDialog,
    private _router: Router,
    private _translate: TranslateService
  ) { 
    this._unsubscribeAll = new Subject();
    this.subscripcionesFiltros = new Subject();
    //this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.mySubscription = this._router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //     // Trick the Router into believing it's last link wasn't previously loaded
    //     this._router.navigated = false;
    //   }
    // });
  }

  ngOnInit(): void {
    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
        if (datos?.datos) {
          let permisos: Object = datos?.permisos || new Object();
					this.config.listadoMenuOpciones = [];
					this.config.paginatorSize = 100;

					if (permisos.hasOwnProperty('DESCARGAR_PLANTILLA_ALUMNOS_SEMS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar plantilla alumnos SEMS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/download/SEMS' });
					if (permisos.hasOwnProperty('DESCARGAR_PLANTILLA_PROFESORES_SEMS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar plantilla profesores SEMS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/profesores/download/SEMS' });
					if (permisos.hasOwnProperty('DESCARGAR_LISTADO_ALUMNOS_SEMS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar alumnos SEMS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/alumnos/download/SEMS' });
					if (permisos.hasOwnProperty('IMPORTAR_PLANTILLA_ALUMNOS_SEMS'))
						this.config.listadoMenuOpciones.push({ title: 'Importar plantilla alumnos SEMS', icon: 'arrow_upward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/upload' });
					if (permisos.hasOwnProperty('IMPORTAR_PLANTILLA_PROFESORES_SEMS'))
						this.config.listadoMenuOpciones.push({ title: 'Importar plantilla profesores SEMS', icon: 'arrow_upward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/profesores/upload' });
					if (permisos.hasOwnProperty('DESCARGAR_PLANTILLA_ALUMNOS_JOBS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar plantilla alumnos JOBS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/download/JOBS' });
					if (permisos.hasOwnProperty('DESCARGAR_PLANTILLA_PROFESORES_JOBS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar plantilla profesores JOBS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/profesores/download/JOBS' });
					if (permisos.hasOwnProperty('DESCARGAR_LISTADO_ALUMNOS_JOBS'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar alumnos JOBS', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/alumnos/download/JOBS' });
					if (permisos.hasOwnProperty('IMPORTAR_PLANTILLA_ALUMNOS_JOBS'))
						this.config.listadoMenuOpciones.push({ title: 'Importar plantilla alumnos JOBS', icon: 'arrow_upward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/upload' });
					if (permisos.hasOwnProperty('IMPORTAR_PLANTILLA_PROFESORES_JOBS'))
						this.config.listadoMenuOpciones.push({ title: 'Importar plantilla profesores JOBS', icon: 'arrow_upward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/profesores/upload' });
					if (permisos.hasOwnProperty('DESCARGAR_PLANTILLA_ALUMNOS_PCP'))
						this.config.listadoMenuOpciones.push({ title: 'Descargar plantilla alumnos PCP', icon: 'arrow_downward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/download/PCP' });
					if (permisos.hasOwnProperty('IMPORTAR_PLANTILLA_ALUMNOS_PCP'))
						this.config.listadoMenuOpciones.push({ title: 'Importar plantilla alumnos PCP', icon: 'arrow_upward', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/plantilla-grupos/template/upload' });
					if (permisos.hasOwnProperty('EXPORTAR_EXCEL_GRUPOS'))
						this.config.listadoMenuOpciones.push({ title: 'EXCEL', icon: 'table_chart', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/plantilla-grupos/download/excel' });

          this.listaSede = datos?.listaSede || [];
          this.listaAnio = datos?.listaAnio || [];
          this.listaCurso = datos?.listaCurso || [];
          this.listaModalidad = datos?.listaModalidad || [];
          this.setFiltros();
        }
    });

    // Plantel
    this._listadoService.onListaPlantelChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(_listaPlantel => {
      if(_listaPlantel){
        this.listaPlantel = _listaPlantel;
        this.actualizaCampoLista('listaPlantel', this.listaPlantel);
      }
    });

    // Curso
    this._listadoService.onListaCursoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(_listaCurso => {
      if(_listaCurso){
        this.listaCurso = _listaCurso;
        this.actualizaCampoLista('listaCurso', this.listaCurso);
      }
    });

    // Modalidad
    this._listadoService.onListaModalidadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(_listaModalidad => {
      if(_listaModalidad){
        this.listaModalidad = _listaModalidad;
        this.actualizaCampoLista('listaModalidad', this.listaModalidad);
      }
    });

    // Fecha
    this._listadoService.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(_listaFecha => {
      if (!!_listaFecha) {
        if (_listaFecha?.length == 0) {
          this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
        } else {
          this.listaFecha = [];
          let id: number = 1;
          _listaFecha.map(item => {
            let fechaModel: FechaModel;
            fechaModel = {
              id: id,
              fecha: moment(item).format('DD/MM/YYYY')
            }
            this.listaFecha.push(fechaModel);
            // Contador
            id++;
          });
          this.actualizaCampoLista('listaFecha',this.listaFecha);
        }
      }
    });

    this.setFiltros();
  }

  actualizaCampoLista(name: string, list: any[]): void{

    var field = this.regConfig.find(item => item.name === name);
    let index: number = this.regConfig.indexOf(field);

    // Obtenemos validador
    const validator = field.formControl.validator({} as AbstractControl);
    // Cuando no hay lista de Plantel para quitar el obligatorio
    if(name == 'listaPlantel' && list.length == 0){
      if(validator?.required){
        field.formControl.clearValidators();
        field.formControl.updateValueAndValidity();
      }
    }
    else{
      if(name == 'listaPlantel'){
        if(!validator?.required){
          field.formControl.setValidators([Validators.required]);
          field.formControl.updateValueAndValidity();
        }
      }
    } 

    field.list = list;
    // Actualizamos el campo
    this.regConfig[index] = {...field};
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    // if (this.mySubscription) {
    //  this.mySubscription.unsubscribe();
    // }
    this.subscripcionesFiltros.next();
    this.subscripcionesFiltros.complete();
  }

  setFiltros(): void {
    let config: FieldConfig[] = [];
    
    this.config.paginatorSize = 100;
   
    config.push({
      type: "pixvsMatSelect",
      label: "Sede",
      name: "sede",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: false,
      selectAll: false,
      list: this.listaSede,
      campoValor: 'nombre'
    });
    
    config.push({
      type: "pixvsMatSelect",
      label: "Plantel Grupo",
      name: "listaPlantel",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: true,
      list: this.listaPlantel,
      campoValor: 'nombre'
    });
    
    config.push({
      type: "pixvsMatSelect",
      label: "Año",
      name: "anio",
      formControl: new FormControl(new Date().getFullYear(), [Validators.required]),
      validations: [],
      multiple: false,
      selectAll: false,
      list: this.listaAnio
    });

    config.push({
      type: "pixvsMatSelect",
      label: "Curso",
      name: "listaCurso",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: false,
      list: this.listaCurso,
      campoValor: 'nombre'
    });

    config.push({
      type: "pixvsMatSelect",
      label: "Modalidad",
      name: "listaModalidad",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: false,
      list: this.listaModalidad,
      campoValor: 'nombre',
      values: ['codigo', 'nombre']
    });

    config.push({
      type: "pixvsMatSelect",
      label: "Fecha de inicio",
      name: "listaFecha",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: false,
      list: this.listaFecha,
      campoValor: 'fecha'
    });

    this.regConfig = [...config];
    this.setSubscripcionesFiltros();
  }

  setSubscripcionesFiltros(): void {
    this.subscripcionesFiltros.next();
    this.subscripcionesFiltros.complete();
    let field: FormControl = null;

    // Sede
    field = this.regConfig.find( item => item.name === 'sede')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        if(value){
          this._listadoService.getListaPlantel(value.id);
          this._listadoService.getListaCurso(value.id);
        }else{
          this.actualizaCampoLista('listaPlantel', []);
          this.actualizaCampoLista('listaCurso', []);
        }

        // Limpiar los filtros al cambiar de sede
        this.limpiaFiltros();
      });
    }

    // Anio
    field = this.regConfig.find( item => item.name === 'anio')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        if(value){
          const _listaModalidad: PAModalidadHorarioComboSimpleProjection[] = this.regConfig.find(item => item.name == 'listaModalidad').formControl.value;
          if (value && _listaModalidad && _listaModalidad.length) {
            var json = {
              anio: value,
              listaModalidad: _listaModalidad
            };
            this._listadoService.getListaFecha(json);
          }
        }else{
          this.actualizaCampoLista('listaFecha', []);
        }
      });
    }

    // Curso
    field = this.regConfig.find( item => item.name === 'listaCurso')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        if(value.length){
          var json = {
            listaCurso: value
          };
          this._listadoService.getListaModalidad(json);
        }else{
          this.actualizaCampoLista('listaModalidad', []);
        }
      });
    }

    // Modalidad
    field = this.regConfig.find( item => item.name === 'listaModalidad')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        if(value.length){
          const anio = this.regConfig.find(item => item.name == 'anio').formControl.value;
          if (anio && value && value.length) {
            var json = {
              anio: anio,
              listaModalidad: value
            };
    
            this._listadoService.getListaFecha(json);
          }
        }else{
          this.actualizaCampoLista('listaFecha', []);
        }
      });
    }
  }

  limpiaFiltros(){
    let field: FormControl = null;

    // Año
    field = this.regConfig.find( item => item.name === 'anio')?.formControl;
    if(field.value != new Date().getFullYear()){
      field.setValue(new Date().getFullYear());
    }

    // Curso
    field = this.regConfig.find( item => item.name === 'listaCurso')?.formControl;
    field.setValue([]);
    field.markAsPristine();
    field.markAsUntouched();
    field.updateValueAndValidity();

    // Modalidad
    field = this.regConfig.find( item => item.name === 'listaModalidad')?.formControl;
    field.setValue([]);
    field.markAsPristine();
    field.markAsUntouched();
    field.updateValueAndValidity();

    // Fecha
    field = this.regConfig.find( item => item.name === 'listaFecha')?.formControl;
    field.setValue([]);
    field.markAsPristine();
    field.markAsUntouched();
    field.updateValueAndValidity();
  }

  getOption(opcion: ListadoMenuOpciones): void{
		if(opcion.title.toLocaleUpperCase().includes('IMPORTAR')){
			this.openFileLoader(opcion);
		} else {
      this.descargarExcel(opcion);
      
		}
	}

  descargarExcel(opcion: ListadoMenuOpciones): void{
    // Loader
    this.isLoading = true;
    // Variables
    let json: {} = {}, esValidar: boolean = true;

    for(let x = 0; x < this.regConfig.length; x++){
      // Verficamos si la validacion es false para no seguir
      if(this.regConfig[x].formControl.invalid){
        // Cambiamos el valor de validar
        esValidar = false;
        this.regConfig[x].formControl.markAsTouched();
        this._matSnackBar.open(this._translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
          duration: 5000,
        });
        // Loader
        this.isLoading = false;
        break;
      }

      // Establecer el valor del formcontrol
      json = { ...json, [this.regConfig[x].name]: this.regConfig[x].formControl.value }
    }

    if(esValidar){
      this._matSnackBar.openFromComponent(IconSnackBarComponent, {
        data: {
            message: this._translate.instant('INTERFAZ.DESCARGANDO')+'...',
            icon: 'cloud_download',
        },
        horizontalPosition: 'right'
      });

      this._listadoService.getExcelConFiltros(opcion.url, json).finally(() => {
        this._matSnackBar.dismiss();
        // Loader
        this.isLoading = false;
      });
    }
  }

	openFileLoader(opcion): void {
		this.uploadURL = opcion.url || null;
		document.getElementById('fileloader').click();
	}

  onLoadFile(files): void {
		let fileToUpload = files.item(0);
		let formData: FormData = new FormData();
		formData.append('file', fileToUpload, fileToUpload.name);
		this.isLoading = true;
		this._httpClient.upload_form(formData, this.uploadURL, true)
		.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
			this._matSnackBar.open(response?.message, 'OK', { duration: 5000 });
			this.isLoading = false;
			(<HTMLInputElement> document.getElementById('fileloader')).value = "";
			if(response.status == 200){
				let dialogData: ErroresDialogData = {
					response: response?.data || [],
					onAceptar: this.aceptarDialog.bind(this)
				};
	
				const dialogRef = this._dialog.open(ErroresDialogComponent, {
					width: '800px',
					data: dialogData,
					disableClose: true
				});
			}
			
		}, (response) => {
			let message = response.error?.message || 'Hubo un error al procesar la plantilla';
			this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
			this.isLoading = false;
			(<HTMLInputElement> document.getElementById('fileloader')).value = "";
		});
	}

  aceptarDialog(){

	}

}
