import { Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../../../i18n/en';
import { locale as spanish } from '../../../i18n/es';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ValidatorService } from '@services/validators.service';
import { ArticulosSubtipos } from '@app/main/modelos/mapeos/articulos-subtipos';
import { ArticuloArbolComponentesProjection } from '@app/main/modelos/articulo';
import { SurtirPedidoService } from '../../surtir-pedido.service';

export interface SurtirPedidosComponentesDialogData {
	articuloId: number;
	existencias: any[];
	existenciasPaquetes: any[];
}

@Component({
	selector: 'componentes-dialog',
	styleUrls: ['./componentes.dialog.scss'],
	templateUrl: 'componentes.dialog.html',
	encapsulation: ViewEncapsulation.None
})
export class SurtirPedidosComponentesDialogComponent {

	ArticulosSubtipos = ArticulosSubtipos;

	articuloId: number;

	articuloArbolComponentes: ArticuloArbolComponentesProjection = null;

	cargandoComponentes: boolean = false;

	existencias: any[];
	existenciasPaquetes: any[];

	private _unsubscribeAll: Subject<any>;

	constructor(
		public dialogRef: MatDialogRef<SurtirPedidosComponentesDialogComponent>,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _formBuilder: FormBuilder,
		private translate: TranslateService,
		@Inject(MAT_DIALOG_DATA) public data: SurtirPedidosComponentesDialogData,
		public validatorService: ValidatorService,
		private _pedidoService: SurtirPedidoService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		// Set the private defaults
		this._unsubscribeAll = new Subject();
		this.cargandoComponentes = true;
		this.setData(data);
	}

	ngOnDestroy(){
		this._pedidoService.onArticuloArbolComponentesChanged.next(null);
		// Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
	}

	setData(data: SurtirPedidosComponentesDialogData) {
		this.articuloId = data.articuloId;
		this.existencias = data.existencias;
		this.existenciasPaquetes = data.existenciasPaquetes;
		this.cargandoComponentes = true;
		this._pedidoService.getArticuloArbolComponentes(this.articuloId);
		this._pedidoService.onArticuloArbolComponentesChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(articulo => {
			if(articulo){
				this.articuloArbolComponentes = articulo;
				this.setExistenciaArbol(this.articuloArbolComponentes);
				this.cargandoComponentes = false;
			}
		});
	}

	aceptar(): void {
		this.dialogRef.close();
	}

	setExistenciaArbol(arbol: ArticuloArbolComponentesProjection){
		arbol.existencia = (this.existenciasPaquetes[arbol.id]) || this.existencias.filter( exs => exs.articuloId == arbol.id)[0]?.existencia || 0;
		for(let componente of arbol.componentes){
			this.setExistenciaArbol(componente.componente);
		}
	}
}