import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
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
import { MatTableDataSource } from '@angular/material/table';

@Component({
	selector: 'pixvs-tabla-detalles',
	templateUrl: './tabla-detalles.component.html',
	styleUrls: ['./tabla-detalles.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsTablaDetallesComponent implements OnInit {

	@Input() detalles: any[];
	@Input() filter: ElementRef;
	@Input() localeEN: any;
	@Input() localeES: any;
	@Input() columnasFechas: string[];
	@Input() columnas: any[];
	@Input() listadoAcciones: ListadoAcciones[];
	@Input() reordenamiento: boolean;
	@Input() displayedColumns: string[];
	@Input() columnaId: string;
	@Input() mostrarBotonAgregar: boolean = false;
	@Input() showAll: boolean = false;
	@Output() onSeleccionarRegistro: EventEmitter<any> = new EventEmitter();
	@Output() onNuevoRegistro: EventEmitter<any> = new EventEmitter();
	@Output() onIconoInfo: EventEmitter<any> = new EventEmitter();

	@ViewChild(MatPaginator, {
		static: true
	})
	paginator: MatPaginator;

	dataSource: MatTableDataSource<any> = new MatTableDataSource([]);

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
		this._fuseTranslationLoaderService.loadTranslations(this.localeEN, this.localeES);
		this.dataSource.data = this.detalles || [];

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

					this.paginator.pageIndex = 0;
					this.dataSource.filter = this.filter.nativeElement.value;
				});
		} else {
			this.paginator.pageIndex = 0;
			this.dataSource.filter = '';
		}
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.detalles){
			this.detalles = changes.detalles.currentValue;
			this.dataSource.data = this.detalles || [];
		}
		if(changes.mostrarBotonAgregar){
			this.mostrarBotonAgregar = changes.mostrarBotonAgregar.currentValue;
		}
	}

	getElemento(element, names) {
		if (typeof names == 'string') {
			names = [names];
		}

		if(names.length == 1){
			let campos: any[] = names[0].split('.');

			let valor: any = null;
			campos.forEach(campo => {
                if (valor) {
                    valor = valor[campo];
                } else {
                    valor = element[campo];
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

		if (item.tipo == 'delete') {
			const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
				width: '400px',
				data: {
					mensaje: this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
				}
			});

			dialogRef.afterClosed().subscribe(confirm => {
				if (confirm) {
					// this.service.eliminar(item.url + this.hashid.encode(id));
					// this.service.getDatos();
				}
			});

		}

		if (item.tipo == 'download') {
			// this.service.getPDF(item.url + id);
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
					// this.service.datos.splice(index, 1);
					// this.service.recarga();
				}
			});
		}
	}

	getRowIndex(id: any) {
		let index: number = null;
		// this.service.datos.forEach((registro, i) => { index = registro.id == id ? i : index; });
		return index;
	}

	drop(event: CdkDragDrop<string[]>) {
		// this.service.cargando = true;
		// this.service.cambiarOrden(event.previousIndex, event.currentIndex, (this.service.url + '/modificar-orden/'));

		// setTimeout(() => {
		// 	this.recargar();
		// }, 1000);
	}

	nuevoRegistro(){
		this.onNuevoRegistro.emit();
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