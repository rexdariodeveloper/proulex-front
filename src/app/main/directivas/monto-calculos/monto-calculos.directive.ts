import { Directive, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { FormControl, NgControl } from '@angular/forms';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';
/**
 * Para usarse necesita mandarse a llamar con el attributo [monto]
 * @param cantidad cantidad de producto
 * @param precioUnitario precio unitario del producto
 * @param descuento monto del descuento, no usar porcentaje
 * @param ivaPorcentaje porcentaje del IVA
 * @param iepsPorcentaje porcentaje del IEPS
 * @param cuotaFija monto de la cuota fija, si este parametro no existe, se usara el IEPS
 */
@Directive({
	selector: '[monto]'
})
export class MontoCalculosDirective implements OnInit {
	/**
	 * Formas de uso en span
	 * Los valaores se sobreescribiran en caso de ser diferentes a un input
	 * subtotal: <span monto [requerido]="'subtotal'" [cantidad]="2.25" [precioUnitario]="30.256899" [descuento]="5.0" [iepsPorcentaje]="8" [cuotaFija]="null" [ivaPorcentaje]="16"> </span>
	 *      Para el subtotal solo es necesario la cantidad y el precio unitario
	 */
	elemento: any;
	@Input('requerido') valorRequerido: 'subtotal' | 'ieps' | 'iva';
	@Input('cantidad') cantidad: number = null;
	@Input('precioUnitario') precioUnitario: number = null;
	@Input('descuento') descuento: number = null;
	@Input('ivaPorcentaje') ivaPorcentaje: number = null;
	@Input('iepsPorcentaje') iepsPorcentaje: number = null;
	@Input('cuotaFija') cuotaFija: number = null;
	
	@Input('prefijo') prefijo: string = null;
	@Input('formato') formato: 'moneda' = null;

	private numeroFormatoPipe: NumeroFormatoPipe = new NumeroFormatoPipe();

	constructor(
		// private control : NgControl,
		private el: ElementRef
	) {
		this.elemento = this.el.nativeElement;
	}

	ngOnInit() {
		this.calcularResultado();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.requerido){
			this.valorRequerido = changes.requerido.currentValue;
		}
		if(changes.cantidad){
			this.cantidad = changes.cantidad.currentValue;
		}
		if(changes.precioUnitario){
			this.precioUnitario = changes.precioUnitario.currentValue;
		}
		if(changes.descuento){
			this.descuento = changes.descuento.currentValue;
		}
		if(changes.ivaPorcentaje){
			this.ivaPorcentaje = changes.ivaPorcentaje.currentValue;
		}
		if(changes.iepsPorcentaje){
			this.iepsPorcentaje = changes.iepsPorcentaje.currentValue;
		}
		if(changes.cuotaFija){
			this.cuotaFija = changes.cuotaFija.currentValue;
		}
		if(changes.prefijo){
			this.prefijo = changes.prefijo.currentValue;
		}
		this.calcularResultado();
	}

	calcularResultado(){
		const CantidadLimpia = (this.cantidad || 0);
		const PrecioUnitarioLimpio = (this.precioUnitario || 0);
		const subtotal = Redondeos.redondear(CantidadLimpia * PrecioUnitarioLimpio);
		if (this.valorRequerido === 'subtotal') {
			this.setValue(subtotal);
			return;
		}
		const DescuentoLimpio = (this.descuento || 0);
		const IEPSLimpio = (this.iepsPorcentaje || 0) / 100;
		let ieps = 0;
		const base = Redondeos.redondear(subtotal - DescuentoLimpio);
		if (!!!this.cuotaFija) {
			ieps = Redondeos.redondear(base * IEPSLimpio);
		} else {
			ieps = Redondeos.redondear(CantidadLimpia * this.cuotaFija);
		}
		if (this.valorRequerido === 'ieps') {
			this.setValue(ieps);
			return;
		}
		const IVALimpio = (this.ivaPorcentaje || 0) / 100;
		const BaseIVA = Redondeos.redondear(base + ieps);
		const iva = Redondeos.redondear(BaseIVA * IVALimpio);
		if (this.valorRequerido === 'iva') {
			this.setValue(iva);
			return;
		}
		const total = Redondeos.redondear((base + iva + ieps));
		this.setValue(total);
	}

	setValue(value: number): void {
		let valueStr: string = String(Redondeos.redondear(value,Redondeos.DECIMALES_DINERO));
		if(this.formato == 'moneda'){
			valueStr = this.numeroFormatoPipe.transform(value);
		}
		if(this.prefijo){
			valueStr = this.prefijo + ' ' + valueStr;
		}
		if (this.elemento.tagName !== 'INPUT') {
			this.elemento.innerHTML = valueStr;
		} else {
			this.elemento.value = valueStr;
		}
	}
}