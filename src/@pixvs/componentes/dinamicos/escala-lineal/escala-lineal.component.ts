import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FieldConfig } from "../field.interface";
@Component({
    selector: "app-escala-lineal",
    template: `
        <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        	<div class="demo-full-width margin-top" [formGroup]="group" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        		<label class="radio-label-padding" class="mat-body-2">{{field.label}}</label>
        		<br>
        			<label class="radio-label-padding" *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        			<br>
        				<mat-radio-group [ngStyle]="field.verticalList? {'display':'flex', 'flex-direction': 'column'} : {'display':'flex','margin-left': '16px'}" [formControlName]="field.name">
        					<table fxFlex.lg="0 0 calc(33% - 10px)" fxFlex="0 0 calc(50%-10px)">
        						<tr>
        							<th></th>
        							<th *ngFor="let item of field.options" style="font-size: 12px;text-align: center;align-items: center;">
        								<span>{{(field.custom && isOtro(item[field.campoValor]) )? '' : (item[field.campoValor] || '0')}}</span>
        							</th>
        							<th></th>
        						</tr>
        						<tr>
        							<th style="width=25%" [ngStyle]="{'font-size': wScreen < 500 ? '8px' : '12px'}">
        								<label style="margin-right: 1px;margin-left: -20px;">{{field.etiquetaInicio}}</label>
        								<!--Malo-->
        							</th>
        							<th *ngFor="let item of field.options" style="font-size: 12px;text-align: center;align-items: center;width=25%">
        								<mat-radio-button [value]="item" (change)="onChange($event.value)"></mat-radio-button>
        							</th>
        							<th style="width=25%" [ngStyle]="{'font-size': wScreen < 500 ? '8px' : '12px'}">
        								<label style="margin-right: 16px;display: contents;">{{field.etiquetaFin}}</label>
        								<!--Excelente-->
        							</th>
        						</tr>
        					</table>
        					<!--<input *ngIf="!!field.custom && isOtro(item[field.campoValor])" matInput [formControl]="customControl" [type]="text" [placeholder]="field.placeholder">-->
        				</mat-radio-group>
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
export class EscalaLinealComponent implements OnInit {
    field: FieldConfig;
    group: FormGroup;
    customControl: FormControl;
    _unsubscribeAll: Subject<any>;
    wScreen: number;
    constructor() {
        this._unsubscribeAll = new Subject();
    }
    ngOnInit() {

        this.customControl = new FormControl('Otro', []);

        this.customControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
            if (this.group) {
                let current = this.group.get(this.field.name).value;
                if (current) {
                    if (value)
                        current['otro'] = value;
                    else
                        delete current['otro'];
                }
            }
        });

        this.customControl.disable();
        this.wScreen = window.screen.width;
    }

    onChange(value) {
        if (!value)
            return;
        if (!!this.field.custom && this.isOtro(value[this.field.campoValor]) && !this.customControl.enabled) {
            this.customControl.enable();
            this.customControl.setValue(null);
        }
        else if (!this.customControl.disabled)
            this.customControl.disable();
    }

    isOtro(value) {
        return value.toUpperCase() === 'OTRO';
    }
}