import { Component } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { Subject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';

@Component({
    selector: 'bancos-listado',
    templateUrl: './bancos-listado.component.html',
    styleUrls: ['./bancos-listado.component.scss']

})
export class BancosListadoComponent {

    regConfig: FieldConfig[];
    private _unsubscribeAll: Subject<any>;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "view_list",
        columnaId: "id",
        rutaDestino: "/app/catalogos/bancos/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-100", centrado: false, type: null },
            { name: 'rfc', title: 'RFC', class: "mat-column-160", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre corto', class: "mat-column-240", centrado: false, type: null },
            { name: 'razonSocial', title: 'Razón social', class: "mat-column-flex", centrado: false, type: null },
            { name: 'activo', title: 'Activo', class: "mat-column-80", centrado: false, type: 'boolean' },
        ],
        reordenamiento: false,
        displayedColumns: ['codigo', 'rfc', 'nombre', 'razonSocial', 'activo'],
        columasFechas: [],
        listadoMenuOpciones: []
    };

    constructor(public _FichasDataService: FichasDataService) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this._FichasDataService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
            });
    }
}