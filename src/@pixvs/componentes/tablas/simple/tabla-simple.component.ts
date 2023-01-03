import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { NumeroFormatoPipe } from '@pixvs/utils/pipes/numero-formato.pipe';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { ListadoAcciones } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { TableDataSource } from '@pixvs/utils/table-data-source';
import { HashidsService } from '@services/hashids.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { fromEvent, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'pixvs-tabla-simple',
	templateUrl: './tabla-simple.component.html',
	styleUrls: ['./tabla-simple.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsTablaSimpleComponent implements OnInit {

	@Input() service: any;
	@Input() filter: ElementRef;
	@Input() localeEN: any;
	@Input() localeES: any;
	@Input() columnasFechas: string[];
	@Input() columnas: any[];
	@Input() listadoAcciones: ListadoAcciones[];
	@Input() reordenamiento: boolean;
	@Input() displayedColumns: string[];
	@Input() rutaDestino: string;
	@Input() columnaId: string;
	@Input() showAll: boolean = false;
	@Output() onSeleccionarRegistro: EventEmitter<any> = new EventEmitter();
	@Output() onIconoInfo: EventEmitter<any> = new EventEmitter();
	@Output() onSelectionChange: EventEmitter<any> = new EventEmitter();
	@Output() onCellValueChange: EventEmitter<any> = new EventEmitter();

	dataSource: TableDataSource | null;
	@ViewChild(MatPaginator, {
		static: true
	})
	paginator: MatPaginator;
	@ViewChild(MatSort, {
		static: true
	})
	sort: MatSort;

	private _unsubscribeAll: Subject<any>;
	private _numeroFormatoPipe: NumeroFormatoPipe = new NumeroFormatoPipe();

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
		this._fuseTranslationLoaderService.loadTranslations(this.localeEN, this.localeES);
		this.dataSource = new TableDataSource(this.service, this.paginator, this.sort, this.columnasFechas, false);

		if (this.filter) {
			fromEvent(this.filter.nativeElement, 'keyup')
				.pipe(
					takeUntil(this._unsubscribeAll),
					debounceTime(150),
					distinctUntilChanged()
				)
				.subscribe(() => {
					if (!this.dataSource) {
						return;
					}

					if(this.paginator)
						this.paginator.pageIndex = 0;
					this.dataSource.filter = this.filter.nativeElement.value;
				});
		} else {
			if(this.paginator)
				this.paginator.pageIndex = 0;
			this.dataSource.filter = '';
		}
	}

	drop(event: CdkDragDrop<string[]>) {
		this.service.cargando = true;
		this.service.cambiarOrden(event.previousIndex, event.currentIndex, (this.service.url + '/modificar-orden/'));

		setTimeout(() => {
			this.recargar();
		}, 1000);
	}

	recargar() {
		this.service.getDatos();
	}

	getElemento(element, names) {
		if (typeof names == 'string') {
			names = [names];
		}

		if(names.length == 1){
			let campos: any[] = names[0].split('.');

			let valor: any = null;
			campos.forEach(campo => {
                if (element) {
					valor = element[campo];
					element = valor;
				}
			});
			switch(valor){
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

	action(event: any, item: ListadoAcciones, element: any) {
		event.stopPropagation();

		let id = this.getElemento(element,this.columnaId);

		if (item.tipo == 'delete') {
			const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				width: '400px',
				data: {
					mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
				}
			});

			dialogRef.afterClosed().subscribe(confirm => {
				if (confirm) {
					this.service.eliminar(item.url + this.hashid.encode(id));
					this.service.getDatos();
				}
			});

		}

		if (item.tipo == 'download') {
			this.service.getPDF(item.url + id);
		}

		if(!!item.accion){
			item.accion(element);
		}
	}

	getHashId(id: number) {
		return this.hashid.encode(id)
	}

	navegarRutaDestino(rutaDestino: string, rutaId: string) {
		if (rutaDestino) {
			this.router.navigate([rutaDestino + rutaId]);
		}
	}

	seleccionarRegistro(id: any) {
		this.onSeleccionarRegistro.emit(id);
	}

	selectionChange(event: any, id: any, columna: any) {
		let seleccionado = event.checked;

		let tabla: any[] = this.service.getDatos();
		let index = this.getRowIndex(id);

		(tabla[index])[columna] = seleccionado;

		this.service.recarga();

		this.onSelectionChange.emit({id, columna, seleccionado});
	}

	cellValueChange(event: any, id: any, columna: any, tipoColumna: any) {
		let nuevoValor = event.target.value;

		let tabla: any[] = this.service.getDatos();
		let index = this.getRowIndex(id);

		if (tipoColumna == 'money') {
			nuevoValor = this._numeroFormatoPipe.transform(this._numeroFormatoPipe.stringMoneyToNumber(nuevoValor));
		}

		(tabla[index])[columna] = nuevoValor;

		this.service.recarga();

		this.onCellValueChange.emit({id, columna, nuevoValor});
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
					this.service.datos.splice(index, 1);
					this.service.recarga();
				}
			});
		}
	}

	getRowIndex(id: any) {
		let index: number = null;
		this.service.datos.forEach((registro, i) => { index = registro[this.columnaId] == id ? i : index; });
		return index;
	}

	iconoInfo(element,idExtra){
		this.onIconoInfo.emit({element,idExtra});
	}

	mostrarIconoInfo(opcion,element){
		if(opcion.comparacionMostrar){
			let valorOpcion = element;
			let columnasBuscar: string[] = opcion.comparacionMostrar.columna.split('.');
			for(let columna of columnasBuscar){
				valorOpcion = valorOpcion[columna];
			}
			return valorOpcion == opcion.comparacionMostrar.valorComparar;
		}
		return true;
	}
}