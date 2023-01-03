import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from "rxjs";

export interface PixvsBuscadorAmazonOpcion {
	id: number;
	nombre: string;
}

export interface PixvsBuscadorAmazonEvent {
	id: number;
	textoBuscar: string;
}

@Component({
	selector: 'pixvs-buscador-amazon',
	templateUrl: './buscador-amazon.component.html',
	styleUrls: ['./buscador-amazon.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None,
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class PixvsBuscadorAmazonComponent implements OnInit {

	@Input() localeEN: any;
	@Input() localeES: any;
	@Input() opciones: PixvsBuscadorAmazonOpcion[];

	@Output() onBuscar: EventEmitter<PixvsBuscadorAmazonEvent> = new EventEmitter(null);

	opcionesControl: FormControl;
	textoBuscar: string = '';

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
		this._fuseTranslationLoaderService.loadTranslations(this.localeEN || {}, this.localeES || {});
		this.opcionesControl = new FormControl(this.opciones[0],[])
	}

	buscar(){
		this.onBuscar.next({
			id: this.opcionesControl.value.id,
			textoBuscar: this.textoBuscar
		});
	}

}