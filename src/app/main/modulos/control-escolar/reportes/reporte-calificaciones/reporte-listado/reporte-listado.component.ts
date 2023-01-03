import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import * as moment from 'moment';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { Observable, Subject } from 'rxjs';
import { ReporteCalificacionesService } from './reporte-listado.service';
import { FichasDataService } from '@services/fichas-data.service';
import { HttpService } from '@services/http.service';
import { TranslateService } from '@ngx-translate/core';
import { NavigationEnd, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';

interface FechaModel {
	id: number,
	fecha: string
};

@Component({
  selector: 'app-reporte-listado',
  templateUrl: './reporte-listado.component.html',
  styleUrls: ['./reporte-listado.component.scss']
})
export class ReporteListadoComponent implements OnInit, OnDestroy {

  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.isLoading;
  }
  private _unsubscribeAll: Subject<any>;
  regConfig: FieldConfig[] = [];
  isLoading: boolean = false;

  opciones: ListadoMenuOpciones[] = [];

  config: FichaListadoConfig = {
      localeEN: english, localeES: spanish,
      icono: "folder_open",
      columnaId: null,
      rutaDestino: null,
      ocultarBotonNuevo: true,
      columns: [
          { name: 'codigo', title: 'Código PROULEX', class: "mat-column-100", centrado: false, type: null },
          { name: 'codigoAlumno', title: 'Código de alumno', class: "mat-column-100", centrado: false, type: null },
          { name: 'primerApellido', title: 'Primer apellido', class: "mat-column-180", centrado: false, type: null },
          { name: 'segundoApellido', title: 'Segundo apellido', class: "mat-column-180", centrado: false, type: null },
          { name: 'nombre', title: 'Nombre(s)', class: "mat-column-180", centrado: false, type: null },
          { name: 'codigoGrupo', title: 'Código de Grupo', class: "mat-column-180", centrado: false, type: null },
          { name: 'estatus', title: 'Estatus', class: "mat-column-100", centrado: false, type: null },
          { name: 'calificacionFinal', title: 'Calificación Final', class: "mat-column-100", centrado: false, type: null },
      ],
      displayedColumns: ['codigo', 'codigoAlumno', 'primerApellido', 'segundoApellido', 'nombre', 'codigoGrupo', 'estatus', 'calificacionFinal'],
      columasFechas: [],
      listadoMenuOpciones: []
  };

  mySubscription;

  listaFecha: FechaModel[] = [];

  constructor(
    public _service: ReporteCalificacionesService,
    public _fichasDataService: FichasDataService,
    private _httpClient: HttpService,
    private translate: TranslateService,
    private router: Router,
    private _matSnackBar: MatSnackBar
  ) { 
    this._unsubscribeAll = new Subject();
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.mySubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this.router.navigated = false;
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    if (this.mySubscription) { this.mySubscription.unsubscribe(); }
  }

  ngOnInit(): void {
    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos?.sedes) {
        if (datos?.permisos.hasOwnProperty('REPORTE_CALIFICACIONES_EXCEL')) {
          this.opciones = [
            { title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/captura_calificaciones/reporte/xlsx" }
          ];
        }

        this.regConfig = [
          {
            type: "pixvsMatSelect",
            label: "Sede",
            name: "sede",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: true,
            selectAll: false,
            list: datos?.sedes,
            campoValor: 'nombre',
          },
          {
            type: "pixvsMatSelect",
            label: "Año",
            name: "anio",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: false,
            selectAll: false,
            list: datos?.anios
          },
          {
            type: "pixvsMatSelect",
            label: "Modalidad",
            name: "modalidad",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: true,
            selectAll: false,
            list: datos?.modalidades,
            campoValor: 'nombre',
            values: ['codigo', 'nombre'],
          },
          {
            type: "pixvsMatSelect",
            label: "Fecha de inicio",
            name: "fechas",
            formControl: new FormControl(null, [Validators.required]),
            validations: [],
            multiple: true,
            selectAll: false,
            list: [],
            campoValor: 'fecha'
          },
          {
            type: "input",
            label: "Alumno",
            inputType: "text",
            name: "alumno",
            formControl: new FormControl(null),
            validations: [{ "name": "maxlength", "validator": Validators.maxLength(100), "message": "Máximo 100 caracteres" }]
          }
        ];
      }
    });

    var anio = new Date().getFullYear();
    var modalidad = null;

    // La Sede
    let regSede = this.regConfig.find(item => item.name == 'sede');
    regSede.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      this.onChangeSedeLimpiaCampos();
    });

    let regAnio = this.regConfig.find(item => item.name == 'anio');

    regAnio.formControl.setValue(anio);

    regAnio.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      this.updateFechas([]);

      anio = regAnio.formControl.value;

      if (anio && modalidad) {
        var json = {
          anio: anio,
          modalidad: modalidad
        };

        this._service.getFechasByFiltros(json);
      }
    });

    let regModalidad = this.regConfig.find(item => item.name == 'modalidad');

    regModalidad.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      this.updateFechas([]);

      modalidad = regModalidad.formControl.value;

      if (anio && modalidad && modalidad.length) {
        var json = {
          anio: anio,
          modalidad: modalidad
        };

        this._service.getFechasByFiltros(json);
      }
    });

    this._service.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
      if (!!data?.fechas) {
        if (data?.fechas.length == 0) {
          this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
        } else {
          this.listaFecha = [];
          let id: number = 1;
          data.fechas.map(item => {
            let fechaModel: FechaModel;
            fechaModel = {
              id: id,
              fecha: moment(item).format('DD/MM/YYYY')
            }
            this.listaFecha.push(fechaModel);
            // Contador
            id++;
          });
          this.updateFechas(this.listaFecha);
        }
      }
    });
  }

  onChangeSedeLimpiaCampos(){
    this.regConfig.map(item => {
      if(item.name == 'anio'){
        var anio = new Date().getFullYear();
        if(item.formControl.value != anio)
          item.formControl.setValue(anio);
      }

      if(item.name == 'modalidad')
        item.formControl.setValue([]);
      
      if(item.name == 'fechas')
        item.formControl.setValue([]);

      if(item.name == 'alumno')
        item.formControl.setValue(null);
    });
  }

  updateFechas(fechas) {
    let field: FieldConfig = {
      type: "pixvsMatSelect",
      label: "Fecha de inicio",
      name: "fechas",
      formControl: new FormControl(null, [Validators.required]),
      validations: [],
      multiple: true,
      selectAll: false,
      list: fechas,
      campoValor: 'fecha'
    };

    this.updateFilters(3, "fechas", field);
  }

  updateFilters(index: number, name: string, field: FieldConfig) {
    let regIndex = this.regConfig.findIndex(item => item.name == name);

    if (regIndex != -1) {
      this.regConfig.splice(regIndex, 1);
    }

    this.regConfig.splice(index, 0, field);
    this.regConfig = [...this.regConfig];
  }

}
