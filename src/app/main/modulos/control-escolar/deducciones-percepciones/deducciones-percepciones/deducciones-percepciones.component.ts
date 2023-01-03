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
import { DeduccionesPercepcionesService } from './deducciones-percepciones.service';
import { CXPFactura, CXPFacturaListadoProjection } from '@app/main/modelos/cxpfactura';
import { Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { ArchivoProjection } from '@models/archivo';
import { HttpService } from '@services/http.service';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ErroresDialogComponent, ErroresDialogData } from './dialogs/errores/errores.dialog';
import { MatDialog } from '@angular/material/dialog';

class MenusIds {
	static ProgramarPago = 1;
}

@Component({
	selector: 'deducciones-percepciones-listado',
	templateUrl: './deducciones-percepciones.component.html',
	styleUrls: ['./deducciones-percepciones.component.scss'],
	encapsulation: ViewEncapsulation.None
})
export class DeduccionesPercepcionesListadoComponent implements ComponentCanDeactivate {

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
		rutaDestino: "/app/control-escolar/deducciones-percepciones/",
		columns: [{
				name: 'codigo',
				title: 'Código Grupo',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'fechaCreacion',
				title: 'Fecha de creación',
				class: "mat-column-flex",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'fecha',
				title: 'Fecha de ajuste',
				class: "mat-column-flex",
				centrado: true,
				type: 'fecha',
				tooltip: true
			},
			{
				name: 'empleadoNombre',
				title: 'Empleado',
				class: "mat-column-flex",
				centrado: false,
				type: null,
				tooltip: true
			},
			{
				name: 'tipoMovimiento.valor',
				title: 'Tipo',
				class: "mat-column-220",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'deduccionPercepcion.concepto',
				title: 'Concepto',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{
				name: 'total',
				title: 'Monto $',
				class: "mat-column-flex",
				centrado: true,
				type: null,
				tooltip: true
			},
			{ 	name: 'activo', 
				title: '', 
				class: "mat-column-80", 
				centrado: true, 
				type: "boolean" 
			}
		],
		listadoMenuOpciones: [
			{ title: 'EXCEL', icon: 'arrow_downward', tipo: FichaListadoConfig.EXCEL, url: '/api/v1/empleado-deduccion-percepcion/download/excel' }
		],
		displayedColumns: ['codigo','fechaCreacion' ,'fecha', 'empleadoNombre', 'tipoMovimiento.valor', 'deduccionPercepcion.concepto', 'total','activo'],
		columasFechas: ['fechaCreacion','fecha'],
		

	};

	paModalidadControl: FormControl;
	horarios = []
	horarioSelected = [];
	permisoPlantilla: boolean = false;
	isLoading: boolean = false;
	uploadURL: string = null;

	constructor(
		public _fichasDataService: FichasDataService,
		public _gruposService: DeduccionesPercepcionesService,
		private _matSnackBar: MatSnackBar,
		private router: Router,
		private hashid: HashidsService,
		private _httpClient: HttpService,
		public dialog: MatDialog
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();

	}

	ngOnDestroy(): void {
		// Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
	}

	ngOnInit(): void {

	}

	onEditarGrupo(grupo: any){
		this.router.navigate([`/app/control-escolar/deducciones-percepciones/ver/${this.hashid.encode(grupo.id)}`]);
	}

	aceptarDialog(){

	}
}