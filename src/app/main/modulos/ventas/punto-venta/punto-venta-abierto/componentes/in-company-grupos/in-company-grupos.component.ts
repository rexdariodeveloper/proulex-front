import { Component, Input, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AlumnoComboProjection } from "@app/main/modelos/alumno";
import { LocalidadComboProjection } from "@app/main/modelos/localidad";
import { ProgramaGrupoCardProjection } from "@app/main/modelos/programa-grupo";
import { environment } from "@environments/environment";
import { fuseAnimations } from "@fuse/animations";
import { HashidsService } from "@services/hashids.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PuntoVentaAlumnoDialogComponent, PuntoVentaAlumnoDialogData } from "../../dialogs/alumno/alumno.dialog";
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";

@Component({
    selector: 'punto-venta-in-company-grupos',
    templateUrl: './in-company-grupos.component.html',
    styleUrls: ['./in-company-grupos.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaInCompanyGruposComponent {

    // Propiedades de configuración de la ficha
	apiUrl: string = environment.apiUrl;

    // @Inputs
	@Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

    // Listados
    grupos: ProgramaGrupoCardProjection[] = [];

    // FormControls
	filtroControl: FormControl = new FormControl('',[]);

    // Misc
    grupoSeleccionado: ProgramaGrupoCardProjection = null;

    // Private
	private _unsubscribeAll: Subject < any > ;
    private rutaNuevoAlumno = '/app/control-escolar/alumnos/nuevo/';

    constructor(
        public _puntoVentaAbiertoService: PuntoVentaAbiertoService,
        private hashid: HashidsService,
        private _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
        private router: Router
    ){
        // Set the private defaults
		this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        // Subscribe to update grupos on changes
		this._puntoVentaAbiertoService.onGruposInCompanyChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if(datos){
                    this._puntoVentaAbiertoService.onGruposInCompanyChanged.next(null);
                    this.grupos = datos.gruposCabeceras;
                }
            });

        this._puntoVentaAbiertoService.getGruposInCompany(this.componentePV.clienteInCompanySeleccionado.id);
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
    }

    onVistaAtras(){
        this.componentePV.filtroControl.setValue('');
        this.grupos = [];
        this.componentePV.clienteInCompanySeleccionado = null;
        this.componentePV.vistaNavegador = 'Clientes In Company';
    }

    onGrupo(grupo: ProgramaGrupoCardProjection){
        if(!!grupo && !grupo.permiteInscripcion){
			this._matSnackBar.open('El grupo tiene cupo lleno', 'OK', {
				duration: 5000,
			});
			return;
		}

        this.grupoSeleccionado = grupo;
		
		let dialogData: PuntoVentaAlumnoDialogData = {
			grupoId: grupo.id,
			grupoEsJobsSems: false,
			articuloId: null,
			alumnos: this.componentePV.alumnos,
			localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.componentePV.localidadesSucursal,
			activarBecas: false,
			activarValesCertificacion: false,
			pedirCantidad: false,
			onAceptar: this.onAceptarAlumnoDialog.bind(this),
			onNuevoAlumno: this.onNuevoAlumnoDialog.bind(this)
		};

		const dialogRef = this.dialog.open(PuntoVentaAlumnoDialogComponent, {
			width: '500px',
			data: dialogData
		});
    }

    onAceptarAlumnoDialog(alumno: AlumnoComboProjection, becaUDGId: number, programaIdiomaCertificacionValeId: number, localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.inscripcionInCompany(
			alumno.id,
			this.grupoSeleccionado.id,
			localidad.id,
			this.componentePV.siguienteIdTmp++
		);
	}
	
	onNuevoAlumnoDialog(localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this.componentePV.guardarLocalStorage(localidad);
		this.router.navigate([this.rutaNuevoAlumno],{queryParams: {
			fichaVolver: 'PuntoVenta',
			clienteInCompany: this.hashid.encode(this.componentePV.clienteInCompanySeleccionado.id),
			grupoInCompany: this.hashid.encode(this.grupoSeleccionado?.id)
		}});
	}

}