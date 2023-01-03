import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { takeUntil } from 'rxjs/operators';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { ReporteConfirmingService } from './reporte.service';
import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';

@Component({
	selector: 'reporte-confirming',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReporteConfirmingComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = [
		"nombreSucursal","nombreProveedor","codigo","fechaRegistro","folio","fechaFactura","diasCredito","ultimaFechaPago","subtotal","descuento","iva","ieps","retenciones","total"
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _reporteService: ReporteConfirmingService,
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

		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.dataSource.filterPredicate = (elemento,filtro) => {
			let textoBuscar = elemento.codigo
				+ ' ' + elemento.nombre;
			return !filtro || textoBuscar.toLowerCase().includes(filtro.toLowerCase());
		};

		this._reporteService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.proveedores){

					this.filtros = [
						{
							type: "input",
							label: this.translate.instant('FILTROS.FECHA_INICIO'),
							inputType: "date",
							name: "fechaInicio",
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							value: moment(new Date()).format('YYYY-MM-DD')
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.FECHA_FIN'),
							inputType: "date",
							name: "fechaFin",
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							value: moment(new Date()).format('YYYY-MM-DD')
						},
						{
							type: "pixvsMatSelect",
							label: "Sede",
							name: "sedes",
							formControl: new FormControl(null, [Validators.required]),
							validations: [{
								name: 'required',
								validator: Validators.required,
								message: this.translate.instant('ERRORES_CAPTURA.CAMPO_REQUERIDO')
							}],
							multiple: true,
							selectAll: false,
							list: datos.sucursales,
							campoValor: 'nombre',
							values: ['nombre']
						},
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
						}
					];

					this.filtrosOpciones = [{
						title: 'EXCEL',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/confirming/xls'
					},{
						title: 'PDF',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.PERSONALIZADO,
						url: '/api/v1/confirming/pdf'
					}];
				} else {
					if(!datos?.length){
						this.dataSource = new MatTableDataSource(null);
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}else {
						this.dataSource = new MatTableDataSource(datos);
					}
					
				}
			});
	}

	ngAfterViewInit(): void {
		//this.filtrosSidebar._FichasDataService.translate = this.translate;
	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

}