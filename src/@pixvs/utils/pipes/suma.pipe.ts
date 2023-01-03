import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'SumaPipe'})
export class SumaPipe implements PipeTransform {
	transform(arr: any[] = [], columnaSumar?: string): number {
		let total: number = 0;
		if(!!columnaSumar){
			for(let obj of arr){
				total += obj[columnaSumar] || 0;
			}
		}else{
			for(let obj of arr){
				total += obj || 0;
			}
		}

		return total;
	}
}