import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatButton } from "@angular/material/button";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import Calendar from "js-year-calendar";
import CalendarDataSourceElement from "js-year-calendar/dist/interfaces/CalendarDataSourceElement";
import CalendarOptions from "js-year-calendar/dist/interfaces/CalendarOptions";
import { Subject } from "rxjs";

@Component({
	selector: 'pixvs-stepper-vertical',
	templateUrl: './stepper.component.html',
	styleUrls: ['./stepper.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsStepperVerticalComponent implements OnInit {

	// @Inputs
	@Input() pasos: string[];
	@Input() contenedorFicha: HTMLElement;
	@Input() pasoCurrent: number;

	// @Outputs
	@Output() onPaso: EventEmitter<number> = new EventEmitter();

	// public
	pasoActual: number = 0;
	@ViewChild("botonAnterior") botonAnterior: MatButton;
	@ViewChild("botonSiguiente") botonSiguiente: MatButton;

	private _unsubscribeAll: Subject<any>;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		public dialog: MatDialog,
		private translate: TranslateService,
		private hashid: HashidsService,
		private router: Router
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
	}

	ngAfterViewInit(): void {
		console.log('contenedorFicha',this.contenedorFicha);
		console.log('botonAnterior',this.contenedorFicha);
		this.setBotones();
	}

    ngOnChanges(changes: SimpleChanges): void {
		if(changes.pasos){
			this.pasos = changes.pasos.currentValue;
		}
		if(changes.pasoCurrent){
			this.pasoActual = changes.pasoCurrent.currentValue;
		}
	}

    ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	cambiarPaso(paso: number){
		this.pasoActual = paso;
		this.onPaso.emit(this.pasoActual);
	}

	setBotones(){
		if(this.contenedorFicha){
			this.contenedorFicha.style.position = 'relative';
			this.botonAnterior._elementRef.nativeElement.style.display = '';
			this.botonSiguiente._elementRef.nativeElement.style.display = '';
			this.contenedorFicha.append(this.botonAnterior._elementRef.nativeElement);
			this.contenedorFicha.append(this.botonSiguiente._elementRef.nativeElement);
		}
	}

	onAnterior(){
		if(this.pasoActual > 0){
			this.cambiarPaso(this.pasoActual-1);
		}
	}

	onSiguiente(){
		if(this.pasoActual < (this.pasos.length-1)){
			this.cambiarPaso(this.pasoActual+1);
		}
	}

}