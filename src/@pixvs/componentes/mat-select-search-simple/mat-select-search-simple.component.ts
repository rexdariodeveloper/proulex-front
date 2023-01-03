import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

@Component({
	selector: 'pixvs-mat-select-simple',
	templateUrl: './mat-select-search-simple.component.html',
	styleUrls: ['./mat-select-search-simple.component.scss']
})
export class PixvsMatSelectSimpleComponent implements OnInit, AfterViewInit, OnDestroy {

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
	@Input() elementsPerScroll: number;

	@Input() showLabelAll: boolean = true;
	@Input() labelAll: string = "Todos";

    @Input() showToolTip: boolean = false;

	constructor() { }

	ngOnInit() {
		// set initial selection
		//this.matSelectCtrl.setValue(this.datos[0]);

		// load the initial Data list
		if (this.datos)
			this.filteredData.next(this.filtrarScroll(this.datos.slice()));

		// listen for search field value changes
		this.matSelectFilterCtrl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe(() => {
				this.filterData();
			});

		this.matSelectCtrl.valueChanges
			.pipe(takeUntil(this._onDestroy))
			.subscribe((data) => {
				//this.filterData();
				// this.setInitialValue();
				
				//Solo para select de un solo elemento con scroll infinito
				if(!this.multiple && !!this.elementsPerScroll){
					//Buscar el elemento seleccionado
					let index = this.datos.findIndex(item => item == data);
					if(index != -1){
						//Remover el elemento del array de datos
						this.datos.splice(index, 1);
						//Pasar el elemento seleccionado a la primera posición
						this.datos = [data, ...this.datos];
					}
				}
			});
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

	seleccionadosTodos(): boolean {
		if(Number(this.datos?.length) > 1)
			return Number(this.datos?.length) == Number(this.matSelectCtrl?.value?.length);
		return false;
	}
}