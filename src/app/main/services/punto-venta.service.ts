import { Injectable } from '@angular/core';
import { JsonResponse } from '@models/json-response';
import { HttpService } from '@services/http.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PuntoVentaGeneralService {

	private urlApi = '/api/v1/punto-venta';

    constructor(
		public _httpClient: HttpService
	){
    }

	getSucursalId(): number{
		let sucursalIdStr: string = localStorage.getItem('sucursalPuntoVentaId');
		if(!!sucursalIdStr){
			return Number(sucursalIdStr);
		}
		return null;
	}

	setSucursalId(sucursalId: number){
		if(!!sucursalId){
			localStorage.setItem('sucursalPuntoVentaId',String(sucursalId));
		}else{
			localStorage.removeItem('sucursalPuntoVentaId');
		}
	}

	getPlantelId(): number{
		let plantelIdStr: string = localStorage.getItem('plantelPuntoVentaId');
		if(!!plantelIdStr){
			return Number(plantelIdStr);
		}
		return null;
	}

	setPlantelId(plantelId: number){
		if(!!plantelId){
			localStorage.setItem('plantelPuntoVentaId',String(plantelId));
		}else{
			localStorage.removeItem('plantelPuntoVentaId');
		}
	}

}