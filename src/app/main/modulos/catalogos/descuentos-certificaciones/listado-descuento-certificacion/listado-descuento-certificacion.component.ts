import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
  selector: 'app-listado-descuento-certificacion',
  templateUrl: './listado-descuento-certificacion.component.html',
  styleUrls: ['./listado-descuento-certificacion.component.scss']
})
export class ListadoDescuentoCertificacionComponent implements OnInit {

  config: FichaListadoConfig = {
    localeEN: english, localeES: spanish,
    icono: "receipt",
    columnaId: "id",
    rutaDestino: "/app/catalogos/descuentos-certificaciones/",
    columns: [
        { name: 'curso', title: 'Curso', class: "mat-column-180", centrado: false, type: null },
        { name: 'certificacion', title: 'Certificación', class: "mat-column-flex", centrado: false, type: null },
        { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" }
    ],
    displayedColumns: ['curso', 'certificacion', 'activo'],
    columasFechas: [],
    listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/descuentos-certificaciones/download/excel' }]

  };

  constructor() { }

  ngOnInit(): void {
  }

}
