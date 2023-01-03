import { Component, OnInit, ViewEncapsulation, ViewChild, HostListener } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable, Subject } from 'rxjs';
import { ArticuloService } from './articulo.service';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { Articulo, ArticuloComboProjection, ArticuloEditarProjection } from '@app/main/modelos/articulo';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ValidatorService } from '@services/validators.service';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ArticuloCategoriaComboProjection } from '@app/main/modelos/articulo-categoria';
import { ArticuloSubcategoriaComboProjection } from '@app/main/modelos/articulo-subcategoria';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection, ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { ArticuloTipo, ArticuloTipoComboProjection } from '@app/main/modelos/articulo-tipo';
import { ArticuloSubtipoComboProjection } from '@app/main/modelos/articulo-subtipo';
import { UnidadMedida, UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { MatTabGroup } from '@angular/material/tabs';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { MatTableDataSource } from '@angular/material/table';
import { ArticuloComponenteEditarProjection } from '@app/main/modelos/articulo-componente';
import { fuseAnimations } from '@fuse/animations';
import { ArticuloComponenteDialogComponent, ArticuloComponenteDialogData } from './dialogs/componente/componente.dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';

const MAX_28: number = 9999999999999999999999999999.99;

@Component({
	selector: 'articulo',
	templateUrl: './articulo.component.html',
	styleUrls: ['./articulo.component.scss'],
	animations: fuseAnimations
})
export class ArticuloComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return (this.formDG.disabled || this.formDG.pristine) && (this.formP.disabled || this.formP.pristine) && (this.formC.disabled || this.formC.pristine) && (this.formPV.disabled || this.formPV.pristine) && (this.formCom.disabled || this.formCom.pristine);
	}

	ArticulosSubtipos = ArticulosSubtipos;

	@ViewChild('tabs') tabs: MatTabGroup;

	localeEN = english;
	localeES = spanish;

	titulo: string;
	pageType: string = 'nuevo';
	currentId: number;
	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

	formDG: FormGroup;
	formP: FormGroup;
	formPV: FormGroup;
	formC: FormGroup;
	formCom: FormGroup;

	articulo: ArticuloEditarProjection;

	imageChangedEvent: any = '';
	croppedImage: any = '';

	familiaControl: FormControl = new FormControl();
	familias: ArticuloFamiliaComboProjection[];
	
	@ViewChild('categoriaSelect') categoriaSelect: PixvsMatSelectComponent;
	categoriaControl: FormControl = new FormControl();
	categorias: ArticuloCategoriaComboProjection[];
	
	@ViewChild('subcategoriaSelect') subcategoriaSelect: PixvsMatSelectComponent;
	subcategoriaControl: FormControl = new FormControl();
	subcategorias: ArticuloSubcategoriaComboProjection[];
	
	clasificacion1Control: FormControl = new FormControl();
	clasificaciones1: ControlMaestroMultipleComboProjection[];

	clasificacion2Control: FormControl = new FormControl();
	clasificaciones2: ControlMaestroMultipleComboProjection[];

	clasificacion3Control: FormControl = new FormControl();
	clasificaciones3: ControlMaestroMultipleComboProjection[];

	clasificacion4Control: FormControl = new FormControl();
	clasificaciones4: ControlMaestroMultipleComboProjection[];

	clasificacion5Control: FormControl = new FormControl();
	clasificaciones5: ControlMaestroMultipleComboProjection[];

	clasificacion6Control: FormControl = new FormControl();
	clasificaciones6: ControlMaestroMultipleComboProjection[];

	programas: ProgramaComboProjection[];

	articuloTipoControl: FormControl = new FormControl();
	articulosTipos: ArticuloTipoComboProjection[];
	
	@ViewChild('articuloSubtipoSelect') articuloSubtipoSelect: PixvsMatSelectComponent;
	articuloSubtipoControl: FormControl = new FormControl();
	articulosSubtipos: ArticuloSubtipoComboProjection[];

	unidadesMedida: UnidadMedidaComboProjection[];
	umInventarioControl: FormControl = new FormControl();
	umConversionVentasControl: FormControl = new FormControl();
	umConversionComprasControl: FormControl = new FormControl();

	ivaControl: FormControl = new FormControl();
	ivaExentoControl: FormControl = new FormControl();
	
	iepsControl: FormControl = new FormControl();
	iepsCuotaFijaControl: FormControl = new FormControl();
	iepsCuotaFijaCheckControl: FormControl = new FormControl();

	sucursales: SucursalComboProjection[];
	mostrarSucursalesControl: FormControl = new FormControl();
	mostrarSucursalesPVControl: FormControl = new FormControl();

	tiposCosto: ControlMaestroMultipleComboProjection[];
	tipoCostoControl: FormControl = new FormControl();

	objetosImpuestoSAT: ControlMaestroMultipleComboSimpleProjection[];
	objetoImpuestoSATControl: FormControl = new FormControl();

	idiomas: ControlMaestroMultipleComboProjection[];
	//programas: ControlMaestroMultipleComboProjection[];
	editoriales: ControlMaestroMultipleComboProjection[];

	dataSourceComponentes: MatTableDataSource<ArticuloComponenteEditarProjection> = new MatTableDataSource([]);
	displayedColumnsComponentes: string[] = [
		'articulo',
		'um',
		'cantidadEnsamble',
		'acciones'
	];

	componentesListado: ArticuloComboProjection[] = [];
	componentesOmitirModalIds: number[] = [];

	componenteEditar: ArticuloComponenteEditarProjection = null;

	contadorComponentes: number = 0;

	// Private
	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _articuloService: ArticuloService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		public validatorService : ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
		
		this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.articulo = new ArticuloEditarProjection();
            }

            this.config = {
                rutaAtras: "/app/catalogos/articulos",
                rutaBorrar: "/api/v1/articulos/delete/",
                icono: "free_breakfast"
            }

		});
		
		this.serviceSubscriptions();
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	serviceSubscriptions() {
		this._articuloService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {

			this.articulo = datos.articulo || new Articulo();

			if(this.articulo?.id){
				this.titulo = this.articulo.codigoArticulo
			}
			
			this.createForms();

			this.familias = datos.familias;
			this.clasificaciones1 = datos.clasificaciones1;
			this.clasificaciones2 = datos.clasificaciones2;
			this.clasificaciones3 = datos.clasificaciones3;
			this.clasificaciones4 = datos.clasificaciones4;
			this.clasificaciones5 = datos.clasificaciones5;
			this.clasificaciones6 = datos.clasificaciones6;
			this.articulosTipos = datos.articulosTipos;
			this.articulosSubtipos = datos.articulosSubtipos;
			this.unidadesMedida = datos.unidadesMedida;
			this.sucursales = datos.sucursales;
			this.tiposCosto = datos.tiposCosto;
			this.categorias = datos.categorias;
			this.subcategorias = datos.subcategorias;
			this.programas = datos.programas;

			this.idiomas = datos.idiomas;
			this.editoriales = datos.editoriales;
			
			this.componentesListado = datos.componentesListado;

			this.objetosImpuestoSAT = datos.objetosImpuestoSAT;

			if(this.articulo?.componentes?.length){
				this.articulo.componentes.forEach(componente => {
					componente['idExtra'] = ++this.contadorComponentes;
					this.componentesOmitirModalIds.push(componente.componente.id);
				});
			}
			this.dataSourceComponentes.data = this.articulo?.componentes || [];
		});
		this._articuloService.onComboCategoriasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoCategorias => {
			if(listadoCategorias){
				this._articuloService.onComboCategoriasChanged.next(null);
				this.categorias = listadoCategorias;
				this.categoriaSelect.setDatos(this.categorias);
			}
		});
		this._articuloService.onComboSubcategoriasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoSubcategorias => {
			if(listadoSubcategorias){
				this._articuloService.onComboSubcategoriasChanged.next(null);
				this.subcategorias = listadoSubcategorias;
				this.subcategoriaSelect.setDatos(this.subcategorias);
			}
		});
		this._articuloService.onComboSubtiposChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoSubtipos => {
			if(listadoSubtipos){
				this._articuloService.onComboSubtiposChanged.next(null);
				this.articulosSubtipos = listadoSubtipos;
				this.articuloSubtipoSelect.setDatos(this.articulosSubtipos);
			}
		});
	}

	createForms(){
		this.formDG = this.createFormDG();
		this.formP = this.createFormP();
		this.formPV = this.createFormPV();
		this.formC = this.createFormC();
		this.formCom = this.createFormCom();

		if (this.pageType == 'ver') {
			this.formDG.disable({ emitEvent: false });
			this.formP.disable({ emitEvent: false });
			this.formPV.disable({ emitEvent: false });
			this.formC.disable({ emitEvent: false });
			this.formCom.disable({ emitEvent: false });
		} else {
			this.formDG.enable({ emitEvent: false });
			this.formP.enable({ emitEvent: false });
			this.formPV.enable({ emitEvent: false });
			this.formC.enable({ emitEvent: false });
			this.formCom.enable({ emitEvent: false });
		}
	}

	createFormDG(): FormGroup{

		this.familiaControl = new FormControl(this.articulo.familia, [Validators.required]);
		this.categoriaControl = new FormControl(this.articulo.categoria, [Validators.required]);
		this.subcategoriaControl = new FormControl(this.articulo.subcategoria, []);
		this.clasificacion1Control = new FormControl(this.articulo.clasificacion1, []);
		this.clasificacion2Control = new FormControl(this.articulo.clasificacion2, []);
		this.clasificacion3Control = new FormControl(this.articulo.clasificacion3, []);
		this.clasificacion4Control = new FormControl(this.articulo.clasificacion4, []);
		this.clasificacion5Control = new FormControl(this.articulo.clasificacion5, []);
		this.clasificacion6Control = new FormControl(this.articulo.clasificacion6, []);
		this.articuloTipoControl = new FormControl(this.articulo.tipoArticulo, [Validators.required]);
		this.articuloSubtipoControl = new FormControl(this.articulo.articuloSubtipo, []);
		this.umInventarioControl = new FormControl(this.articulo.unidadMedidaInventario, [Validators.required]);
		this.ivaControl = new FormControl(this.articulo.iva, [Validators.max(100),Validators.min(0)]);
		this.ivaExentoControl = new FormControl(this.articulo.ivaExento || false, []);
		this.iepsCuotaFijaCheckControl = new FormControl(!!this.articulo.iepsCuotaFija, []);
		this.objetoImpuestoSATControl = new FormControl(this.articulo.objetoImpuesto, [Validators.required]);

		if(!!this.articulo.iepsCuotaFija){
			this.iepsControl = new FormControl(this.articulo.ieps, []);
			this.iepsCuotaFijaControl = new FormControl(this.articulo.iepsCuotaFija, [Validators.max(MAX_28), Validators.min(0)]);
		}else{
			this.iepsControl = new FormControl(this.articulo.ieps, [Validators.min(0),Validators.max(100)]);
			this.iepsCuotaFijaControl = new FormControl(this.articulo.iepsCuotaFija, []);
		}

		this.familiaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.familia = this.familiaControl.value || null;
			this.categoriaSelect.setDatos([]);
			this.categoriaControl.setValue(null);
			this.subcategoriaSelect.setDatos([]);
			this.subcategoriaControl.setValue(null);
			if(this.familiaControl.value){
				this.getComboCategorias(this.articulo.familia.id);
				
			}
		});
		this.categoriaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.categoria = this.categoriaControl.value || null;
			this.subcategoriaSelect.setDatos([]);
			this.subcategoriaControl.setValue(null);
			if(this.categoriaControl.value){
				this.getComboSubcategorias(this.articulo.categoria.id);
			}
		});
		this.subcategoriaControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.subcategoria = this.subcategoriaControl.value || null;
		});
		this.clasificacion1Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion1 = this.clasificacion1Control.value || null;
		});
		this.clasificacion2Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion2 = this.clasificacion2Control.value || null;
		});
		this.clasificacion3Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion3 = this.clasificacion3Control.value || null;
		});
		this.clasificacion4Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion4 = this.clasificacion4Control.value || null;
		});
		this.clasificacion5Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion5 = this.clasificacion5Control.value || null;
		});
		this.clasificacion6Control.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.clasificacion6 = this.clasificacion6Control.value || null;
		});
		this.articuloTipoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.tipoArticulo = this.articuloTipoControl.value || null;
			this.articuloSubtipoSelect.setDatos([]);
			this.articuloSubtipoControl.setValue(null);
			if(this.articuloTipoControl.value){
				this.getComboSubtipos(this.articulo.tipoArticulo.id);
			}
		});
		this.articuloSubtipoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.articuloSubtipo = this.articuloSubtipoControl.value || null;
			
			if(!!this.formDG){
				if(this.articulo.articuloSubtipo?.id == ArticulosSubtipos.LIBRO || this.articulo.articuloSubtipo?.id == ArticulosSubtipos.PAQUETE_DE_LIBROS){
					this.formDG.controls['idioma'].setValidators([Validators.required]);
					this.formDG.controls['programa'].setValidators([Validators.required]);
					this.formDG.controls['editorial'].setValidators([Validators.required]);
				}else{
					this.formDG.controls['idioma'].setValidators([]);
					this.formDG.controls['programa'].setValidators([]);
					this.formDG.controls['editorial'].setValidators([]);
				}
				this.formDG.controls['idioma'].updateValueAndValidity();
				this.formDG.controls['programa'].updateValueAndValidity();
				this.formDG.controls['editorial'].updateValueAndValidity();
			}
			if(this.articuloSubtipoControl.value?.id == ArticulosSubtipos.PAQUETE_DE_LIBROS){
				if(!!this.formP){
					this.formP.disable();
				}
				if(!!this.formC){
					this.formC.disable();
				}
				if(!!this.formCom){
					this.formCom.enable();
				}
			}else{
				if(!!this.formCom){
					this.formCom.disable();
				}
				if(!!this.formP){
					this.formP.enable();
				}
				if(!!this.formC){
					this.formC.enable();
				}
			}
		});
		this.umInventarioControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.unidadMedidaInventario = this.umInventarioControl.value || null;
		});
		this.ivaExentoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.ivaExentoControl.value){
				this.ivaControl.setValue('0');
			}
		});
		this.iepsCuotaFijaCheckControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			if(this.iepsCuotaFijaCheckControl.value){
				this.iepsControl = new FormControl(this.articulo.ieps, []);
				this.iepsCuotaFijaControl = new FormControl(this.articulo.iepsCuotaFija, [Validators.max(MAX_28), Validators.min(0)]);
			}else{
				this.iepsControl = new FormControl(this.articulo.ieps, [Validators.max(100), Validators.min(0)]);
				this.iepsCuotaFijaControl = new FormControl(this.articulo.iepsCuotaFija, []);
			}
		});

		this.objetoImpuestoSATControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.objetoImpuesto = this.objetoImpuestoSATControl.value || null;
		});

		let validatorsSubtipoLibro: any[] = [];
		if(this.articulo.articuloSubtipo?.id == ArticulosSubtipos.LIBRO || this.articulo.articuloSubtipo?.id == ArticulosSubtipos.PAQUETE_DE_LIBROS){
			validatorsSubtipoLibro = [Validators.required]
		}

		let form = this._formBuilder.group({
			id: [this.articulo.id],
			img64: new FormControl(),
			codigoArticulo: new FormControl(this.articulo.codigoArticulo, []),
			codigoAlterno: new FormControl(this.articulo.codigoAlterno, [Validators.maxLength(30)]),
			nombreArticulo: new FormControl(this.articulo.nombreArticulo, [Validators.required, Validators.maxLength(100)]),
			nombreAlterno: new FormControl(this.articulo.nombreAlterno, [Validators.maxLength(100)]),
			descripcion: new FormControl(this.articulo.descripcion, [Validators.maxLength(1000)]),
			descripcionCorta: new FormControl(this.articulo.descripcionCorta, [Validators.required,Validators.maxLength(30)]),
			codigoBarras: new FormControl(this.articulo.codigoBarras, [Validators.maxLength(50)]),
			familia: this.familiaControl,
			categoria: this.categoriaControl,
			subcategoria: this.subcategoriaControl,
			clasificacion1: this.clasificacion1Control,
			clasificacion2: this.clasificacion2Control,
			clasificacion3: this.clasificacion3Control,
			clasificacion4: this.clasificacion4Control,
			clasificacion5: this.clasificacion5Control,
			clasificacion6: this.clasificacion6Control,
			tipoArticulo: this.articuloTipoControl,
			articuloSubtipo: this.articuloSubtipoControl,
			unidadMedidaInventario: this.umInventarioControl,
			objetoImpuesto: this.objetoImpuestoSATControl,
			claveProductoSAT: new FormControl(this.articulo.claveProductoSAT, [Validators.maxLength(8)]),
			iva: new FormControl(this.articulo.iva, [Validators.required]),
            ivaExento: new FormControl(this.articulo.ivaExento),
            // ieps: new FormControl(this.articulo.ieps, [Validators.required]),
            ieps: this.iepsControl,
            // iepsCuotaFija: new FormControl(this.articulo.iepsCuotaFija),
            iepsCuotaFija: this.iepsCuotaFijaControl,
            activo: new FormControl((this.articulo.activo === undefined ? true : this.articulo.activo), []),
            inventariable: new FormControl((this.articulo.inventariable === undefined ? true : this.articulo.inventariable), []),
            idioma: new FormControl((this.articulo.idioma), validatorsSubtipoLibro),
            programa: new FormControl((this.articulo.programa), validatorsSubtipoLibro),
            editorial: new FormControl((this.articulo.editorial), validatorsSubtipoLibro),
            marcoCertificacion: new FormControl((this.articulo.marcoCertificacion), [Validators.maxLength(50)]),
			articuloParaVenta: new FormControl(this.articulo.articuloParaVenta ? this.articulo.articuloParaVenta : false, [Validators.required]),
			pedirCantidadPV: new FormControl(this.articulo.pedirCantidadPV || false, [])
		});

		return form;
	}

	createFormP(): FormGroup{

		this.umConversionVentasControl = new FormControl(this.articulo.unidadMedidaConversionVentas, []);
		this.umConversionComprasControl = new FormControl(this.articulo.unidadMedidaConversionCompras, []);
		this.mostrarSucursalesControl = new FormControl(this.articulo.mostrarSucursales, []);
		
		this.umConversionVentasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.unidadMedidaConversionVentas = this.umConversionVentasControl.value || null;
		});
		this.umConversionComprasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.unidadMedidaConversionCompras = this.umConversionComprasControl.value || null;
		});
		this.mostrarSucursalesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.mostrarSucursales = this.mostrarSucursalesControl.value;
		});

		let form = this._formBuilder.group({
			id: [this.articulo.id],
			unidadMedidaConversionVentas: this.umConversionVentasControl,
			factorConversionVentas: new FormControl(this.articulo.factorConversionVentas, [Validators.max(MAX_28),Validators.min(0)]),
			unidadMedidaConversionCompras: this.umConversionComprasControl,
			factorConversionCompras: new FormControl(this.articulo.factorConversionCompras, [Validators.max(MAX_28),Validators.min(0)]),
			multiploPedido: new FormControl(this.articulo.multiploPedido, [Validators.max(MAX_28),Validators.min(0)]),
			permitirCambioAlmacen: new FormControl(this.articulo.permitirCambioAlmacen || false, []),
			maximoAlmacen: new FormControl(this.articulo.maximoAlmacen, [Validators.max(MAX_28),Validators.min(0)]),
			minimoAlmacen: new FormControl(this.articulo.minimoAlmacen, [Validators.max(MAX_28),Validators.min(0)]),
			planeacionTemporadas: new FormControl(this.articulo.planeacionTemporadas || false, []),
			mostrarSucursales: this.mostrarSucursalesControl
		});

		form.controls['planeacionTemporadas'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {

			if(data){
				form.controls['minimoAlmacen'].disable();
				form.controls['maximoAlmacen'].disable();
			} else {
				form.controls['minimoAlmacen'].enable();
				form.controls['maximoAlmacen'].enable();
			}
		});

		form.controls['planeacionTemporadas'].setValue(this.articulo?.planeacionTemporadas || false);

		return form;
	}

	createFormPV(): FormGroup{

		this.mostrarSucursalesPVControl = new FormControl(this.articulo.mostrarSucursalesPV, []);

		this.mostrarSucursalesPVControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.mostrarSucursalesPV = this.mostrarSucursalesPVControl.value;
		});

		let form = this._formBuilder.group({
			id: [this.articulo.id],
			mostrarSucursalesPV: this.mostrarSucursalesPVControl
		});

		return form;
	}

	createFormC(): FormGroup{

		this.tipoCostoControl = new FormControl(this.articulo.tipoCosto, [Validators.required]);

		this.tipoCostoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.articulo.tipoCosto = this.tipoCostoControl.value;
		});

		let form = this._formBuilder.group({
			id: [this.articulo.id],
			tipoCosto: this.tipoCostoControl,
			costoUltimo: new FormControl(this.articulo.costoUltimo, [Validators.required,Validators.max(MAX_28),Validators.min(0)]),
			costoPromedio: new FormControl(this.articulo.costoPromedio, [Validators.required,Validators.max(MAX_28),Validators.min(0)]),
			costoEstandar: new FormControl(this.articulo.costoEstandar, [Validators.required,Validators.max(MAX_28),Validators.min(0)])
		});

		return form;
	}

	createFormCom(): FormGroup{

		let form = this._formBuilder.group({
			id: [this.articulo.id],
			mostrarSucursales: this.mostrarSucursalesControl
		});

		return form;
	}

	guardar() {
		if(this.pageType == 'nuevo'){
			const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				width: '400px',
				data: {
					mensaje: this.translate.instant('CONFIRMACION_GUARDAR')
				}
			});

			dialogRef.afterClosed().subscribe(confirm => {
				if (confirm) {
					this.guardarCambios();
				}
			});
		}else{
			this.guardarCambios();
		}
        
    }

	guardarCambios(){
		
		if (this.croppedImage) {
            this.formDG.get('img64').setValue(this.croppedImage);
		}
		
		this._articuloService.cargando = true;

		let valid: boolean = false;

		if(this.articuloSubtipoControl.value?.id == ArticulosSubtipos.PAQUETE_DE_LIBROS){
			if(!this.articulo.componentes){
				this.tabs.selectedIndex = 1;
				this._matSnackBar.open('Selecciona por lo menos un componente', 'OK', {
					duration: 5000,
				});
				this._articuloService.cargando = false;
				return;
			}
			if(this.formDG.enabled && !this.formDG.valid){
				this.formDG.markAllAsTouched();
				this.tabs.selectedIndex = 0;
			} else if(this.formCom.enabled && !this.formCom.valid){
				this.formCom.markAllAsTouched();
				this.tabs.selectedIndex = 1;
			} else{
				valid = true;
			}
		}else{
			if(this.formDG.enabled && !this.formDG.valid){
				this.formDG.markAllAsTouched();
				this.tabs.selectedIndex = 0;
			} else if(this.formP.enabled && !this.formP.valid){
				this.formP.markAllAsTouched();
				this.tabs.selectedIndex = 1;
			} else if(this.formPV.enabled && !this.formPV.valid){
				this.formPV.markAllAsTouched();
				this.tabs.selectedIndex = 2;
			} else if(this.formC.enabled && !this.formC.valid){
				this.formC.markAllAsTouched();
				this.tabs.selectedIndex = 3;
			} else{
				valid = true;
			}
		}
		
		if(valid){
			this.formDG.disable({ emitEvent: false });
			this.formP.disable({ emitEvent: false });
			this.formPV.disable({ emitEvent: false });
			this.formC.disable({ emitEvent: false });
			this.formCom.disable({ emitEvent: false });

			let articulo: ArticuloEditarProjection = {
				imagenId: this.articulo.imagenId,
				fechaModificacion: this.articulo.fechaModificacion
			};

			Object.assign(articulo,this.formDG.value);
			Object.assign(articulo,this.formP.value);
			Object.assign(articulo,this.formPV.value);
			Object.assign(articulo,this.formC.value);
			Object.assign(articulo,this.formCom.value);

			if(this.iepsCuotaFijaCheckControl?.value){
				articulo.ieps = null;
				articulo.iepsCuotaFija = this.iepsCuotaFijaControl.value;
			}else{
				articulo.ieps = this.iepsControl.value;
				articulo.iepsCuotaFija = null;
			}
			articulo.componentes = this.articulo?.componentes || [];
			
			this._articuloService.guardar(JSON.stringify(articulo), '/api/v1/articulos/save').then(
				(result: JsonResponse) => {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {                      
						this._articuloService.cargando = false;
						this.formDG.enable({ emitEvent: false });
						this.formP.enable({ emitEvent: false });
						this.formP.enable({ emitEvent: false });
						this.formC.enable({ emitEvent: false });
						this.formCom.enable({ emitEvent: false });
					}
				}
			);
		}else{
			this._articuloService.cargando = false;
            this.formDG.enable({ emitEvent: false });
            this.formP.enable({ emitEvent: false });
            this.formPV.enable({ emitEvent: false });
            this.formC.enable({ emitEvent: false });
            this.formCom.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
			});
			
			let value = this.formP.controls['planeacionTemporadas'].value;
			this.formP.controls['planeacionTemporadas'].setValue(value);
		}
	}

	fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
	}
	
	isRequired(form: FormGroup, campo: string) {

        let form_field = form.get(campo);
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);

	}
	
	getComboCategorias(familiaId: number){
		this._articuloService.getComboCategorias(familiaId);
	}

	getComboSubcategorias(categoriaId: number){
		this._articuloService.getComboSubcategorias(categoriaId);
	}

	getComboSubtipos(articuloTipoId: number){
		this._articuloService.getComboSubtipos(articuloTipoId);
	}

	agregarComponente() {
        this.componenteEditar = null;
        this.mostrarModalComponente(null);
    }

	editarComponente(componente: ArticuloComponenteEditarProjection) {
		this.componenteEditar = componente;
		this.mostrarModalComponente(this.componenteEditar);
	}

	mostrarModalComponente(componente: ArticuloComponenteEditarProjection): void {

		let dialogData: ArticuloComponenteDialogData = {
			esNuevo: !componente,
			componente,
			articulos: this.componentesListado,
			articulosOmitirIds: this.componentesOmitirModalIds,
			onAceptar: this.onAceptarComponenteDialog.bind(this)
		};

		const dialogRef = this.dialog.open(ArticuloComponenteDialogComponent, {
			width: '500px',
			data: dialogData
		});
    
	}

	onAceptarComponenteDialog(componenteModificado: ArticuloComponenteEditarProjection) {
		this.formCom.markAsDirty();
		this.componentesOmitirModalIds.push(componenteModificado.componente.id);
		let componenteEditar: any = {
			...this.componenteEditar
		};
		Object.assign(componenteEditar, componenteModificado);
		if(componenteEditar['idExtra']){
			this.articulo.componentes = this.articulo.componentes.map(componente => {
				if(componente['idExtra'] == componenteEditar['idExtra']){
					return componenteEditar;
				}
				return componente;
			});
		}else{
			componenteEditar['idExtra'] = ++this.contadorComponentes;
			this.articulo.componentes = [...(this.articulo.componentes || [])].concat(componenteEditar);
		}
		this.dataSourceComponentes.data = this.articulo.componentes;
		this.componenteEditar = null;
	}

	borrarComponente(componente: ArticuloComponenteEditarProjection){
		this.formCom.markAsDirty();
		this.componentesOmitirModalIds = this.componentesOmitirModalIds.filter(componenteId => {
			return componenteId != componente.componente.id;
		});
		this.articulo.componentes = this.articulo.componentes.filter(c => {
			return c['idExtra'] != componente['idExtra'];
		});
		this.dataSourceComponentes.data = this.articulo.componentes;
	}

	deshabilitarCampos() {
		this.formDG.controls.inventariable.disable();
	}
}