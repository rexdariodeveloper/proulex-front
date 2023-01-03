import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'cursos-listado',
    templateUrl: './cursos.component.html',
    styleUrls: ['./cursos.component.scss']

})
export class CursosListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "book",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/cursos/",
        columns: [
            { name: 'codigo', title: 'Código Curso', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre Curso', class: "mat-column-flex", centrado: false, type: null },
            { name: 'horasTotales', title: 'Horas totales', class: "mat-column-flex", centrado: true, type: null },
            { name: 'numeroNiveles', title: 'Numero niveles', class: "mat-column-flex", centrado: true, type: null },
            { name: 'modalidadesSize', title: 'Modalidades', class: "mat-column-flex", centrado: true, type: null },
            { name: 'sucursalesSize', title: 'Sucursales', class: "mat-column-flex", centrado: true, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['codigo', 'nombre','horasTotales','numeroNiveles','modalidadesSize','sucursalesSize','activo'],
        columasFechas: ['fechaAlta'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/cursos/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}