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
import { ReporteOrdenesCompraService } from './reporte.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReporteOrdenesCompraComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	@ViewChild('filter', { static: true })
	filter: ElementRef;
	
	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = [
		'codigo','almacen','fechaOC','fechaReq','estatus','proveedor','art_cod','articulo','um','cantidad',
		'precio','subtotal','descuento','iva','ieps','total'
	];
	
	page: number = 0;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		public _fichasDataService: FichasDataService,
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

		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.dataSource.filterPredicate = (elemento,filtro) => {
			let textoBuscar = elemento.codigo
				+ ' ' + elemento.nombre;
			return !filtro || textoBuscar.toLowerCase().includes(filtro.toLowerCase());
		};

		fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if (!this.dataSource) {
                    return;
                }

                this.paginator.pageIndex = 0;
                this.dataSource.filter = this.filter.nativeElement.value;
            });

		this._fichasDataService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.proveedores){

					let estatus = datos.estatus.filter(item => ![2000061,2000062,2000065].includes(item.id))
					this.filtros = [
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.PROVEEDORES'),
							name: "proveedores",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.proveedores,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.CODIGO'),
							inputType: "text",
							name: "codigo"
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.ARTICULOS'),
							name: "articulos",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.articulos,
							campoValor: 'nombreArticulo',
							values: ['nombreArticulo']
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.ALMACEN'),
							name: "almacen",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.almacenes,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.DESDE'),
							inputType: "date",
							name: "fechaDesde",
							validations: []
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.HASTA'),
							inputType: "date",
							name: "fechaHasta",
							validations: []
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.ESTATUS'),
							name: "estatus",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: true,
							list: estatus,
							campoValor: 'valor',
							values: ['valor']
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

					];

					this.filtrosOpciones = [{
						title: 'EXCEL',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/ordenes-compra/reporte/download/excel'
					}];
				} else {
					if(!datos?.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
						this.dataSource = new MatTableDataSource([]);
					}else {
						this.dataSource = new MatTableDataSource(datos);
						this._fuseSidebarService.getSidebar('filtros-sidebar').close();
					}
					
				}
			});


	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

}