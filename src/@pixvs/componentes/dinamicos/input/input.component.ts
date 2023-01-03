import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";
@Component({
	selector: "app-input",
	template: `
        <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        	<mat-form-field class="mt-0" floatLabel="auto" fxFlex="1 0 auto" [formGroup]="group" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        		<label *ngIf="!!field.labelMain" class="mat-body-2">{{field.labelMain}}</label>
        		<br>
        			<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        			<mat-label>{{field.label}}</mat-label>
        			<br>
        				<input matInput style="color: #000000;" [formControlName]="field.name" [type]="field.inputType" [mask]="field.mask" [thousandSeparator]="field.thousandSeparator || ','" [readonly]="field.readonly || false" [placeholder]="field.placeholder" [min]="field.min" [pattern]="field.pattern" [step]="field.step" autocomplete="new-password">
        					<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
        						<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        					</ng-container>
        					</mat-form-field>
        				</mat-card>
        				<div *ngIf="!field.isMatCard">
        					<mat-form-field class="mt-0" floatLabel="auto" fxFlex="1 0 auto" [formGroup]="group" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        						<label *ngIf="!!field.labelMain" class="mat-body-2">{{field.labelMain}}</label>
        						<br>
        							<label *ngIf="!!field.description" style="color: #000000;opacity: 0.9;">{{field.description}}</label>
        							<mat-label>{{field.label}}</mat-label>
        							<br>
        								<input matInput [formControlName]="field.name" [type]="field.inputType" [mask]="field.mask" [thousandSeparator]="field.thousandSeparator || ','" [readonly]="field.readonly || false" [placeholder]="field.placeholder" [min]="field.min" [pattern]="field.pattern" [step]="field.step" >
        									<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
        										<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
        									</ng-container>
        								</mat-form-field>
        							</div>
        							<br>`,
	styles: []
})
export class InputComponent implements OnInit {
	field: FieldConfig;
	group: FormGroup;
	constructor() { }
	ngOnInit() {
	}
}
