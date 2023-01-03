import { Component, HostListener, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { takeUntil } from 'rxjs/operators';
import { FormControl, Validators } from '@angular/forms';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { Observable, Subject } from 'rxjs';
import { FichasDataService } from '@services/fichas-data.service';
import { title } from 'process';
import { FichaListadoComponent } from '@pixvs/componentes/fichas/ficha-listado/listado.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GruposService } from './grupos.service';
import { CXPFactura, CXPFacturaListadoProjection } from '@app/main/modelos/cxpfactura';
import { Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { ArchivoProjection } from '@models/archivo';
import { HttpService } from '@services/http.service';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ErroresDialogComponent, ErroresDialogData } from './dialogs/errores/errores.dialog';
import { MatDialog } from '@angular/material/dialog';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { PAModalidadComboProjection, PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { ProgramaIdiomaComboSimpleProjection } from '@app/main/modelos/programa-idioma';
import { PAModalidadHorarioComboProjection, PAModalidadHorarioComboSimpleProjection } from '@app/main/modelos/pamodalidad-horario';
import { AlumnoComboProjection } from '@app/main/modelos/alumno';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';

class MenusIds {
	static ProgramarPago = 1;
}

enum NivelFiltrosEnum {
	CERO,
	SEDE,
	CURSO,
	MODALIDAD
}

interface FechaModel {
	id: number,
	fecha: string
};

@Component({
	selector: 'grupos-listado',
	templateUrl: './grupos.component.html',
	styleUrls: ['./grupos.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class GruposListadoComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return !this.isLoading;
	}

	@ViewChild('ficha') ficha: FichaListadoComponent;

	regConfig: FieldConfig[];
	private _unsubscribeAll: Subject < any > ;

	config: FichaListadoConfig = {
		localeEN: english,
		localeES: spanish,
		icono: "view_list",
		columnaId: "id",
		rutaDestino: "/app/programacion-academica/grupos/",
		columns: [{
				name: 'codigo',
				title: 'Código Grupo',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'programacion',
				title: 'Programación',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'sucursal',
				title: 'Sede',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'nombreGrupo',
				title: 'Nombre',
				class: "mat-column-220",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'horario',
				title: 'Horario',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'fechaInicio',
				title: 'Fecha Inicio',
				class: "mat-column-flex",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'fechaFin',
				title: 'Fecha Fin',
				class: "mat-column-flex",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'nombreProfesor',
				title: 'Profesor',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'estatus',
				title: 'Estatus',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{	name: 'acciones', 
				title: 'Acciones', 
				class: "mat-column-flex", 
				centrado: false, 
				type: 'acciones' 
			}
		],
		listadoMenuOpciones: [
			{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/grupos/download/excel' }
		],
		displayedColumns: ['codigo', 'programacion', 'sucursal', 'nombreGrupo', 'horario', 'fechaInicio','fechaFin', 'nombreProfesor','estatus','acciones'],
		columasFechas: ['fechaFin','fechaInicio'],
		listadoAcciones: [
            { title: 'Descargar Resumen', icon: 'play_for_work', tipo: 'download', url: "/api/v1/grupos/exportar/resumen/pdf/" },
			{ title: 'Descargar Boletas', icon: 'play_for_work', tipo: 'download_zip', url: "/api/v1/captura_calificaciones/boletas/" }
        ]
		

	};

	paModalidadControl: FormControl;
	permisoPlantilla: boolean = false;
	isLoading: boolean = false;
	uploadURL: string = null;

	nivelFiltros: NivelFiltrosEnum = NivelFiltrosEnum.CERO;
	subscripcionesFiltros: Subject<any>;

	sucursales: SucursalComboProjection[] = [];
	sucursalesSeleccionadas: SucursalComboProjection[] = [];
	cursos: ProgramaIdiomaComboSimpleProjection[] = [];
	cursosSeleccionados: ProgramaIdiomaComboSimpleProjection[] = [];
	modalidades: PAModalidadComboSimpleProjection[] = [];
	modalidadSeleccionada: PAModalidadComboSimpleProjection = null;
	niveles: any[] = [];
	nivelesSeleccionados: any[] = [];
	horarios: PAModalidadHorarioComboSimpleProjection[] = [];
	horariosSeleccionados: PAModalidadHorarioComboSimpleProjection[] = [];
	tiposGrupo: ControlMaestroMultipleComboProjection[] = [];
	estatusList: any[] = [
		{
			id:1,
			nombre:'Activo'
		},
		{
			id:2,
			nombre:'Finalizado'
		},
		{
			id:3,
			nombre:'Cancelado'
		}
	];
	alumnos: AlumnoComboProjection[] = [];

	

	constructor(
		public _fichasDataService: FichasDataService,
		public _gruposService: GruposService,
		private _matSnackBar: MatSnackBar,
		private router: Router,
		private hashid: HashidsService,
		private _httpClient: HttpService,
		public dialog: MatDialog
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
		this.subscripcionesFiltros = new Subject();

	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
		this.subscripcionesFiltros.next();
		this.subscripcionesFiltros.complete();
	}

	ngOnInit(): void {
		this.paModalidadControl = new FormControl();
		this._fichasDataService.onDatosChanged
			.pipe(takeUntil(this._unsubscribeAll))
			.subscribe(datos => {
				if (datos?.datos) {
					let permisos: Object = datos?.permisos || new Object();
					this.config.listadoMenuOpciones = [];
					this.config.paginatorSize = 100;

					if (permisos.hasOwnProperty('EXPORTAR_EXCEL_GRUPOS'))
						this.config.listadoMenuOpciones.push({ title: 'EXCEL', icon: 'table_chart', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/grupos/download/excel' });
				}

				if (datos?.sedes) {
					this.regConfig = [
						{
							type: "pixvsMatSelect",
							label: "Sede",
							name: "sede",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos?.sedes,
							campoValor: 'nombre',
						},
						{
							type: "pixvsMatSelect",
							label: "Año",
							name: "anio",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: datos?.anios
						},
						{
							type: "pixvsMatSelect",
							label: "Modalidad",
							name: "modalidad",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos?.modalidades,
							campoValor: 'nombre',
							values: ['codigo', 'nombre'],
						},
						{
							type: "pixvsMatSelect",
							label: "Fecha de inicio",
							name: "fechas",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: [],
							campoValor: 'fecha'
						},
						{
							type: "pixvsMatSelect",
							label: "Tipo de grupo",
							name: "tiposGrupo",
							formControl: new FormControl(null),
							validations: [],
							multiple: true,
							selectAll: false,
							list: datos?.tipoGrupo,
							campoValor: 'valor',
						},
						{
							type: "pixvsMatSelect",
							label: "Estatus",
							name: "estatus",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false,
							list: this.estatusList,
							campoValor: 'nombre',
						},
						{
							type: "input",
							label: "Código Alumno",
							name: "codigoAlumno",
							formControl: new FormControl(null),
							validations: [],
							multiple: false,
							selectAll: false
						}
					];
				}
			});

			var anio = new Date().getFullYear();
			var modalidad = null;
	
			let regAnio = this.regConfig.find(item => item.name == 'anio');
	
			regAnio.formControl.setValue(anio);
	
			regAnio.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.updateFechas([]);
	
				anio = regAnio.formControl.value;
	
				if (anio && modalidad) {
					var json = {
						anio: anio,
						modalidad: modalidad
					};
	
					this._gruposService.getFechas(json);
				}
			});
	
			let regModalidad = this.regConfig.find(item => item.name == 'modalidad');
	
			regModalidad.formControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				this.updateFechas([]);
	
				modalidad = regModalidad.formControl.value;
	
				if (anio && modalidad && modalidad.length) {
					var json = {
						anio: anio,
						modalidad: modalidad
					};
	
					this._gruposService.getFechas(json);
				}
			});
	}

	ngAfterViewInit(){
		setTimeout(() => {
			this._gruposService.onFechasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
				if (!!data?.fechas) {
					if (data?.fechas.length == 0) {
						this._matSnackBar.open('No hay fechas para el año y modalidad seleccionados.', 'OK', { duration: 5000, });
					} else {
						this.updateFechas(data.fechas.map(item => { return { id: moment(item).format('DDMMYYYY'), fecha: moment(item).format('DD/MM/YYYY') }; }));
					}
				}
			});
		},0 );
	}

	updateFechas(fechas) {
		let field: FieldConfig = {
			type: "pixvsMatSelect",
			label: "Fecha de inicio",
			name: "fechas",
			formControl: new FormControl(fechas),
			validations: [],
			multiple: true,
			selectAll: false,
			list: fechas,
			campoValor: 'fecha'
		};

		this.updateFilters(3, "fechas", field);
	}

	updateFilters(index: number, name: string, field: FieldConfig) {
		let regIndex = this.regConfig.findIndex(item => item.name == name);

		if (regIndex != -1) {
			this.regConfig.splice(regIndex, 1);
		}

		this.regConfig.splice(index, 0, field);
		this.regConfig = [...this.regConfig];
	}

	onEditarGrupo(grupo: any){
		this.router.navigate([`/app/programacion-academica/grupos/ver/${this.hashid.encode(grupo.id)}`]);
	}

	getOption(opcion: ListadoMenuOpciones): void{
		if(opcion.title.toLocaleUpperCase().includes('IMPORTAR')){
			this.openFileLoader(opcion);
		} else {
			this._gruposService.getExcel(opcion.url);
		}
	}

	openFileLoader(opcion): void {
		this.uploadURL = opcion.url || null;
		document.getElementById('fileloader').click();
	}

	onLoadFile(files): void {
		let fileToUpload = files.item(0);
		let formData: FormData = new FormData();
		formData.append('file', fileToUpload, fileToUpload.name);
		this.isLoading = true;
		this._httpClient.upload_form(formData, this.uploadURL, true)
		.pipe(takeUntil(this._unsubscribeAll)).subscribe((response: any) => {
			this._matSnackBar.open(response?.message, 'OK', { duration: 5000 });
			this.isLoading = false;
			(<HTMLInputElement> document.getElementById('fileloader')).value = "";
			if(response.status == 200){
				let dialogData: ErroresDialogData = {
					response: response?.data || [],
					onAceptar: this.aceptarDialog.bind(this)
				};
	
				const dialogRef = this.dialog.open(ErroresDialogComponent, {
					width: '800px',
					data: dialogData,
					disableClose: true
				});
			}
			
		}, (response) => {
			let message = response.error?.message || 'Hubo un error al procesar la plantilla';
			this._matSnackBar.open(message.replace('Exception ', ''), 'OK', { duration: 5000 });
			this.isLoading = false;
			(<HTMLInputElement> document.getElementById('fileloader')).value = "";
		});
	}

	aceptarDialog(){

	}
}