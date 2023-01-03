import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'requisiciones-listado',
    templateUrl: './requisiciones.component.html',
    styleUrls: ['./requisiciones.component.scss']

})
export class RequisicionesListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "add_shopping_cart",
        columnaId: "id",
        rutaDestino: "/app/compras/requisiciones/",
        columns: [
            { name: 'codigo', title: 'Código de requisición', class: "mat-column-240", centrado: false, type: null },
            { name: 'fecha', title: 'Fecha requisición', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: ['sucursal.nombre','departamento.nombre'], title: 'Sede - Departamento', class: "mat-column-flex", centrado: false, type: null },
            { name: 'creadoPor.nombreCompleto', title: 'Usuario solicitante', class: "mat-column-flex", centrado: false, type: null },
            { name: 'estadoRequisicion.valor', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null }
        ],
        displayedColumns: ['codigo', 'fecha', 'sucursal.nombre - departamento.nombre', 'creadoPor.nombreCompleto', 'estadoRequisicion.valor'],
        columasFechas: ['fecha'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/requisiciones/download/excel' }]

    };

    constructor() {

    }

    ngOnInit(): void {

    }

}