import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'programacion-academica-comercial-listado',
    templateUrl: './programacion-academica-comercial-listado.component.html',
    styleUrls: ['./programacion-academica-comercial-listado.component.scss']
})
export class ProgramacionAcademicaComercialListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "add_shopping_cart",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/programacion-academica-comercial/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-240", centrado: false, type: null },
            { name: 'fechaInicio', title: 'Fecha inicio', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'fechaFin', title: 'Fecha fin', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'paCiclo', title: 'Ciclo', class: "mat-column-240", centrado: false, type: null },
            { name: 'activo', title: 'Estatus', class: "mat-column-flex", centrado: false, type: 'boolean' }
        ],
        displayedColumns: ['codigo', 'nombre', 'fechaInicio', 'fechaFin', 'paCiclo', 'activo'],
        columasFechas: ['fechaInicio','fechaFin'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/programacion-academica-comercial/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}