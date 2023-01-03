import { Component, ElementRef, HostListener, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MenuListadoGeneralDetalleEditarProjection } from '@models/menu-listado-general-detalle';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FormGroup, FormBuilder, AbstractControl, FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { OrdenCompraDetalleEditarProjection } from '@app/main/modelos/orden-compra-detalle';
import { ArticuloComboProjection, ArticuloPrecargarProjection, ArticuloUltimasComprasProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { ValidatorService } from '@services/validators.service';
import { ArticulosTipos } from '@app/main/modelos/mapeos/articulos-tipos';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { OrdenCompra } from '@app/main/modelos/orden-compra';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import * as moment from 'moment';
import { Usuario } from '@models/usuario';
import { ConvertirRequisicionService } from '../../convertir-requisicion.service';
import { OrderReportData, OrderReportPrintComponent } from '../../prints/invoice.print';


const MAX_28: number = 9999999999999999999999999999.99;

export interface ConvertirDialogData {
	ordenesCompra: OrdenCompra[];
	monedas: MonedaComboProjection[];
	monedaPredeterminada: MonedaComboProjection;
	onAceptar: (ordenesCompra: OrdenCompra[]) => void;
    onPreview: (OrderReportData) => void;
}

@Component({
	selector: 'convertir-dialog',
	styleUrls: ['convertir.dialog.scss'],
	templateUrl: 'convertir.dialog.html',
})
export class ConvertirDialogComponent {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	@ViewChild("printBtn") printBtn: ElementRef;
	@ViewChild(OrderReportPrintComponent) invoice: OrderReportPrintComponent;

	usuarioActual: Usuario;
	fechaActual: Date = new Date();

	ordenesCompra: OrdenCompra[];
	monedas: MonedaComboProjection[];
	monedaPredeterminada: MonedaComboProjection;

	form: FormGroup;
	fechaRequeridaControls: {[ocId: number]: FormControl} = {};
	monedaControls: {[ocId: number]: FormControl} = {};

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public dialogRef: MatDialogRef < ConvertirDialogComponent > ,
		private _formBuilder: FormBuilder,
		@Inject(MAT_DIALOG_DATA) public data: ConvertirDialogData,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private el: ElementRef,
		private _convertirRequisicionService: ConvertirRequisicionService
	) {

		this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this._unsubscribeAll = new Subject();
		this.setData(data);
	}

	ngOnInit(): void {
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	setData(data: ConvertirDialogData) {
		this.monedas = data.monedas;
		this.monedaPredeterminada = data.monedaPredeterminada;
		
		this.form = this._formBuilder.group({});
		for(let oc of data.ordenesCompra){
			this.fechaRequeridaControls[oc.codigo] = new FormControl(moment(oc.fechaRequerida),[Validators.required]);
			this.monedaControls[oc.codigo] = new FormControl(this.monedaPredeterminada,[Validators.required]);

			this.form.addControl('fechaRequerida' + oc.codigo, this.fechaRequeridaControls[oc.codigo]);
			this.form.addControl('moneda' + oc.codigo, this.monedaControls[oc.codigo]);
		}
		
		this.ordenesCompra = data.ordenesCompra;
	}

	cancelar(): void {
		this.dialogRef.close();
	}

	aceptar(): void {
		// this.dialogRef.close();
		if (this.form.valid) {
			this.form.disable();
			for(let oc of this.ordenesCompra){
				oc.fechaRequerida = this.fechaRequeridaControls[oc.codigo].value;
				oc.moneda = this.monedaControls[oc.codigo].value;
				oc.monedaId = oc.moneda.id;
			}
			this.data.onAceptar(this.ordenesCompra);
			this.dialogRef.close();
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

	ocVistaPrevia: OrdenCompra;
	onVistaPrevia(oc: OrdenCompra){
		this.ocVistaPrevia = {...oc};
		this.ocVistaPrevia.moneda = {
			nombre: this.monedaControls[oc.codigo].value?.nombre || ''
		};
		this.ocVistaPrevia.detalles.forEach(detalle => {
			let montos = this._convertirRequisicionService._impuestosArticuloService.getMontos(detalle.precio,detalle.cantidad,detalle.descuento,detalle.ivaExento ? 0 : detalle.iva, !!detalle.iepsCuotaFija ? 0 : detalle.ieps,detalle.iepsCuotaFija);
			detalle['subtotal'] = montos.subtotal;
			detalle['iepsTotal'] = montos.ieps;
			detalle['ivaTotal'] = montos.iva;
			detalle['total'] = montos.total;
		});
		let data: OrderReportData = {
			codigo: this.ocVistaPrevia?.codigo,
			fecha: moment(this.ocVistaPrevia?.fechaOC).format('DD/MM/YYYY hh:mm A'),
            fechaRequerida: moment(this.ocVistaPrevia?.fechaRequerida).format('DD/MM/YYYY hh:mm A'),
			proveedor: this.ocVistaPrevia.proveedor,
			envio: this.ocVistaPrevia.recepcionArticulosAlmacen,
			terminos: this.ocVistaPrevia.terminoPago,
			moneda: this.ocVistaPrevia.moneda,
			creador: this.usuarioActual.nombreCompleto,//this.ocVistaPrevia?.creadoPor?.nombreCompleto,
			autorizador: '',
			comentarios: this.ocVistaPrevia.comentario,
			data: this.ocVistaPrevia?.detalles || [],
			columns: ["partida", "descripcion", "fecha", "um", "requerida", "precio", "subtotal"]
		};
        
        this.data.onPreview(data);
        //this.dialogRef.close();
		/*
        this.invoice.setData(data);
        this.dialogRef.updateSize('100%', '100%');
		setTimeout(function(){ 
            window.print();
        }.bind(this) , 1000);
        */

		/*setTimeout(() => {
			this.printBtn.nativeElement.click();
		});*/
	}

}