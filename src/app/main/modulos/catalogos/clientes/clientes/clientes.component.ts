import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'clientes-listado',
    templateUrl: './clientes.component.html',
    styleUrls: ['./clientes.component.scss']

})
export class ClientesListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "person_pin",
        columnaId: "id",
        rutaDestino: "/app/catalogos/clientes/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-160", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'rfc', title: 'RFC', class: "mat-column-160", centrado: false, type: null },
            { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-120", centrado: true, type: "fecha", tooltip: false },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre', 'rfc', 'fechaCreacion', 'activo'],
        columasFechas: ['fechaCreacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/clientes/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}