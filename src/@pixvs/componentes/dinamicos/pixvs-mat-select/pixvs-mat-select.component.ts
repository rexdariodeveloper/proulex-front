import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";
@Component({
	selector: "app-pixvs-mat-select",
	template: `
        <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        	<div class="mt-0 pt-0" [formGroup]="group" style="flex-direction: column;" [hidden]="(field?.hideOnDisabled && field.formControl.disabled) || field?.hidden">
        		<label *ngIf="!!field.labelMain" class="mat-body-2">{{field.labelMain}}</label>
        		<br>
        			<label *ngIf="!!field.description" style="color: #000000;">{{field.description}}</label>
        			<pixvs-mat-select-simple [matSelectCtrl]="field.formControl" [datos]="field.list" [appearance]="'standard'" [multiple]="field.multiple" [selectAll]="field.selectAll" [showToggleAllCheckbox]="field.multiple" [matError]="'ERRORES_CAPTURA.CAMPO_REQUERIDO' | translate" [campoValor]="field.values || field.campoValor" [label]="field.label" [required]="false" [elementsPerScroll]="field.elementsPerScroll" fxFlex="1 0 auto" [showToolTip]="field.showToolTip"></pixvs-mat-select-simple>
        		</div>
				<div *ngIf="!group.get(field.name).value && !!group.get(field.name).touched"> <ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error"><mat-error>{{validation.message}}</mat-error></ng-container></div>
        	</mat-card>
        	<div *ngIf="!field.isMatCard" [ngStyle]="{'display':field?.hidden? 'none' : ''}">
        		<div class="mt-0 pt-0" [formGroup]="group" style="flex-direction: column;" [hidden]="field?.hideOnDisabled && field.formControl.disabled">
        			<label *ngIf="!!field.labelMain" class="mat-body-2">{{field.labelMain}}</label>
        			<br>
        				<label *ngIf="!!field.description" style="color: #000000;">{{field.description}}</label>
        				<pixvs-mat-select-simple [matSelectCtrl]="field.formControl" [datos]="field.list" [appearance]="'standard'" [multiple]="field.multiple" [selectAll]="field.selectAll" [showToggleAllCheckbox]="field.multiple" [matError]="'ERRORES_CAPTURA.CAMPO_REQUERIDO' | translate" [campoValor]="field.values || field.campoValor" [label]="field.label" [required]="false" [elementsPerScroll]="field.elementsPerScroll" fxFlex="1 0 auto" [showToolTip]="field.showToolTip"></pixvs-mat-select-simple>
        			</div>
        		</div>
        		<br>`,
	styles: []
})
export class PixvsMatSelectComponent implements OnInit {
	field: FieldConfig;
	group: FormGroup;
	valido: Boolean;
	mensaje: string;
	constructor() { }
	ngOnInit() {

	}
}


// <mat-form-field class="demo-full-width margin-top" [formGroup]="group">
// <mat-select [placeholder]="field.label" [formControlName]="field.name">
// <mat-option *ngFor="let item of field.options" [value]="item">{{item}}</mat-option>
// </mat-select>
// </mat-form-field>