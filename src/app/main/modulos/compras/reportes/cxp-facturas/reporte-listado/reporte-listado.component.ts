import { Component, HostListener } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NavigationEnd, Router } from '@angular/router';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichasDataService } from '@services/fichas-data.service';
import { Observable, Subject } from 'rxjs';
import { ReporteFacturasService } from './reporte-listado.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { ArchivoProjection } from '@models/archivo';
import { FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-reporte-listado',
  templateUrl: './reporte-listado.component.html',
  styleUrls: ['./reporte-listado.component.scss']
})
export class ReporteListadoComponent {
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean { return !this.isLoading; }

  private _unsubscribeAll: Subject<any>;
  regConfig: FieldConfig[] = [];
  isLoading: boolean = false;

  config: FichaListadoConfig = {
    localeEN: english, localeES: spanish,
    icono: 'toc',
    columnaId: 'id',
    rutaDestino: null,
    ocultarBotonNuevo: true,
    columns: [
      { name: 'fecha', title: 'Fecha', class: "mat-column-120", centrado: false, type: 'fecha' },
      { name: 'proveedor', title: 'Proveedor', class: "mat-column-flex", centrado: false, type: null },
      { name: 'folio', title: 'Folio', class: "mat-column-160", centrado: false, type: null },
      { name: 'monto', title: 'Monto', class: "mat-column-120", centrado: true, type: 'money', tooltip: true },
      { name: 'moneda', title: 'Moneda', class: "mat-column-100", centrado: false, type: null },
      { name: 'estatus', title: 'Estatus', class: "mat-column-160", centrado: false, type: null, tooltip: true },
      { name: 'acciones', title: 'Documentos', class: "mat-column-80", centrado: false, type: 'acciones' }
    ],
    displayedColumns: ['fecha', 'proveedor', 'folio', 'monto', 'moneda', 'estatus', 'acciones'],
    columasFechas: ['fecha'],
    listadoMenuOpciones: [],
    listadoAcciones: [
      {
        title: 'Documentos',
        tipo: 'menu',
        icon: 'more_vert',
        ocultarBotonTodo: true,
        columnaOpcionesMenu: 'archivos',
        columnaMostrarOpcionMenu: 'nombreOriginal',
        accion: this.onDescargarArchivo.bind(this),
      }
    ]
  };

  opciones: ListadoMenuOpciones[] = [];

  mySubscription;

  constructor(
    public _reporteFacturasService: ReporteFacturasService,
    public _fichasDataService: FichasDataService,
    private router: Router,
    private _matSnackBar: MatSnackBar,
    private _translateService: TranslateService
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

  ngOnInit(): void {
    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos?.proveedores) {
        this.regConfig = [
          {
            type: "pixvsMatSelect",
            label: "Proveedor",
            name: "proveedores",
            formControl: new FormControl(null),
            validations: [],
            multiple: true,
            selectAll: false,
            list: datos?.proveedores,
            campoValor: 'nombre',
          },
          {
            type: "input",
            label: 'Fecha Inicio',
            inputType: "date",
            name: "fechaInicio",
            formControl: new FormControl(null, [Validators.required]),
            validations: []
          },
          {
            type: "input",
            label: 'Fecha Fin',
            inputType: "date",
            name: "fechaFin",
            formControl: new FormControl(null, [Validators.required]),
            validations: []
          }
        ];

        if (datos.permisoDescargar) {
          this.opciones.push({ title: 'Descargar Reporte', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-cxpfacturas/exportar/xlsx" })
        }

        if (datos.permisoExcel) {
          this.opciones.push({ title: 'Descargar Facturas', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/reporte-cxpfacturas/descargar/facturas" })
        }
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    if (this.mySubscription) { this.mySubscription.unsubscribe(); }
  }

  onDescargarArchivo(archivosDescargar: ArchivoProjection, event, id) {
    return this._reporteFacturasService.descargarArchivo(id, archivosDescargar.nombreOriginal);
  }
}