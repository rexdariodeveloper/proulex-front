import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'roles-listado',
    templateUrl: './roles.component.html',
    styleUrls: ['./roles.component.scss']

})
export class RolesListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "supervised_user_circle",
        columnaId: "id",
        rutaDestino: "/config/roles/",
        columns: [
            { name: 'nombre', title: 'Nombre', class: "mat-column-240", centrado: false, type: null },
            { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-flex", centrado: true, type: "fecha" },
            { name: 'activo', title: '', class: "mat-column-160", centrado: true, type: "boolean" },
        ],
        reordenamiento: false,
        displayedColumns: ['nombre', 'fechaCreacion', 'activo'],
        columasFechas: ['fechaCreacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/roles/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}