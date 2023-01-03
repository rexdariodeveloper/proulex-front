import { Directive, ElementRef, Input, OnInit, SimpleChanges } from '@angular/core';
import { Redondeos } from '@pixvs/utils/pipes/redondeos.util';
/**
 * Para usarse necesita mandarse a llamar con el attributo [redondear]
 * @param monto monto a redondear
 * @param decimales (opcional) en caso de omitir, se redondea a Redondeos.DECIMALES_DINERO
 */
@Directive({
	selector: '[redondear]'
})
export class RedondearDirective implements OnInit {
	/**
	 * Formas de uso
	 * <span redondear [montoRedondear]="3.14159265359" [decimales]="4"></span>
	 */
	elemento: any;
	@Input('montoRedondear') montoRedondear: number = null;
	@Input('decimales') decimales: number = Redondeos.DECIMALES_DINERO;
	
	constructor(
		// private control : NgControl,
		private el: ElementRef,
	) {
		this.elemento = this.el.nativeElement;
	}

	ngOnInit() {
		this.redondear();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.montoRedondear){
			this.montoRedondear = changes.montoRedondear.currentValue;
		}
		if(changes.decimales){
			this.decimales = changes.decimales.currentValue;
		}
		this.redondear();
	}

	redondear(){
		this.setValue(Redondeos.redondear(this.montoRedondear || 0,this.decimales));
	}

	setValue(value: number): void {
		let valueStr: string = value.toFixed(this.decimales);
		this.elemento.innerHTML = valueStr;
	}
}