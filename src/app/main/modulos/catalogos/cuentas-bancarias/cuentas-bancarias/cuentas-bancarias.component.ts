import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'cuentas-bancarias',
    templateUrl: './cuentas-bancarias.component.html',
    styleUrls: ['./cuentas-bancarias.component.scss']

})
export class CuentasBancariasComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "credit_card",
        columnaId: "id",
        rutaDestino: "/app/catalogos/cuentas-bancarias/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'descripcion', title: 'Descripción', class: "mat-column-flex", centrado: false, type: null },
            { name: 'moneda', title: 'Moneda', class: "mat-column-flex", centrado: false, type: null },
            { name: 'banco', title: 'Banco', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'descripcion', 'moneda', 'banco', 'fechaCreacion', 'activo'],
        columasFechas: ['fechaCreacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/cuentas-bancarias/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}