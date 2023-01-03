import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'entidades-listado',
    templateUrl: './entidades.component.html',
    styleUrls: ['./entidades.component.scss']

})
export class EntidadesListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "person_pin",
        columnaId: "id",
        rutaDestino: "/app/catalogos/entidades/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'director', title: 'Directo', class: "mat-column-flex", centrado: false, type: null },
            { name: 'entidadIndependiente', title: 'Entidad depende', class: "mat-column-flex", centrado: false, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre', 'director', 'entidadIndependiente', 'activo'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/entidades/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}