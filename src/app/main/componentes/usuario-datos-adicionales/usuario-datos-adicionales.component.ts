import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { UsuarioDatosAdicionalesProjection } from '@app/main/modelos/usuario';
import { fuseAnimations } from '@fuse/animations';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { DepartamentoComboProjection, DepartamentoNodoProjection } from '@models/departamento';
import { PixvsMatTreeNodo } from '@models/pixvs-mat-tree';
import { TranslateService } from '@ngx-translate/core';
import { PixvsMatTreeComponent } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.component';
import { HashidsService } from '@services/hashids.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SucursalComboArbol } from './usuario-datos-adicionales.modelos';
import { UsuarioDatosAdicionalesService } from './usuario-datos-adicionales.service';

@Component({
	selector: 'usuario-datos-adicionales',
	templateUrl: './usuario-datos-adicionales.component.html',
	styleUrls: ['./usuario-datos-adicionales.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class UsuarioDatosAdicionalesComponent {

	@ViewChild('treePermisosSucursalesAlmacenes', { static: true }) treePermisosSucursalesAlmacenes: PixvsMatTreeComponent;
	@ViewChild('treePermisosDepartamentos', { static: true }) treePermisosDepartamentos: PixvsMatTreeComponent;

	@Input() form: FormGroup;
	@Input() permiteEditar: boolean;
	@Input() idEmpleado: number = null;
	@Input() datosAdicionales: any;

	mostrar: boolean = true;

	usuarioDatosAdicionales: UsuarioDatosAdicionalesProjection;

	sucursales: SucursalComboArbol[];
	departamentosTree: PixvsMatTreeNodo<DepartamentoComboProjection, DepartamentoNodoProjection>[];

	mensajeError: string = null;

	// Private
	public _unsubscribeAll: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseNavigationService: FuseNavigationService,
		public _formBuilder: FormBuilder,
		public _location: Location,
		public _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private translate: TranslateService,
		private router: Router,
		private hashid: HashidsService,
		private _historial: MatBottomSheet,
		private _usuarioDatosAdicionalesService: UsuarioDatosAdicionalesService,
		private route: ActivatedRoute
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the default

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this.serviceSubscriptions();
		this.route.params.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
			if (this.datosAdicionales) {
				this.setDatos(this.datosAdicionales);
			} else if (!this.idEmpleado) {
				let id = this.hashid.decode(params?.id) || null;
				this._usuarioDatosAdicionalesService.getDatos(id);
			} else {
				this._usuarioDatosAdicionalesService.getDatos(this.idEmpleado);
			}
		});
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes.permiteEditar) {
			this.permiteEditar = changes.permiteEditar.currentValue;
		}
	}

	serviceSubscriptions() {
		this._usuarioDatosAdicionalesService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
			if (datos) {
				this.usuarioDatosAdicionales = datos.usuarioDatosAdicionales;

				let almacenesUsuarioIds: number[] = [];
				let departamentosUsuarioIds: number[] = [];

				if (this.usuarioDatosAdicionales) {
					almacenesUsuarioIds = this.usuarioDatosAdicionales.almacenes.map(almacen => {
						return almacen.id;
					});

					departamentosUsuarioIds = this.usuarioDatosAdicionales.departamentosPermisos.map(departamento => {
						return departamento.id;
					});
				}

				this.sucursales = datos.sucursales.map((sucursal: SucursalComboProjection): SucursalComboArbol => {
					let almacenes: PixvsMatTreeNodo<AlmacenComboProjection, any>[] = datos.almacenesMap[sucursal.id].map((almacen: AlmacenComboProjection): PixvsMatTreeNodo<AlmacenComboProjection, any> => {
						return {
							info: almacen,
							ocultarSeleccion: false,
							ocultarAcciones: true,
							selected: almacenesUsuarioIds.includes(almacen.id),
							...almacen
						};
					});

					return {
						info: sucursal,
						ocultarSeleccion: false,
						ocultarAcciones: true,
						selected: false,
						almacenes: almacenes,
						...sucursal
					};
				});

				let sucursales: any[] = [...this.sucursales].filter(sucursal => {
					return !!sucursal.almacenes.length;
				});

				this.treePermisosSucursalesAlmacenes.setDatos(sucursales, 'nombre', 'almacenes')

				this.departamentosTree = datos.departamentosTree;
				this.setDepartamentos(this.departamentosTree, departamentosUsuarioIds);
				this.treePermisosDepartamentos.setDatos(this.departamentosTree, 'nombre');
			}
		})
	}

	setDatos(datos) {
		this.datosAdicionales = datos;

		let sucursales = [];
		let departamentos = [];

		if (this.datosAdicionales) {
			if (this.datosAdicionales.almacenes) {
				this.datosAdicionales.almacenes.forEach(element => {
					if (!sucursales.find(x => { return x.id == element.sucursalId; })) {
						let sucursalInfo = {
							id: element.sucursalId,
							codigoSucursal: element.sucursalCodigo,
							nombre: element.sucursalNombre,
							prefijo: element.sucursalPrefijo
						}

						let almacenes = [];

						this.datosAdicionales.almacenes.forEach(registro => {
							if (registro.sucursalId === element.sucursalId) {
								let info = {
									id: registro.almacenId,
									codigoAlmacen: registro.almacenCodigo,
									nombre: registro.almacenNombre,
									activo: true,
									sucursal: sucursalInfo
								}

								let almacen = {
									info: info,
									id: registro.almacenId,
									codigoAlmacen: registro.almacenCodigo,
									nombre: registro.almacenNombre,
									ocultarSeleccion: false,
									ocultarAcciones: true,
									selected: registro.seleccionado
								}

								almacenes.push(almacen);
							}
						});

						let sucursal = {
							info: sucursalInfo,
							id: element.sucursalId,
							codigoSucursal: element.sucursalCodigo,
							prefijo: element.sucursalPrefijo,
							nombre: element.sucursalNombre,
							ocultarSeleccion: false,
							ocultarAcciones: true,
							selected: false,
							almacenes: almacenes							
						}

						sucursales.push(sucursal);
					}				
				});				
			}

			departamentos = this.datosAdicionales.departamentos ? this.listToTreeDepartamentos(this.datosAdicionales.departamentos) : [];
		}

		this.treePermisosSucursalesAlmacenes.setDatos(sucursales, 'nombre', 'almacenes');
		this.treePermisosDepartamentos.setDatos(departamentos, 'nombre');
	}

	listToTreeDepartamentos(list) {
		let map = {};
		let roots = [];		

		for (let i = 0; i < list.length; i += 1) {
			let info = {
				id: list[i].id,
				nombre: list[i].nombre,
				prefijo: list[i].prefijo
			}

			map[list[i].id] = i;
			list[i].children = [];
			list[i].info = info;
			list[i].ocultarAcciones = true;
			list[i].ocultarSeleccion = false;
		}

		for (let i = 0; i < list.length; i += 1) {
			let node = list[i];
			
			if (node.departamentoPadre) {
				list[map[node.departamentoPadre]].children.push(node);
			} else {
				roots.push(node);
			}
		}

		return roots;
	}

	setDepartamentos(departamentos: PixvsMatTreeNodo<DepartamentoComboProjection, DepartamentoNodoProjection>[], departamentosUsuarioIds: number[]) {
		departamentos.forEach(departamento => {
			departamento.ocultarSeleccion = false;
			departamento.selected = departamentosUsuarioIds.includes(departamento.id);
			this.setDepartamentos(departamento.children, departamentosUsuarioIds);
		});
	}

	setDatosForm() {
		this.form.setControl('almacenes', new FormControl(this.treePermisosSucursalesAlmacenes.getNodosSeleccionados()));
		this.form.setControl('departamentosPermisos', new FormControl(this.treePermisosDepartamentos.getNodoSeleccionadoPrincipal()));
	}

	validar(): boolean {
		if (this.treePermisosDepartamentos.tieneMultiplesCaminosSeleccionados()) {
			this.mensajeError = 'El usuario solo puede pertenecer a un departamento';
			return false;
		}
		return true;
	}
}