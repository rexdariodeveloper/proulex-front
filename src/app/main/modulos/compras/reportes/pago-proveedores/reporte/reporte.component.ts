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
import { ReportePagoProveedoresService } from './reporte.service';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import * as moment from 'moment';
import { PixvsMatAccordionCell } from '@pixvs/componentes/mat-accordion/mat-accordion.component';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { ArchivoProjection } from '@models/archivo';

export class EstatusReporte {
	id: number;
	nombre: string;

	constructor(object) {
		this.id = object.id;
		this.nombre = object.nombre;
	}
}

export class DataGrouper {
    columnName: string;
    columnReplace: string;
    type: 'group' | 'sum' | 'rowCount';

    constructor(p0, p1, p2){
        this.columnName = p0;
        this.columnReplace = p1;
        this.type = p2;
    }
}

export class AccordionData {
    data: any[];
    headers: PixvsMatAccordionCell[];
    details: PixvsMatAccordionCell[];
    groups: DataGrouper[];
}

@Component({
	selector: 'reporte-antiguedad-saldos',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReportePagoProveedoresComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	CXPdata: AccordionData = new AccordionData();

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
	displayedColumns: string[] = [
		"fechaRegistro", "sede", "proveedor", "numeroDocumento", "monto", "moneda", "fechaVencimiento", "fechaPago", "formaPago", "cuenta"
	];

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _reporteService: ReportePagoProveedoresService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		private hashid: HashidsService
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.CXPdata.headers = [
			{name: 'Fecha Registro', value:'fechaRegistro', type: 'fecha', flex:'0 0 8%'},
			{name: 'Sede', value:'sede', flex:'0 0 10%'},
			{name: 'Proveedor', value:'proveedor', flex:'fill'},
			{name: 'Número de documento', value:'numeroDocumento', flex:'0 0 10%'},
			{name: 'Monto', value:'monto', type:'money', flex:'0 0 8%'},
			{name: 'Moneda', value:'moneda', flex:'0 0 8%'},
			{name: 'Fecha de vencimiento', value:'fechaVencimiento', type: 'fecha', flex:'0 0 10%'},
			{name: 'Fecha de pago', value:'fechaPago', type: 'fecha', flex:'0 0 8%'},
			{name: 'Forma de pago', value:'formaPago', flex:'0 0 15%'},
			{name: 'Cuenta', value:'cuenta', flex:'0 0 8%'}
		];
		this.CXPdata.details = [
			{name: 'Folio OC/SP/SPRH', value: 'codigo', flex:'0 0 10%'},
			{name: '', value: 'ordenCompraId', flex:'0 0 5%', type:'document', icon: 'receipt', action: this.getOC.bind(this)},
			{name: 'Folio de solicitud', value: 'solicitud', flex:'0 0 10%'},
			{name: '', value: 'solicitudId', flex:'0 0 5%', type:'document', icon: 'receipt', action: this.getSolicitud.bind(this)},
			{name: 'Identificador del pago', value: 'identificacionPago', flex:'0 0 10%'},
			{name: '', value: 'comprobanteId', flex:'0 0 5%', type:'document', icon: 'receipt', action: this.getEvidencia.bind(this)},
			{name: 'PDF', value: 'pdfId', flex:'0 0 5%', type:'document', icon: 'receipt', action: this.getPDF.bind(this)},
			{name: 'XML', value: 'xmlId', flex:'fill', type:'document', icon: 'receipt', action: this.getXML.bind(this)},
		];
		this.CXPdata.groups = [
			{columnName:'fechaRegistro', columnReplace:'fechaRegistro', type: 'group'},
			{columnName:'sede', columnReplace:'sede', type: 'group'}, 
			{columnName:'proveedor', columnReplace:'proveedor', type: 'group'}, 
			{columnName:'numeroDocumento', columnReplace:'numeroDocumento', type: 'group'}, 
			{columnName:'monto', columnReplace:'monto', type: 'group'}, 
			{columnName:'moneda', columnReplace:'moneda', type: 'group'}, 
			{columnName:'fechaVencimiento', columnReplace:'fechaVencimiento', type: 'group'}, 
			{columnName:'fechaPago', columnReplace:'fechaPago', type: 'group'}, 
			{columnName:'formaPago', columnReplace:'formaPago', type: 'group'}, 
			{columnName:'cuenta', columnReplace:'cuenta', type: 'group'}
		];
		this.CXPdata.data = [];
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
						},
						{
							type: "pixvsMatSelect",
							label: "Forma de pago",
							name: "formaPago",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos.formasPago,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.CUENTA'),
							name: "cuenta",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos.cuentas,
							campoValor: 'codigo',
							values: ['codigo','descripcion']
						},
					];

					this.filtrosOpciones = [{
						title: 'EXCEL',
						icon: 'arrow_downward',
						tipo: FichaListadoConfig.EXCEL,
						url: '/api/v1/pago-proveedores/report/download/excel'
					}];
				} else {
					if(!datos?.length){
						this.dataSource = new MatTableDataSource(null);
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}else {
						this.dataSource = new MatTableDataSource(datos);
						this.CXPdata.data =  this.mergeData(datos, this.CXPdata.groups);
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

	private mergeData(data: any[], groups: DataGrouper[]): any[] {
        let groupedData: any[] = [];
        
        data.forEach( d => {
            let row: any = {};
            let key: string = '';

            groups.forEach( g => {
                //Si la columna es del tipo 'grupo', pasarla a la cabecera y agregarla a la llave
                if(g.type === 'group'){
                    row[g.columnReplace] = d[g.columnName];
                    key += (d[g.columnName] || '');
                }
                //Si la columna es del tipo 'contador', inicializar a 1
                else if(g.type === 'rowCount')
                    row[g.columnReplace] = 1;

                //Pasar todo el registro a la propiedad 'children'
                row['children'] = [d];
            });

            //Utilizando la llave generada, se calcula un código hash único para cada llave
            row['hash'] = this.getHashCode(key);
            //Se busca si el código hash ya existe en los datos agrupados
            let group = groupedData.find( gd => gd?.hash === row.hash)

            if(group){
                //Por cada propiedad, excepto el código hash
                for( let k of Object.keys(group).filter( k => k !== 'hash')){
                    //Agregar los datos al arreglo 'children'
                    if(k === 'children')
                        group[k] = group[k].concat(row[k]);
                    //Aumentar los valores de las columnas acumulador
                    else{
                        if(typeof(group[k]) === 'number' && k.search('fecha') === -1)
                            group[k] += row[k];
                    }
                }
            }
            else
                groupedData.push(row);
        });

        return groupedData;
    }

    private getHashCode(str: string) : number {
        let hash = 0;
        if(str.length === 0) return hash;
        for(let i = 0; i < str.length; i++){
            let c = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + c;
            hash |= 0;
        }
        return hash;
    }

	private getFileByURL(id: string | number, url: string){
		this._reporteService.getArchivo(url + id);
		this._matSnackBar.openFromComponent(IconSnackBarComponent, {
			data: {
				message: 'Descargando...',
				icon: 'cloud_download',
			},
			duration: 1 * 1000, horizontalPosition: 'right'
		});
	}

	private getFileById(id: number, ext: string){
		let archivo = new ArchivoProjection();
		archivo.id = Number(id);
		archivo.nombreOriginal = 'archivo.' + ext;
		this._reporteService.verArchivo(archivo);
		this._matSnackBar.openFromComponent(IconSnackBarComponent, {
			data: {
				message: 'Descargando...',
				icon: 'cloud_download',
			},
			duration: 1 * 1000, horizontalPosition: 'right'
		});
	}

	getOC(id, event){
		let encoded = id;
		if(typeof(id) === 'number')
			encoded = this.hashid.encode(id);
		this.getFileByURL(encoded, '/api/v1/ordenes-compra/pdf/');
	}

	getSolicitud(id, event){
		this.getFileByURL(Number(id), '/api/v1/programacion-pagos/pdf/');
	}

	getEvidencia(id, event){
		this.getFileById(id, 'pdf');
	}

	getPDF(id, event){
		this.getFileById(id, 'pdf');
	}

	getXML(id, event){
		this.getArchivoById(id, 'xml');
	}

	private getArchivoById(id: number, ext: string){
		this._matSnackBar.openFromComponent(IconSnackBarComponent, {
			data: {
				message: 'Descargando...',
				icon: 'cloud_download',
			},
			duration: 9000, horizontalPosition: 'right'
		});
		this._reporteService.descargarArchivo(id, ext);
	}
}