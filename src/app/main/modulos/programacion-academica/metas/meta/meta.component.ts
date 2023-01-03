import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Moment } from 'moment';
import * as moment from 'moment';
import { MetaService } from './meta.service';
import { ProgramaMetaEditarProjection } from '@app/main/modelos/programa-meta';
import { ProgramaMetaDetalle, ProgramaMetaDetalleEditarProjection } from '@app/main/modelos/programa-meta-detalle';
import { ProgramacionAcademicaComercialComboProjection } from '@app/main/modelos/programacion-academica-comercial';
import { PixvsMenuSidebarMenu, PixvsMenuSidebarSeccion } from '@pixvs/componentes/sidebars/menu-sidebar/menu-sidebar.component';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { MatTableDataSource } from '@angular/material/table';
import { ProgramacionAcademicaComercialDetalleMetaListadoProjection } from '@app/main/modelos/programacion-academica-comercial-detalle';
import { EditarMetaDialogComponent, EditarMetaDialogData } from './dialogs/editar-meta/editar-meta.dialog';

@Component({
    selector: 'meta',
    templateUrl: './meta.component.html',
    styleUrls: ['./meta.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class MetaComponent {

	// Propiedades de configuración de la ficha
	pageType: string = 'nuevo';
	config: FichaCRUDConfig;
	titulo: String;
	subTitulo: String;
	apiUrl: string = environment.apiUrl;
	@ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

	// Propiedades de edición de la ficha
	programaMeta: ProgramaMetaEditarProjection;
	detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal: {[sucursalId:string]: {[paModalidadId:string]: {[fechaInicio:string]: ProgramaMetaDetalleEditarProjection}}} = {};
	programaMetaDetallesJsonEditar: {[sucursalId:string]: {[paModalidadId:string]: {[fechaInicio:string]: number}}} = {};
	
	// Propiedades de formulario principal
	form: FormGroup;
	programacionAcademicaComercialControl: FormControl = new FormControl();

	// Listados
	programacionAcademicaComercial: ProgramacionAcademicaComercialComboProjection[] = [];
	paModalidades: PAModalidadComboProjection[] = [];

	// Propiedades sidebar
	seccionesSidebar: PixvsMenuSidebarSeccion<SucursalComboProjection>[] = [];
	sidebarSeleccionInicial: PixvsMenuSidebarMenu<SucursalComboProjection> = null;

	// Propiedades tablas metas
	dataSourceMetasMapPaModalidadId: {[paModalidadId:string]: MatTableDataSource<ProgramacionAcademicaComercialDetalleMetaListadoProjection>} = {};
	displayedColumnsDetalles: string[] = [
		'fechaInicio',
		'fechaFin',
		'meta'
	];

	// Misc
	sedeSeleccionada: SucursalComboProjection = null;

	// Private
	private _unsubscribeAll: Subject < any > ;
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
		public _metaService: MetaService,
		private el: ElementRef,
		public validatorService: ValidatorService
	) {

		this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
		this._fuseTranslationLoaderService.loadTranslations(en, es);

		// Set the default
		this.programaMeta = new ProgramaMetaEditarProjection();

		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit(): void {
		this.route.paramMap.subscribe(params => {
			this.pageType = params.get("handle");
			let id: string = params.get("id");

			this.currentId = this.hashid.decode(id);
			if (this.pageType == 'nuevo') {
				this.programaMeta = new ProgramaMetaEditarProjection();
			}

			this.config = {
				rutaAtras: "/app/programacion-academica/metas",
				rutaBorrar: "/api/v1/programas-metas/delete/",
				icono: "add_shopping_cart"
			}

		});

		// Subscribe to update datos on changes
		this._metaService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {

				if (datos && datos.programaMeta) {
					this.programaMeta = datos.programaMeta;
					this.programaMeta.detalles.forEach(detalle => {
						if(!this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[detalle.sucursalId]){
							this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[detalle.sucursalId] = {};
						}
						if(!this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[detalle.sucursalId][detalle.paModalidadId]){
							this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[detalle.sucursalId][detalle.paModalidadId] = {};
						}
						this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[detalle.sucursalId][detalle.paModalidadId][moment(detalle.fechaInicio).format('YYYY-MM-DD')] = detalle;
					});
					this.programaMetaDetallesJsonEditar = datos.programaMetaDetallesJsonEditar;
					this.titulo = this.programaMeta.codigo;
				} else {
					this.programaMeta = new ProgramaMetaEditarProjection();
				}

				// Inicializar listados
				this.programacionAcademicaComercial = datos.programacionAcademicaComercial;
				this.paModalidades = datos.paModalidades;
				this.sidebarSeleccionInicial = null;
				if(datos.sucursales[0]){
					this.sidebarSeleccionInicial = {
						id: datos.sucursales[0].id,
						nombre: datos.sucursales[0].nombre,
						objeto: datos.sucursales[0]
					}
				}
				this.seccionesSidebar = [{
					nombre: 'SEDES',
					menus: datos.sucursales.map((sucursal: SucursalComboProjection): PixvsMenuSidebarMenu<SucursalComboProjection> => {
						return {
							id: sucursal.id,
							nombre: sucursal.nombre,
							objeto: sucursal
						};
					})
				}];

				// Inicializar datasources
				this.paModalidades.forEach(paModalidad => {
					this.dataSourceMetasMapPaModalidadId[paModalidad.id] = new MatTableDataSource([]);
				});

				this.form = this.createMetaForm();

				if (this.pageType == 'ver') {
					this.form.disable();
				} else {
					this.form.enable();
				}

			});

		// Subscribe to update programacionAcademicaComercialDetalles on changes
		this._metaService.onProgramacionAcademicaComercialDetallesChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe((detalles: ProgramacionAcademicaComercialDetalleMetaListadoProjection[]) => {
				if (detalles != null) {
					let detallesMapPaModalidadId: {[paModalidadId:string]: ProgramacionAcademicaComercialDetalleMetaListadoProjection[]} = {};
					let dictModalidadFechaInicioExiste: {[paModalidadId:string]: {[fechaInicio:string]: boolean}} = {};
					detalles.forEach(detalle => {
						if(!dictModalidadFechaInicioExiste[detalle.paModalidadId]){
							dictModalidadFechaInicioExiste[detalle.paModalidadId] = {};
						}
						if(!dictModalidadFechaInicioExiste[detalle.paModalidadId][detalle.fechaInicio]){
							detallesMapPaModalidadId[detalle.paModalidadId] = (detallesMapPaModalidadId[detalle.paModalidadId] || []).concat(detalle);
							dictModalidadFechaInicioExiste[detalle.paModalidadId][detalle.fechaInicio] = true;
						}
					});
					this.paModalidades.forEach(paModalidad => {
						this.dataSourceMetasMapPaModalidadId[paModalidad.id].data = (detallesMapPaModalidadId[paModalidad.id] || []);
					});
					if(this.sidebarSeleccionInicial && !this.sedeSeleccionada){
						this.onSede(this.sidebarSeleccionInicial.objeto);
					}
				}
			});

	}

	createMetaForm(): FormGroup {

		// Inicializar FormControls
		this.programacionAcademicaComercialControl = new FormControl(this.programaMeta?.programacionAcademicaComercial || null, [Validators.required]);
		
		// Subscripciones FormControl.valueChanges
		this.programacionAcademicaComercialControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(value => {
			if(this.form.enabled){
				this.limpiarOnProgramacionAcademicaComercial();
			}
			if(value){
				this._metaService.getDetallesProgramacionAcademicaComercial(value.id);
			}
		});

		// Inicializar Form
		let form = this._formBuilder.group({
			id: [this.programaMeta.id],
			programacionAcademicaComercial: this.programacionAcademicaComercialControl,
			fechaModificacion: this.programaMeta.fechaModificacion
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

	guardar() {

		if (this.form.valid) {

			this._metaService.cargando = true;
			this.form.disable();

			let formRaw = this.form.getRawValue();

			let detalles: ProgramaMetaDetalle[] = [];

			for(let sucursalId in this.programaMetaDetallesJsonEditar){
				for(let paModalidadId in this.programaMetaDetallesJsonEditar[sucursalId]){
					for(let fechaInicio in this.programaMetaDetallesJsonEditar[sucursalId][paModalidadId]){
						detalles.push({
							id: (((this.detallesMapProgramaMapProgramacionAcademicaComercialDetalleMapSucursal[sucursalId] || {})[paModalidadId] || {})[fechaInicio] || {}).id || null,
							sucursalId: Number(sucursalId),
							paModalidadId: Number(paModalidadId),
							fechaInicio: fechaInicio + ' 00:00:00.000',
							meta: this.programaMetaDetallesJsonEditar[sucursalId][paModalidadId][fechaInicio]
						});
					}
				}
			}

			formRaw.detalles = detalles;

			this._metaService.guardar(JSON.stringify(formRaw), '/api/v1/programas-metas/save').then(
				function(result: JsonResponse) {
					if (result.status == 200) {
						this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
							duration: 5000,
						});
						this.router.navigate([this.config.rutaAtras])
					} else {
						this._programacionAcademicaComercialService.cargando = false;
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

			this._metaService.cargando = false;
			this.form.enable();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});

		}

	}

	onSede(sede: SucursalComboProjection){
		this.sedeSeleccionada = sede;
		if(!!sede && !this.programaMetaDetallesJsonEditar[sede.id]){
			this.programaMetaDetallesJsonEditar[sede.id] = {};
		}
	}

	onDetalle(paModalidad: PAModalidadComboProjection, detalle: ProgramacionAcademicaComercialDetalleMetaListadoProjection){
		if(this.form?.disabled){
			return;
		}
		let dialogData: EditarMetaDialogData = {
			programacionAcademicaComercial: this.programacionAcademicaComercialControl.value,
			paModalidad,
			programacionAcademicaComercialDetalle: detalle,
			meta: ((this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id] || {})[detalle.paModalidadId] || {})[moment(detalle.fechaInicio).format('YYYY-MM-DD')] || 0,
			onAceptar: this.onDetalleAceptar.bind(this)
		};

		const dialogRef = this.dialog.open(EditarMetaDialogComponent, {
			width: '800px',
			data: dialogData,
			panelClass: 'modal-titulo-bg'
		});
	}

	onDetalleAceptar(programacionAcademicaComercialDetalle: ProgramacionAcademicaComercialDetalleMetaListadoProjection, meta: number){
		if(!this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id]){
			this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id] = {};
		}
		if(!this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id][programacionAcademicaComercialDetalle.paModalidadId]){
			this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id][programacionAcademicaComercialDetalle.paModalidadId] = {};
		}
		this.programaMetaDetallesJsonEditar[this.sedeSeleccionada.id][programacionAcademicaComercialDetalle.paModalidadId][moment(programacionAcademicaComercialDetalle.fechaInicio).format('YYYY-MM-DD')] = meta;
	}

	limpiarOnProgramacionAcademicaComercial(){
		this.sedeSeleccionada = null;
		this.programaMetaDetallesJsonEditar = {};
		this.paModalidades.forEach(paModalidad => {
			this.dataSourceMetasMapPaModalidadId[paModalidad.id].data = [];
		});
	}

	exportarExcel(){
		this._metaService.exportar(this.programaMeta.id);
	}

	descargarPlantilla(){
		if(!this.programacionAcademicaComercialControl.value){
			this._matSnackBar.open('Selecciona una programación comercial', 'OK', {
				duration: 5000,
			});
			return;
		}
		this._metaService.getPlantilla(this.programacionAcademicaComercialControl.value.id);
	}

	xlsxChangeEvent(event: any){
		let archivo: File = null;
		if(event?.target?.files?.length){
			for(let file of event.target.files){
				archivo = file;
			}
		}
		if(!!archivo){
			this._metaService.subirArchivo(archivo).then((data)=>{
				if(this.programacionAcademicaComercialControl?.value?.id != data.data.programacionAcademicaComercialId){
					this._matSnackBar.open('Los datos del excel importado no coinciden con los seleccionados en la vista', 'OK', {
						duration: 5000,
					});
				}else{
					this.programaMetaDetallesJsonEditar = data.data.programaMetaDetallesJsonEditar;
				}
            });
		}
	}

}