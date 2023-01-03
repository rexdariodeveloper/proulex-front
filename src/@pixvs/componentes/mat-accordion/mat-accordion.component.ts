import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseConfirmDialogComponent } from "@fuse/components/confirm-dialog/confirm-dialog.component";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from "rxjs";

export interface PixvsMatAccordionCell {
	name: string;
	value: string;
	flex?: string;
	type?: string | null;
	extras?: PixvsMatAccordionExtras[];
	icon?: string;
	action?: (element: any, event?) => void;
}

export interface PixvsMatAccordionExtras {
	name: string;
	value: any;
}

@Component({
	selector: 'pixvs-mat-accordion',
	templateUrl: './mat-accordion.component.html',
	styleUrls: ['./mat-accordion.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsMatAccordionComponent implements OnInit {

	@Input() localeEN: any;
	@Input() localeES: any;
	@Input() headers: PixvsMatAccordionCell[];
	@Input() details: PixvsMatAccordionCell[];
	@Input() detailProperty: string = 'children';
	@Input() data: any;
	@Input() displayNames: boolean = true;
	@Input() columnaId: string;
	@Output() onRecargarTabla: EventEmitter<any> = new EventEmitter();

	private _unsubscribeAll: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		public dialog: MatDialog,
		private translate: TranslateService,
		private hashid: HashidsService,
		private router: Router
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(this.localeEN || {}, this.localeES || {});
	}

	action(event: any, item: PixvsMatAccordionCell, id: string | number){
		if(item?.action){
			item.action(id,event);
		}
	}

	getElemento(element, names) {
		if (typeof names == 'string') {
			names = [names];
		}

		if (names.length == 1) {
			let campos: any[] = names[0].split('.');

			let valor: any = null;
			campos.forEach(campo => {
				if (valor) {
					valor = valor[campo];
				} else {
					valor = element[campo];
				}
			});
			switch (valor) {
				case null:
				case undefined:
					return '';
				default:
					return valor;
			}
		}

		let valor = '';
		names.forEach((name, i) => {
			let campos: any[] = name.split('.');
			let campo = null;

			campos.forEach(function (item, j) {
				if (campo) {
					campo = campo[item];
				} else {
					campo = element[item];
				}

				if (campos.length == j + 1) {
					valor = valor + campo + (names.length != i + 1 ? ' - ' : '');
				}
			});
		});

		return valor;
	}

	delete(event: any, id: any) {
		event.stopPropagation();

		let index = this.getRowIndex(id);

		if (index != null) {
			const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				width: '400px',
				data: {
					mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
				}
			});

			dialogRef.afterClosed().subscribe(confirm => {
				if (confirm) {
					this.data.splice(index, 1);

					this.onRecargarTabla.emit(this.data);
				}
			});
		}
	}

	getRowIndex(id: any) {
		let index: number = null;
		this.data.forEach((registro, i) => { index = registro.id == id ? i : index; });
		return index;
	}
}