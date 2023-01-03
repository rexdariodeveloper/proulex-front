import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'precios-listado',
    templateUrl: './precios-incompany.component.html',
    styleUrls: ['./precios-incompany.component.scss']

})
export class PrecioIncompanyListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "receipt",
        columnaId: "id",
        rutaDestino: "/app/catalogos/precio-incompany/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaInicio', title: 'Fecha Inicio', class: "mat-column-flex", centrado: false, type: 'fecha' },
            { name: 'fechaFin', title: 'Fecha Fin', class: "mat-column-flex", centrado: false, type: 'fecha' },
            { name: 'estatus', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null }
        ],
        displayedColumns: ['codigo', 'nombre', 'fechaInicio','fechaFin','estatus'],
        columasFechas: ['fechaInicio','fechaFin'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/precios-incompany/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}