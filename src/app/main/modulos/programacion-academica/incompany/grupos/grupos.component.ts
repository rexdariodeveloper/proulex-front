import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'grupos-listado',
    templateUrl: './grupos.component.html',
    styleUrls: ['./grupos.component.scss']

})
export class GruposListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "calendar_today",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/incompany/",
        columns: [
            { name: 'codigo', title: 'Código Programa', class: "mat-column-240", centrado: false, type: null },
            { name: 'cliente', title: 'Cliente', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sucursal', title: 'Sede', class: "mat-column-flex", centrado: true, type: null },
            { name: 'curso', title: 'Curso', class: "mat-column-flex", centrado: true, type: null },
            { name: 'grupos', title: 'Número de grupos', class: "mat-column-flex", centrado: true, type: null },
            { name: 'alumnos', title: 'Alumnos', class: "mat-column-flex", centrado: true, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'cliente','sucursal','curso','grupos','alumnos','activo'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/incompany/grupos/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}