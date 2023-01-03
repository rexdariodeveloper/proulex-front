import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'metas-listado',
    templateUrl: './metas-listado.component.html',
    styleUrls: ['./metas-listado.component.scss']
})
export class MetasListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "add_shopping_cart",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/metas/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'ciclo', title: 'Ciclo', class: "mat-column-240", centrado: false, type: null },
            { name: 'meta', title: 'Meta', class: "mat-column-240", centrado: false, type: null },
            { name: 'avance', title: 'Avance', class: "mat-column-240", centrado: false, type: 'progressBar', progressValueColumn: 'inscripciones', progressGoalColumn: 'meta' }
        ],
        displayedColumns: ['codigo', 'nombre', 'ciclo', 'meta', 'avance'],
        columasFechas: [],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/programas-metas/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}