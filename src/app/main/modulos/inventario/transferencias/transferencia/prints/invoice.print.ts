import { Component, Input } from '@angular/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { BehaviorSubject, Subject } from 'rxjs';
import { locale as english } from '../../i18n/en';
import { locale as spanish } from '../../i18n/es';

export interface TransferenciaInvoiceData {
	reimpresion: boolean,
	codigo: string,
	destinoSede: any,
	destinoAlmacen: any,
	cedisSede: any,
	cedisAlmacen: any,
	fecha: string,
	usuario: any,
	modulo: string,
	comentarios: string,
	data: any[],
	columns: string[]
}

@Component({
	selector: 'invoice-print',
	templateUrl: './invoice.print.html',
	styleUrls: ['./invoice.print.scss'],
})
export class TransferenciaInvoicePrintComponent {
	
	public data: TransferenciaInvoiceData;
	public totalArticulos: number;
	public totalCantidad: number;
	public totalImporte: number;

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

	setData(data: TransferenciaInvoiceData){
		this.data = data;
		this.totalArticulos = 0;
        this.totalCantidad = 0;
        this.totalImporte = 0;

        this.totalArticulos = this.data.data.length;
        this.data.data.forEach(item => {
            this.totalCantidad +=  Number(item.cantidad);
            this.totalImporte += Number(item.cantidad) * Number(item.articulo.costoUltimo);
		});
	}

	ngOnInit(){
	}
}