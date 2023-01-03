import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'puestos',
    templateUrl: './puestos.component.html',
    styleUrls: ['./puestos.component.scss']

})
export class PuestosComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "work_outline",
        columnaId: "id",
        rutaDestino: "/app/catalogos/puestos/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-160", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'estadoPuesto.valor', title: 'Estatus', class: "mat-column-flex", centrado: true, type: null },
        ],
        displayedColumns: ['codigo', 'nombre', 'estadoPuesto.valor'],
        columasFechas: [],
        listadoMenuOpciones: [
            { title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/puestos/download/excel' }
        ]

    };

    constructor() {

    }

    ngOnInit(): void {

    }
}