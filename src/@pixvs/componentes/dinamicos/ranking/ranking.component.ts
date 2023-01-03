import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FieldConfig } from "../field.interface";
@Component({
    selector: "app-ranking",
    template: `
        <div *ngIf="!field.isMatCard">
        	<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        		<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        		<br>
        		<br>
        		<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        		<br>
                <div style="display: none;">
                    <input matInput [formControlName]="field.name">
                </div>
                <div  style="aling-items: center;">
                    <table style="border-radius: 15px 0 15px 0;">
                        <th></th>
                        <th style="text-align: center;">Opción</th>
                        <tr *ngFor="let fila of field.columnas">
                            <th style="text-align: center;">{{fila.opcion}}</th>
        					<td *ngFor="let col of field.columnas" style="text-align: center;border: black 1px solid;">
        						<input matInput (input)="onInputChange($event, fila.id)">
        					</td>
                        </tr>
                    </table>
                </div>
        	</div>
        </div>
        <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        	<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
                <label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
                <br>
                <br>
                <label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
                <br>  
                <div  style="aling-items: center; padding: 0 20% 0 0;">
                    <table style="border-radius: 15px 0 15px 0;width: 100%;">
                        <th></th>
                        <th style="text-align: center;">Opción</th>
                        <tr *ngFor="let fila of field.columnas">
                            <th style="text-align: center;width: 60%;">{{fila.opcion}}</th>
                            <td style="text-align: center;border: black 0.5px solid; border-color: #a59494; width: 40%;">
                                <input matInput (input)="onInputChange($event, fila.id, null)" type="number" [min]="field.min" [max]="field?.max">
                            </td>
                        </tr>
                    </table>
                </div>
                <br>
        		<div *ngIf="!!group.get(field.name).touched">
        		    <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
        				<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        			</ng-container>
        		</div>
            </div>
        </mat-card>
        <br>`,
    styles: []
})
export class RankingComponent implements OnInit {
    field: FieldConfig;
	group: FormGroup;
	values: any[];
	valorEscrito: any;
    repetido: any;
	constructor() { }
    ngOnInit() {
        this.values = [];
    }

    onInputChange(event, filaId, columnaId) {
		this.valorEscrito = event.target.value;
		let comparador = this.values.findIndex((v) => v.filaId == filaId && v.columnaId == columnaId)

		if (comparador != -1) {
			if (this.values[comparador].respuesta != this.valorEscrito)
				this.values[comparador].respuesta = this.valorEscrito;
		} else {
			this.values.push({ filaId: filaId, columnaId: columnaId, respuesta: this.valorEscrito });
		}
		this.values = [...this.values.filter((v) => { return v.respuesta.trim() != "" })];
        
		this.group.get(this.field.name).setValue(this.values);
	}

}