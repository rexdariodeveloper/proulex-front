import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'workshop-listado',
    templateUrl: './workshops.component.html',
    styleUrls: ['./workshops.component.scss']

})
export class WorkshopListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "book",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/workshops/",
        columns: [
            { name: 'tipo', title: 'Tipo', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre Curso', class: "mat-column-flex", centrado: false, type: null },
            { name: 'horas', title: 'Horas totales', class: "mat-column-flex", centrado: true, type: null },
            { name: 'modalidadesSize', title: 'Modalidades', class: "mat-column-flex", centrado: true, type: null },
            { name: 'sucursalesSize', title: 'Sucursales', class: "mat-column-flex", centrado: true, type: null },
            { name: 'activo', title: '', class: "mat-column-80", centrado: true, type: "boolean" },
        ],
        displayedColumns: ['tipo','nombre','horas','modalidadesSize','sucursalesSize','activo'],
        columasFechas: [],
        listadoMenuOpciones: [],
    };

    constructor() {
    }

    ngOnInit(): void {
    }

}