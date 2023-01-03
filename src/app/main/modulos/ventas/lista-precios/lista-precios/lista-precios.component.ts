import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'lista-precios',
    templateUrl: './lista-precios.component.html',
    styleUrls: ['./lista-precios.component.scss']

})
export class ListaPreciosListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "perm_identity",
        columnaId: "id",
        rutaDestino: "/app/ventas/lista-precios/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-130", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-220", centrado: false, type: null },
            { name: 'fecha', title: 'Vigencia', class: "mat-column-flex", centrado: true, type: null },
            { name: 'asignado', title: 'Asignado a', class: "mat-column-flex", centrado: true, type: null},
            { name: 'activo', title: 'Estatus', class: "mat-column-200", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre', 'fecha', 'asignado', 'activo'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/listado-precio/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}