import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { ValidatorService } from "@services/validators.service";
import { Subject } from "rxjs";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { FormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { BecaUDGListadoProjection } from "@app/main/modelos/becas-udg";
import { InfiniteScrollController } from "../../punto-venta-abierto.clases";

@Component({
    selector: 'punto-venta-becas-proulex',
    templateUrl: './becas-proulex.component.html',
    styleUrls: ['./becas-proulex.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaBecasProulexComponent {

	// @Inputs
	@Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

	// FormControls
	filtroControl: FormControl = new FormControl('',[]);

	// Tabla alumnos
	@ViewChild("tablaBecas") tablaBecas: any;
	dataSourceBecas: MatTableDataSource<BecaUDGListadoProjection> = new MatTableDataSource([]);
	displayedColumnsBecas: string[] = [
		'entidadBeca',
		'codigoProulex',
		'codigoBeca',
		'codigoUDG',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'descuento',
		'curso',
		'nivel',
		'modalidad',
		'acciones'
	];

	// Misc public
	buscandoBecas: boolean = false;

	// Misc private
	private _unsubscribeAll: Subject < any > ;
	private becasScrollController: InfiniteScrollController;
	private rutaEditarAlumno = '/app/control-escolar/alumnos/ver/';

    constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private translate: TranslateService,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private hashid: HashidsService,
		public _puntoVentaAbiertoService: PuntoVentaAbiertoService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {
		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

		this.becasScrollController = null;
		this.filtroControl.setValue('');

		// Set the private defaults
		this._unsubscribeAll = new Subject();
    }

	ngOnInit(): void {

		// Subscribe to update alumnos on changes
		this._puntoVentaAbiertoService.onBecasProulexChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				this.buscandoBecas = false;
				if(datos){
					this._puntoVentaAbiertoService.onBecasProulexChanged.next(null);
					this.becasScrollController?.scrollToStart();
					this.becasScrollController?.registrosRecuperados(datos.becas?.length || 0);
					this.dataSourceBecas.data = this.dataSourceBecas.data.concat(datos.becas);
					if(!this.becasScrollController){
						setTimeout(() => {
							this.becasScrollController = new InfiniteScrollController(this.tablaBecas._elementRef,this.getBecas.bind(this));
						});
					}
				}
			});

		// Subscribe to update filtroControl.valueChanges
		this.filtroControl.valueChanges
			.pipe(
				tap(() => this.buscandoBecas = true),
				takeUntil(this._unsubscribeAll),
				debounceTime(1000)
			).subscribe(value => {
				this._puntoVentaAbiertoService.cargando = true;
				this.dataSourceBecas.data = [];
				this.becasScrollController.scrollIndex = 0;
				this.getBecas();
			});

		if(this.componentePV.precargarFiltro){
			this.componentePV.precargarFiltro = false;
			this.filtroControl.setValue(this.componentePV.textoBusquedaPrecargar,{emitEvent: false});
		}
		this.componentePV.textoBusquedaPrecargar = '';
        this.getBecas();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	
	onVistaAtras(){
		this.dataSourceBecas.data = [];
		this.becasScrollController.scrollIndex = 0;
		
		this.componentePV.vistaNavegador = 'Idiomas';
	}

	onScrollDownAlumnos(e){
		if(!this._puntoVentaAbiertoService.cargando){
			this.becasScrollController.onScrollDown(e);
		}
	}

	getBecas(){
        this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getBecasProulex(this.filtroControl?.value || '',this.becasScrollController?.scrollIndex || 0,this.becasScrollController?.maxBusqueda || 100)
	}

	onAplicarBeca(beca: BecaUDGListadoProjection){
		this.componentePV.becaProulexAplicarId = beca.id;
		this._puntoVentaAbiertoService.getDatosBecaProulex(beca.alumnoId,beca.id);
	}

	onScrollDownBecas(e){
		this.becasScrollController.onScrollDown(e);
	}

}