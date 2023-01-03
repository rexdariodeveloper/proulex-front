import { Component, Inject, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { FacturacionGlobalImpuestosNotaVentaProjection, FacturacionGlobalNotaVentaProjection, FacturacionNotaVentaProjection } from '@app/main/modelos/orden-venta';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { UsuarioComboProjection } from '@models/usuario';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FacturaGlobalService } from '../factura-global.service';

export interface NotaVentaDialogData {
	camposListado: FieldConfig[];
	onAceptar: (registro: any, filtrosNotasVenta: any) => void;
	listadoSedes: any[];
	listadoPlanteles: any[];
}

@Component({
	selector: 'nota-venta-dialog',
	templateUrl: './nota-venta.dialog.html',
	styleUrls: ['./nota-venta.dialog.scss'],
	animations: fuseAnimations,
})
export class NotaVentaDialogComponent {

	@ViewChild('camposDinamicos') camposDinamicos: PixvsDynamicComponent;

	camposListado: FieldConfig[];
	_unsubscribeAll: Subject<any>;
	listadoSedes: any[];
	listadoPlanteles: any[];
	listadoPlantelesFiltrado: any[];
	sedeTipoFacturaId: number;
	form: FormGroup;

	notasVenta: FacturacionGlobalNotaVentaProjection[];
	impuestos: FacturacionGlobalImpuestosNotaVentaProjection[];
	usuarios: UsuarioComboProjection[];

	plantelControl: FormControl = new FormControl();
	usuarioControl: FormControl = new FormControl();

	constructor(
		public dialogRef: MatDialogRef<NotaVentaDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private _matSnackBar: MatSnackBar,
		public _facturaService: FacturaGlobalService,
		@Inject(MAT_DIALOG_DATA) public data: NotaVentaDialogData
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		// Set the private defaults
		this._unsubscribeAll = new Subject();

		this.setData(data);
	}

	setData(data: NotaVentaDialogData) {
		this.camposListado = data.camposListado;
		this.listadoSedes = data.listadoSedes;
		this.listadoPlanteles = data.listadoPlanteles;

		setTimeout(() => {
			this.form = this.camposDinamicos.form.form;

			for (let campoRegistro in this.form.controls) {
				this.form.controls[campoRegistro].setValue(null);
				this.form.controls[campoRegistro].markAsUntouched();
				this.form.controls[campoRegistro].updateValueAndValidity();
			}

			this._facturaService.onNotaVentaChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(datos => {
					if (datos) {
						this._facturaService.onNotaVentaChanged.next(null);
						this.notasVenta = datos.notasVenta;
						this.impuestos = datos.impuestos;

						if (this.impuestos) {
							this.notasVenta.forEach(notaVenta => {
								notaVenta.impuestosDetalles = this.impuestos.filter(impuesto => impuesto.ordenVentaId == notaVenta.id);
							});
						}

						let filtrosNotasVenta = {
							sedeId: this.form.controls.sede.value,
							plantelId: this.plantelControl.value,
							fechaInicio: this.form.controls.fechaInicio.value,
							fechaFin: this.form.controls.fechaFin.value,
							usuariosId: this.usuarioControl.value
						}

						this.data.onAceptar(this.notasVenta, filtrosNotasVenta);
						this.dialogRef.close();
					}
				});

			this._facturaService.onUsuariosChanged
				.pipe(takeUntil(this._unsubscribeAll))
				.subscribe(datos => {
					if (datos) {
						this._facturaService.onUsuariosChanged.next(null);
						this.updateUsuarios(datos.usuarios || []);
					}
				});

			this.form.controls.sede.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
				this.sedeTipoFacturaId = this.form.controls.sede.value ? this.form.controls.sede.value.tipoFacturaGlobalId : null;
				let sedeId: number = this.form.controls.sede.value ? this.form.controls.sede.value.id : null;
				this.listadoPlantelesFiltrado = this.listadoPlanteles.filter(x => { return x.sucursalId === sedeId; });
				this.plantelControl.setValue(null);
				this.usuarioControl.setValue(null);
				this.updateUsuarios([]);

				this.updatePlanteles(this.listadoPlantelesFiltrado);

				if (sedeId && !this.listadoPlantelesFiltrado.length && this.esTipoPorUsuario()) {
					var json = {
						sedeId: sedeId
					};

					this._facturaService.getUsuarios(json);
				}
			});
		});
	}

	updatePlanteles(planteles) {
		if (planteles && planteles.length) {
			this.plantelControl = new FormControl(null, [Validators.required]);

			let field: FieldConfig = {
				type: "pixvsMatSelect",
				label: "Plantel",
				name: "plantel",
				formControl: this.plantelControl,
				validations: [],
				multiple: true,
				selectAll: false,
				list: planteles,
				campoValor: 'nombre',
			};

			this.updateFilters(1, "plantel", field);
		} else {
			this.plantelControl = new FormControl();
			this.updateFilters(1, "plantel", null);
		}

		this.plantelControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((planteles: SucursalPlantelComboProjection[]) => {
			this.usuarioControl.setValue(null);
			this.updateUsuarios([]);

			if (planteles && planteles.length && this.esTipoPorUsuario()) {
				var json = {
					planteles: planteles
				};

				this._facturaService.getUsuarios(json);
			}
		});
	}

	updateUsuarios(usuarios) {
		if (this.esTipoPorUsuario()) {
			this.usuarioControl = new FormControl(null, [Validators.required]);

			let field: FieldConfig = {
				type: "pixvsMatSelect",
				label: "Usuario",
				name: "usuario",
				formControl: this.usuarioControl,
				validations: [],
				multiple: true,
				selectAll: false,
				list: usuarios,
				campoValor: 'nombreCompleto',
			};

			this.updateFilters(4, "usuario", field);
		} else {
			this.usuarioControl = new FormControl();
			this.updateFilters(4, "usuario", null);
		}
	}

	updateFilters(index: number, name: string, field: FieldConfig) {
		let regIndex = this.camposListado.findIndex(item => item.name == name);

		if (regIndex != -1) {
			this.camposListado.splice(regIndex, 1);
		}

		if (field) {
			this.camposListado.splice(index, 0, field);
		}

		this.camposListado = [...this.camposListado];
	}

	private esTipoPorUsuario() {
		return this.sedeTipoFacturaId && this.sedeTipoFacturaId == ControlesMaestrosMultiples.CMM_SUC_TipoFacturaGlobal.POR_USUARIO;
	}

	cancelar(): void {
		this.data.onAceptar(null, null);
		this.dialogRef.close();
	}

	aceptar(): void {
		this.notasVenta = null;
		this.plantelControl.markAsTouched();
		this.usuarioControl.markAsTouched();

		if (this.form.valid) {
			if ((this.listadoPlantelesFiltrado.length && !this.plantelControl?.value)
				|| (this.esTipoPorUsuario() && !this.usuarioControl?.value)) {
				return;
			}

			this._facturaService.getDatosNotaVenta(
				this.form.controls.sede.value,
				this.plantelControl.value,
				this.form.controls.fechaInicio.value,
				this.form.controls.fechaFin.value,
				this.usuarioControl.value
			);
		} else {
			this.camposDinamicos.form.validateAllFormFields(this.form);
		}
	}
}