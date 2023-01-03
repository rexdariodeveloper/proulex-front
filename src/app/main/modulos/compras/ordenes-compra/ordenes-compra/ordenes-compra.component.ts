import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdenCompraListadoProjection } from '@app/main/modelos/orden-compra';
import { ArchivoProjection } from '@models/archivo';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { PixvsBuscadorAmazonOpcion } from '@pixvs/componentes/buscador-amazon/buscador-amazon.component';
import { OCDescargasService } from './descargas.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

class BuscadorAmazonOpciones {
	static Todo: number = 1;
	static Codigo: number = 2;
	static Proveedor: number = 3;
	static RFC: number = 4;
	static FechaOC: number = 5;
	static FechaUltimaModificacion: number = 6;
	static Estatus: number = 7;
}

@Component({
    selector: 'ordenes-compra-listado',
    templateUrl: './ordenes-compra.component.html',
    styleUrls: ['./ordenes-compra.component.scss']

})
export class OrdenesCompraListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "assignment",
        columnaId: "id",
        rutaDestino: "/app/compras/ordenes-compra/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-flex", centrado: false, type: null },
            { name: 'sedeNombre', title: 'Sede', class: "mat-column-flex", centrado: false, type: null },
            { name: 'proveedorNombre', title: 'Proveedor', class: "mat-column-flex", centrado: false, type: null },
            { name: 'proveedorRfc', title: 'RFC', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaOC', title: 'Fecha OC', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'fechaModificacion', title: 'Fecha última modificación', class: "mat-column-flex", centrado: false, type: "fecha" },
			{ name: 'estatusValor', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null },
			{ name: 'documentos', title: 'Documentos', class: "mat-column-flex", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['codigo','sedeNombre' ,'proveedorNombre', 'proveedorRfc', 'fechaOC', 'fechaModificacion', 'estatusValor', 'documentos'],
        columasFechas: ['fechaOC','fechaModificacion'],
		listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/ordenes-compra/download/excel' }],
		listadoAcciones: [{
			title: 'Evidencia',
			tipo: 'menu',
			icon: 'attachment',
			columnaOpcionesMenu: 'evidencia',
			columnaMostrarOpcionMenu: 'nombreOriginal',
			accion: this.onMostrarEvidencia.bind(this)
		},{
			title: 'Factura',
			tipo: 'menu',
			icon: 'receipt',
			columnaOpcionesMenu: 'facturas',
			columnaMostrarOpcionMenu: 'nombreOriginal',
			accion: this.onMostrarFactura.bind(this)
		}],
        ocultarPaginado: true

	};
	
	opcionesBuscador: PixvsBuscadorAmazonOpcion[] = [
		{
			id: BuscadorAmazonOpciones.Todo,
			nombre: 'Todo'
		},{
			id: BuscadorAmazonOpciones.Codigo,
			nombre: 'Código'
		},{
			id: BuscadorAmazonOpciones.Proveedor,
			nombre: 'Proveedor'
		},{
			id: BuscadorAmazonOpciones.RFC,
			nombre: 'RFC'
		},{
			id: BuscadorAmazonOpciones.FechaOC,
			nombre: 'Fecha OC'
		},{
			id: BuscadorAmazonOpciones.FechaUltimaModificacion,
			nombre: 'Fecha última modificación'
		},{
			id: BuscadorAmazonOpciones.Estatus,
			nombre: 'Estatus'
		}
	];

    constructor(
		private _descargasService: OCDescargasService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService
	) {

    }

    ngOnInit(): void {

	}
	
	onMostrarEvidencia(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._descargasService.getArchivos(evidenciaIds,'evidencia.zip');
		}else{
			this._descargasService.verArchivo(archivosDescargar);
		}
	}

	onMostrarFactura(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let evidenciaIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._descargasService.getArchivos(evidenciaIds,'facturas.zip');
		}else{
			this._descargasService.verArchivo(archivosDescargar);
		}
	}

}