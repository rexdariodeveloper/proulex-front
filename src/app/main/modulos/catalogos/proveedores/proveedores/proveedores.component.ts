import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'proveedores-listado',
    templateUrl: './proveedores.component.html',
    styleUrls: ['./proveedores.component.scss']

})
export class ProveedoresListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "local_shipping",
        columnaId: "id",
        rutaDestino: "/app/catalogos/proveedores/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'rfc', title: 'RFC', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre', 'rfc', 'fechaCreacion', 'activo'],
        columasFechas: ['fechaCreacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/proveedores/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}