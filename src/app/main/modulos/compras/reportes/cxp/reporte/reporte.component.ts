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
import { ReporteCXPService } from './reporte.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { ReporteCXPDescargasService } from './descargas.service';

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReporteCXPComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = [
		"fechaRegistro", "sede", "proveedor", "numeroDocumento", "monto", "saldo", "moneda", "fechaVencimiento", "archivos"
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _reporteService: ReporteCXPService,
		public _descargaService: ReporteCXPDescargasService,
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
							list: datos.sedes,
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
						},
						{
							type: "input",
							label: 'Número de documento',
							inputType: "text",
							name: "numeroDocumento",
							validations: [],
							value: null
						},
						{
							type: "pixvsMatSelect",
							label: "Moneda",
							name: "moneda",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.monedas,
							campoValor: 'nombre',
							values: ['nombre']
						}
					];

					this.filtrosOpciones = [{
						title: 'EXCEL',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/cxp/xls'
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
		this.filtrosSidebar._FichasDataService.translate = this.translate;
	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

	getDocument(id: number, extension: string): void {
		this._descargaService.getArchivo(id,extension);
	}

}