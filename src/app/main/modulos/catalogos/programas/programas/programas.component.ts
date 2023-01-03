import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'programas-listado',
    templateUrl: './programas.component.html',
    styleUrls: ['./programas.component.scss']

})
export class ProgramasListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "book",
        columnaId: "id",
        rutaDestino: "/app/catalogos/programas/",
        columns: [
            { name: 'codigo', title: 'Código Programa', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre Programa', class: "mat-column-flex", centrado: false, type: null },
            { name: 'idiomasSize', title: 'Idiomas', class: "mat-column-flex", centrado: true, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre','idiomasSize','activo'],
        columasFechas: ['fechaAlta'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/programas/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}