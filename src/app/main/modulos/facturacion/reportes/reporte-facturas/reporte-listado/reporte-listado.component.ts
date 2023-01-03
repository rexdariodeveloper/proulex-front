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
import { JsonResponse } from '@models/json-response';
import { FormControl, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { TranslateService } from '@ngx-translate/core';
import { DatosFacturacionRfcComboProjection } from '@app/main/modelos/datos-facturacion';
import { FacturaNotaVentaService } from '../../../factura-nota-venta/factura-nota-venta/factura-nota-venta.service';

@Component({
  selector: 'app-reporte-listado',
  templateUrl: './reporte-listado.component.html',
  styleUrls: ['./reporte-listado.component.scss']
})
export class ReporteListadoComponent {
  @HostListener('window:beforeunload')
  canDeactivate(): Observable<boolean> | boolean {
    return !this.isLoading;
  }
  private _unsubscribeAll: Subject<any>;
  regConfig: FieldConfig[] = [];
  isLoading: boolean = false;

  config: FichaListadoConfig = {
    localeEN: english, localeES: spanish,
    icono: 'folder_open',
    columnaId: 'id',
    rutaDestino: null,
    ocultarBotonNuevo: true,
    columns: [
      { name: 'fechaFactura', title: 'Fecha', class: "mat-column-120", centrado: false, type: 'fecha' },
      { name: 'sede', title: 'Sede', class: "mat-column-120", centrado: false, type: null },
      { name: 'tipoFactura', title: 'Tipo', class: "mat-column-160", centrado: false, type: null },
      { name: 'folioFactura', title: 'Folio', class: "mat-column-100", centrado: false, type: null },
      { name: 'cliente', title: 'Receptor', class: "mat-column-flex", centrado: false, type: null },
      { name: 'notaVenta', title: 'Nota venta', class: "mat-column-120", centrado: false, type: null },
      { name: 'total', title: 'Monto', class: "mat-column-120", centrado: true, type: 'money', tooltip: true },
      { name: 'estatus', title: 'Estatus', class: "mat-column-100", centrado: false, type: null, tooltip: true },
      { name: 'acciones', title: 'Documentos', class: "mat-column-80", centrado: false, type: 'acciones' }
    ],
    displayedColumns: ['fechaFactura', 'sede', 'tipoFactura', 'folioFactura', 'cliente', 'notaVenta', 'total', 'estatus', 'acciones'],
    columasFechas: [],
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

  opciones: ListadoMenuOpciones[] = [
    { title: 'Descargar Reporte Excel', icon: 'play_for_work', tipo: FichaListadoConfig.EXCEL, url: "/api/v1/reporte-facturas/exportar/xlsx" },
    { title: 'Descargar Facturas', icon: 'play_for_work', tipo: FichaListadoConfig.PERSONALIZADO, url: "/api/v1/reporte-facturas/exportar/facturas" }
  ];

  listaSede: any[] = [];
  listaReceptor: DatosFacturacionRfcComboProjection[] = [];
  listaEstatus: ControlMaestroMultipleComboProjection[] = [];

  subscripcionesFiltros: Subject<any>;

  mySubscription;

  clientelId: any;
  modalidadesAll: any;
  programacionId: any;
  fechaInicio: any;

  constructor(
    public _reporteFacturasService: ReporteFacturasService,
    public _fichasDataService: FichasDataService,
    private _router: Router,
    private _matSnackBar: MatSnackBar,
    private _translateService: TranslateService,
    public _facturaNotaVentaService: FacturaNotaVentaService
  ) {
    this._unsubscribeAll = new Subject();
    this.subscripcionesFiltros = new Subject();
    this._router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.mySubscription = this._router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Trick the Router into believing it's last link wasn't previously loaded
        this._router.navigated = false;
      }
    });
  }

  ngOnInit(): void {
    this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos?.listaSede) {
        this.listaSede = datos?.listaSede || [];
        this.listaReceptor = datos?.listaReceptor || [];
        this.listaEstatus = datos?.listaEstatus || [];
        this.setFiltros();
      }
    });
    //this.setFiltros();
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
    if (this.mySubscription) {
      this.mySubscription.unsubscribe();
    }
    this.subscripcionesFiltros.next();
    this.subscripcionesFiltros.complete();
  }

  setFiltros(): void {
    let config: FieldConfig[] = [];

    this.config.paginatorSize = 100;

    if (this.listaSede.length > 0) {
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
    }

    config.push({
      type: "input",
      label: 'Fecha Inicio',
      inputType: "date",
      name: "fechaInicio",
      formControl: new FormControl(null, [Validators.required]),
      validations: []
    });

    config.push({
      type: "input",
      label: 'Fecha Fin',
      inputType: "date",
      name: "fechaFin",
      formControl: new FormControl(null, [Validators.required]),
      validations: []
    });

    if (this.listaReceptor.length > 0) {
      config.push({
        type: "pixvsMatSelect",
        label: "Receptor",
        name: "listaRecepto",
        formControl: new FormControl(null),
        validations: [],
        multiple: true,
        selectAll: false,
        list: this.listaReceptor,
        campoValor: 'rfc'
      });
    }

    config.push({
      type: "input",
      label: "Nota de Venta",
      inputType: "text",
      name: "notaVenta",
      formControl: new FormControl(null),
      validations: [{ "name": "maxlength", "validator": Validators.maxLength(15), "message": "Máximo 15 caracteres" }]
    });

    if (this.listaEstatus.length > 0) {
      config.push({
        type: "pixvsMatSelect",
        label: "Estatus",
        name: "listaEstatus",
        formControl: new FormControl(null),
        validations: [],
        multiple: true,
        selectAll: false,
        list: this.listaEstatus,
        campoValor: 'valor',
      });
    }

    this.regConfig = [...config];
    this.setSubscripcionesFiltros();
  }

  setSubscripcionesFiltros(): void {
    this.subscripcionesFiltros.next();
    this.subscripcionesFiltros.complete();
    let field: FormControl = null;

    // Fecha Inicio
    field = this.regConfig.find(item => item.name === 'fechaInicio')?.formControl;
    if (field) {
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        let config = this.regConfig.find(item => item.name == 'fechaFin');
        if (!!value) {
          config.min = value;
        } else {
          config.min = null;
        }
      });
    }

    // Nota de Venta
    field = this.regConfig.find(item => item.name === 'notaVenta')?.formControl;
    if (field) {
      field.valueChanges.pipe(takeUntil(this.subscripcionesFiltros)).subscribe((value) => {
        // Sede
        field = this.regConfig.find(item => item.name === 'listaSede')?.formControl;
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
        field = this.regConfig.find(item => item.name === 'fechaInicio')?.formControl;
        if (value != '') {
          if (field.validator != null) {
            field.clearValidators();
            field.updateValueAndValidity();
          }
        } else {
          field.setValidators([Validators.required]);
          field.updateValueAndValidity();
        }

        // Fecha Fin
        field = this.regConfig.find(item => item.name === 'fechaFin')?.formControl;
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

  onDescargarArchivo(archivosDescargar: ArchivoProjection, event, id) {
    return this._facturaNotaVentaService.descargarArchivo(id, archivosDescargar.nombreOriginal);
  }

  descargarFacturas(event) {
    if (event.opcion.tipo == FichaListadoConfig.PERSONALIZADO) {
      this._matSnackBar.openFromComponent(IconSnackBarComponent, {
        data: {
          message: this._translateService.instant('INTERFAZ.DESCARGANDO') + '...',
          icon: 'cloud_download'
        },
        horizontalPosition: 'right'
      });

      this._reporteFacturasService.descargarFacturas(event.datos).then(
        function (result: JsonResponse) {
          if (result.status == 200) {
            this._matSnackBar.dismiss();
          } else {
            let message = result.message;
            this._matSnackBar.dismiss();
            this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
          }
        }.bind(this));
    }
  }
}