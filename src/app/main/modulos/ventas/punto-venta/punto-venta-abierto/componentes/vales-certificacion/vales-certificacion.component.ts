import { Component, ElementRef, Input, ViewChild, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { ActivatedRoute, Router } from "@angular/router";
import { fuseAnimations } from "@fuse/animations";
import { FuseTranslationLoaderService } from "@fuse/services/translation-loader.service";
import { TranslateService } from "@ngx-translate/core";
import { HashidsService } from "@services/hashids.service";
import { ValidatorService } from "@services/validators.service";
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from "rxjs";
import { InfiniteScrollController } from "../../punto-venta-abierto.clases";
import { MatTableDataSource } from "@angular/material/table";
import { debounceTime, takeUntil, tap } from "rxjs/operators";
import { ProgramaIdiomaCertificacionValeListadoPVProjection } from "@app/main/modelos/programa-idioma-certificacion-vale";
import { thresholdFreedmanDiaconis } from "d3";
import { LocalidadComboProjection } from "@app/main/modelos/localidad";
import { PuntoVentaSeleccionarLocalidadDialogComponent, PuntoVentaSeleccionarLocalidadDialogData } from "../../dialogs/seleccionar-localidad/seleccionar-localidad.dialog";

@Component({
    selector: 'punto-venta-vales-certificacion',
    templateUrl: './vales-certificacion.component.html',
    styleUrls: ['./vales-certificacion.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaValesCertificacionComponent {

    // @Inputs
    @Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

    // FormControls
    filtroControl: FormControl = new FormControl('',[]);

    // Tabla alumnos
	@ViewChild("tablaValesCertificacion") tablaValesCertificacion: any;
	dataSourceValesCertificacion: MatTableDataSource<ProgramaIdiomaCertificacionValeListadoPVProjection> = new MatTableDataSource([]);
	displayedColumnsValesCertificacion: string[] = [
		'codigoProulex',
		'primerApellido',
		'segundoApellido',
		'nombre',
		'curso',
        'certificacion',
		'descuento',
		'acciones'
	];

	// Misc public
	buscandoValesCertificacion: boolean = false;

    // Misc private
	private _unsubscribeAll: Subject < any > ;
	private valesCertificacionScrollController: InfiniteScrollController;
	private valeCertificacionSeleccionado: ProgramaIdiomaCertificacionValeListadoPVProjection = null;

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

        this.valesCertificacionScrollController = null;
        this.filtroControl.setValue('');

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

	ngOnInit(): void {

		// Subscribe to update alumnos on changes
		this._puntoVentaAbiertoService.onValesCertificacionesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				this.buscandoValesCertificacion = false;
				if(datos){
					this._puntoVentaAbiertoService.onValesCertificacionesChanged.next(null);
					this.valesCertificacionScrollController?.scrollToStart();
					this.valesCertificacionScrollController?.registrosRecuperados(datos.valesCertificaciones?.length || 0);
					this.dataSourceValesCertificacion.data = this.dataSourceValesCertificacion.data.concat(datos.valesCertificaciones);
					if(!this.valesCertificacionScrollController){
						setTimeout(() => {
							this.valesCertificacionScrollController = new InfiniteScrollController(this.tablaValesCertificacion._elementRef,this.getValesCertificacion.bind(this));
						});
					}
				}
			});

		// Subscribe to update filtroControl.valueChanges
		this.filtroControl.valueChanges
			.pipe(
				tap(() => this.buscandoValesCertificacion = true),
				takeUntil(this._unsubscribeAll),
				debounceTime(1000)
			).subscribe(value => {
				this._puntoVentaAbiertoService.cargando = true;
				this.dataSourceValesCertificacion.data = [];
				this.valesCertificacionScrollController.scrollIndex = 0;
				this.getValesCertificacion();
			});

		if(this.componentePV.precargarFiltro){
			this.componentePV.precargarFiltro = false;
			this.filtroControl.setValue(this.componentePV.textoBusquedaPrecargar,{emitEvent: false});
		}
		this.componentePV.textoBusquedaPrecargar = '';
        this.getValesCertificacion();
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}
	
	onVistaAtras(){
		this.dataSourceValesCertificacion.data = [];
		this.valesCertificacionScrollController.scrollIndex = 0;
		
		this.componentePV.vistaNavegador = 'Idiomas';
	}

	onScrollDownValesCertificacion(e){
		if(!this._puntoVentaAbiertoService.cargando){
			this.valesCertificacionScrollController.onScrollDown(e);
		}
	}

	getValesCertificacion(){
        this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.getValesCertificacion(this.filtroControl?.value || '',this.valesCertificacionScrollController?.scrollIndex || 0,this.valesCertificacionScrollController?.maxBusqueda || 100)
	}

	onSeleccionarValeCertificacion(valeCertificacion: ProgramaIdiomaCertificacionValeListadoPVProjection){
		this.valeCertificacionSeleccionado = valeCertificacion;
		this.onAplicarVale(null);
	}

	onAplicarVale(localidad?: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		if(this.componentePV.localidadesSucursal.length == 1){
			localidad = this.componentePV.localidadesSucursal[0];
		}
		if(!!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() || !!localidad?.id){
			this.componentePV.valeCertificacionAplicarId = this.valeCertificacionSeleccionado.id;
			this._puntoVentaAbiertoService.aplicarValeCertificacion(this.valeCertificacionSeleccionado.id,this.componentePV.getListaPreciosId(),localidad?.id || null,this.componentePV.siguienteIdTmp++);
		}else {
			this.onSeleccionarLocalidad();
		}
	}

	onSeleccionarLocalidad(){
		let dialogData: PuntoVentaSeleccionarLocalidadDialogData = {
			localidadesSucursal: this.componentePV.localidadesSucursal,
			onAceptar: this.onAplicarVale.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaSeleccionarLocalidadDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

}