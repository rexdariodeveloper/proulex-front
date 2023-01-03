import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, Subject } from 'rxjs';
import { MenuListadoGeneral } from '@models/menu-listado-general';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FichasDataService } from '@services/fichas-data.service';
import { ReporteAntiguedadSaldosService } from './reporte.service';
import { MatPaginator } from '@angular/material/paginator';
import { ProveedorReporteAntiguedadSaldosDetalleProjection, ProveedorReporteAntiguedadSaldosResumenProjection } from '@app/main/modelos/proveedor';
import { MatTableDataSource } from '@angular/material/table';

import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';

const TiposReportes = {
	DETALLE: 1,
	RESUMEN: 2
};

const TiposSaldos = {
	TODOS: 1,
    VENCIDOS: 2,
    POR_VENCER: 3
};

export class Reporte{
	url: string;
	tipo: string;
	nombre: string;

	constructor(obj){
		this.url = obj?.url;
		this.tipo = obj?.tipo || obj?.detalles?.tipo;
		this.nombre = obj?.nombre || obj?.detalles?.nombre;
	}
}

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReporteAntiguedadSaldosComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	@ViewChild('filter', { static: true })
	filter: ElementRef;
	
	dataSourceDetalle: MatTableDataSource<ProveedorReporteAntiguedadSaldosDetalleProjection> = new MatTableDataSource([]);
	displayedColumnsDetalle: string[] = [
		'codigoProveedor',
		'nombreProveedor',
		'codigoFactura',
		'fechaFactura',
		'fechaVencimiento',
		'diasVencimiento',
		'montoOriginal',
		'montoActual',
		'porVencer',
		'montoP1',
		'montoP2',
		'montoP3',
		'montoP4',
		'montoProgramado',
		'codigos'
	];
	dataSourceResumen: MatTableDataSource<ProveedorReporteAntiguedadSaldosResumenProjection> = new MatTableDataSource([]);
	displayedColumnsResumen: string[] = [
		'codigoProveedor',
		'nombreProveedor',
		'montoOriginal',
		'montoActual',
		'porVencer',
		'montoP1',
		'montoP2',
		'montoP3',
		'montoP4',
		'montoProgramado'
	];
	page: number = 0;
	
	tituloMontoP1: string = '';
	tituloMontoP2: string = '';
	tituloMontoP3: string = '';
	tituloMontoP4: string = '';
	url: string = null;

	reportes = [];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _reporteAntiguedadSaldosService: ReporteAntiguedadSaldosService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngOnInit(): void {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.dataSourceDetalle.filterPredicate = (elemento,filtro) => {
			let textoBuscar = elemento.proveedorCodigo
				+ ' ' + elemento.proveedorNombre
				+ ' ' + elemento.codigoRegistro;
			return !filtro || textoBuscar.toLowerCase().includes(filtro.toLowerCase());
		};
		this.dataSourceResumen.filterPredicate = (elemento,filtro) => {
			let textoBuscar = elemento.codigo
				+ ' ' + elemento.nombre;
			return !filtro || textoBuscar.toLowerCase().includes(filtro.toLowerCase());
		};


		this._reporteAntiguedadSaldosService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.datos){
					if(!datos.datos.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}
					let diasAgrupar: number = Number(this.filtrosSidebar?.form?.form?.form?.controls['diasAgrupar']?.value || 0);
					this.tituloMontoP1 = '1-' + diasAgrupar;
					this.tituloMontoP2 = (diasAgrupar + 1) + ' - ' + (diasAgrupar * 2);
					this.tituloMontoP3 = ((2 * diasAgrupar) + 1) + ' - ' + (diasAgrupar * 3);
					this.tituloMontoP4 = ((3 * diasAgrupar) + 1) + ' +';
					switch(this.filtrosSidebar?.form?.form?.form?.controls['tipoReporte']?.value?.id){
						case TiposReportes.DETALLE:
							this.dataSourceDetalle.data = datos.datos || [];
							this.dataSourceResumen.data = [];
							break;
						case TiposReportes.RESUMEN:
							this.dataSourceDetalle.data = [];
							this.dataSourceResumen.data = datos.datos || [];
						break;
					}
				} else if(datos.url){
					this.url = datos.url;
					if(datos?.detalles?.tipo === 'resumen'){
						this.reportes = [];
						this.reportes.push(new Reporte(datos));
					} else if(datos?.detalles?.tipo.includes('detalle_')){
						let index = this.reportes.findIndex((reporte: Reporte)=>{return reporte.tipo == datos?.detalles?.tipo});
						if(index != -1)
							this.reportes.splice(index, 1);
						this.reportes.push(new Reporte(datos));
					}
				} else if(datos){
					this.filtros = [
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.PROVEEDORES'),
							name: "proveedores",
							formControl: new FormControl(null,[Validators.required]),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.proveedores,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.MONEDAS'),
							name: "monedas",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.monedas,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.DIAS_AGRUPAR'),
							inputType: "number",
							name: "diasAgrupar",
							validations: [
								{
									name: 'required',
									validator: Validators.required,
									message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
								},
								{
									name: 'min',
									validator: Validators.min(0),
									message: this.translate.instant('ERRORES_CAPTURA.ERROR_GENERAL_NUMERO_MINIMO')
								}
							]
						}
					];

					//this.filtrosOpciones = [];
					this.filtrosOpciones = [{
						title: 'XLSX',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/reporte-antiguedad-saldos/xls'
					}];
				} 
			});


	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

	verDetalle(id) {
		this.filtrosSidebar.subreporte(id);
	}

	closeTab(item: Reporte){
		event.stopPropagation();
		let index = this.reportes.findIndex((reporte: Reporte)=>{return reporte?.url === item?.url});
		if(index != -1)
			this.reportes.splice(index,1);
	}

}