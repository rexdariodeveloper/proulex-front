import { Component } from '@angular/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';

export interface OrderReportData {
	codigo: string,
	fecha: string,
    fechaRequerida: string,
	proveedor: any,
	envio: any,
	terminos: number,
	moneda: any,
	creador: string,
	autorizador: string,
	comentarios: string,
	data: any[],
	columns: string[]
}

export interface OrderReportSummary {
	subtotal: number,
	descuento: number,
	iva: number,
	ieps: number,
	total: number
}

@Component({
	selector: 'invoice-print',
	templateUrl: './invoice.print.html',
	styleUrls: ['./invoice.print.scss'],
})
export class OrderReportPrintComponent {
	
	public data: OrderReportData;
	public summary: OrderReportSummary;
	public columns:string[] = ["partida", "descripcion", "fecha", "um", "requerida", "precio", "subtotal"];

	_unsubscribeAll: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	setData(data: OrderReportData){
		this.data = data;
		this.summary = {
			subtotal 	: 0,
			descuento 	: 0,
			ieps 		: 0,
			iva 		: 0,
			total 		: 0
		};

		this.data.data.forEach( d => {
			d.iva  = Number(d.iva) / 100;
			d.ieps = Number(d.ieps) / 100;

			d['subtotal'] 	= this.getSubtotal(d);
			d['total']		= this.getTotal(d);
			d['montoiva']   = (d['subtotal'] * d.iva);
			d['montoieps']  = (d['subtotal'] * d.ieps);

			this.summary.ieps 		+= d['montoieps'];
			this.summary.iva  		+= d['montoiva'];
			this.summary.descuento 	+= d.descuento;
			this.summary.subtotal	+= d.subtotal;
			this.summary.total		+= d.total;
		})
	}

	getSubtotal(detail){
		return detail.cantidad * detail.precio;
	}

	getTotal(detail){
		return ((detail.cantidad * detail.precio) * (1 + detail.iva + detail.ieps)) - detail.descuento;
	}

	ngOnInit(){
	}
}