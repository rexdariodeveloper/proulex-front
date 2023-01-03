import { SelectionModel } from '@angular/cdk/collections';
import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Injectable, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChecklistDatabase } from './check-list-database';

/**
 * Node for to-do item
 */
export class TodoItemNode {
	children: TodoItemNode[];
	item: string;
	valor: any;
}

/** Flat to-do item node with expandable and level information */
export class TodoItemFlatNode {
	item: string;
	level: number;
	valor: any;
	expandable: boolean;
	nodoPadre: TodoItemFlatNode;
}

/**
 * @title Tree with checkboxes
 */
@Component({
	selector: 'pixvs-mat-tree',
	templateUrl: './pixvs-mat-tree.component.html',
	styleUrls: ['./pixvs-mat-tree.component.scss'],
	providers: [ChecklistDatabase]
})
export class PixvsMatTreeComponent implements OnInit, OnDestroy {

	@Input() crearNuevosNodos: boolean = false;
	@Input() isDisabled: boolean = false;
	@Input() id: number = null;
	@Input() campoRecuperar: string = 'rolMenu';
	@Input() recuperarTodo: boolean = false;
	@Input() seleccionarPadres: boolean = false;

	/** Subject that emits when the component has been destroyed. */
	protected _onDestroy = new Subject < void > ();

	/** Map from flat node to nested node. This helps us finding the nested node to be modified */
	flatNodeMap = new Map < TodoItemFlatNode, TodoItemNode > ();

	/** Map from nested node to flattened node. This helps us to keep the same object for selection */
	nestedNodeMap = new Map < TodoItemNode, TodoItemFlatNode > ();

	/** A selected parent node to be inserted */
	selectedParent: TodoItemFlatNode | null = null;

	/** The new item's name */
	newItemName = '';

	treeControl: FlatTreeControl < TodoItemFlatNode > ;

	treeFlattener: MatTreeFlattener < TodoItemNode, TodoItemFlatNode > ;

	dataSource: MatTreeFlatDataSource < TodoItemNode, TodoItemFlatNode > ;

	/** The selection for checklist */
	checklistSelection = new SelectionModel < TodoItemFlatNode > (true /* multiple */ );

	constructor(private database: ChecklistDatabase) {
		this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
			this.isExpandable, this.getChildren);
		this.treeControl = new FlatTreeControl < TodoItemFlatNode > (this.getLevel, this.isExpandable);
		this.dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

		database.dataChange.subscribe(data => {
			this.dataSource.data = data;
		});
	}

	ngOnInit() {
		//this.setDatos([]);
	}

	setDatos(datos: any, campoTexto: string | Array < string > = "title", campoNodosHijos: string = "children") {
		this.checklistSelection = new SelectionModel < TodoItemFlatNode > (true, []);
		this.database.setDataArray(datos, campoTexto, campoNodosHijos);
		this.treeControl.dataNodes.forEach(node => {
			if(!node.nodoPadre){
				node.nodoPadre = null;
			}
			let descendants = this.treeControl.getDescendants(node);
			descendants.forEach(descendant => {
				descendant.nodoPadre = node;
			});
		});
		this.checkAll(this.database.checklistSelection);
	}


	ngOnDestroy() {
		this._onDestroy.next();
		this._onDestroy.complete();
	}

	/**
	 * Sets the initial value after the filteredData are loaded initially
	 */
	protected setInitialValue() {

	}

	getLevel = (node: TodoItemFlatNode) => node.level;

	isExpandable = (node: TodoItemFlatNode) => node.expandable;

	getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

	hasChild = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.expandable;

	hasNoContent = (_: number, _nodeData: TodoItemFlatNode) => _nodeData.item === '';

	/**
	 * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
	 */
	transformer = (node: TodoItemNode, level: number) => {
		const existingNode = this.nestedNodeMap.get(node);
		const flatNode = existingNode && existingNode.item === node.item ?
			existingNode :
			new TodoItemFlatNode();
		flatNode.item = node.item;
		flatNode.level = level;
		flatNode.expandable = !!node.children;
		flatNode.valor = node.valor;
		this.flatNodeMap.set(flatNode, node);
		this.nestedNodeMap.set(node, flatNode);
		return flatNode;
	}

	/** Whether all the descendants of the node are selected */
	descendantsAllSelected(node: TodoItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		return descendants.every(child => this.checklistSelection.isSelected(child));
	}

	/** Whether part of the descendants are selected */
	descendantsPartiallySelected(node: TodoItemFlatNode): boolean {
		const descendants = this.treeControl.getDescendants(node);
		const result = descendants.some(child => this.checklistSelection.isSelected(child));
		return result && !this.descendantsAllSelected(node);
	}

	/** Toggle the to-do item selection. Select/deselect all the descendants node */
	todoItemSelectionToggle(node: TodoItemFlatNode): void {
		// console.log('todoItemSelectionToggle',node);
		this.checklistSelection.toggle(node);
		const descendants = this.treeControl.getDescendants(node);
		if (!this.recuperarTodo && this.checklistSelection.isSelected(node)) {
			this.checklistSelection.select(...descendants);
		} else if (!this.checklistSelection.isSelected(node)) {
			this.checklistSelection.deselect(...descendants);
		}
		if(this.seleccionarPadres && !this.checklistSelection.isSelected(node)){
			let nodoPadre = node.nodoPadre;
			while(!!nodoPadre){
				if(!this.checklistSelection.isSelected(nodoPadre)){
					this.checklistSelection.select(nodoPadre);
					nodoPadre = nodoPadre.nodoPadre;
				}else{
					nodoPadre = null;
				}
			}
		}
	}

	/** Select the category so we can insert the new item. */
	addNewItem(node: TodoItemFlatNode) {
		const parentNode = this.flatNodeMap.get(node);
		this.database.insertItem(parentNode!, '');
		this.treeControl.expand(node);
	}

	/** Save the node to database */
	saveNode(node: TodoItemFlatNode, itemValue: string) {
		const nestedNode = this.flatNodeMap.get(node);
		this.database.updateItem(nestedNode!, itemValue);
	}

	permiso(node: TodoItemFlatNode, permiso: string, event: any) {
		if (permiso == 'crear') {
			node.valor.rolMenu.crear = event.checked
			this.selectNodo(node);
		} else if (permiso == 'modificar') {
			node.valor.rolMenu.modificar = event.checked
			this.selectNodo(node);
		} else if (permiso == 'eliminar') {
			node.valor.rolMenu.eliminar = event.checked
			this.selectNodo(node);
		}
	}


	creaRolMenu(node: TodoItemFlatNode) {
		let rolMenu = {
			"id": null,
			"rolId": this.id,
			"nodoId": node.valor.id,
			"crear": false,
			"modificar": false,
			"eliminar": false
		}
	}

	getNodosSeleccionados() {
		let selected: any[] = [];
		this.checklistSelection.selected.forEach(node => {
			if (this.recuperarTodo || !node.expandable) {
				if (this.campoRecuperar) {
					selected.push(node.valor[this.campoRecuperar]);
				} else {
					selected.push(node.valor);
				}
			}
		});
		return selected;
	}

	checkAll(list: any[]) {
		this.treeControl.dataNodes.forEach(node => {
			if (node.valor.selected) {
				this.selectNodo(node);
				// if(this.seleccionarPadres){
				// 	let nodoPadre = node.nodoPadre;
				// 	while(!!nodoPadre){
				// 		if(!this.checklistSelection.isSelected(nodoPadre)){
				// 			this.selectNodo(nodoPadre);
				// 			nodoPadre = nodoPadre.nodoPadre;
				// 		}else{
				// 			nodoPadre = null;
				// 		}
				// 	}
				// }
			}
		});
		this.treeControl.expandAll();
	}

	selectNodo(nodo: TodoItemFlatNode) {
		if (!this.checklistSelection.isSelected(nodo)) {
			this.todoItemSelectionToggle(nodo);
		}
	}

	public tieneMultiplesCaminosSeleccionados(): boolean{
		let totalesNivelesMap: {[nivel:number]: number} = {};
		for(let node of this.checklistSelection.selected){
			if((totalesNivelesMap[node.level] || 0) > 0){
				return true;
			}
			totalesNivelesMap[node.level] = (totalesNivelesMap[node.level] || 0) + 1;
		}
		return false;
	}

	public getNodoSeleccionadoPrincipal() {
		let nivel: number = -1;
		let nodoValor: any = null;
		this.checklistSelection.selected.forEach(node => {
			if(nivel < node.level){
				nivel = node.level;
				if (this.campoRecuperar) {
					nodoValor = node.valor[this.campoRecuperar];
				} else {
					nodoValor = node.valor;
				}
			}
		});
		if(!!nodoValor){
			return [nodoValor];
		}
		return [];
	}

}