import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FieldConfig } from "../field.interface";
@Component({
  selector: "app-radiobutton",
  template: `
    <mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
    	<div class="demo-full-width margin-top" [formGroup]="group" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
    		<label class="radio-label-padding" class="mat-body-2">{{field.label}}</label>
    		<br>
    			<label class="radio-label-padding" *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
    			<br>
    				<mat-radio-group [ngStyle]="field.verticalList? {'display':'flex', 'flex-direction': 'column'} : {}" [formControlName]="field.name">
    					<mat-radio-button *ngFor="let item of field.options" [value]="item" (change)="onChange($event.value)">
    						<span>
    							<p style="white-space: pre-wrap">{{(field.custom && isOtro(item[field.campoValor]) )? '' : (item[field.campoValor] || item)}}</p>
    						</span>
    						<input *ngIf="!!field.custom && isOtro(item[field.campoValor])" matInput [formControl]="customControl" [type]="text" [placeholder]="field.placeholder">
    							<input *ngIf="mostrarInput && item.solicitarCampoTexto" matInput [formControl]="customControlTexto" [type]="text" [placeholder]="field.placeholder">
    							</mat-radio-button>
    						</mat-radio-group>
    						<div *ngIf="!!group.get(field.name).touched">
    							<ng-container *ngFor="let validation of field.validations;" ngProjectAs="mat-error">
    								<mat-error *ngIf="group.get(field.name).hasError(validation.name)">{{validation.message}}</mat-error>
    							</ng-container>
    						</div>
    					</div>
    				</mat-card>
    				<div *ngIf="!field.isMatCard">
    					<div class="demo-full-width margin-top" [formGroup]="group" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
    						<label class="radio-label-padding" class="mat-body-2">{{field.label}}</label>
    						<br>
    							<label class="radio-label-padding" *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
    							<br>
    								<mat-radio-group [ngStyle]="field.verticalList? {'display':'flex', 'flex-direction': 'column'} : {}" [formControlName]="field.name">
    									<mat-radio-button *ngFor="let item of field.options" [value]="item" (change)="onChange($event.value)">
    										<span>{{(field.custom && isOtro(item[field.campoValor]) )? '' : (item[field.campoValor] || item)}}</span>
    										<input *ngIf="!!field.custom && isOtro(item[field.campoValor])" matInput [formControl]="customControl" [type]="text" [placeholder]="field.placeholder">
    										</mat-radio-button>
    									</mat-radio-group>
    								</div>
    							</div>
    							<br>`,
  styles: []
})
export class RadiobuttonComponent implements OnInit {
  field: FieldConfig;
  group: FormGroup;
  customControl: FormControl;
  customControlTexto: FormControl;
  _unsubscribeAll: Subject<any>;
  mostrarInput: Boolean = false;
  constructor() {
    this._unsubscribeAll = new Subject();
  }
  ngOnInit() {
    this.customControl = new FormControl('Otro', []);
    this.customControlTexto = new FormControl('SolicitarTexto', []);

    if (this.field.customNinguna) {
      let pregunta = Number(this.field.name.replace('pregunta', ''));
      let opcion = {
        id: null,
        opcion: "Ninguna de las anteriores",
        orden: this.field.options.length + 1,
        ponderacion: null,
        preguntaId: pregunta,
        saltoCierre: null,
        saltoDePregunta: null,
        saltoPregunta: null,
        solicitarCampoTexto: false,
      }
      this.field.options.push(opcion);
    }
    this.customControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      if (this.group) {
        let current = this.group.get(this.field.name).value;
        if (current) {
          if (value)
            current['otro'] = value;
          else {
            delete current['otro'];
          }
        }
      }
    });

    this.customControlTexto.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((value) => {
      if (this.group) {
        let current = this.group.get(this.field.name).value;
        if (current) {
          if (value)
            current['texto'] = value;
          else
            delete current['texto'];
        }
      }
    });

    this.customControl.disable();
    this.customControlTexto.disable();
    //this.customControlTexto.value();
  }

  onChange(value) {
    if (!value)
      return;
    if (!!this.field.custom && this.isOtro(value[this.field.campoValor]) && !this.customControl.enabled) {
      this.customControl.enable();
      this.customControl.setValue(null);
    }
    else if (!this.customControl.disabled) {
      this.customControl.disable();
      this.customControl.setValue('Otro');
    }
    if (value.solicitarCampoTexto) {
      // if (!!this.field.custom && this.isSolicitarCampoTexo(value[this.field.campoValor]) && !this.customControlTexto.enabled) {
      this.mostrarInput = true;
      this.customControlTexto.enable();
      this.customControlTexto.setValue(null);
    }
    else if (!this.customControlTexto.disabled) {
      this.customControlTexto.disable();
      this.mostrarInput = false;
    }
  }

  isOtro(value) {
    return value.toUpperCase() === 'OTRO';
  }

  isSolicitarCampoTexo(value) {
    return value.toUpperCase() === 'TEXTO';
  }
}
