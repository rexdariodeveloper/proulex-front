import { Pipe, PipeTransform } from '@angular/core';
import { FormControl } from '@angular/forms';

@Pipe({name: 'MontoPagarPipe'})
export class MontoPagarPipe implements PipeTransform {
	transform(montoPagarControls: {[facturaId: number]: FormControl} = {}, actualizarCont: number): number {
		let total: number = 0;
		for(let facturaId in montoPagarControls){
			if(!!montoPagarControls[facturaId]){
				total += Number(montoPagarControls[facturaId].value || 0)
			}
		}
		return total;
	}
}