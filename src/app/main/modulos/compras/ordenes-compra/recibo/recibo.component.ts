import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { OrdenCompra, OrdenCompraEditarProjection, OrdenCompraRecibirProjection } from '@app/main/modelos/orden-compra';
import { ProveedorComboProjection } from '@app/main/modelos/proveedor';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { DepartamentoComboProjection } from '@models/departamento';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { OrdenCompraDetalleEditarProjection, OrdenCompraDetalleRecibirProjection } from '@app/main/modelos/orden-compra-detalle';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ReciboOrdenCompraService } from './recibo.service';
import { LocalidadComboProjection } from '@app/main/modelos/localidad';
import { MatTableDataSource } from '@angular/material/table';
import { ArchivoProjection } from '@models/archivo';
import { ArchivoDialogComponent, ArchivoDialogData } from './dialogs/archivo/archivo.dialog';
import { UsuarioComboProjection } from '@models/usuario';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ComentariosDialogComponent, ComentariosDialogData } from './dialogs/comentarios/comentarios.dialog';

class OrdenCompraDetalleRecibirDatasource extends OrdenCompraDetalleRecibirProjection {
	cantidadRecibida: number;
	cantidadRecibidaControl: FormControl;
}

@Component({
	selector: 'recibo-orden-compra',
	templateUrl: './recibo.component.html',
	styleUrls: ['./recibo.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReciboOrdenCompraComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || (this.form.pristine && this.formCantidades.pristine);
	}

	pageType: string = 'editar';

	localeEN = english;
	localeES = spanish;

	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;

	ordenCompra: OrdenCompraRecibirProjection;
	fechaActual: Date = new Date();
	usuarioActual: UsuarioComboProjection;
	form: FormGroup;
	formCantidades: FormGroup;
	cantidadesControls: FormArray;

	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	/** Select Controls */

	localidadControl: FormControl = new FormControl();
	localidades: LocalidadComboProjection[];

	dataSourceDetalles: MatTableDataSource<OrdenCompraDetalleRecibirDatasource> = new MatTableDataSource([]);
	displayedColumnsDetalles: string[] = [
		'codigoArticulo',
		'nombre',
		'um',
		'cantidadRequerida',
		'cantidadPendiente',
		'cantidadRecibida',
		'acciones'
	];

	dataSourceArchivos: MatTableDataSource<ArchivoProjection> = new MatTableDataSource([]);
	displayedColumnsArchivos: string[] = [
		'nombre',
		'tipo',
		'creadoPor',
		'fecha'
	];
	tiposArchivos: ControlMaestroMultipleComboProjection[] = [];
	facturaPDFTmp: ArchivoProjection = null;
	facturaXMLTmp: ArchivoProjection = null;
	evidenciaTmp: ArchivoProjection[] = [];

	// Private
	private _unsubscribeAll: Subject < any > ;
	currentId: number;


	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _formBuilder: FormBuilder,
		private _location: Location,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public _reciboOrdenCompraService: ReciboOrdenCompraService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english,spanish);

		// Set the default
		this.ordenCompra = new OrdenCompraRecibirProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			// this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			// if (this.pageType == 'nuevo') {
			// 	this.ordenCompra = new OrdenCompraRecibirProjection();
			// }

			this.config = {
				rutaAtras: "/app/compras/recibo-oc",
				icono: "assignment"
			}

		});

		// Subscribe to update ordenCompra on changes
		this._reciboOrdenCompraService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.ordenCompra) {
					this.ordenCompra = datos.ordenCompra;
					this.titulo = this.ordenCompra.codigo
				} else {
					this.ordenCompra = new OrdenCompraRecibirProjection();
				}

				this.localidades = datos.localidades;
				this.tiposArchivos = datos.tiposArchivos;

				this.cantidadesControls = new FormArray([]);
				this.formCantidades = this._formBuilder.group({
					cantidades: this.cantidadesControls
				});

				this.setDatasourceDetalles();

				this.form = this.createReciboOrdenCompraForm();

			});

	}

	setDatasourceDetalles(){
		this.dataSourceDetalles.data = this.ordenCompra.detalles.map(detalle => {
			let cantidadControl: FormControl = new FormControl(null,[Validators.min(0),Validators.max(detalle.cantidadPendiente)]);
			this.cantidadesControls.push(cantidadControl);
			return {...detalle,cantidadRecibida: 0,cantidadRecibidaControl: cantidadControl};
		});
	}

	createReciboOrdenCompraForm(): FormGroup {

		if(this.localidades.length == 1){
			this.localidadControl = new FormControl(this.localidades[0], [Validators.required]);
		}else{
			this.localidadControl = new FormControl(null, [Validators.required]);
		}

		let form = this._formBuilder.group({
			id: [this.ordenCompra.id],
			localidadRecibir: this.localidadControl,
			fechaModificacion: this.ordenCompra.fechaModificacion
		});

		return form;
	}


	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	isRequired(campo: string) {

		let form_field = this.form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	recargar() {
		this.pageType = this.fichaCrudComponent.recargar();
	}

	guardar() {
		if(this._reciboOrdenCompraService.cargando)
			return;
		if (this.form.valid) {

			this._reciboOrdenCompraService.cargando = true;
			this.form.disable();

			let body = {
				...this.form.value,
				facturaPDFReciboId: this.facturaPDFTmp?.id || null,
				facturaXMLReciboId: this.facturaXMLTmp?.id || null,
				evidenciaReciboIds: this.evidenciaTmp?.map(archivo => archivo.id) || []
			};
			let recibirValid: boolean = false;
			let recibirCantidadValid: boolean = true;
			this.dataSourceDetalles.data.forEach(detalle => {
				let cantidadRecibida = detalle.cantidadRecibidaControl.value || 0;
				if(!recibirValid && cantidadRecibida > 0){
					recibirValid = true;
				}
				if(cantidadRecibida > detalle.cantidadPendiente){
					recibirCantidadValid = false;
				}
			});
			if(!recibirValid){
				this._reciboOrdenCompraService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.RECIBIR_1'), 'OK', {
					duration: 5000,
				});
				return;
			}
			if(!recibirCantidadValid){
				this._reciboOrdenCompraService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.RECIBIR_2'), 'OK', {
					duration: 5000,
				});
				return;
			}
			body.detalles = this.dataSourceDetalles.data.map(detalle => {
				let detalleRecibir = {...detalle};
				detalleRecibir.cantidadRecibida = detalleRecibir.cantidadRecibidaControl.value || 0;
				delete detalleRecibir.cantidadRecibidaControl;
				return detalleRecibir;
			});

			this._reciboOrdenCompraService.guardar(JSON.stringify(body), '/api/v1/recibo-ordenes-compra/save').then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._reciboOrdenCompraService.cargando = false;
						this.form.enable();
					}
				}.bind(this)
			);




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

			this._reciboOrdenCompraService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	nuevoArchivo(){
		let dialogData: ArchivoDialogData = {
			tipos: this.tiposArchivos,
			onAceptar: this.onAceptarArchivoDialog.bind(this)
		};

		const dialogRef = this.dialog.open(ArchivoDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarArchivoDialog(archivos: ArchivoProjection[]) {
		for(let archivo of archivos){
			if(archivo.tipo.id == ControlesMaestrosMultiples.CMM_OCR_TipoArchivo.FACTURA){
				let extension: string = archivo.nombreOriginal.substr(archivo.nombreOriginal.lastIndexOf('.')).toLocaleLowerCase();
				if(extension == '.pdf'){
					this.facturaPDFTmp = archivo;
				}
				if(extension == '.xml'){
					this.facturaXMLTmp = archivo;
				}
			}
			if(archivo.tipo.id == ControlesMaestrosMultiples.CMM_OCR_TipoArchivo.EVIDENCIA){
				this.evidenciaTmp = [...this.evidenciaTmp,archivo];
			}
			this.dataSourceArchivos.data = [...this.dataSourceArchivos.data,archivo];
		}
	}

	onModalComentarios(detalle: OrdenCompraDetalleRecibirDatasource){
		let dialogData: ComentariosDialogData = {
			comentariosRequisicion: detalle?.requisicionPartida?.comentarios || 'Sin comentarios',
			comentariosCompras: detalle?.comentarios || 'Sin comentarios'
		};

		const dialogRef = this.dialog.open(ComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onMostrarImagen(detalle){
		
		let imagen: ArchivoProjection = new ArchivoProjection();
		imagen = detalle?.requisicionPartida?.imagenArticulo;
		this._reciboOrdenCompraService.verArchivo(imagen);
	}

}