import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { OrdenCompraListadoProjection } from '@app/main/modelos/orden-compra';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { ArchivoProjection } from '@models/archivo';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { FichasDataService } from '@services/fichas-data.service';
import { DescargasService } from './descargas.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
    selector: 'recibo-ordenes-compra-listado',
    templateUrl: './recibos.component.html',
    styleUrls: ['./recibos.component.scss']

})
export class ReciboOrdenesCompraListadoComponent {

    config: FichaListadoConfig = {
        localeEN: english, localeES: spanish,
        icono: "assignment",
        columnaId: "id",
        rutaDestino: "/app/compras/recibo-oc/",
        columns: [
            { name: 'codigo', title: 'Código', class: "mat-column-240", centrado: false, type: null },
            { name: 'proveedorNombre', title: 'Proveedor', class: "mat-column-flex", centrado: false, type: null },
            { name: 'cantidad', title: 'Cantidad articulos', class: "mat-column-flex", centrado: false, type: null },
            { name: 'fechaOC', title: 'Fecha OC', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'fechaRequerida', title: 'Fecha compromiso', class: "mat-column-flex", centrado: false, type: "fecha" },
            { name: 'estatusValor', title: 'Estatus', class: "mat-column-flex", centrado: false, type: null },
            { name: 'acciones', title: 'Documentos', class: "mat-column-flex", centrado: false, type: 'acciones' }
        ],
        displayedColumns: ['codigo', 'proveedorNombre', 'cantidad', 'fechaOC', 'fechaRequerida', 'estatusValor','acciones'],
        columasFechas: ['fechaOC','fechaRequerida'],
		listadoMenuOpciones: [{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/ordenes-compra/recibo/download/excel' }],
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
			accion: this.onMostrarFacturas.bind(this)
		}]

	};
	
	ocMap: {[ocId: number]: OrdenCompraListadoProjection} = {};

    constructor(
		private _fichasDataService: FichasDataService,
		private _descargasService: DescargasService,
		private _matSnackBar: MatSnackBar,
		private translate: TranslateService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService
	) {

    }

    ngOnInit(): void {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
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
	
	onMostrarFacturas(archivosDescargar: ArchivoProjection | ArchivoProjection[]){
		if(Array.isArray(archivosDescargar)){
			let facturasIds: number[] = archivosDescargar.map(ev => {
				return Number(ev.id);
			});
			this._descargasService.getArchivos(facturasIds,'facturas.zip');
		}else{
			this._descargasService.verArchivo(archivosDescargar);
		}
	}

}