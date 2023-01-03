import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { BehaviorSubject, ReplaySubject, Subject } from 'rxjs';
import { debounceTime, filter, map, take, takeUntil } from 'rxjs/operators';
import { FieldConfig } from '../dinamicos/field.interface';
import { NuevoRegistroDialogData, NuevoRegistroDialogComponent } from './dialogs/nuevo/nuevo.dialog';
import { PixvsMatSelectService } from './pixvs-mat-select.service';

@Component({
	selector: 'pixvs-mat-select',
	templateUrl: './pixvs-mat-select.component.html',
	styleUrls: ['./pixvs-mat-select.component.scss']
})
export class PixvsMatSelectComponent implements OnInit, AfterViewInit, OnDestroy {

	/** list of Data */
	@Input() protected datos: any[] = [];

	/** control for the selected Data */
	@Input() public matSelectCtrl: FormControl = new FormControl();
	@Input() public matformGroup: FormGroup;
	@Input() public matformControlName: string;

	/** control for the MatSelect filter keyword */
	public matSelectFilterCtrl: FormControl = new FormControl();

	/** list of Data filtered by search keyword */
	public filteredData: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

	@ViewChild('pixvsSelect', { static: true }) pixvsSelect: MatSelect;

	/** Subject that emits when the component has been destroyed. */
	protected _onDestroy = new Subject<void>();

	//matFormFieldFppearance
	@Input() appearance: string = null;

	@Input() matError: string = "";

	@Input() required: boolean = false;

	@Input() multiple: boolean = false;

	@Input() showToggleAllCheckbox: boolean = false;

	@Input() selectAll: boolean = false;

	@Input() campoValor: string[] = ["nombre"];

	@Input() label: string = "Campo";

	incrementarScrollIndex: boolean = false;
	scrollIndex: number = 1;
	scrollLength: number = 0;
	busquedaAnterior: string = "";
	@Input() elementsPerScroll: number;

	@Input() permiteAgregar: boolean = false;
	@Input() camposNuevoRegistro: FieldConfig[] = [];
	@Input() callbackGenerarRegistro: (registro: any) => void;
	@Input() bsNuevoRegistroGuardado: BehaviorSubject<any>;

	@Input() incluirItemVacio: boolean = true;

	@Input() isDisabled: boolean = false;
	@Input() seleccionarUnicaOpcion: boolean = true;
	
	@Input() etiquetaVacio: string = '--';

	@Input() busquedaAsincronaActiva: boolean = false;
	@Input() busquedaAsincronaRuta: string = null;
	buscando: boolean = false;

	buscadorAnteriorLongitud: number = 0;

	constructor(
		public dialog: MatDialog,
		private _pixvsMatSelectService: PixvsMatSelectService
	) { }

	ngOnInit() {
		// set initial selection
		//this.matSelectCtrl.setValue(this.datos[0]);

		if(this.matSelectCtrl && !this.matSelectCtrl?.value && this.datos?.length == 1 && this.seleccionarUnicaOpcion){
			this.matSelectCtrl.setValue(this.datos[0]);
		}

		// load the initial Data list
		if (this.datos)
			this.filteredData.next(this.filtrarScroll(this.datos.slice()));

		// listen for search field value changes
		if(this.busquedaAsincronaActiva){
			this.matSelectFilterCtrl.valueChanges
				.pipe(
					// El filter valida la regla de "No buscar al borrar caracteres", básicamente verifica con la veriable buscadorAnteriorLongitud que la longitud actual no sea menor que laregistrada anteriormente
					// Esta validación se hace en el filter y no en el map para poderlo validar después de cada pulsación de tecla y no solo después del debounceTime
					filter(busqueda => {
						if(this.buscadorAnteriorLongitud > (busqueda?.length || 0)){
								this.buscadorAnteriorLongitud = busqueda?.length || 0;
								this.buscando = false;
								return false;
							}
						return true;
					}),
					takeUntil(this._onDestroy),
					debounceTime(2000),
					map(busqueda => {
						if(busqueda?.length >= 5 && this.busquedaAnterior != busqueda){
							this.busquedaAnterior = busqueda;
							this.buscando = true;
							return this._pixvsMatSelectService.getDatos(this.busquedaAsincronaRuta,busqueda);
						}else{
							this.buscando = false;
							return null;
						}
					}),
					takeUntil(this._onDestroy)
				).subscribe(datosPromise => {
					if(datosPromise)
						datosPromise.then(
							response => {
								this.buscando = false;
								if(response.status == 200){
									if(this.matSelectCtrl?.value){
										this.datos = [this.matSelectCtrl.value].concat(
											response.data.filter(dato => {
												return dato.id != this.matSelectCtrl.value.id;
											})
										);
									}else{
										this.datos = response.data;
									}
									this.filteredData.next(this.datos);
								}
							}
						);
				});
				this._pixvsMatSelectService.getDatos(this.busquedaAsincronaRuta,'').then(
					response => {
						this.buscando = false;
						if(response.status == 200){
							if(this.matSelectCtrl?.value){
								this.datos = [this.matSelectCtrl.value].concat(
									response.data.filter(dato => {
										return dato.id != this.matSelectCtrl.value.id;
									})
								);
							}else{
								this.datos = response.data;
							}
							this.filteredData.next(this.datos);
						}
					}
				);
		}else{
			this.matSelectFilterCtrl.valueChanges
				.pipe(takeUntil(this._onDestroy))
				.subscribe(() => {
					this.filterData();
				});
		}

		this.matSelectCtrl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe(() => {
				//this.filterData();
				// this.setInitialValue();
			});

		if(this.bsNuevoRegistroGuardado){
			this.bsNuevoRegistroGuardado.pipe(takeUntil(this._onDestroy)).subscribe(registro => {
				if(registro){
					this.datos = [...this.datos,registro];
					this.matSelectCtrl.setValue(registro);
					this.matSelectCtrl.updateValueAndValidity();
					this.filterData();
				}
			});
		}
	}

	ngAfterViewInit() {
		this.setInitialValue();
		if (this.selectAll) {
			this.toggleSelectAll(true);
		}
	}

	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	/**
	 * Sets the initial value after the filteredData are loaded initially
	 */
	protected setInitialValue() {
		this.filteredData
			.pipe(take(1), takeUntil(this._onDestroy))
			.subscribe(() => {
				// setting the compareWith property to a comparison function
				// triggers initializing the selection according to the initial value of
				// the form control (i.e. _initializeSelection())
				// this needs to be done after the filteredData are loaded initially
				// and after the mat-option elements are available

				if (this.campoValor) {
					this.pixvsSelect.compareWith = (a: any, b: any) => a && b && a.id === b.id;
				} else {
					this.pixvsSelect.compareWith = (a: any, b: any) => a && b && a == b;
				}
			});
	}

	getElemento(element, names) {
		if (typeof names == 'string') {
			names = [names];
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

	setDatos(datos: any) {
		this.datos = datos;
		this.filterData();
	}

	protected filterData() {
		if (!this.datos) {
			return;
		}

		// get the search keyword
		let search = this.matSelectFilterCtrl.value;

		if (!search) {
			this.filteredData.next(this.filtrarScroll(this.datos.slice()));
			return;
		}

		search = search.toLowerCase();

		// filter the Datas
		this.filteredData.next(this.filtrarScroll(
			this.datos.filter(elemento =>
				this.campoValor ?
					this.getElemento(elemento, this.campoValor).toLowerCase().indexOf(search) > -1 :
					elemento.toString().toLowerCase().indexOf(search) > -1
			)
		));
	}

	toggleSelectAll(selectAllValue: boolean) {
		this.filteredData.pipe(take(1), takeUntil(this._onDestroy))
			.subscribe(val => {
				if (selectAllValue) {
					this.matSelectCtrl.patchValue(val);
				} else {
					this.matSelectCtrl.patchValue([]);
				}
			});
	}

	getNextBatch() {
        if(!!this.matSelectFilterCtrl.value)
            return;
		this.incrementarScrollIndex = true;
		this.filteredData.next(this.filtrarScroll(this.datos.slice()));
	}

	lastScrollTop: number = 0;

	filtrarScroll(datos: any[]) {
		if (!this.elementsPerScroll) {
			return datos;
		}

		let selectSearch: any = document.getElementsByClassName('mat-select-search-panel')[0];

		if (!this.incrementarScrollIndex) {
			this.scrollIndex = 1;
			let datosFiltrados = datos.slice(0, this.elementsPerScroll * this.scrollIndex);
			this.scrollLength = datosFiltrados.length;
			this.lastScrollTop = 0;

			if (selectSearch) {
				selectSearch.scrollTo(0, this.lastScrollTop);
			}

			return datosFiltrados;
		}

		if (datos.length != this.scrollLength) {
			this.scrollIndex++;
		}

		let datosFiltrados = datos.slice(0, this.elementsPerScroll * this.scrollIndex);

		this.scrollLength = datosFiltrados.length;
		this.incrementarScrollIndex = false;

		if (selectSearch) {
			if (!selectSearch.onscroll) {
				selectSearch.onscroll = (scrollEvent) => {
					if (selectSearch.scrollTop == 0 && this.lastScrollTop > 0) {
						selectSearch.scrollTo(0, this.lastScrollTop);
					}
				}
			}

			this.lastScrollTop = selectSearch.scrollTop;
		}

		return datosFiltrados;
	}

	onSeleccionar(event: MatSelectChange){
		if(event.value?.id == -1){
			this.matSelectCtrl.setValue(null);
			this.abrirModalNuevoRegistroCatalogo();
		}
	}

	abrirModalNuevoRegistroCatalogo(): void {

		let dialogData: NuevoRegistroDialogData = {
			campos: this.camposNuevoRegistro,
			onAceptar: this.onAceptarNuevoRegistroCatalogoDialog.bind(this)
		};

		const dialogRef = this.dialog.open(NuevoRegistroDialogComponent, {
			width: '300px',
			data: dialogData
		});
	}

	onAceptarNuevoRegistroCatalogoDialog(registro: any){
		this.callbackGenerarRegistro(registro);
	}
}