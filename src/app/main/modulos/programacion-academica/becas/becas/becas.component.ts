import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { FichasDataService } from '@services/fichas-data.service';
import { HttpService } from '@services/http.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'becas-listado',
    templateUrl: './becas.component.html',
    styleUrls: ['./becas.component.scss']

})
export class BecasListadoComponent {
    private _unsubscribeAll: Subject<any>;
    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "person_pin",
        columnaId: "id",
        rutaDestino: "/app/programacion-academica/becas-solicitudes/",
        columns: [
            { name: 'solicitudBeca', title: 'Solicitud Beca', class: "mat-column-flex", centrado: false, type: null },
            { name: 'entidad', title: 'Entidad Beca', class: "mat-column-flex", centrado: false, type: null },
            { name: 'codigoBeca', title: 'Código Beca', class: "mat-column-flex", centrado: false, type: null },
            { name: 'codigoAlumno', title: 'Código Proulex', class: "mat-column-flex", centrado: false, type: null },
            { name: 'primerApellido', title: 'Primer Apellido', class: "mat-column-flex", centrado: false, type: null },
            { name: 'segundoApellido', title: 'Segundo Apellido', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombre', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'curso', title: 'Curso', class: "mat-column-flex", centrado: false, type: null },
            { name: 'modalidad', title: 'Modalidad', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nivel', title: 'Nivel', class: "mat-column-flex", centrado: false, type: null },
            { name: 'descuento', title: 'Descuento %', class: "mat-column-flex", centrado: false, type: null },
            { name: 'estatus', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombreCompleto', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null },
            { name: 'nombreCompletoInerso', title: 'Nombre', class: "mat-column-flex", centrado: false, type: null }
        ],
        displayedColumns: ['solicitudBeca', 'entidad','codigoBeca','codigoAlumno','primerApellido','segundoApellido','nombre','curso','modalidad','nivel','descuento','estatus'],
        columasFechas: [],
        listadoMenuOpciones: [
        { title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/becas-solicitudes/download/excel' },
        { title: 'Descargar plantilla', icon: 'cloud_download', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/becas-solicitudes/download/template' },
        { title: 'Importar plantilla', icon: 'cloud_upload', tipo: FichaListadoConfig.PERSONALIZADO, url: '/api/v1/becas-solicitudes/upload/template'}]

    };

    isLoading: boolean = false;
    uploadURL: string = null;

    constructor(public _fichasDataService: FichasDataService, private _matSnackBar: MatSnackBar, private _httpClient: HttpService) {
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {

    }

    getOption(opcion: ListadoMenuOpciones): void{
        if(opcion.title.toLocaleUpperCase().includes('IMPORTAR'))
            this.openFileLoader(opcion);
    }

    openFileLoader(opcion): void {
        this.uploadURL = opcion.url || null;
        document.getElementById('fileloader').click();
    }

    onLoadFile(files): void {
        let file = files.item(0);
        let formData: FormData = new FormData();
        formData.append('file', file, file.name);
        this.isLoading = true;
        this._httpClient.upload_form(formData, this.uploadURL, true)
        .pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
            this._matSnackBar.open(response?.message, 'OK', { duration: 5000 });
            this.isLoading = false;
            this._fichasDataService.getDatos();
            (<HTMLInputElement> document.getElementById('fileloader')).value = "";
        }, (response) => {
            let message = response.error?.message || 'Hubo un error al procesar la plantilla';
            this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
            this.isLoading = false;
            (<HTMLInputElement> document.getElementById('fileloader')).value = "";
        });
    }
}