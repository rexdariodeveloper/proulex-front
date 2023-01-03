import { Component, HostListener, OnInit } from '@angular/core';
import { AbstractControl, FormControl, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { ListadoValeCertificacionService } from './listado-vale-certificacion.service';
import * as moment from 'moment';
import { PAModalidadHorarioComboSimpleProjection } from '@app/main/modelos/pamodalidad-horario';
import { ArchivoProjection } from '@models/archivo';
import { ProgramaIdiomaCertificacionValeListadoProjection } from '@app/main/modelos/programa-idioma-certificacion-vale';
import { MatDialog } from '@angular/material/dialog';
import { ListadoValeCertificacionReenviarDialog } from './dialogs/listado-vale-certificacion-reenviar/listado-vale-certificacion-reenviar.dialog';
import { TranslateService } from '@ngx-translate/core';

interface FechaModel {
	id: number,
	fecha: string
};

@Component({
  selector: 'app-listado-vale-certificacion',
  templateUrl: './listado-vale-certificacion.component.html',
  styleUrls: ['./listado-vale-certificacion.component.scss']
})
export class ListadoValeCertificacionComponent {

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
    mostrarBotonEnviar: true,
    etiquetaEnviar: 'Generar vales certificación',
    columns: [
        { name: 'codigo', title: 'Código', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'alumno', title: 'Alumno', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'sede', title: 'Sede Origen', class: "mat-column-flex", centrado: false, type: null,tooltip: true },
        { name: 'curso', title: 'Curso', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'nivel', title: 'Niveles', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'certificacion', title: 'Certificación', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'descuento', title: 'Descuento', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'vigencia', title: 'Vigencia', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'costoFinal', title: 'Costo Final', class: "mat-column-flex", centrado: false, type: 'money', tooltip: true },
        { name: 'estatus', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'acciones', title: 'Acciones', class: "mat-column-100", centrado: false, type: 'acciones' }
    ],
    displayedColumns: ['codigo', 'alumno', 'sede','curso', 'nivel', 'certificacion', 'descuento', 'vigencia', 'costoFinal', 'estatus', 'acciones'],
    columasFechas: [],
    listadoMenuOpciones: [],
    listadoAcciones: [
      {
        title: 'Acciones',
        tipo: 'menu',
        icon: 'more_vert',
        ocultarBotonTodo: true,
        columnaOpcionesMenu: 'menuAcciones',
        columnaMostrarOpcionMenu: 'nombre',
        accion: this.onAcciones.bind(this),
      }
    ]
  };

  listaSede: SucursalComboProjection[] = [];
  listaAnio: number[] = [];
  listaCurso: ProgramaIdiomaComboProjection[] = [];
  listaModalidad: PAModalidadComboSimpleProjection[] = [];
  listaFecha: FechaModel[] = [];

  mySubscription;

  constructor(
    public _fichasDataService: FichasDataService,
		public _listadoService: ListadoValeCertificacionService,
    private _matSnackBar: MatSnackBar,
    public _dialog: MatDialog,
    public _translateService: TranslateService
  ) { 
    this._unsubscribeAll = new Subject();
    // this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.mySubscription = this._router.events.subscribe((event) => {
    //   if (event instanceof NavigationEnd) {
    //       Trick the Router into believing it's last link wasn't previously loaded
    //       this._router.navigated = false;
    //   }
    // }); 
  }

  ngOnInit(): void {
    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if(datos?.listaSede){
        this.listaSede = datos?.listaSede || [];
        this.listaAnio = datos?.listaAnio || [];
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

    //Acciones
    // Actualizar el Alumno
    this._listadoService.onActualizarAlumno.pipe(takeUntil(this._unsubscribeAll)).subscribe((vale: ProgramaIdiomaCertificacionValeListadoProjection) => {
      if(vale){
        var listaVale: ProgramaIdiomaCertificacionValeListadoProjection[] = Object.assign([],this._fichasDataService.datos);
        listaVale[listaVale.findIndex(_vale => _vale.id == vale.id)] = vale;
        this._fichasDataService.setDatos(listaVale);
      }
    });

    // Actualizar los Alumnos
    this._listadoService.onActualizarAlumnos.pipe(takeUntil(this._unsubscribeAll)).subscribe((vales: ProgramaIdiomaCertificacionValeListadoProjection[]) => {
      if(vales){
        var listaVale: ProgramaIdiomaCertificacionValeListadoProjection[] = Object.assign([],this._fichasDataService.datos);
        vales.map(vale => {
          listaVale[listaVale.findIndex(_vale => _vale.id == vale.id)] = vale;
        })
        this._fichasDataService.setDatos(listaVale);
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    // if (this.mySubscription) {
    //  this.mySubscription.unsubscribe();
    // }
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

    config.push({
      type: "input",
      label: "Alumno",
      inputType: "text",
      name: "alumno",
      formControl: new FormControl(null),
      validations: [{ "name": "maxlength", "validator": Validators.maxLength(100), "message": "Máximo 100 caracteres" }]
    })

    this.regConfig = [...config];
    this.setSubscripcionesFiltros();
  }

  setSubscripcionesFiltros(): void {
    let field: FormControl = null;

    // Sede
    field = this.regConfig.find( item => item.name === 'sede')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
        if(value){
          this._listadoService.getListaCurso(value.id);
        }else{
          this.actualizaCampoLista('listaCurso', []);
        }
        // Limpiar los filtros al cambiar de sede
        this.limpiaFiltros();
      });
    }

    // Anio
    field = this.regConfig.find( item => item.name === 'anio')?.formControl;
    if(field){
      field.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
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
      field.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
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
      field.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
        if(value.length){
          const anio = this.regConfig.find(item => item.name == 'anio').formControl.value;
          if (anio && value && value.length) {
            var json = {
              sede: this.regConfig.find( item => item.name === 'sede')?.formControl.value,
              listaCurso: this.regConfig.find( item => item.name === 'listaCurso')?.formControl.value,
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

    // Nota de Venta
    field = this.regConfig.find(item => item.name === 'alumno')?.formControl;
    if (field) {
      field.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
        
        // Sede
        field = this.regConfig.find(item => item.name === 'sede')?.formControl;
        if (value != '') {
          if (field.validator != null) {
            field.clearValidators();
            field.updateValueAndValidity();
          }
        } else {
          field.setValidators([Validators.required]);
          field.updateValueAndValidity();
        }

        // Curso
        field = this.regConfig.find(item => item.name === 'listaCurso')?.formControl;
        if (value != '') {
          if (field.validator != null) {
            field.clearValidators();
            field.updateValueAndValidity();
          }
        } else {
          field.setValidators([Validators.required]);
          field.updateValueAndValidity();
        }

        // Modalidad
        field = this.regConfig.find(item => item.name === 'listaModalidad')?.formControl;
        if (value != '') {
          if (field.validator != null) {
            field.clearValidators();
            field.updateValueAndValidity();
          }
        } else {
          field.setValidators([Validators.required]);
          field.updateValueAndValidity();
        }
  
        // Fecha Inicio
        field = this.regConfig.find(item => item.name === 'listaFecha')?.formControl;
        if (value != '') {
          if (field.validator != null) {
            field.clearValidators();
            field.updateValueAndValidity();
          }
        } else {
          field.setValidators([Validators.required]);
          field.updateValueAndValidity();
        }
      });
    }
  }

  actualizaCampoLista(name: string, list: any[]): void{

    var field = this.regConfig.find(item => item.name === name);
    let index: number = this.regConfig.indexOf(field);

    field.list = list;
    // Actualizamos el campo
    this.regConfig[index] = {...field};
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

  onAcciones(accion: any, event, alumnoGrupoId) {
    event.preventDefault();
    // Generar vale de ceriticacion
    if(accion.id == 1){
      this._listadoService.getValeCertificacionGenerar(alumnoGrupoId);
    }

    // Enviar vale de ceriticacion
    if(accion.id == 2){
      this._listadoService.getValeCertificacionEnviar(alumnoGrupoId);
    }

    // Reenviar vale de ceriticacion
    if(accion.id == 3){
      this.abrirModalReenviar(alumnoGrupoId);
    }

    // Imprimir vale de ceriticacion
    if(accion.id == 5){
      this._listadoService.getValeCertificacionImprimir(alumnoGrupoId);
    }

    // Borrar vale de ceriticacion
    if(accion.id == 6){
      this._listadoService.getValeCertificacionBorrar(alumnoGrupoId);
    }

    // Cancelar vale de certificacion
    if(accion.id == 7){
      this._listadoService.getValeCertificacionCancelar(alumnoGrupoId);
    }
  }

  abrirModalReenviar(alumnoGrupoId: number){

    const dialogRef = this._dialog.open(ListadoValeCertificacionReenviarDialog, {
      width: '600px',
      data: {
        alumnoGrupoId: alumnoGrupoId
      },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe((json) => {
      
    });
  }

  onGenerarValesCertificacion(){
    let listaVale: ProgramaIdiomaCertificacionValeListadoProjection[] = Object.assign([], this._fichasDataService.datos);

    if(listaVale.length == 0){
      this._matSnackBar.open(this._translateService.instant('No hay registro para generar'), 'OK', {
				duration: 5000,
			});

      return;
    }

    // Obtenemos los vales que sea el estatus "No generado" para hacer generar
    listaVale = listaVale.filter(vale => vale.estatus == 'No generado');

    let listaAlumnoGrupoId: number[] = [];
    listaVale.map(vale => listaAlumnoGrupoId.push(vale.id));

    this._listadoService.getValeCertificacionGenerarTodos(listaAlumnoGrupoId);
  }
}
