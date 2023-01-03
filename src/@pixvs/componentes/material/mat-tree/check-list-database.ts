import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TodoItemNode, TodoItemFlatNode } from './pixvs-mat-tree.component';


/**
 * Checklist database, it can build a tree structured Json object.
 * Each node in Json object represents a to-do item or a category.
 * If a node is a category, it has children items and new items can be added under the category.
 */
@Injectable()
export class ChecklistDatabase {
    dataChange = new BehaviorSubject<TodoItemNode[]>([]);
    checklistSelection: any[] = [];

    get data(): TodoItemNode[] { return this.dataChange.value; }

    constructor() {
        this.initialize({});
    }

    initialize(datos: any) {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        //     file node as children.
        const data = this.buildFileTree(datos, 0);

        // Notify the change.
        this.dataChange.next(data);
    }

    initializeArray(datos: any, campoTexto: string|Array<string>, campoNodosHijos: string) {
        // Build the tree nodes from Json object. The result is a list of `TodoItemNode` with nested
        //     file node as children.
        const data = this.buildFileTreeFromArray(datos, 0, campoTexto, campoNodosHijos);

        // Notify the change.
        this.dataChange.next(data);
    }

    setDataArray(datos: any, campoTexto: string|Array<string>, campoNodosHijos: string) {
        this.initializeArray(datos, campoTexto, campoNodosHijos);
    }

    /**
     * Build the file structure tree. The `value` is the Json object, or a sub-tree of a Json object.
     * The return value is the list of `TodoItemNode`.
     */
    buildFileTree(obj: { [key: string]: any }, level: number): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
            const node = new TodoItemNode();
            node.item = key;

            
            if (value != null) {
                if (typeof value === 'object') {
                    node.children = this.buildFileTree(value, level + 1);
                } else {
                    node.item = value;
                }
            }

            return accumulator.concat(node);
        }, []);
    }

    buildFileTreeFromArray(obj: { [key: string]: any }, level: number, campoTexto: string|Array<string>, campoNodosHijos: string): TodoItemNode[] {
        return Object.keys(obj).reduce<TodoItemNode[]>((accumulator, key) => {
            const value = obj[key];
			const node = new TodoItemNode();
			let valorMostrar = '';
			if(typeof campoTexto == 'string'){
				valorMostrar = value[campoTexto];
			}else{
				campoTexto.forEach(campo => {
					valorMostrar += ' ' + (value[campo] || campo);
				});
				valorMostrar = valorMostrar.substr(1);
			}
            node.item = valorMostrar;
            node.valor = value;
            
            if(value != null && value[campoNodosHijos] && value[campoNodosHijos].length <= 0 && obj[key].selected){
            // if(value != null && obj[key].selected){
                let nodeFlat: TodoItemFlatNode = new TodoItemFlatNode();
                nodeFlat.expandable = false;
                // nodeFlat.expandable = (value[campoNodosHijos]?.length || 0) > 0;
                nodeFlat.level = level;
                nodeFlat.item = valorMostrar; 
                nodeFlat.valor = value;
                this.checklistSelection.push(nodeFlat);
			}
			if(value != null && value[campoNodosHijos] && value[campoNodosHijos].length > 0 && obj[key].selected){
					this.checklistSelection.push(node);
				}


            if (value != null) {
                if (value[campoNodosHijos] && value[campoNodosHijos].length > 0) {
                    node.children = this.buildFileTreeFromArray(value[campoNodosHijos], level + 1, campoTexto, campoNodosHijos);
                }else {
                    node.item = valorMostrar;
                }
            }

            return accumulator.concat(node);
        }, []);
    }

    /** Add an item to to-do list */
    insertItem(parent: TodoItemNode, name: string) {
        if (parent.children) {
            parent.children.push({ item: name } as TodoItemNode);
            this.dataChange.next(this.data);
        }
    }

    updateItem(node: TodoItemNode, name: string) {
        node.item = name;
        this.dataChange.next(this.data);
    }
}