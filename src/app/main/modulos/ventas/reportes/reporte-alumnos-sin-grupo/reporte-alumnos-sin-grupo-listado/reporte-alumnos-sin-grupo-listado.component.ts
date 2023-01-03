import { Component, HostListener, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { Observable, Subject } from 'rxjs';
import { ReporteAlumnosSinGrupoListadoService } from './reporte-alumnos-sin-grupo-listado.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { FormControl, Validators } from '@angular/forms';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
  selector: 'app-reporte-alumnos-sin-grupo-listado',
  templateUrl: './reporte-alumnos-sin-grupo-listado.component.html',
  styleUrls: ['./reporte-alumnos-sin-grupo-listado.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReporteAlumnosSinGrupoListadoComponent {

  @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
      return !this.isLoading;
  }
  isLoading: boolean = false;
  regConfig: FieldConfig[] = [];

  config: FichaListadoConfig = {
    localeEN: english, localeES: spanish,
    icono: 'folder_open',
    columnaId: 'id',
    rutaDestino: null,
    ocultarBotonNuevo:true,
    columns: [
        { name: 'sede', title: 'Sede', class: "mat-column-flex text-right", centrado: false, type: null, tooltip: true },
        { name: 'alumnoCodigo', title: 'Código Alumno', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'alumnoCodigoUDG', title: 'Código UDG', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'alumnoPrimerApellido', title: 'Primero apellido', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'alumnoSegundoApellido', title: 'Segundo apellido', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'alumnoNombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'curso', title: 'Curso', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'nivel', title: 'Nivel', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'paModalidadNombre', title: 'Modalidad', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'montoPago', title: 'Monto pago', class: "mat-column-flex", centrado: false, type: 'money', tooltip: true },
        { name: 'medioPago', title: 'Medio de pago', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'ovCodigo', title: 'Nota de venta', class: "mat-column-flex", centrado: false, type: null, tooltip: true },
        { name: 'estatus', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null, stickyEnd: false, tooltip: true }
    ],
    displayedColumns: ['sede', 'alumnoCodigo', 'alumnoCodigoUDG','alumnoPrimerApellido', 'alumnoSegundoApellido', 'alumnoNombre', 'curso', 'nivel', 'paModalidadNombre', 'montoPago', 'medioPago', 'ovCodigo', 'estatus'],
    columasFechas: [],
    listadoMenuOpciones: [],
    listadoAcciones: [],
    esFusePerfectScrollbar: false
  };

  opciones: ListadoMenuOpciones[] = [];

  listaSede: SucursalComboProjection[] = [];

  mySubscription;

  private _unsubscribeAll: Subject <any>;

  constructor(
    public _reporteService: ReporteAlumnosSinGrupoListadoService,
    public _fichasDataService: FichasDataService,
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _translateService: TranslateService
  ) { 
    this._unsubscribeAll = new Subject();
    this.mySubscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this._router.navigated = false;
      }
    }); 
  }

  ngOnInit(): void {
    // Agregar scroll en horizontal y vertical en la tabla
    var ps = new PerfectScrollbar('.ficha-table');
    ps.update();

    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if(datos?.listaSede){
        this.listaSede = datos?.listaSede || [];
        let listaPermiso: Object = datos?.listaPermiso || new Object();
        // Lista de permiso, el usuario tiene permiso para descargar o exportar
        if (listaPermiso.hasOwnProperty('EXPORTAR_EXCEL_ALUMNOS_SIN_GRUPO')){
          this.opciones.push({ title: 'Descargar Reporte Excel', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-alumnos-sin-grupo/exportar/xlsx" })
        }
        this.setFiltros();
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
     }
  }

  setFiltros(): void {
    let config: FieldConfig[] = [];
    
    this.config.paginatorSize = 100;

    config.push({
      type: "pixvsMatSelect",
      label: "Sede",
      name: "listaSede",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: false,
      list: this.listaSede,
      campoValor: 'nombre'
    });

    this.regConfig = [...config];
  }
}
