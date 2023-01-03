import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
  selector: 'app-listado-nueva-contratacion',
  templateUrl: './listado-nueva-contratacion.component.html',
  styleUrls: ['./listado-nueva-contratacion.component.scss']
})
export class ListadoNuevaContratacionComponent implements OnInit {

  config: FichaListadoConfig = {
    localeEN: english, localeES: spanish,
    icono: "person",
    columnaId: "id",
    rutaDestino: "/app/ingreso-promocion/nuevas-contrataciones/",
    columns: [
        { name: 'codigo', title: 'Folio solicitud', class: "mat-column-flex", centrado: false, type: null },
        { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-flex", centrado: false, type: 'fecha' },
        { name: 'usuario', title: 'Usuario', class: "mat-column-flex", centrado: false, type: null },
        { name: 'cantidadEmpleado', title: 'Cantidad de Empleados', class: "mat-column-flex", centrado: false, type: null },
        { name: 'tipoContrato', title: 'Tipo Contrato', class: "mat-column-flex", centrado: false, type: null },
        { name: 'estatus', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null }
    ],
    displayedColumns: ['codigo', 'fechaCreacion', 'usuario', 'cantidadEmpleado', 'tipoContrato', 'estatus'],
    columasFechas: ['fechaCreacion'],
    listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/nuevas-contrataciones/download/excel' }]

  };

  constructor() { }

  ngOnInit(): void {
  }

}
