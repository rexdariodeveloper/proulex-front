import { Component, Input, ViewEncapsulation } from "@angular/core";
import { FormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Router } from "@angular/router";
import { AlumnoComboProjection } from "@app/main/modelos/alumno";
import { LocalidadComboProjection } from "@app/main/modelos/localidad";
import { PAModalidadCardProjection } from "@app/main/modelos/pamodalidad";
import { ProgramaGrupoCardProjection } from "@app/main/modelos/programa-grupo";
import { environment } from "@environments/environment";
import { fuseAnimations } from "@fuse/animations";
import { ControlMaestroMultipleCardProjection } from "@models/control-maestro-multiple";
import { HashidsService } from "@services/hashids.service";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { PuntoVentaAlumnoDialogComponent, PuntoVentaAlumnoDialogData } from "../../dialogs/alumno/alumno.dialog";
import { PuntoVentaAbiertoComponent } from "../../punto-venta-abierto.component";
import { PuntoVentaAbiertoService } from "../../punto-venta-abierto.service";
import { ControlesMaestrosMultiples } from "@modelos/mapeos/controles-maestros-multiples";

@Component({
    selector: 'punto-venta-academy-grupos',
    templateUrl: './academy-grupos.component.html',
    styleUrls: ['./academy-grupos.component.scss','../../punto-venta-abierto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuntoVentaAcademyGruposComponent {

    // Propiedades de configuración de la ficha
	apiUrl: string = environment.apiUrl;

    // @Inputs
	@Input('componentePV') componentePV: PuntoVentaAbiertoComponent;

    // Listados
    categorias: ControlMaestroMultipleCardProjection[] = [];
    modalidades: PAModalidadCardProjection[] = [];
    tipos: ControlMaestroMultipleCardProjection[] = [];
    grupos: ProgramaGrupoCardProjection[] = [];

    // FormControls
	filtroControl: FormControl = new FormControl('',[]);

    // Misc
    currentView: 'CATEGORIES'|'MODALITIES'|'COURSE_TYPES'|'WORKSHOPS'|'DIPLOMADOS' = 'CATEGORIES';
    navigatedViews: string[] = ['CATEGORIES'];
    breadcrumAcademy: string[] = [];
    modalidadSelected: PAModalidadCardProjection = null;
    tipoSelected: ControlMaestroMultipleCardProjection = null;
    grupoSelected: ProgramaGrupoCardProjection = null;
    lpvCliente: any = null;
    lpvSucursal: any = null;


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
        let cat1: ControlMaestroMultipleCardProjection = new ControlMaestroMultipleCardProjection();
        cat1.valor = 'Workshops';
        let cat2: ControlMaestroMultipleCardProjection = new ControlMaestroMultipleCardProjection();
        cat2.valor = 'Diplomados';
        this.categorias.push(cat1);
        this.categorias.push(cat2);

        this.lpvCliente = this.componentePV.listaPreciosCliente;
        this.lpvSucursal = this.componentePV.listaPreciosSucursal;
        
        this._puntoVentaAbiertoService.onModalidadesAcademyChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(data){
                    this.modalidades = data;
                    this._puntoVentaAbiertoService.onModalidadesAcademyChanged.next(null);
                }
            });

        this._puntoVentaAbiertoService.onTiposWorkshopChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(data){
                    this.tipos = data;
                    this._puntoVentaAbiertoService.onTiposWorkshopChanged.next(null);
                }
            });

        this._puntoVentaAbiertoService.onWorkshopsChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(data){
                    this.grupos = data;
                    this._puntoVentaAbiertoService.onWorkshopsChanged.next(null);
                }
            });

        this._puntoVentaAbiertoService.onDiplomadosAcademyChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((data) => {
                if(data){
                    //this.grupos = data;
                    this._puntoVentaAbiertoService.onDiplomadosAcademyChanged.next(null);
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
		this._unsubscribeAll.next();
		this._unsubscribeAll.complete();
    }

    onVistaAtras(){
        //Obtenemos y eliminamos el ultimo elemento visitado
        let last = this.navigatedViews.pop();
        //Dependiendo de su valor, limpiamos las variables correspondientes
        if(last === 'WORKSHOPS' || last === 'DIPLOMADOS'){
            this.grupoSelected = null;
            this.grupos = [];
        }
        if(last === 'COURSE_TYPES'){
            this.tipoSelected = null;
            this.tipos = [];
        }
        if(last === 'MODALITIES'){
            this.modalidadSelected = null;
            this.modalidades = [];
        }
        //Removemos el ultimo elemento visitado del breadcrum
        this.breadcrumAcademy.pop();
        //Si ya no hay mas elementos, regresamos a la pantalla inicial. En caso contrario, navegamos al ultimo elemento visitado
        if(this.navigatedViews.length == 0){
            this.componentePV.filtroControl.setValue('');
            this.grupos = [];
            this.componentePV.vistaNavegador = 'Idiomas';
        } else {
            this.currentView = (this.navigatedViews[this.navigatedViews.length - 1] as 'CATEGORIES' | 'MODALITIES' | 'DIPLOMADOS' | 'COURSE_TYPES' | 'WORKSHOPS');
        }
    }

    onCategoria(categoria: any){
        this.breadcrumAcademy.push(categoria.valor);
        if(categoria.valor === 'Workshops'){
            this.currentView = 'MODALITIES';
            this._puntoVentaAbiertoService.getModalidadesAcademy(this.componentePV.programaAcademy.id, ControlesMaestrosMultiples.CMM_ART_Idioma.ACADEMY);
        }
        if(categoria.valor === 'Diplomados'){
            this.currentView = 'DIPLOMADOS';
        }
        this.navigatedViews.push(this.currentView);
    }

    onModalidad(modalidad: PAModalidadCardProjection){
        this.breadcrumAcademy.push(modalidad?.nombre);
        this.currentView = 'COURSE_TYPES';
        this.navigatedViews.push(this.currentView);
        this.modalidadSelected = modalidad;
        this._puntoVentaAbiertoService.getTiposWorkshop(this.modalidadSelected.id);
    }

    onTipoWorkshop(tipo: ControlMaestroMultipleCardProjection){
        this.breadcrumAcademy.push(tipo?.valor);
        this.currentView = 'WORKSHOPS';
        this.navigatedViews.push(this.currentView);
        this.tipoSelected = tipo;
        this._puntoVentaAbiertoService.getWorkshops(this.modalidadSelected?.id, this.tipoSelected?.id);
    }

    onGrupo(grupo: ProgramaGrupoCardProjection){
        if(!!grupo && !grupo.permiteInscripcion){
			this._matSnackBar.open('El grupo tiene cupo lleno', 'OK', {
				duration: 5000,
			});
			return;
		}

        this.grupoSelected = grupo;
		
		let dialogData: PuntoVentaAlumnoDialogData = {
			grupoId: grupo.id,
			grupoEsJobsSems: false,
			articuloId: null,
			alumnos: this.componentePV.alumnos,
			localidadesSucursal: !!this._puntoVentaAbiertoService.getPlantelPuntoVentaId() ? [] : this.componentePV.localidadesSucursal,
			activarBecas: false ,
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

    onAceptarAlumnoDialog(alumno: AlumnoComboProjection, becaUDGId: number, localidad: LocalidadComboProjection){
		this._puntoVentaAbiertoService.cargando = true;
		this._puntoVentaAbiertoService.inscripcionAcademy(
			alumno.id,
			this.grupoSelected.id,
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
			grupoInCompany: this.hashid.encode(this.grupoSelected?.id)
		}});
	}

}