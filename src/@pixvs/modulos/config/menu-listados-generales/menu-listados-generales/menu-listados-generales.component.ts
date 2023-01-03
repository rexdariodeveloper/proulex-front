import { Component, OnInit, ViewEncapsulation } from '@angular/core';
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
import { Subject } from 'rxjs';
import { MenuListadosGeneralesService } from './menu-listados-generales.service';
import { MenuListadoGeneral } from '@models/menu-listado-general';
import { Validators } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { CatalogoService } from './catalogo.service';
import { MatDialog } from '@angular/material/dialog';
import { RegistroCatalogoDialogComponent, RegistroCatalogoDialogData } from './dialogs/registro-catalogo/registro-catalogo.dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { environment } from '@environments/environment';
import { CropperConfig } from '@pixvs/componentes/dinamicos/cropper/cropper.interface';

@Component({
	selector: 'menu-listados-generales-listado',
	templateUrl: './menu-listados-generales.component.html',
	styleUrls: ['./menu-listados-generales.component.scss']
})
export class MenuListadosGeneralesListadoComponent {

	menuCatalogos: MenuListadoGeneral[] = [];
	camposListado: MenuListadoGeneralDetalleEditarProjection[] = [];

	catalogoSeleccionado: MenuListadoGeneral = null;

	localeEN = english;
	localeES = spanish;
	columnasTablaCatalogo: any[] = [];
	columnasFechasTablaCatalogo: string[] = [];
	displayedColumnsTablaCatalogo: string[] = [];
	apiUrl: string = environment.apiUrl;

	// Private
	private _unsubscribeAll: Subject < any > ;

	private registroEditar: any = null;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _menuListadosGeneralesService: MenuListadosGeneralesService,
		public _catalogoService: CatalogoService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog
	) {
		this.serviceSubscriptions();
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
	}

	serviceSubscriptions() {
		this._menuListadosGeneralesService.onDatosChanged.subscribe(datos => {
			this.menuCatalogos = datos.menu.navigation;
			let campos: MenuListadoGeneralDetalleEditarProjection[] = datos.campos.map((campo): MenuListadoGeneralDetalleEditarProjection => {
				return {
					id: campo.id,
					jsonConfig: FieldConfigUtils.jsonConfigParse(campo.jsonConfig),
					jsonListado: JSON.parse(campo.jsonListado),
					campoModelo: campo.campoModelo
				};
			});
			if (this._menuListadosGeneralesService.id) {
				this.setDatosTablaCatalogos(campos);
				this.catalogoSeleccionado = this.buscarMenuSeleccionado(this.menuCatalogos, this._menuListadosGeneralesService.id);
				this._catalogoService.url = this.catalogoSeleccionado.urlAPI;
				if(this.catalogoSeleccionado.cmmControlCatalogo){
					this._catalogoService.id = 'control/' + this.catalogoSeleccionado.cmmControlCatalogo;
				}else{
					this._catalogoService.id = null;
				}
				this._catalogoService.getDatos();
			}
			this.camposListado = campos;
		});
		this._catalogoService.onGuardarChanged.subscribe(exitoso => {
			if(exitoso){
				this._catalogoService.getDatos();
			}
		});
		this._catalogoService.onBorrarChanged.subscribe(exitoso => {
			if(exitoso){
				this._catalogoService.getDatos();
			}
		});
	}

	setDatosTablaCatalogos(campos: MenuListadoGeneralDetalleEditarProjection[]){
		this.columnasTablaCatalogo = campos.map(campo => {
			return campo.jsonListado;
		}).filter( item => !!item);
		this.columnasFechasTablaCatalogo = this.columnasTablaCatalogo.filter(columna => {
			return columna.type == 'fecha';
		}).map(columna => {
			return columna.name;
		});
		this.displayedColumnsTablaCatalogo = this.columnasTablaCatalogo.map(columna => {
			return columna.name;
		});
	}

	buscarMenuSeleccionado(menuListado: MenuListadoGeneral[], id: number): MenuListadoGeneral {
		for (let menu of menuListado) {
			if (menu.id == id) {
				return menu;
			}
			if (menu.children.length) {
				let menuEncontrado = this.buscarMenuSeleccionado(menu.children, id);
				if(!!menuEncontrado){
					return menuEncontrado;
				}
			}
		}
		return null;
	}

	nuevoRegistro() {
		this.registroEditar = null;
		this.abrirModalRegistroCatalogo(null);
	}

	onEditarRegistro(registroId: number){
		this.registroEditar = this._catalogoService.datosMap[registroId];
		this.abrirModalRegistroCatalogo(this.registroEditar);
	}

	abrirModalRegistroCatalogo(registro: any): void {
		let options: CropperConfig = {};
		this.camposListado.forEach(item => {
			if(item.jsonConfig.type === 'imageCropper')
				options.id = registro?.archivoId ? registro?.archivoId : null;
				options.aspect = '3/2';
				options.fileRoute = this.apiUrl + '/v1/archivo/';
				options.min = [300,200];
				options.resize = [300,200];

				item.jsonConfig['croppOptions'] = options;
		});

		let dialogData: RegistroCatalogoDialogData = {
			esNuevo: !registro,
			registro,
			camposListado: this.camposListado,
			listados: this._catalogoService.listados || [],
			onAceptar: this.onAceptarRegistroCatalogoDialog.bind(this),
			onBorrar: this.onBorrarRegistroCatalogoDialog.bind(this)
		};

		const dialogRef = this.dialog.open(RegistroCatalogoDialogComponent, {
			width: '300px',
			data: dialogData
		});
	}

	onAceptarRegistroCatalogoDialog(registro: any){
		let registroEditar = {...this.registroEditar};
		Object.assign(registroEditar,registro);
		if(this.catalogoSeleccionado?.cmmControlCatalogo){
			registroEditar.control = this.catalogoSeleccionado.cmmControlCatalogo;
		}
		this._catalogoService.guardar(registroEditar);
	}

	onBorrarRegistroCatalogoDialog(registro: any){
		this._catalogoService.eliminar(registro.id);
	}

}