import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Component, ElementRef, ViewChild, Input, OnInit, AfterContentChecked, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

/**
 * Node for to-do item
 */
export class TodoItemNode {
	children: TodoItemNode[];
	item: string;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
	item: string;
	level: number;
	expandable: boolean;
}

@Component({
	selector: 'pixvs-mat-chip-autocomplete',
	templateUrl: './pixvs-mat-chip-autocomplete.component.html',
	styleUrls: ['./pixvs-mat-chip-autocomplete.component.scss']
})
export class PixvsMatChipAutocompleteComponent {

	/** list of Data */
	@Input() datos: any[] = [];
	@Input() selectedElements: any[] = [];

	/** control for the selected Data */
	@Input("matCtrl") public formControl: FormControl = new FormControl();
	public matCtrl: FormControl = new FormControl();

	//matFormFieldFppearance
	@Input() appearance: string = null;
	@Input() matError: string = "";
	@Input() required: boolean = false;
	@Input() campoValor: string = "nombre";
	@Input() campoValor2: string = null;
	@Input() label: string = "Campo";
	@Input() placeholder: string = "Nuevo...";
	@Input() permitirAgregar: boolean = false;
	@Input() manualDisable: boolean = false;

	visible = true;
	selectable = true;
	removable = true;
	separatorKeysCodes: number[] = [ENTER, COMMA];
	filteredElements: Observable < string[] > ;


	@ViewChild('elementInput') elementInput: ElementRef < HTMLInputElement > ;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	@ViewChild('chipList') chipList: MatChipList;

	constructor() {

		this.filteredElements = this.matCtrl.valueChanges.pipe(
			startWith(''),
			map((element: string | null) => {
				return element ? this._filter(element) : this.datos.slice();
			}));
	}


	ngOnInit() {
		this.setManualFormControlEnable();
		this.matCtrl.statusChanges.subscribe(
			status => {
				this.chipList.disabled = !this.matCtrl.enabled;
				this.chipList.errorState = status === 'INVALID';
			}
		);

		
	}

	ngAfterContentChecked() {
		if (this.chipList)
			this.chipList.disabled = !this.matCtrl.enabled;
	}

	ngOnChanges(changes: SimpleChanges): void {
		if(changes.manualDisable){
			this.manualDisable = changes.manualDisable.currentValue;
			this.setManualFormControlEnable();
		}
	}

	add(event: MatChipInputEvent): void {

		const input = event.input;
		const value = event.value;

		if (!this.permitirAgregar) {
			if (input) {
				input.value = '';
			}
			this.formControl.setValue(this.selectedElements);
			this.formControl.updateValueAndValidity();
			this.matCtrl.setValue(null);
			this.matCtrl.updateValueAndValidity();
			this.elementInput.nativeElement.blur();
			return;
		}

		// Add our element
		if ((value || '').trim()) {
			this.selectedElements.push(value.trim());
		}

		// Reset the input value
		if (input) {
			input.value = '';
		}

		this.elementInput.nativeElement.blur();
	}

	remove(element: any): void {
		const index = this.selectedElements.findIndex(x => x.id === element.id);

		if (index >= 0) {
			this.selectedElements.splice(index, 1);
			this.formControl.setValue(this.selectedElements);
			this.formControl.updateValueAndValidity();
			this.matCtrl.setValue(null);
			this.matCtrl.updateValueAndValidity();
		}
		this.elementInput.nativeElement.blur();
	}

	selected(event: MatAutocompleteSelectedEvent): void {
		if (this.selectedElements.findIndex(x => x.id === event.option.value.id) >= 0) {
			this.elementInput.nativeElement.value = '';
		} else {

			this.selectedElements.push(event.option.value);
			this.elementInput.nativeElement.value = '';

			this.formControl.setValue(this.selectedElements);
			this.formControl.updateValueAndValidity();
			this.matCtrl.setValue(null);
			this.matCtrl.updateValueAndValidity();


			/*
			//TODO
			//Borrar las ya seleccionadas
			this.allFruits.splice(0, 1);
			*/

		}
		this.elementInput.nativeElement.blur();
	}

	private _filter(value: any): string[] {
		let filterValue: string;
		if(typeof value == 'string'){
			filterValue = (value || '').toLowerCase();
		}else if (!!this.campoValor2) {
			filterValue = value[this.campoValor][this.campoValor2].toLowerCase();
		} else {
			filterValue = this.campoValor ? value[this.campoValor].toLowerCase(): value.toLowerCase();
		}

		return this.datos.filter(element => {
			let valorEvaluar: string;
			if (!!this.campoValor2) {
				valorEvaluar = element[this.campoValor][this.campoValor2];
			} else {
				valorEvaluar = element[this.campoValor];
			}
			return valorEvaluar.toLowerCase().indexOf(filterValue) === 0
		});
	}

	drop(event: CdkDragDrop < any[] > ) {
		moveItemInArray(this.selectedElements, event.previousIndex, event.currentIndex);
		this.formControl.setValue(this.selectedElements);
		this.formControl.updateValueAndValidity();
	}

	setManualFormControlEnable(){
		if(this.manualDisable){
			this.formControl.disable();
		}else{
			this.formControl.enable();
		}
	}
}