import { Component, OnInit } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { Subject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';

@Component({
    selector: 'usuarios-listado',
    templateUrl: './usuarios.component.html',
    styleUrls: ['./usuarios.component.scss']

})
export class UsuariosListadoComponent {

    regConfig: FieldConfig[];
    private _unsubscribeAll: Subject<any>;

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "people",
        columnaId: "id",
        rutaDestino: "/config/usuarios/",
        columns: [
            { name: 'nombreCompleto', title: 'Nombre', class: "mat-column-240", centrado: false, type: null, tooltip: true },
            { name: 'correoElectronico', title: 'Email', class: "mat-column-flex", centrado: false, type: null, tooltip: false },
            { name: 'fechaCreacion', title: 'Fecha Creación', class: "mat-column-flex", centrado: true, type: "fecha", tooltip: false },
            { name: 'rol.nombre', title: 'Rol', class: "mat-column-160", centrado: false, type: null, tooltip: false },
            { name: 'estatus.id', title: '', class: "mat-column-80", centrado: true, type: "estatus", tooltip: false },
        ],
        reordenamiento: false,
        displayedColumns: ['nombreCompleto', 'correoElectronico', 'fechaCreacion', 'rol.nombre', 'estatus.id'],
        columasFechas: ['fechaCreacion'],
        listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/usuarios/download/excel' }]

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

                if (datos?.datos) {
                    let estatus = datos?.cmmEstatus

                    this.regConfig = [
                        {
                            type: "input",
                            label: "Fecha Creación (Desde)",
                            inputType: "date",
                            name: "fechaCreacionDesde",
                            validations: []
                        }
                        ,
                        {
                            type: "input",
                            label: "Fecha Creación (Hasta)",
                            inputType: "date",
                            name: "fechaCreacionHasta",
                            validations: []
                        },
                        {
                            type: "pixvsMatSelect",
                            label: "Estatus",
                            name: "estatus",
                            formControl: new FormControl(null, [Validators.required]),
                            validations: [],
                            multiple: true,
                            selectAll: false,
                            list: estatus,
                            campoValor: 'valor',
                        },
                        {
                            type: "button",
                            label: "Save",
                            hidden: true
                        }
                    ];
                }

            });


    }

}