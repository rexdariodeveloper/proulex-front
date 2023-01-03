import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { fromEvent, Subject } from 'rxjs';
import { MenuListadoGeneral } from '@models/menu-listado-general';
import { Validators, FormControl } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { FichasDataService } from '@services/fichas-data.service';

import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

import { FiltrosSidebarComponent } from '../sidebars/filtros/filtros.component';
import { fuseAnimations } from '@fuse/animations';
import { ReporteAlertasService } from './reporte.service';
import { PixvsConfirmComentarioDialogComponent } from '@pixvs/componentes/confirm-comentario-dialog/confirm-comentario-dialog.component';
import { AlertaDetalleListadoProjection } from '@app/main/modelos/alerta';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';

@Component({
	selector: 'reporte-alertas',
	templateUrl: './reporte.component.html',
	styleUrls: ['./reporte.component.scss'],
	animations: fuseAnimations,
	encapsulation: ViewEncapsulation.None
})
export class ReporteAlertasComponent {

	filtros: FieldConfig[];
	filtrosOpciones: any;

	@ViewChild('filtrado')
	filtrosSidebar: FiltrosSidebarComponent;

	@ViewChild(MatPaginator)
	paginator: MatPaginator;
	
	@ViewChild('filter', { static: true })
	filter: ElementRef;
	
	dataSource: MatTableDataSource<AlertaDetalleListadoProjection> = new MatTableDataSource([]);
	displayedColumns: string[] = ['fecha','codigo','sede','tipo','inicadaPor','estatus','acciones'];
	
	page: number = 0;

	actualizarSidebar: boolean = false;

	private _unsubscribeAll: Subject < any > ;

	constructor(
		public _reporteAlertasService: ReporteAlertasService,
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _fuseSidebarService: FuseSidebarService,
		private translate: TranslateService,
		private hashid: HashidsService,
		private router: Router,
		private _matSnackBar: MatSnackBar,
		public dialog: MatDialog
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
		_reporteAlertasService.translate = translate;
	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngAfterViewInit() {
	    this.dataSource.paginator = this.paginator;
	}
	

	ngOnInit(): void {

		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		fromEvent(this.filter.nativeElement, 'keyup')
            .pipe(
                takeUntil(this._unsubscribeAll),
                debounceTime(150),
                distinctUntilChanged()
            )
            .subscribe(() => {
                if (!this.dataSource) {
                    return;
                }

                this.paginator.pageIndex = 0;
                this.dataSource.filter = this.filter.nativeElement.value;
            });

		this._reporteAlertasService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if(datos?.sedes){
					let sedes = datos.sedes;
					let tipos = datos.tipos;
					let usuarios = datos.usuarios;
					let estatus = datos.estatus;

					this.filtros = [
						{
							type: "input",
							label: this.translate.instant('FILTROS.DESDE'),
							inputType: "date",
							name: "fechaDesde",
							validations: []
						},
						{
							type: "input",
							label: this.translate.instant('FILTROS.HASTA'),
							inputType: "date",
							name: "fechaHasta",
							validations: []
						},
						{
							type: "pixvsMatSelect",
							label: "Sede",
							name: "sede",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: sedes,
							campoValor: 'nombre',
							values: ['nombre']
						},
						/*{
							type: "pixvsMatSelect",
							label: "Usuario",
							name: "iniciadaPor",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: usuarios,
							campoValor: 'nombreCompleto',
							values: ['nombreCompleto']
						},*/
						,
						{
							type: "pixvsMatSelect",
							label: "Tipo",
							name: "tipo",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: tipos,
							campoValor: 'valor',
							values: ['valor']
						},
						{
							type: "pixvsMatSelect",
							label: this.translate.instant('FILTROS.ESTATUS'),
							name: "estatus",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: estatus,
							campoValor: 'valor',
							values: ['valor']
						},
						{
							type: "button",
							label: "Save",
							hidden: true
						}
					];
					//this.paginator.pageIndex = 0;
					this.dataSource = new MatTableDataSource(datos.alertas || []);
					this.dataSource.paginator = this.paginator;
				} else {
					if(!datos.length){
						this._matSnackBar.open(this.translate.instant('MENSAJE.NO_INFO'), 'OK', {
							duration: 5000,
						});
						this.dataSource = new MatTableDataSource([]);
					}else {
						this.dataSource = new MatTableDataSource(datos);
					}
					this.dataSource.paginator = this.paginator;
				}
			});
			this._reporteAlertasService.onEstatusChange.pipe(takeUntil(this._unsubscribeAll)).subscribe(estatusChange => {
				if(estatusChange){
					this._reporteAlertasService.onEstatusChange.next(false);
					this._reporteAlertasService.getDatos();
				}
			});
			this._reporteAlertasService.onActualizarRegistrosChange.pipe(takeUntil(this._unsubscribeAll)).subscribe(estatusChange => {
				if(estatusChange){
					this._reporteAlertasService.onActualizarRegistrosChange.next(false);
					this._reporteAlertasService.getDatos();
				}
			});

	}

	toggleSidebar(name): void {
        this._fuseSidebarService.getSidebar(name).toggleOpen();
	}
	
	onAceptar(alerta: AlertaDetalleListadoProjection){
		this.onVerAlerta(alerta);
		this._reporteAlertasService.changeStatus({"alertaDetalleId": alerta.id, "autorizar": true});
	}

	onCancelar(alerta: AlertaDetalleListadoProjection){
		this.onVerAlerta(alerta);
		const dialogRef = this.dialog.open(PixvsConfirmComentarioDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_RECHAZAR'),
				comentarioObligatorio: true
            }
        });

        dialogRef.afterClosed().subscribe(comentario => {
            if (comentario) {
				this._reporteAlertasService.changeStatus({"alertaDetalleId": alerta.id, "autorizar": false, comentario});
            }
        });
	}

	navegarRutaDestino(alerta: AlertaDetalleListadoProjection) {
		this.onVerAlerta(alerta);
		let url: string;
		let isAutorizacion: boolean = (alerta.estatusId == ControlesMaestrosMultiples.CMM_CALE_EstatusAlerta.EN_PROCESO &&
									   alerta.tipoId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.AUTORIZACION);
		if(isAutorizacion)
			url = !!alerta.urlAlerta? alerta.urlAlerta : alerta.url+'/alerta/';
		else
			url = !!alerta.urlNotificacion? alerta.urlNotificacion : alerta.url+'/ver/';
		let encoded = this.hashid.encode(alerta.procesoId);
		this.router.navigate([url + encoded]);
	}

	onVerAlerta(alerta: AlertaDetalleListadoProjection){
		this._reporteAlertasService.verAlerta(alerta.id,alerta.tipoId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.NOTIFICACION);
	}

	descargarPdf(alerta: AlertaDetalleListadoProjection){
		let url: string = alerta.urlDocumento;
		if(!!url){
			this._reporteAlertasService.getArchivo('/api/v1/pago-proveedores/pdf/' + alerta.procesoId);
			this._matSnackBar.open('Descargando...', '', {
					data :{
						icon: 'cloud_download'
					},
					duration: 5000,
			});
		} else {
			this._matSnackBar.open('No hay url configurada para la descarga', 'OK', { duration: 5000 });
		}
	}
}