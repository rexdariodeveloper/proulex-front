import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'tabuladores-listado',
    templateUrl: './tabuladores.component.html',
    styleUrls: ['./tabuladores.component.scss']

})
export class TabuladoresListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "receipt",
        columnaId: "id",
        rutaDestino: "/app/catalogos/tabuladores/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'descripcion', title: 'Descripción', class: "mat-column-flex", centrado: false, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'descripcion', 'activo'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/tabuladores/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}