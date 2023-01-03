import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
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
import { Validators, FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { MatTableDataSource } from '@angular/material/table';

import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import { RequisicionConvertirListadoProjection } from '@app/main/modelos/requisicion';
import { RequisicionPartidaConvertirListadoProjection } from '@app/main/modelos/requisicion-partida';
import { ConvertirRequisicionService } from './convertir-requisicion.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { Proveedor, ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { ArticuloComboProjection, ArticuloPrecargarProjection, ArticuloUltimasComprasProjection } from '@app/main/modelos/articulo';
import { UltimasComprasDialogComponent, UltimasComprasDialogData } from './dialogs/ultimas-compras/ultimas-compras.dialog';
import { OrdenCompra } from '@app/main/modelos/orden-compra';
import { OrdenCompraDetalle } from '@app/main/modelos/orden-compra-detalle';
import { AlmacenComboDomicilioProjection } from '@app/main/modelos/almacen';
import { ConvertirDialogComponent, ConvertirDialogData } from './dialogs/convertir/convertir.dialog';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { Moment } from 'moment';
import * as moment from 'moment';
import { JsonResponse } from '@models/json-response';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ArticulosTipos } from '@app/main/modelos/mapeos/articulos-tipos';
import { RechazarPartidaDialogComponent, RechazarPartidaDialogData } from './dialogs/rechazar-partida/rechazar-partida.dialog';
import { RequisicionComentariosDialogComponent, RequisicionComentariosDialogData } from '../../requisiciones/requisicion/dialogs/comentarios/comentarios.dialog';
import { EditarPartidaConvertirDialogComponent, EditarPartidaConvertirDialogData } from './dialogs/editar-partida/editar-partida.dialog';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ValidatorService } from '@services/validators.service';
import { PixvsBuscadorAmazonEvent, PixvsBuscadorAmazonOpcion } from '@pixvs/componentes/buscador-amazon/buscador-amazon.component';
import { ArchivoProjection } from '@models/archivo';
import { OrdenCompraService } from './../../ordenes-compra/orden-compra/orden-compra.service';
import { OrderReportData, OrderReportPrintComponent } from './prints/invoice.print';

class BuscadorAmazonOpciones {
	static Todo: number = 1;
	static Familias: number = 2;
	static Categorias: number = 3;
	static Subcategorias: number = 4;
	static Articulos: number = 5;
}

@Component({
	selector: 'convertir-requisicion',
	templateUrl: './convertir-requisicion.component.html',
	styleUrls: ['./convertir-requisicion.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ConvertirRequisicionComponent  {

	ArticulosTipos = ArticulosTipos;

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;
	@ViewChildren('chk')
	requisicionesChk: QueryList<MatCheckbox>;
	@ViewChild('chkRequisiciones')
	chkRequisiciones: MatCheckbox;
	@ViewChildren('chkPartida')
	partidasChk: QueryList<MatCheckbox>;
	@ViewChild('chkPartidas')
	todasPartidasChk: MatCheckbox;

    @ViewChild("printBtn") printBtn: ElementRef;
	@ViewChild(OrderReportPrintComponent) invoice: OrderReportPrintComponent;

	dataSourceRequisiciones: MatTableDataSource<RequisicionConvertirListadoProjection> = new MatTableDataSource([]);
	displayedColumnsRequisiciones: string[] = [
		'checkConvertir',
		'codigo',
		'fecha',
		'sucursal',
		'departamento',
		'comentarios',
		'estadoRequisicion'
	];
	dataSourcePartidas: MatTableDataSource<RequisicionPartidaConvertirListadoProjection> = new MatTableDataSource([]);
	displayedColumnsPartidas: string[] = [
		'checkConvertir',
		'codigoRequisicion',
		'fechaPartida',
		'codigoArticulo',
		'nombreArticulo',
		'um',
		'cantidad',
		'precioUnitario',
		'ultimasCompras',
		'iva',
		'ieps',
		'total',
		'proveedor',
		'lugarEntrega',
		'cuentaCompras',
		'rechazar'
	];

	requisicionSeleccionada: RequisicionConvertirListadoProjection = null;
	requisicionesSeleccionadasMap: {[requisicionId:number]: boolean} = {};
	requisicionesMap: {[requisicionId:number]: RequisicionConvertirListadoProjection} = {};
	partidasMap: {[partidaId:number]: RequisicionPartidaConvertirListadoProjection} = {};
	partidasMapRequisicion: {[requisicionId:number]: RequisicionPartidaConvertirListadoProjection[]} = {};
	partidasSeleccionadasMap: {[partidaId:number]: boolean} = {};

	form: FormGroup;
	umControls: {[partidaId: number]: FormControl} = {};
	cantidadControls: {[partidaId: number]: FormControl} = {};
	precioUnitarioControls: {[partidaId: number]: FormControl} = {};
	proveedorControls: {[partidaId: number]: FormControl} = {};
	proveedores: ProveedorComboProjection[] = [];
	cuentaComprasControls: {[partidaId: number]: FormControl} = {};

	articuloSeleccionadoUltimasCompras: ArticuloPrecargarProjection = null;

	monedas: MonedaComboProjection[];
	monedaPredeterminada: MonedaComboProjection;

	@ViewChild('selectFamilias') selectFamilias: PixvsMatSelectComponent;
	@ViewChild('selectCategorias') selectCategorias: PixvsMatSelectComponent;
	@ViewChild('selectSubcategorias') selectSubcategorias: PixvsMatSelectComponent;
	@ViewChild('selectArticulos') selectArticulos: PixvsMatSelectComponent;

	articuloFamilias: ArticuloFamiliaComboProjection[];
	articuloCategorias: ArticuloCategoriaComboProjection[];
	articuloSubcategorias: ArticuloSubcategoriaComboProjection[];
	articulos: ArticuloComboProjection[];

	articuloFamiliasControl: FormControl = new FormControl([],[]);
	articuloCategoriasControl: FormControl = new FormControl([],[]);
	articuloSubcategoriasControl: FormControl = new FormControl([],[]);
	articulosControl: FormControl = new FormControl([],[]);

	actualizarVistaCont: number = 0;

	partidaSeleccionadaRechazar: RequisicionPartidaConvertirListadoProjection = null;

	opcionesBuscadorAmazon: PixvsBuscadorAmazonOpcion[] = [
		{
			id: BuscadorAmazonOpciones.Todo,
			nombre: 'Todo'
		},{
			id: BuscadorAmazonOpciones.Familias,
			nombre: 'Familias'
		},{
			id: BuscadorAmazonOpciones.Categorias,
			nombre: 'Categorías'
		},{
			id: BuscadorAmazonOpciones.Subcategorias,
			nombre: 'Subcategorías'
		},{
			id: BuscadorAmazonOpciones.Articulos,
			nombre: 'Artículos'
		}
	];
	opcionBuscadorAmazonSeleccionadaId: number = null;

	private _unsubscribeAll: Subject < any > ;

	private partidaEditar: RequisicionPartidaConvertirListadoProjection = null;

	constructor(
		public _convertirRequisicionService: ConvertirRequisicionService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		private _formBuilder: FormBuilder,
		private el: ElementRef,
		public dialog: MatDialog,
		public validatorService: ValidatorService,
        public _ordenCompraService: OrdenCompraService
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

		this._convertirRequisicionService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.requisiciones){
					if(!datos.requisiciones.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}
					this.dataSourceRequisiciones.data = datos.requisiciones || [];
					this.dataSourceRequisiciones.data.forEach(requisicion => {
						this.requisicionesMap[requisicion.id] = requisicion;
					});
				} else if(datos?.partidas) {
					if(!datos.partidas.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
					}
					this.partidasMapRequisicion[this.requisicionSeleccionada.id] = datos.partidas || [];
					this.partidasMapRequisicion[this.requisicionSeleccionada.id].forEach(partida => {
						this.partidasMap[partida.id] = partida;
						this.umControls[partida.id] = new FormControl(partida.unidadMedida,[]);
						this.cantidadControls[partida.id] = new FormControl(partida.cantidadRequerida,[]);
						this.cantidadControls[partida.id] = new FormControl(partida.cantidadRequerida,[]);
						this.precioUnitarioControls[partida.id] = new FormControl(partida.articulo.costoUltimo,[]);
						this.proveedorControls[partida.id] = new FormControl(datos.proveedoresMapArticuloId[partida.articulo.id] || null,[]);
						this.cuentaComprasControls[partida.id] = new FormControl(partida.articulo.cuentaCompras || null,[]);
						this.umControls[partida.id].disable();
						this.cantidadControls[partida.id].disable();
						this.precioUnitarioControls[partida.id].disable();
						this.proveedorControls[partida.id].disable();
						this.cuentaComprasControls[partida.id].disable();
						this.form.addControl('um' + partida.id,this.umControls[partida.id]);
						this.form.addControl('cantidad' + partida.id,this.cantidadControls[partida.id]);
						this.form.addControl('precio' + partida.id,this.precioUnitarioControls[partida.id]);
						this.form.addControl('proveedor' + partida.id,this.proveedorControls[partida.id]);
						this.form.addControl('cuentaCompras' + partida.id,this.cuentaComprasControls[partida.id]);
					});
					this.dataSourcePartidas.data = [...this.dataSourcePartidas.data,...this.partidasMapRequisicion[this.requisicionSeleccionada.id]];
				}else if(datos){
					this.filtros = [
						{
                            type: "input",
                            label: this.translate.instant('FILTROS.FECHA_DESDE'),
                            inputType: "date",
                            name: "fechaDesde",
                            validations: []
						},
						{
                            type: "input",
                            label: this.translate.instant('FILTROS.FECHA_HASTA'),
                            inputType: "date",
                            name: "fechaHasta",
                            validations: []
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.CODIGO_REQUISICION'),
							inputType: null,
							name: "codigoRequisicion",
							validations: [
							]
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.SUCURSAL'),
							name: "sucursalId",
							formControl: new FormControl(null,[Validators.required]),
							validations: [],
							multiple: true,
							selectAll: true,
							list: datos.sucursales,
							campoValor: 'nombre',
							values: ['nombre']
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.DEPARTAMENTO'),
							name: "departamentoId",
							formControl: new FormControl(null,[Validators.required]),
							validations: [],
							multiple: true,
							selectAll: true,
							list: datos.departamentos,
							campoValor: 'nombre',
							values: ['nombre']
						}
					];

					this.filtrosOpciones = [];

					this.proveedores = datos.proveedores;
					this.monedas = datos.monedas;
					this.monedaPredeterminada = datos.monedaPredeterminada;
					
					this.articuloFamilias = datos.articuloFamilias;
					this.articuloCategorias = datos.articuloCategorias;
					this.articuloSubcategorias = datos.articuloSubcategorias;
					this.articulos = datos.articulos;

					this.form = this.createForm();
					this.form.enable();

					this.dataSourceRequisiciones.data = datos.requisicionesInicial || [];
					this.dataSourceRequisiciones.data.forEach(requisicion => {
						this.requisicionesMap[requisicion.id] = requisicion;
					});
					this.dataSourcePartidas.data = [];
					this.dataSourcePartidas.filterPredicate = this.filtrarPartidas.bind(this);
					this.requisicionesSeleccionadasMap = {};
					this.partidasSeleccionadasMap = {};
				}
			});
		this._convertirRequisicionService.onUltimasComprasChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(ultimasCompras => {
				if(ultimasCompras){
					if(!ultimasCompras?.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_ULTIMAS_COMPRAS'), 'OK', {
							duration: 5000,
						});
						return;
					}
					this._convertirRequisicionService.onUltimasComprasChanged.next(null);
					this.abrirModalUltimasCompras(this.articuloSeleccionadoUltimasCompras,ultimasCompras);
				}
			});
		this._convertirRequisicionService.onRechazarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(rechazado => {
				if(rechazado){
					this._convertirRequisicionService.onRechazarChanged.next(null);
				}
			});

		this._convertirRequisicionService.onErrorGuardarChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(error => {
				if(error){
					this._convertirRequisicionService.onErrorGuardarChanged.next(null);
					location.reload();
				}
			});

	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
	}
	
	onSeleccionarRequisicion(requisicion: RequisicionConvertirListadoProjection, chk: MatCheckbox){
		this.requisicionSeleccionada = requisicion;
		this.requisicionesSeleccionadasMap[requisicion.id] = chk.checked;
		if(chk.checked && !this.partidasMapRequisicion[requisicion.id]){
			this._convertirRequisicionService.getPartidas(requisicion.id);
			if(this.estanTodasRequisicionesSeleccionadas()){
				this.chkRequisiciones.indeterminate = false;
				this.chkRequisiciones.checked = true;
			}else if(this.hayRequisicionesSeleccionadas()){
				this.chkRequisiciones.checked = false;
				this.chkRequisiciones.indeterminate = true;
			}
		}else if(chk.checked){
			this.dataSourcePartidas.data = [...this.dataSourcePartidas.data,...this.partidasMapRequisicion[requisicion.id]];
			if(this.estanTodasRequisicionesSeleccionadas()){
				this.chkRequisiciones.indeterminate = false;
				this.chkRequisiciones.checked = true;
			}else if(this.hayRequisicionesSeleccionadas()){
				this.chkRequisiciones.checked = false;
				this.chkRequisiciones.indeterminate = true;
			}
		}else{
			this.dataSourcePartidas.data = this.dataSourcePartidas.data.filter(partida => {
				this.partidasSeleccionadasMap[partida.id] = false;
				return partida.requisicion.id != requisicion.id;
			});
			this.chkRequisiciones.checked = false;
			if(this.hayRequisicionesSeleccionadas()){
				this.chkRequisiciones.indeterminate = true;
			}else{
				this.chkRequisiciones.indeterminate = false;
			}
		}
	}
	
	onSeleccionarPartida(partida: RequisicionPartidaConvertirListadoProjection, chk: MatCheckbox){
		this.partidasSeleccionadasMap[partida.id] = chk.checked;
		if(chk.checked){
			this.umControls[partida.id].setValidators([Validators.required]);
			this.cantidadControls[partida.id].setValidators([Validators.required, Validators.min(0.000001), Validators.max(partida.cantidadRequerida)]);
			this.precioUnitarioControls[partida.id].setValidators([Validators.required, Validators.min(0)]);
			this.proveedorControls[partida.id].setValidators([Validators.required]);
			this.cuentaComprasControls[partida.id].setValidators([Validators.maxLength(18)]);
			this.umControls[partida.id].enable();
			this.cantidadControls[partida.id].enable();
			this.precioUnitarioControls[partida.id].enable();
			this.proveedorControls[partida.id].enable();
			this.cuentaComprasControls[partida.id].enable();
			if(this.estanTodasPartidasSeleccionadas()){
				this.todasPartidasChk.indeterminate = false;
				this.todasPartidasChk.checked = true;
			}else if(this.hayPartidasSeleccionadas()){
				this.todasPartidasChk.checked = false;
				this.todasPartidasChk.indeterminate = true;
			}
		}else{
			this.umControls[partida.id].setValidators([]);
			this.cantidadControls[partida.id].setValidators([]);
			this.precioUnitarioControls[partida.id].setValidators([]);
			this.proveedorControls[partida.id].setValidators([]);
			this.cuentaComprasControls[partida.id].setValidators([]);
			this.umControls[partida.id].disable();
			this.cantidadControls[partida.id].disable();
			this.precioUnitarioControls[partida.id].disable();
			this.proveedorControls[partida.id].disable();
			this.cuentaComprasControls[partida.id].disable();
			this.todasPartidasChk.checked = false;
			if(this.hayPartidasSeleccionadas()){
				this.todasPartidasChk.indeterminate = true;
			}else{
				this.todasPartidasChk.indeterminate = false;
			}
		}
	}

	createForm(): FormGroup {

		this.articuloFamiliasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(familia => {
			this.selectCategorias.setDatos(this.getCategoriasFiltradas(this.articuloCategorias,this.articuloFamiliasControl.value));
			this.articuloCategoriasControl.setValue([]);
		});
		this.articuloCategoriasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(categoria => {
			this.selectSubcategorias.setDatos(this.getSubcategoriasFiltradas(this.articuloSubcategorias,this.articuloFamiliasControl.value,this.articuloCategoriasControl.value,this.articuloCategorias));
			this.articuloSubcategoriasControl.setValue([]);
		});
		this.articuloSubcategoriasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(subcategoria => {
			this.selectArticulos.setDatos(this.getArticulosFiltrados(this.articulos,this.articuloFamiliasControl.value,this.articuloCategoriasControl.value,this.articuloSubcategoriasControl.value))
			this.articulosControl.setValue([]);
		});
		this.articulosControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(articulo => {
			this.dataSourcePartidas.filter = String(Number(this.dataSourcePartidas.filter || '0') + 1);
			let partidasFiltradasIds: number[] = this.dataSourcePartidas.filteredData.map(partida => {
				return partida.id;
			});
			let partidasSeleccionadasIds: string[] = Object.keys(this.partidasSeleccionadasMap);
			partidasSeleccionadasIds.forEach(partidaId => {
				if(!partidasFiltradasIds.includes(Number(partidaId))){
					this.partidasSeleccionadasMap[partidaId] = false;
				}
			});
		});

		let form = this._formBuilder.group({});

		return form;
	}

	guardar() {
		this._convertirRequisicionService.cargando = true;
		if (this.form.valid) {
			this.form.disable();
			let ocs: OrdenCompra[] = [];
			let index: number = 0;
			let partidasMapProveedor: {[proveedorId:number]: {[almacenId:number]: RequisicionPartidaConvertirListadoProjection[]}} = {};
			let partidasValid: boolean = false;
			for(let partida of this.dataSourcePartidas.data){
				if(this.partidasSeleccionadasMap[partida.id]){
					partidasValid = true;
					let proveedorId = this.proveedorControls[partida.id].value.id;
					if(!partidasMapProveedor[proveedorId]){
						partidasMapProveedor[proveedorId] = {};
					}
					partidasMapProveedor[proveedorId][partida.requisicion.almacen.id] = [...(partidasMapProveedor[proveedorId][partida.requisicion.almacen.id] || []),partida];
				}
			}
			if(!partidasValid){
				this._convertirRequisicionService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
					duration: 5000,
				});
			}
			for(let proveedorId in partidasMapProveedor){
				let almacenesProveedor = partidasMapProveedor[proveedorId];
				for(let almacenId in almacenesProveedor){
					let partidasConvertir: RequisicionPartidaConvertirListadoProjection[] = partidasMapProveedor[proveedorId][almacenId];
					let proveedor: Proveedor = this.proveedorControls[partidasConvertir[0].id].value;
					let detalles: OrdenCompraDetalle[] = [];
					let requisicion: RequisicionConvertirListadoProjection = null;
					let fechaRequeridaMenor: Moment = null;
					for(let partida of partidasConvertir){
						requisicion = partida.requisicion;
						if(fechaRequeridaMenor == null){
							fechaRequeridaMenor = moment(partida.fechaRequerida);
						}else{
							let fechaRequerida = moment(partida.fechaRequerida);
							if(Number(fechaRequeridaMenor) > Number(fechaRequerida)){
								fechaRequeridaMenor = fechaRequerida;
							}
						}
						let detalle: OrdenCompraDetalle = {
							id: null,
							ordenCompraId: null,
							articulo: partida.articulo,
							articuloId: partida.articulo.id,
							unidadMedida: this.umControls[partida.id].value,
							unidadMedidaId: this.umControls[partida.id].value.id,
							factorConversion: this.umControls[partida.id].value.id == partida.articulo.unidadMedidaConversionCompras?.id
								? partida.articulo.factorConversionCompras
								: 1,
							cantidad: this.cantidadControls[partida.id].value,
							precio: this.precioUnitarioControls[partida.id].value,
							descuento: partida.descuento || 0,
							iva: partida.iva,
							ivaExento: partida.ivaExento,
							ieps: partida.ieps,
							iepsCuotaFija: partida.iepsCuotaFija,
							requisicionPartidaId: partida.id,
							cuentaCompras: this.cuentaComprasControls[partida.id].value,
							comentarios: partida.comentariosCompras
						};
						detalles.push(detalle);
					}
					let oc: OrdenCompra = {
						id: null,
						codigo: String(++index),
						proveedor: proveedor,
						proveedorId: Number(proveedorId),
						fechaOC: new Date(),
						fechaRequerida: new Date(fechaRequeridaMenor.format('YYYY-MM-DD HH:mm:ss')),
						direccionOC: requisicion.almacen.direccionCompleta,
						remitirA: null,//TODO: (prooveedor) obtener datos del proveedor
						recepcionArticulosAlmacen: {
							id: requisicion.almacen.id,
							nombre: requisicion.almacen.nombre,
							domicilio: requisicion.almacen.domicilio,
							cp: requisicion.almacen.cp,
							sucursal: {
								nombre: requisicion.almacen.sucursal.nombre
							}
						},
						recepcionArticulosAlmacenId: requisicion.almacen.id,
						moneda: null,
						monedaId: null,
						terminoPago: proveedor.diasPlazoCredito || 0,
						departamento: null,
						departamentoId: null,
						descuento: 0,
						comentario: null,
						estatus: null,
						estatusId: null,
						detalles: detalles
					};
					ocs.push(oc);
				}
			}
			this.abrirModalConvertir(ocs);
		} else {

			for (const key of Object.keys(this.form.controls)) {
				if (this.form.controls[key].invalid) {
					const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

					if (invalidControl) {
						//let tab = invalidControl.parents('div.tab-pane').scope().tab
						//tab.select();                           
						invalidControl.focus();
						break;
					}

				}
			}

			this._convertirRequisicionService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	isRequired(campo: string) {

		let form_field = this.form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	onUltimasCompras(articulo: ArticuloPrecargarProjection){
		this.articuloSeleccionadoUltimasCompras = articulo;
		this._convertirRequisicionService.getUltimasCompras(articulo.id);
	}

	abrirModalUltimasCompras(articulo: ArticuloPrecargarProjection, ultimasCompras: ArticuloUltimasComprasProjection[]): void {

		let dialogData: UltimasComprasDialogData = {
			articulo,
			ultimasCompras
		};

		const dialogRef = this.dialog.open(UltimasComprasDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	abrirModalConvertir(ordenesCompra: OrdenCompra[]): void {

		let dialogData: ConvertirDialogData = {
			ordenesCompra,
			monedas: this.monedas,
			monedaPredeterminada: this.monedaPredeterminada,
			onAceptar: this.onAceptarModalConvertir.bind(this),
            onPreview: this.onPreview.bind(this)
		};

		const dialogRef = this.dialog.open(ConvertirDialogComponent, {
			width: '800px',
			data: dialogData
		});
	}

    onPreview(data: OrderReportData){

        this.invoice.setData(data);
        //this.dialogRef.updateSize('100%', '100%');
		setTimeout(function(){ 
            window.print();
        }.bind(this) , 1000);

    }


	onAceptarModalConvertir(ordenesCompra: OrdenCompra[]){
		let body: any = [...ordenesCompra];
		for(let oc of body){
			oc.fechaOC = moment(oc.fechaOC).format('YYYY-MM-DD HH:mm:ss.SSS');
			oc.fechaRequerida = moment(oc.fechaRequerida).format('YYYY-MM-DD HH:mm:ss.SSS');
		}
		this._convertirRequisicionService.guardar(JSON.stringify(body),'/api/v1/convertir-requisicion/save').then(
			((result: JsonResponse) => {
				if (result.status == 200) {
					this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
						duration: 5000,
					});
                    
                    let OcIds = result.data;
                    for (let index = 0, total = OcIds; index < total.length; index++) {
                        this._ordenCompraService.descargarPdf( OcIds[index] );
                    }

					this.requisicionesSeleccionadasMap = {};
					this.partidasSeleccionadasMap = {};
					this.requisicionSeleccionada = null;
					this.partidaSeleccionadaRechazar = null;
					this.partidasMapRequisicion = {};
					this.requisicionesMap = {};
					this.partidasMap = {};
					this._convertirRequisicionService.getDatos();
				} else {
					this._convertirRequisicionService.cargando = false;
					this.form.enable();
				}
			}).bind(this)
		);
	}

	getCategoriasFiltradas(categorias: ArticuloCategoriaComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = []): ArticuloCategoriaComboProjection[] {
		if(!familiasSeleccionadas.length){
			return categorias;
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		return categorias.filter(categoria => {
			return familiasIds.includes(categoria.familia.id);
		});
	}

	getSubcategoriasFiltradas(subcategorias: ArticuloSubcategoriaComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = [], categoriasSeleccionadas: ArticuloCategoriaComboProjection[] = [], categorias: ArticuloCategoriaComboProjection[] = []): ArticuloSubcategoriaComboProjection[] {
		if(!familiasSeleccionadas.length && !categoriasSeleccionadas.length){
			return subcategorias;
		}
		if(!!categoriasSeleccionadas.length){
			let categoriasIds: number[] = categoriasSeleccionadas.map(categoria => {
				return categoria.id;
			});
			return subcategorias.filter(subcategoria => {
				return categoriasIds.includes(subcategoria.categoria.id);
			});
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		let categoriasIds: number[] = categorias.filter(categoria => {
			return familiasIds.includes(categoria.familia.id);
		}).map(categoria => {
			return categoria.id;
		});
		return subcategorias.filter(subcategoria => {
			return categoriasIds.includes(subcategoria.categoria.id);
		});
	}

	getArticulosFiltrados(articulos: ArticuloComboProjection[], familiasSeleccionadas: ArticuloFamiliaComboProjection[] = [], categoriasSeleccionadas: ArticuloCategoriaComboProjection[] = [], subcategoriasSeleccionadas: ArticuloSubcategoriaComboProjection[] = []): ArticuloComboProjection[] {
		if(!familiasSeleccionadas.length && !categoriasSeleccionadas.length && !subcategoriasSeleccionadas.length){
			return articulos;
		}
		if(!!subcategoriasSeleccionadas.length){
			let subcategoriasIds: number[] = subcategoriasSeleccionadas.map(subcategoria => {
				return subcategoria.id;
			});
			return articulos.filter(articulo => {
				return subcategoriasIds.includes(articulo.subcategoria?.id);
			});
		}
		if(!!categoriasSeleccionadas.length){
			let categoriasIds: number[] = categoriasSeleccionadas.map(categoria => {
				return categoria.id;
			});
			return articulos.filter(articulo => {
				return categoriasIds.includes(articulo.categoria?.id);
			});
		}
		let familiasIds: number[] = familiasSeleccionadas.map(familia => {
			return familia.id;
		});
		return articulos.filter(articulo => {
			return familiasIds.includes(articulo.familia?.id);
		});
	}

	filtrarPartidas(partida: RequisicionPartidaConvertirListadoProjection,filtro: string){
		if(!filtro){
			return true;
		}
		let textoBuscar: string = '';
		switch(this.opcionBuscadorAmazonSeleccionadaId){
			case BuscadorAmazonOpciones.Familias:
				textoBuscar = partida.articulo.familia?.nombre;
				break;
			case BuscadorAmazonOpciones.Categorias:
				textoBuscar = partida.articulo.categoria?.nombre;
				break;
			case BuscadorAmazonOpciones.Subcategorias:
				textoBuscar = partida.articulo.subcategoria?.nombre;
				break;
			case BuscadorAmazonOpciones.Articulos:
				textoBuscar = partida.articulo.nombreArticulo;
				break;
			case BuscadorAmazonOpciones.Todo:
					if(!!partida.articulo.familia?.nombre){
						textoBuscar += ' ' + partida.articulo.familia?.nombre;
					}
					if(!!partida.articulo.categoria?.nombre){
						textoBuscar += ' ' + partida.articulo.categoria?.nombre;
					}
					if(!!partida.articulo.subcategoria?.nombre){
						textoBuscar += ' ' + partida.articulo.subcategoria?.nombre;
					}
					if(!!partida.articulo.nombreArticulo){
						textoBuscar += ' ' + partida.articulo.nombreArticulo;
					}
				break;
		}
		return textoBuscar.toLocaleLowerCase().includes(filtro.toLocaleLowerCase());
	}

	estanTodasPartidasSeleccionadas(): boolean{
		for(let partida of this.dataSourcePartidas.filteredData){
			if(!this.partidasSeleccionadasMap[partida.id]){
				return false;
			}
		}
		return true;
	}

	hayPartidasSeleccionadas(): boolean{
		for(let partida of this.dataSourcePartidas.filteredData){
			if(this.partidasSeleccionadasMap[partida.id]){
				return true;
			}
		}
		return false;
	}

	estanTodasRequisicionesSeleccionadas(): boolean{
		for(let requisicion of this.dataSourceRequisiciones.data){
			if(!this.requisicionesSeleccionadasMap[requisicion.id]){
				return false;
			}
		}
		return true;
	}

	hayRequisicionesSeleccionadas(): boolean{
		for(let requisicion of this.dataSourceRequisiciones.data){
			if(this.requisicionesSeleccionadasMap[requisicion.id]){
				return true;
			}
		}
		return false;
	}

	onSeleccionarTodasPartidas(chkPartidas: MatCheckbox){
		if(chkPartidas.checked){
			for(let chk of this.partidasChk){
				if(!chk.checked){
					chk.toggle();
					let partidaId = chk.id.substr(1);
					this.onSeleccionarPartida(this.partidasMap[partidaId],chk)
				}
			}
		}else{
			for(let chk of this.partidasChk){
				if(chk.checked){
					chk.checked = false;
					let partidaId = chk.id.substr(1);
					this.onSeleccionarPartida(this.partidasMap[partidaId],chk)
				}
			}
		}
	}

	onSeleccionarTodasRequisiciones(chkRequisiciones: MatCheckbox){
		if(chkRequisiciones.checked){
			for(let chk of this.requisicionesChk){
				if(!chk.checked){
					chk.toggle();
					let requisicionId = chk.id.substr(1);
					this.onSeleccionarRequisicion(this.requisicionesMap[requisicionId],chk)
				}
			}
		}else{
			for(let chk of this.requisicionesChk){
				if(chk.checked){
					chk.checked = false;
					let requisicionId = chk.id.substr(1);
					this.onSeleccionarRequisicion(this.requisicionesMap[requisicionId],chk)
				}
			}
		}
	}

	onRechazar(partida: RequisicionPartidaConvertirListadoProjection){
		this.abrirModalRechazar(partida);
	}

	abrirModalRechazar(partida: RequisicionPartidaConvertirListadoProjection): void {

		let dialogData: RechazarPartidaDialogData = {
			partidaRechazar: partida,
			onAceptar: this.onAceptarModalRechazar.bind(this)
		};

		const dialogRef = this.dialog.open(RechazarPartidaDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarModalRechazar(partida: RequisicionPartidaConvertirListadoProjection, comentario: string){
		this.partidaSeleccionadaRechazar = partida;
		this._convertirRequisicionService.rechazar(partida.id, comentario);
	}

	onModalComentariosRequisicion(requisicion){

		let dialogData: RequisicionComentariosDialogData = {
			comentarios: requisicion.comentarios || 'Requisicion sin comentarios'
		};

		const dialogRef = this.dialog.open(RequisicionComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});

	}

	onModalComentariosPartida(partida){

		let dialogData: RequisicionComentariosDialogData = {
			comentarios: partida.comentarios || 'Partida sin comentarios'
		};

		const dialogRef = this.dialog.open(RequisicionComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});

	}

	onClickMatCheckbox(chk: MatCheckbox){
		chk._elementRef?.nativeElement?.getElementsByClassName('mat-checkbox-inner-container')[0]?.click();
	}

	onModalEditarPartida(partida: RequisicionPartidaConvertirListadoProjection): void {

		this.partidaEditar = partida;
		let partidaEditar: RequisicionPartidaConvertirListadoProjection = {...partida};

		partidaEditar.unidadMedida = this.umControls[partidaEditar.id].value;
		partidaEditar.cantidadRequerida = this.cantidadControls[partidaEditar.id].value;
		partidaEditar.precio = this.precioUnitarioControls[partidaEditar.id].value;
		partidaEditar.proveedor = this.proveedorControls[partidaEditar.id].value;
		partidaEditar.cuentaCompras = this.cuentaComprasControls[partidaEditar.id].value;

		let unidadesMedida: UnidadMedidaComboProjection[] = [partidaEditar.articulo.unidadMedidaInventario];
		if(!!partidaEditar.articulo.unidadMedidaConversionCompras?.id && partidaEditar.articulo.unidadMedidaConversionCompras.id != partidaEditar.articulo.unidadMedidaInventario.id){
			unidadesMedida.push(partidaEditar.articulo.unidadMedidaConversionCompras);
		}

		let dialogData: EditarPartidaConvertirDialogData = {
			partida: partidaEditar,
			unidadesMedida: unidadesMedida,
			proveedores: this.proveedores,
			onAceptar: this.onAceptarModalEditarPartida.bind(this)
		};

		const dialogRef = this.dialog.open(EditarPartidaConvertirDialogComponent, {
			width: '800px',
			data: dialogData,
			panelClass: 'modal-titulo-bg'
		});
	}

	onAceptarModalEditarPartida(partida: RequisicionPartidaConvertirListadoProjection){

		this.umControls[partida.id].setValue(partida.unidadMedida);
		this.cantidadControls[partida.id].setValue(partida.cantidadRequerida);
		this.precioUnitarioControls[partida.id].setValue(partida.precio);
		this.proveedorControls[partida.id].setValue(partida.proveedor);
		this.cuentaComprasControls[partida.id].setValue(partida.cuentaCompras);
		this.partidaEditar.iva = partida.iva;
		this.partidaEditar.ivaExento = partida.ivaExento;
		this.partidaEditar.ieps = partida.ieps;
		this.partidaEditar.iepsCuotaFija = partida.iepsCuotaFija;
		this.partidaEditar.descuento = partida.descuento;
		this.partidaEditar.comentariosCompras = partida.comentariosCompras;
		
	}

	onBuscarPartidas(event: PixvsBuscadorAmazonEvent){
		this.opcionBuscadorAmazonSeleccionadaId = event.id;
		this.dataSourcePartidas.filter = event.textoBuscar;
	}

	onMostrarImagen(imagenDescargar: ArchivoProjection){
		this._convertirRequisicionService.verArchivo(imagenDescargar);
	}

}