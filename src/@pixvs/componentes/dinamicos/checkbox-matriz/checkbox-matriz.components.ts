import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";
@Component({
	selector: "app-checkbox-matriz",
	template: `
        <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        	<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        		<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        		<br>
        			<br>
        				<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        				<br>
        					<div style="display: none;">
        						<mat-checkbox [formControlName]="field.name"></mat-checkbox>
        					</div>
        					<div fxHide.lt-sm="true" style="aling-items: center;">
        						<table style="border-radius: 15px 0 15px 0; width: 100%;							              border: 1px solid #000;">
        							<th></th>
        							<th *ngFor="let col of field.columnas" style="text-align: center;vertical-align: center;width: 25%;height: auto;">{{ col?.opcion }}</th>
        							<tr *ngFor="let fila of field.list">
        								<th style="text-align: center;vertical-align: center;font-size:10px; width: 25%;height: auto;">{{fila?.opcion}}</th>
        								<td *ngFor="let col of field.columnas" style="text-align: center;vertical-align: center;">
        									<div *ngIf="habilitar( fila.id, col.id)">
        										<mat-checkbox (change)="onCheckboxChange($event.checked, fila.id, col.id)"></mat-checkbox>
        									</div>
        									<div *ngIf="!habilitar( fila.id, col.id)">
        										<mat-checkbox [disabled]="true"></mat-checkbox>
        									</div>
        								</td>
        							</tr>
        						</table>
        					</div>
        					<div fxHide.sm="true" fxHide.gt-sm="true" style="aling-items: center;">
        						<mat-accordion [multi]="true" class="example-headers-align">
        							<mat-expansion-panel [expanded]="true" *ngFor="let fila of field.list">
        								<mat-expansion-panel-header>
        									<mat-panel-title>{{fila?.opcion}}</mat-panel-title>
        								</mat-expansion-panel-header>
        								<tr *ngFor="let col of field.columnas">
        									<div *ngIf="habilitar( fila.id, col.id)">
        										<mat-checkbox (change)="onCheckboxChange($event.checked, fila.id, col.id)"></mat-checkbox>{{ col?.opcion }}
        									</div>
        									<div *ngIf="!habilitar( fila.id, col.id)">
        										<mat-checkbox [disabled]="true"></mat-checkbox>{{ col?.opcion }}
        									</div>
        								</tr>
        							</mat-expansion-panel>
        						</mat-accordion>
        					</div>
        					<br>
        						<div *ngIf="!!group.get(field.name).touched">
        							<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
        								<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        							</ng-container>
        						</div>
        					</div>
        				</mat-card>
        				<div *ngIf="!field.isMatCard">
        					<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        						<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        						<br>
        							<br>
        								<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        								<br>
        									<div style="display: none;">
        										<mat-checkbox [formControlName]="field.name"></mat-checkbox>
        									</div>
        									<div fxHide.xs="true" fxHide.lg="false" style="aling-items: center;">
        										<table style="border-radius: 15px 0 15px 0;">
        											<th></th>
        											<th *ngFor="let col of field.columnas" style="text-align: center;">{{ col?.opcion }}</th>
        											<tr *ngFor="let fila of field.list">
        												<th style="text-align: center;">{{fila?.opcion}}</th>
        												<td *ngFor="let col of field.columnas" style="text-align: center;">
        													<mat-checkbox (change)="onCheckboxChange($event.checked, fila.id, col.id)"></mat-checkbox>
        												</td>
        											</tr>
        										</table>
        									</div>
        									<div .hidden-xs="false" style="aling-items: center;">
        										<mat-accordion [multi]="true" class="example-headers-align">
        											<mat-expansion-panel [expanded]="true" *ngFor="let fila of field.list">
        												<mat-expansion-panel-header>
        													<mat-panel-title>{{fila?.opcion}}</mat-panel-title>
        												</mat-expansion-panel-header>
        												<tr *ngFor="let col of field.columnas">
        													<mat-checkbox (change)="onCheckboxChange($event.checked, fila.id, col.id)"></mat-checkbox>{{ col?.opcion }}
        												</tr>
        											</mat-expansion-panel>
        										</mat-accordion>
        									</div>
        									<br>
        									</div>
        								</div>
        								<br>`,
	styles: []
})
export class CheckboxMatrizComponent implements OnInit {
	field: FieldConfig;
	group: FormGroup;
	values: any[];
	valores: any[] = [];
	constructor() { }
	ngOnInit() {
		this.values = [];
		this.field.list.forEach((p) => {
			let obj = {};
			this.field.columnas.forEach(c => {
				obj = { filaId: p.id, columnaId: c.id, activo: true };
				this.valores.push(obj);
			})
		});
	}

	onCheckboxChange(valor, filaId, columnaId, i, j) {
		if (valor) {
			if (this.field.limitarPorColumna || this.field.limitarPorFila) {
				if (this.field.limitarPorColumna) {
					this.valores.forEach(c => {
						if (c.columnaId == columnaId) {
							if (c.filaId != filaId)
								c.activo = false;
						}
					});
				}
				if (this.field.limitarPorFila) {
					this.valores.forEach(f => {
						if (f.filaId == filaId) {
							if (f.columnaId !== columnaId)
								f.activo = false;
						}
					});
				}
			}
			this.values.push({ filaId: filaId, columnaId: columnaId });
		}
		else {
			if (this.field.limitarPorColumna || this.field.limitarPorFila) {
				if (this.field.limitarPorColumna) {
					this.valores.forEach(c => {
						if (c.columnaId == columnaId) {
							if (c.filaId != filaId)
								c.activo = true;
						}
					});
				}
				if (this.field.limitarPorFila) {
					this.valores.forEach(f => {
						if (f.filaId == filaId) {
							if (f.columnaId !== columnaId)
								f.activo = true;
						}
					});
				}
			}
			this.values = [...this.values.filter((v) => { return v.filaId != filaId || v.columnaId != columnaId })];
		}
		this.group.get(this.field.name).setValue(this.values);
	}

	habilitar(filaId, columnaId) {
		if (this.values.length > 0) {
			let index = this.valores.find(v => columnaId == v.columnaId && filaId == v.filaId);
			return index.activo;
		}
		else
			return true;
	}
}