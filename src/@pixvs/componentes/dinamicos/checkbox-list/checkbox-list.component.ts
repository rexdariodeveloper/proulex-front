import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { FieldConfig } from "../field.interface";
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';

@Component({
	selector: "app-checkbox-list",
	template: `
        <div *ngIf="!field.isMatCard">
        	<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        		<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        		<br>
        			<br>
        				<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        				<mat-list>
        					<mat-list-item style="display: none;">
        						<mat-checkbox [formControlName]="field.name"></mat-checkbox>
        					</mat-list-item>
        					<mat-list-item class="h-24" *ngFor="let item of field.list">
        						<mat-checkbox (change)="onCheckboxChange($event.checked, item)">{{item[field.campoValor]}}</mat-checkbox>
        					</mat-list-item>
        				</mat-list>
        			</div>
        		</div>
        		<mat-card *ngIf="field.isMatCard" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);  transition: 0.3s;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'">
        			<div class="demo-full-width margin-top" [formGroup]="group" style="flex-direction: column;" [style.visibility]="(field?.hideOnDisabled && group.get(field.name).disabled)? 'hidden': 'visible'" [ngClass]="{'h-0': (field?.hideOnDisabled && group.get(field.name).disabled)}">
        				<label *ngIf="!!field.label" class="mat-body-2">{{field.label}}:</label>
        				<br>
        					<br>
        						<label *ngIf="!!field.description" style="color: #B8B0B0;opacity: 0.9;">{{field.description}}</label>
        						<mat-list>
        							<mat-list-item style="display: none;">
        								<mat-checkbox [formControlName]="field.name"></mat-checkbox>
        							</mat-list-item>
        							<mat-list-item class="h-5" *ngFor="let item of field.list">
        								<mat-checkbox (change)="onCheckboxChange($event.checked, item)" [disabled]="item.deshabilitar" [checked]="item.checked">
        									<p style="white-space: pre-wrap;height: auto;width: 100%;">{{(item[field.campoValor])}}
        										<p>
        										</mat-checkbox>
        									</mat-list-item>
        								</mat-list>
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
export class CheckboxListComponent implements OnInit {
	field: FieldConfig;
	group: FormGroup;
	values: any[];
	customControl: FormControl;
	_unsubscribeAll: Subject<any>;
	habilitar: Boolean = false;
	constructor(
		private _translateService: TranslateService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		) {
		this._unsubscribeAll = new Subject();
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);
	}
	ngOnInit() {

		this.field.list.forEach(p => {
			p['deshabilitar'] = false;
			p['checked'] = false;
		});

		if (this.field.customNinguna){
			let pregunta = Number(this.field.name.replace('pregunta', ''));
			let opcion = {
				id: null,
				opcion: this._translateService.instant('NINGUNO_DE_LOS_ANTERIORES'),
				orden: this.field.list.length + 1,
				ponderacion: null,
				preguntaId: pregunta,
				saltoDePregunta: null,
				saltoPregunta: null,
				deshabilitar: false,
				checked: false
			}
			this.field.list.push(opcion);
		}

		let indices = [];
		this.field.list?.forEach((a, key) => {
			if (a.opcion == this._translateService.instant('NINGUNO_DE_LOS_ANTERIORES')) {
				indices.push(key);
			}
			if(indices.length > 1){
				let index = indices[0];
				this.field.list.splice(index,1);
			}
		});
		this.values = [];
	}

	onCheckboxChange(value: boolean, item: any) {
		if (value) {
			this.values.push(item);
			this.field.list.forEach(a => {
				if (a.id == item.id)
					a.checked = value;
			})
			if (item.id == null) {
				this.values = [];
				this.values.push(item);
				this.field.list.forEach(a => {
					if (a.id !== null) {
						a.deshabilitar = true;
						a.checked = !value;
					} else 
						a.checked = value;
				})
			}
		}
		else {
			this.values = [...this.values.filter(v => v.id != item.id)];
			this.field.list.forEach(a => {
				a.deshabilitar = false;
			})
		}

		this.group.get(this.field.name).setValue(this.values);
	}
}