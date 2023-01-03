import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { RequisicionService } from './requisicion.service';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Requisicion, RequisicionEditarProjection } from '@app/main/modelos/requisicion';
import { DepartamentoComboProjection } from '@models/departamento';
import { RequisicionPartidaEditarProjection } from '@app/main/modelos/requisicion-partida';
import { ArticuloDialogComponent, ArticuloDialogData } from './dialogs/articulo/articulo.dialog';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import * as moment from 'moment';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { AlmacenComboProjection } from '@app/main/modelos/almacen';
import { ListadoMenuOpciones } from '@models/ficha-listado-config';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { RequisicionComentariosDialogComponent, RequisicionComentariosDialogData } from './dialogs/comentarios/comentarios.dialog';
import { Usuario } from '@models/usuario';

@Component({
    selector: 'requisicion',
    templateUrl: './requisicion.component.html',
    styleUrls: ['./requisicion.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RequisicionComponent implements ComponentCanDeactivate {

	private URL: string = '/api/v1/requisiciones';

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	@ViewChild("printBtn") printBtn: ElementRef;

	usuarioActual: Usuario;

	historial;
	acciones: ListadoMenuOpciones[] = [];

	localeEN = english;
	localeES = spanish;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
	subTitulo: String;
	puedeEditar: boolean = false;

    requisicion: RequisicionEditarProjection;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
	rolControl: FormControl;
	
	departamentoControl: FormControl = new FormControl();
	departamentos: DepartamentoComboProjection[];

	almacenControl: FormControl = new FormControl();
	almacenes: AlmacenComboProjection[];

	columnasTablaArticulos: any[] = [{
		name: 'articulo.codigoArticulo',
		title: 'Código',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: true
	}, {
		name: 'articulo.nombreArticulo',
		title: 'Nombre',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: false
	}, {
		name: 'unidadMedida.nombre',
		title: 'Unidad de medida',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: false
	}, {
		name: 'cantidadRequerida',
		title: 'Cantidad',
		class: "mat-column-flex",
		centrado: false,
		type: null,
		tooltip: false
	}, {
		name: 'fechaRequerida',
		title: 'Fecha requerida',
		class: "mat-column-flex",
		centrado: false,
		type: 'fecha',
		tooltip: false
	}, {
		name: 'comentarios',
		title: '',
		class: "mat-column-flex",
		centrado: false,
		type: 'acciones',
		listadoAcciones: [
			{
				title: 'Comentarios',
				tipo: '',
				icon: 'message',
				accion: this.onModalComentarios.bind(this)
			}
		]
	}, {
		name: 'acciones',
		title: 'Acciones',
		class: "mat-column-flex",
		centrado: false,
		type: 'acciones'
	}];
	columnasFechasTablaArticulos: string[] = [];
	displayedColumnsTablaArticulos: string[] = ['articulo.codigoArticulo','articulo.nombreArticulo','unidadMedida.nombre','cantidadRequerida','fechaRequerida', 'comentarios','acciones'];
	displayedColumnsTablaArticulosDisabled: string[] = ['articulo.codigoArticulo','articulo.nombreArticulo','unidadMedida.nombre','cantidadRequerida','fechaRequerida', 'comentarios'];
	listadoAccionesArticulos = [
		{
			title: 'Eliminar',
			tipo: '',
			icon: 'delete',
			accion: this.onBorrarPartida.bind(this)
		}
	];

	articuloEditar: RequisicionPartidaEditarProjection = null;

	articulos: ArticuloComboProjection[] = [];
	articulosMiscelaneos: ArticuloComboProjection[] = [];
	unidadesMedida: UnidadMedidaComboProjection[] = [];
	
	contadorPartidas: number = 0;

	fechaActual: Date = new Date();

    // Private
    private _unsubscribeAll: Subject<any>;
	currentId: number;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public _requisicionService: RequisicionService,
        private el: ElementRef,
        public validatorService : ValidatorService
    ) {

		this.usuarioActual = JSON.parse(localStorage.getItem('usuario'));

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.requisicion = new RequisicionEditarProjection();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
				this.requisicion = new RequisicionEditarProjection();
            }

            this.config = {
                rutaAtras: "/app/compras/requisiciones",
                rutaBorrar: "/api/v1/requisiciones/delete/",
				rutaAprobar: this.URL + "/alerta/aprobar/",
                rutaRechazar: this.URL + "/alerta/rechazar/",
                icono: "add_shopping_cart"
            }

        });

        // Subscribe to update requisicion on changes
        this._requisicionService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

				this.historial = datos.historial;

                if (datos && datos.requisicion) {
                    this.requisicion = datos.requisicion;
					this.titulo = this.requisicion.codigo
					if(this.requisicion?.estadoRequisicion?.id == ControlesMaestrosMultiples.CMM_REQ_EstatusRequisicion.GUARDADO){
						this.puedeEditar = true;
					}
					this.requisicion.partidas.forEach(partida => {
						partida['idExtra'] = ++this.contadorPartidas;
					});
					this.acciones = [
						{
							title:  'PDF',
							tipo:   null,
							icon:   'picture_as_pdf'
						},{
							title: 'Vista previa',
							tipo: null,
							icon: 'print'
						}
					];
                } else {
					this.requisicion = new RequisicionEditarProjection();
					this.puedeEditar = true;
					this.acciones = [
						{
							title: 'Vista previa',
							tipo: null,
							icon: 'print'
						}
					];
                }

				this.departamentos = datos.departamentos;
				this.almacenes = datos.almacenes;
				this.articulos = datos.articulos;
				this.articulosMiscelaneos = datos.articulosMiscelaneos;
				this.unidadesMedida = datos.unidadesMedida;

				if(!this.requisicion.id && this.almacenes.length == 1){
					this.requisicion.almacen = this.almacenes[0];
				}
				if(!this.requisicion.id && this.departamentos.length == 1){
					this.requisicion.departamento = this.departamentos[0];
				}

                this.form = this.createRequisicionForm();

                if (this.pageType == 'ver' || this.pageType == 'alerta') {
                    this.form.disable();
                } else {
                    this.form.enable();
				}
				

            });

    }

    createRequisicionForm(): FormGroup {

		this.departamentoControl = new FormControl(this.requisicion.departamento, [Validators.required]);
		this.almacenControl = new FormControl(this.requisicion.almacen, [Validators.required]);

        let form = this._formBuilder.group({
            id: [this.requisicion.id],
            departamento: this.departamentoControl,
            almacen: this.almacenControl,
            fecha: new FormControl(this.requisicion.fecha || new Date(), [Validators.required, ]),
            comentarios: new FormControl(this.requisicion.comentarios, [Validators.maxLength(255)]),
          	fechaModificacion : this.requisicion.fechaModificacion,
        });

        return form;
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string) {

        let form_field = this.form.get(campo);
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);

    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    guardar(enviar: boolean = false) {

        if (this.form.valid) {

			if(!this.requisicion.partidas?.length){
				this._requisicionService.cargando = false;
				this.form.enable();

				this._matSnackBar.open(this.translate.instant('MENSAJE.DETALLES_REQUERIDOS'), 'OK', {
					duration: 5000,
				});
				return;
			}

            this._requisicionService.cargando = true;
			this.form.disable();
			
			let body = {...this.form.value};
			body.fecha = moment(body.fecha).format('YYYY-MM-DD HH:mm:ss.SSS');
			body.partidas = this.requisicion.partidas;
			body.partidas.forEach(partida => {
				delete partida['idExtra'];
				partida.fechaRequerida = moment(partida.fechaRequerida).format('YYYY-MM-DD HH:mm:ss.SSS');
			});

            this._requisicionService.guardar(JSON.stringify(body), `/api/v1/requisiciones/${enviar ? 'enviar' : 'save'}`).then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        let mensaje = this.translate.instant('MENSAJE.GUARDADO_EXITO') + (!!result.data ? (': ' + result.data) : '');
                        this._matSnackBar.open(mensaje, 'OK', {
                            duration: 5000,
                        });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._requisicionService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );




        } else {

            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        //let tab = invalidControl.parents('div.tab-pane').scope().tab
                        //tab.select();                           
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._requisicionService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
	}
	
	onBorrarPartida(partida){
		this.requisicion.partidas = this.requisicion.partidas.filter(p => {
			return p != partida;
		});
	}

	onEditarArticulo(articulo: RequisicionPartidaEditarProjection) {
		if(this.form?.enabled){
			this.articuloEditar = articulo;
			this.abrirModalArticulo(this.articuloEditar);
		}
	}

	onNuevoArticulo(){
		this.articuloEditar = null;
		this.abrirModalArticulo(null);
	}

	abrirModalArticulo(articulo: RequisicionPartidaEditarProjection): void {

		let dialogData: ArticuloDialogData = {
			esNuevo: !articulo,
			articulo,
			articulos: this.articulos,
			articulosMiscelaneos: this.articulosMiscelaneos,
			unidadesMedida: this.unidadesMedida,
			onAceptar: this.onAceptarArticuloDialog.bind(this)
		};

		const dialogRef = this.dialog.open(ArticuloDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

	onAceptarArticuloDialog(articulo: RequisicionPartidaEditarProjection) {
		let articuloEditar: any = {
			...this.articuloEditar
		};
		Object.assign(articuloEditar, articulo);
		if(articuloEditar['idExtra']){
			this.requisicion.partidas = this.requisicion.partidas.map(partida => {
				if(partida['idExtra'] == articuloEditar['idExtra']){
					return articuloEditar;
				}
				return partida;
			});
		}else{
			articuloEditar['idExtra'] = ++this.contadorPartidas;
			this.requisicion.partidas = [...(this.requisicion.partidas || [])].concat(articuloEditar);
		}
		this.articuloEditar = null;
	}

	onActionClicked(event){
		if(event.option.title == 'PDF'){
			this._requisicionService.descargarPDF(this.requisicion);
		}else if(event.option.title == 'Vista previa'){
			if (this.form.disabled || this.form.valid){
				this.printBtn.nativeElement.click();
			}else{
				this._matSnackBar.open('Completa el formulario', 'OK', {
					duration: 5000,
				});
			}
		}
	}

	onModalComentarios(partida){

		let dialogData: RequisicionComentariosDialogData = {
			comentarios: partida.comentarios || 'Partida sin comentarios'
		};

		const dialogRef = this.dialog.open(RequisicionComentariosDialogComponent, {
			width: '500px',
			data: dialogData
		});

	}

}