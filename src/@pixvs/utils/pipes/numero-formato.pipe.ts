import { Pipe, PipeTransform } from '@angular/core';
import { Redondeos } from './redondeos.util';

@Pipe({ name: 'NumeroFormatoPipe' })
export class NumeroFormatoPipe implements PipeTransform {
	transform(numero: number | string, formato: 'moneda' = 'moneda', simbolo: string = '$'): string {
		if (formato == 'moneda') {
			let numeroStr = Number(numero).toFixed(Redondeos.DECIMALES_DINERO);
			let indexDecimal = numeroStr.indexOf('.');

			if (indexDecimal < 0) {
				indexDecimal = numeroStr.length;
			}

			let enteroStr = numeroStr.substr(0, indexDecimal);
			let decimalStr = numeroStr.substr(indexDecimal);

			if (!decimalStr) {
				decimalStr = '.00';
			}

			let enteroSplit = enteroStr.split('').reverse();
			let enteroSplitAux: string[] = [];

			for (let i = 0; i < enteroSplit.length; i++) {
				enteroSplitAux.push(enteroSplit[i]);
				if (!((i + 1) % 3) && (i + 1) < enteroSplit.length) {
					enteroSplitAux.push(',');
				}
			}

			if (!enteroSplitAux.length) {
				return simbolo + ' 0' + decimalStr;
			}

			return simbolo + ' ' + enteroSplitAux.reverse().join('') + decimalStr;
		}
	}

	stringMoneyToNumber(money: any, simbolo: string = '$'): number {
		return Number(((money || '0').replaceAll(simbolo + ' ', '')).replaceAll(',', '') || '0');
	}
}