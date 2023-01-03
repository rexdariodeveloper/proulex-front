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
import { EstadoCuentaService } from './reporte.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';

export class EstatusReporte {
	id: number;
	nombre: string;

	constructor(object) {
		this.id = object.id;
		this.nombre = object.nombre;
	}
}

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class EstadoCuentaComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = [
		'factura','fecha','termino','vencimiento','monto','restante','dias'
	];
	
	page: number = 0;

	estatus: EstatusReporte[] = [];
	saldos: any = {
		total: 0.0,
		actual: 0.0,
		vencido: 0.0,
		agrupador1: 0.0,
		agrupador2: 0.0,
		agrupador3: 0.0,
		agrupador4: 0.0
	};

	proveedor: any = null;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _estadoCuentaService: EstadoCuentaService,
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

		/*
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
		*/

		this._estadoCuentaService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.proveedores){

					this.estatus = [];
					this.estatus.push(new EstatusReporte({id:1, nombre:'Actual'}));
					this.estatus.push(new EstatusReporte({id:2, nombre:'Vencido'}));

					this.filtros = [
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.PROVEEDORES'),
							name: "proveedores",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.proveedores,
							campoValor: 'nombre',
							values: ['nombre']
						},
						/*{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.FACTURAS'),
							name: "facturas",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.facturas,
							campoValor: 'codigoRegistro',
							values: ['codigoRegistro']
						},*/
						{
							type: "input",
							label: this.translate.instant('FILTROS.FECHA'),
							inputType: "date",
							name: "fecha",
							validations: [],
							value: moment(new Date()).format('YYYY-MM-DD')
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.ESTATUS'),
							name: "estatus",
							formControl: new FormControl(this.estatus[0]),
							validations: [],
							multiple: false,
							selectAll: false,
							list: this.estatus,
							campoValor: 'nombre',
							values: ['nombre']
						},
					];

					this.filtrosOpciones = [{
						title: 'EXCEL',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/ordenes-compra/estado-cuenta/download/excel'
					}];
				} else {
					if(!datos.length){
						this.saldos = {total: 0.0,actual: 0.0,vencido: 0.0,agrupador1: 0.0,agrupador2: 0.0,agrupador3: 0.0,agrupador4: 0.0};
						this.dataSource = new MatTableDataSource(null);
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}else {
						this.saldos = {total: 0.0,actual: 0.0,vencido: 0.0,agrupador1: 0.0,agrupador2: 0.0,agrupador3: 0.0,agrupador4: 0.0};

						datos.forEach(row => {
							this.saldos.total += row.monto;
							this.saldos.vencido += row.dias >  0? row.restante : 0;
							this.saldos.actual += row.dias == 0?  row.restante : 0;
							this.saldos.agrupador1 += (row.dias > 0  && row.dias < 16)? row.restante : 0;
							this.saldos.agrupador2 += (row.dias > 15 && row.dias < 31)? row.restante : 0;
							this.saldos.agrupador3 += (row.dias > 30 && row.dias < 46)? row.restante : 0;
							this.saldos.agrupador4 += row.dias > 45? row.restante : 0;
						});

						this.dataSource = new MatTableDataSource(datos);
					}
					
				}
			});


	}

	ngAfterViewInit(): void {
		this.filtrosSidebar._FichasDataService.translate = this.translate;

		this.filtrosSidebar.form.form.form.controls['proveedores'].valueChanges.subscribe( data =>{
			this.proveedor = data;
		});
	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
    }

}