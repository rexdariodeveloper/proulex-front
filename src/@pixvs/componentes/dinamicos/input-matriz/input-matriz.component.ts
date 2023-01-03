import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";
@Component({
	selector: "app-input-matriz",
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
        						<div fxHide.xs="true" fxHide.lg="false" style="aling-items: center;">
        							<table style="border-radius: 15px 0 15px 0;">
        								<th></th>
        								<th *ngFor="let col of field.columnas" style="text-align: center;">{{ col?.opcion }}</th>
        								<tr *ngFor="let fila of field.list">
        									<th style="text-align: center;">{{fila.opcion}}</th>
        									<td *ngFor="let col of field.columnas" style="text-align: center;border: black 1px solid;">
        										<input matInput (input)="onInputChange($event, fila.id, col.id)">
        										</td>
        									</tr>
        								</table>
        							</div>
        							<div fxHide.xs="false" fxHide.lg="true" style="aling-items: center;">
        								<mat-accordion [multi]="true" class="example-headers-align">
        									<mat-expansion-panel *ngFor="let fila of field.list">
        										<mat-expansion-panel-header>
        											<mat-panel-title>{{fila?.opcion}}</mat-panel-title>
        										</mat-expansion-panel-header>
        										<tr *ngFor="let col of field.columnas">
        											<mat-form-field class="example-full-width">
        												<mat-label>{{ col?.opcion }}</mat-label>
        												<input matInput (input)="onInputChange($event, fila.id, col.id)">
        												</mat-form-field>
        											</tr>
        										</mat-expansion-panel>
        									</mat-accordion>
        								</div>
        								<br>
        								</div>
        							</div>
        							<mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        								<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        									<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        									<br>
        										<br>
        											<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        											<br>
        												<div style="display: none;">
        													<input matInput [formControlName]="field.name">
        													</div>
        													<div fxHide.lt-sm="true" style="aling-items: center;">
        														<table style="width: 100%;border: 1px solid #000;">
        															<th></th>
        															<th *ngFor="let col of field.columnas" style="text-align: center;vertical-align: center;width: 20%;height: auto;">{{ col?.opcion }}</th>
        															<tr *ngFor="let fila of field.list">
        																<th style="text-align: center;vertical-align: center;font-size:10px; width: 20%;height: auto;">{{fila.opcion}}</th>
        																<td *ngFor="let col of field.columnas" style="text-align: center;border: black 0.5px solid; border-color: #a59494;">
        																	<div *ngIf="activo(fila.id,col.id)">
        																		<input matInput (input)="onInputChange($event, fila.id, col.id)">
        																		</div>
        																		<div *ngIf="!activo(fila.id,col.id)">
        																			<input matInput disabled (input)="onInputChange($event, fila.id, col.id)">
        																			</div>
        																		</td>
        																	</tr>
        																</table>
        															</div>
        															<div fxHide.sm="true" fxHide.gt-sm="true" style="aling-items: center;">
        																<mat-accordion [multi]="true" class="example-headers-align">
        																	<mat-expansion-panel *ngFor="let fila of field.list">
        																		<mat-expansion-panel-header>
        																			<mat-panel-title>{{fila?.opcion}}</mat-panel-title>
        																		</mat-expansion-panel-header>
        																		<tr *ngFor="let col of field.columnas">
        																			<mat-form-field class="example-full-width">
        																				<mat-label>{{ col?.opcion }}</mat-label>
        																				<div *ngIf="activo(fila.id,col.id)">
        																					<input matInput (input)="onInputChange($event, fila.id, col.id)">
        																					</div>
        																					<div *ngIf="!activo(fila.id,col.id)">
        																						<input matInput disabled (input)="onInputChange($event, fila.id, col.id)">
        																						</div>
        																					</mat-form-field>
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
        																<br>`,
	styles: []
})
export class InputMatrizComponent implements OnInit {
	field: FieldConfig;
	group: FormGroup;
	values: any[];
	valorEscrito: any;
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

	onInputChange(event, filaId, columnaId) {
		this.valorEscrito = event.target.value;
		let comparador = this.values.findIndex((v) => v.filaId == filaId && v.columnaId == columnaId);
		if (this.field.limitarPorFila)
			this.bloquearFila(filaId, columnaId);
		if (this.field.limitarPorColumna)
			this.bloquearColumna(filaId, columnaId);
		if (comparador != -1) {
			if (this.values[comparador].respuesta != this.valorEscrito)
				this.values[comparador].respuesta = this.valorEscrito;
		} else {
			this.values.push({ filaId: filaId, columnaId: columnaId, respuesta: this.valorEscrito });
		}
		this.values = [...this.values.filter((v) => { return v.respuesta.trim() != "" })];
		if (this.valorEscrito == "")
			this.reactivar(filaId, columnaId);
		this.group.get(this.field.name).setValue(this.values);
	}

	activo(fila, columna) {
		let activo = false;
		let valor = this.valores.find(v => v.filaId == fila && v.columnaId == columna);
		activo = valor.activo;
		return activo;
	}

	bloquearColumna(filaId, columnaId) {
		if (this.field.limitarPorColumna) {
			this.valores.forEach(c => {
				if (c.columnaId == columnaId) {
					if (c.filaId != filaId)
						c.activo = false;
				}
			});
		}
	}

	bloquearFila(filaId, columnaId) {
		if (this.field.limitarPorFila) {
			this.valores.forEach(f => {
				if (f.filaId == filaId) {
					if (f.columnaId !== columnaId)
						f.activo = false;
				}
			});
		}
	}

	reactivar(filaId, columnaId) {
		let comparador = this.values.findIndex((v) => v.filaId == filaId && v.columnaId == columnaId);
		if (comparador == -1) {
			if (this.field.limitarPorColumna && this.field.limitarPorFila) {
				this.valores.forEach(v => {
					if (v.columnaId == columnaId) 
						v.activo = true;
				});
				this.values.forEach(va=>{
					this.bloquearFila(va.filaId, va.columnaId);
					this.bloquearColumna(va.filaId, va.columnaId);
				});
			}
			else{
				if (this.field.limitarPorColumna){
					this.valores.forEach(v => {
						if (v.columnaId == columnaId) 
							v.activo = true;
					});
				}
				if (this.field.limitarPorFila) {
					this.valores.forEach(v => {
						if (v.filaId == filaId) 
							v.activo = true;
					});
				}
			}
		}
	}
}