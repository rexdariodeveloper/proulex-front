import { Component, ViewChild, ViewEncapsulation, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';

import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { PAActividadEvaluacionComboProjection } from '@app/main/modelos/paactividad';
import { ProgramaIdiomaEditarProjection, ProgramaIdioma } from '@app/main/modelos/programa-idioma';
import { ProgramaIdiomaModalidadEditarProjection } from '@app/main/modelos/programa-idioma-modalidad';
import { ProgramaIdiomaSucursalEditarProjection } from '@app/main/modelos/programa-idioma-sucursal';
import { ProgramaIdiomaLibroMaterialEditarProjection } from '@app/main/modelos/programa-idioma-libro-material';
import { ProgramaIdiomaExamenDetalleEditarProjection } from '@app/main/modelos/programa-idioma-examen-detalle';
import { ProgramaIdiomaNivelEditarProjection } from '@app/main/modelos/programa-idioma-nivel';
import { ProgramaIdiomaExamenEditarProjection } from '@app/main/modelos/programa-idioma-examen';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { MatTableDataSource } from '@angular/material/table';
import { WorkshopService } from './workshop.service';
import { AddlibroComponent } from './dialogs/libros/libros.dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { GrupoTareaDialogComponent } from './dialogs/add-quizz/add-quizz.dialog';
import { AddTareaComponent } from './dialogs/add-tarea/add-tarea.dialog';

@Component({
    selector: 'workshop',
    templateUrl: './workshop.component.html',
    styleUrls: ['./workshop.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class WorkshopComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';
    currentId: number;
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    programas: ProgramaComboProjection[];
    idiomas: ControlMaestroMultipleComboProjection[];
    tipos: ControlMaestroMultipleComboProjection[];
    modalidades: PAModalidadComboProjection[];
    sucursales: SucursalComboProjection[];
    plataformas: ControlMaestroMultipleComboProjection[];
    unidadesMedidas: UnidadMedidaComboProjection[];
    objetosImpuestoSAT: ControlMaestroMultipleComboProjection[];
    articulos: ArticuloComboProjection[];
    actividades: PAActividadEvaluacionComboProjection[];
    actividadesFormatos: ControlMaestroMultipleComboProjection[];

    librosDataSource: MatTableDataSource<ProgramaIdiomaLibroMaterialEditarProjection>;
    nivelesDataSource: MatTableDataSource<ProgramaIdiomaNivelEditarProjection>;

    filtroModalidadesCtrl: FormControl = new FormControl();
    workshop: ProgramaIdiomaEditarProjection;
    form: FormGroup;

    private _unsubscribeAll: Subject<any>;
    
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
        public _cursoService: WorkshopService,
        public validatorService: ValidatorService,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this.workshop = new ProgramaIdioma();
        this.librosDataSource = new MatTableDataSource<ProgramaIdiomaLibroMaterialEditarProjection>([]);
        this.nivelesDataSource = new MatTableDataSource<ProgramaIdiomaNivelEditarProjection>([]);
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");
            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') 
                this.workshop = new ProgramaIdioma();

            this.config = {
                rutaAtras: "/app/programacion-academica/workshops",
                rutaBorrar: "/api/v1/workshop/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._cursoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (!!datos?.workshop) {
                    this.workshop = datos.workshop;
                    this.titulo = this.workshop.codigo;
                } else {
                    this.workshop = new ProgramaIdioma();
                }
                this.programas = datos?.programas || [];
                this.idiomas = datos?.idiomas || [];
                this.tipos = datos?.tipos || [];
                this.modalidades = datos?.modalidades || [];
                this.sucursales = datos?.sucursales || [];
                this.plataformas = datos?.plataformas || [];
                this.unidadesMedidas = datos?.unidadesMedidas || [];
                this.objetosImpuestoSAT = datos?.objetosImpuestoSAT || [];
                this.articulos = datos?.articulos || [];
                this.actividades = datos?.test || [];
                this.actividadesFormatos = datos?.testFormat || [];

                this.form = this.createForm();
                if(!!this.currentId)
                    this.form.disable();
                this.form.get('programa').setValue(this.programas.find(programa => !!programa.academy));
                this.form.get('idioma').setValue(this.idiomas.find(idioma => idioma?.id == ControlesMaestrosMultiples.CMM_ART_Idioma.ACADEMY));
                this.form.get('numeroNiveles').setValue(1);
                this.form.get('esAcademy').setValue(true);
            });
        
    }

    createForm(): FormGroup {
        let form: FormGroup = this._formBuilder.group({
            id: new FormControl(this.workshop?.id, []),
            codigo: new FormControl(this.workshop?.codigo, [Validators.required]),
            nombre: new FormControl(this.workshop?.nombre, [Validators.required]),
            programaId: new FormControl(this.workshop?.programaId, []),
            programa: new FormControl(this.workshop?.programa, []),
            tipoWorkshopId: new FormControl(this.workshop?.tipoWorkshopId, []),
            tipoWorkshop: new FormControl(this.workshop?.tipoWorkshop, [Validators.required]),
            idioma: new FormControl(this.workshop?.idioma, []),
            plataforma: new FormControl(this.workshop?.plataforma, []),
            horasTotales: new FormControl(this.workshop?.horasTotales, []),
            numeroNiveles: new FormControl(this.workshop?.numeroNiveles, []),
            calificacionMinima: new FormControl(this.workshop?.calificacionMinima, []),
            mcer: new FormControl(this.workshop?.mcer, []),
            unidadMedida: new FormControl(this.workshop?.unidadMedida, []),
            clave: new FormControl(this.workshop?.clave, []),
            examenEvaluacion: new FormControl(this.workshop?.examenEvaluacion, []),
            descripcion: new FormControl(this.workshop?.descripcion, []),
            iva: new FormControl(this.workshop?.iva, []),
            ivaExento: new FormControl(this.workshop?.ivaExento, []),
            ieps: new FormControl(this.workshop?.ieps, []),
            cuotaFija: new FormControl(this.workshop?.cuotaFija, []),
            faltasPermitidas: new FormControl(this.workshop?.faltasPermitidas, []),
            activo: new FormControl(this.workshop?.activo, []),
            fechaModificacion: new FormControl(this.workshop?.fechaModificacion, []),
            certificaciones: new FormControl([], []),
            librosMateriales: new FormControl([], []),
            modalidades: new FormControl([], []),
            sucursales: new FormControl([], []),
            niveles: new FormControl([], []),
            esJobs: new FormControl(this.workshop?.esJobs, []),
            esJobsSems: new FormControl(this.workshop?.esJobsSems, []),
            esPcp: new FormControl(this.workshop?.esPcp, []),
            esAcademy: new FormControl(this.workshop?.esAcademy, []),
            tabulador: new FormControl(this.workshop?.tabulador, []),
            objetoImpuesto: new FormControl(this.workshop?.objetoImpuesto, []),
        });

        if(this.workshop?.modalidades?.length > 0) {
            let modalidades = this.workshop.modalidades.map( modalidad => modalidad.modalidad );
            form.get('modalidades').setValue(modalidades);
        }
        if(this.workshop?.sucursales?.length > 0) {
            let sucursales = this.workshop.sucursales.map( sucursal => sucursal.sucursal );
            form.get('sucursales').setValue(sucursales);
        }
        if(this.workshop?.librosMateriales?.length > 0) {
            this.librosDataSource.data = this.workshop.librosMateriales;
        }
        if(this.workshop?.niveles?.length > 0){
            this.nivelesDataSource.data = this.workshop.niveles;
        }

        form.get('tipoWorkshop').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((data) => {
            if(!!data){
                let programa = this.form.get('programa').value;
                this.form.get('codigo').setValue(programa?.codigo + data?.referencia);
                this.form.get('nombre').setValue([programa?.nombre, data?.valor].join(' '));
            }
        });

        return form;
    }

    ngOnDestroy(): void {
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string, form: FormGroup) {
        let form_field = form.get(campo);
        if (!form_field.validator)
            return false;
        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    abrirModalLibro(){
        const librosDialogRef = this.dialog.open(AddlibroComponent, {
            width: '600px',
            data: this.articulos
        });

        librosDialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
            if(!!data){
                let libros: ProgramaIdiomaLibroMaterialEditarProjection[] = [...this.librosDataSource.data];
                data.nivel = 1;
                data.borrado = false;
                libros.push(data);
                this.librosDataSource.data = [...libros];
            }
        });
    }

    libroIndex: number = null;
    borrarLibro(index: number){
        this.libroIndex = index;
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: { mensaje: '¿Deseas eliminar permanentemente ese elemento?' }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                let libros: ProgramaIdiomaLibroMaterialEditarProjection[] = [...this.librosDataSource.data];
                if(!!libros[this.libroIndex]?.id){
                    //call to service
                } else
                    libros.splice(this.libroIndex, 1);
                this.librosDataSource.data = [...libros];
            }
        });
    }

    addNivel(){
        let nivel: ProgramaIdiomaNivelEditarProjection = new ProgramaIdiomaNivelEditarProjection();
        nivel.activo = true;
        nivel.id = null;
        nivel.modalidadId = this.filtroModalidadesCtrl.value?.id;
        nivel.modalidad = this.filtroModalidadesCtrl.value;
        nivel.nivelInicial = 1;
        nivel.nivelFinal = nivel.nivelInicial;
        nivel.programaIdiomaId = null;
        nivel.examenes = [];

        let niveles: ProgramaIdiomaNivelEditarProjection[] = [...this.nivelesDataSource.data];
        niveles.push(nivel);
        this.nivelesDataSource.data = [...niveles];
        this.filtroModalidadesCtrl.setValue(null, { emitEvent: false });
    }

    nivelSeleccionado: ProgramaIdiomaNivelEditarProjection = null;
    selectItem(item: ProgramaIdiomaNivelEditarProjection){
        this.nivelSeleccionado = item;
    }

    nivelIndex: number
    borrarNivel(index: number){
        this.nivelIndex = index;
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: { mensaje: '¿Deseas eliminar permanentemente ese elemento?' }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                let niveles: ProgramaIdiomaNivelEditarProjection[] = [...this.nivelesDataSource.data];
                if(!!niveles[this.nivelIndex]?.id){
                    //call to service
                } else
                    niveles.splice(this.nivelIndex, 1);
                this.nivelesDataSource.data = [...niveles];
                this.nivelSeleccionado = null;
            }
        });
    }

    grupoIndex: number = null;
    abrirModalGrupo(element: ProgramaIdiomaExamenEditarProjection, index: number){
        let grupo: ProgramaIdiomaExamenEditarProjection = !!element ? element : new ProgramaIdiomaExamenEditarProjection();
        this.grupoIndex = index;
        let totalPonderado = 0.00;
        this.nivelSeleccionado?.examenes.forEach(examen => {
            totalPonderado += Number(examen?.porcentaje);
        });
        const grupoDialogRef = this.dialog.open(GrupoTareaDialogComponent, {
            width: '600px',
            data: { grupo: grupo, totalPonderado: totalPonderado }
        });

        grupoDialogRef.afterClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(!!data){
                if(this.grupoIndex != null){
                    let grupos: ProgramaIdiomaExamenEditarProjection[] = this.nivelSeleccionado?.examenes;
                    grupos[this.grupoIndex] = data;
                    this.nivelSeleccionado.examenes = grupos;
                } else 
                    this.nivelSeleccionado.examenes.push(data);
                this.grupoIndex = null;
            }
        });
    }

    borrarGrupo(index: number){
        this.grupoIndex = index;
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: { mensaje: '¿Deseas eliminar permanentemente ese elemento?' }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                let grupos: ProgramaIdiomaExamenEditarProjection[] = this.nivelSeleccionado?.examenes;
                if(!!grupos[this.grupoIndex]?.id){
                    //call to service
                } else
                    grupos.splice(this.grupoIndex, 1);
                this.nivelSeleccionado.examenes = [...grupos];
                this.grupoIndex = null;
            }
        });
    }

    detalleIndex: number = null;
    abrirModalTest(grupoIndex, index){
        this.grupoIndex = grupoIndex;
        this.detalleIndex = index;
        let examen = this.nivelSeleccionado.examenes[this.grupoIndex];
        let detalle = this.detalleIndex != null ? examen?.detalles[this.detalleIndex] : new ProgramaIdiomaExamenDetalleEditarProjection();

        const dialogRef = this.dialog.open(AddTareaComponent, {
            width: '1000px',
            panelClass: 'custom-dialog-container',
            data: {
                detalle: detalle,
                idCurso: this.workshop.id,
                titulo: examen?.nombre,
                test: this.actividades,
                testFormat: this.actividadesFormatos,
                modalidades: [this.nivelSeleccionado?.modalidad],
                unidades: [...this.librosDataSource.data]
            }
        });
        dialogRef.afterClosed().subscribe(data => {
            if (!!data) {
                if(this.nivelSeleccionado.examenes[this.grupoIndex]?.detalles == null)
                    this.nivelSeleccionado.examenes[this.grupoIndex].detalles = [];
                if(this.detalleIndex != null){
                    let detalles = this.nivelSeleccionado.examenes[this.grupoIndex]?.detalles;
                    detalles[this.detalleIndex] = data.getRawValue();
                    this.nivelSeleccionado.examenes[this.grupoIndex].detalles = detalles;
                } else 
                    this.nivelSeleccionado.examenes[this.grupoIndex].detalles.push(data.getRawValue());
                this.grupoIndex = null;
                this.detalleIndex = null;
            }
        });
    }

    guardar() {
        let to_send: ProgramaIdiomaEditarProjection = new ProgramaIdiomaEditarProjection();
        let form = this.form.getRawValue();
        let modalidades = form.modalidades.map(modalidad => { 
            let idx = (this.workshop?.modalidades || []).findIndex( cM => cM.modalidad.id == modalidad.id );
            if(idx > -1)
                return this.workshop.modalidades[idx];
            else {
                let mI: ProgramaIdiomaModalidadEditarProjection = new ProgramaIdiomaModalidadEditarProjection();
                mI.modalidad = modalidad;
                return mI;
            }
        });
        let sucursales = form.sucursales.map(sucursal => {
            let idx = (this.workshop.sucursales || []).findIndex( cS => cS.sucursal.id == sucursal.id );
            if(idx > -1)
                return this.workshop.sucursales[idx];
            else {
                let sI: ProgramaIdiomaSucursalEditarProjection = new ProgramaIdiomaSucursalEditarProjection();
                sI.sucursal = sucursal;
                return sI;
            }
        });
        to_send.id = form?.id; //: number;
        to_send.codigo = form?.codigo;
        to_send.nombre = form?.nombre;
        to_send.programa = form.programa;
        to_send.programaId = form.programa?.id; //: number;
        to_send.idioma = form.idioma; //: ControlMaestroMultiple;
        to_send.idiomaId = form.idioma?.id; //: number;
        to_send.tipoWorkshop = form.tipoWorkshop; //?: ControlMaestroMultipleComboProjection;
        to_send.tipoWorkshopId = form.tipoWorkshop?.id; //?: number;
        to_send.plataforma = form.plataforma; //: ControlMaestroMultiple;
        to_send.plataformaId = form.plataforma?.id; //: number;
        to_send.horasTotales = form.horasTotales; //: number;
        to_send.numeroNiveles = form.numeroNiveles; //: number;
        to_send.calificacionMinima = form.calificacionMinima; //: number;
        to_send.mcer = form.mcer || ''; //: string;
        to_send.unidadMedida = form.unidadMedida; //: UnidadMedida;
        to_send.unidadMedidaId = form.unidadMedida?.id; //: number;
        to_send.clave = form.clave; //: string;
        to_send.examenEvaluacion = form.examenEvaluacion || true; //: boolean;
        to_send.descripcion = form.descripcion; //: string;
        to_send.iva = form.iva; //: number;
        to_send.ivaExento = form.ivaExento; //: boolean;
        to_send.faltasPermitidas = form.faltasPermitidas; //: number;
        to_send.ieps = form.ieps; //: number;
        to_send.cuotaFija = form.cuotaFija; //: boolean;
        to_send.activo = form.activo || true; //: boolean;
        to_send.certificaciones = form.certificaciones; //: ProgramaIdiomaCertificacion[];
        to_send.librosMateriales = this.librosDataSource.data; //: ProgramaIdiomaLibroMaterial[];
        to_send.modalidades = modalidades; //: ProgramaIdiomaModalidad[];
        to_send.sucursales = sucursales; //: ProgramaIdiomaSucursal[];
        to_send.niveles = this.nivelesDataSource.data; //?: ProgramaIdiomaNivel[];
        to_send.esJobs = form.esJobs; //?: boolean;
        to_send.esJobsSems = form.esJobsSems; //?: boolean;
        to_send.esAcademy = form.esAcademy; //?: boolean;
        to_send.tabulador = form.tabulador; //?: Tabulador;
        to_send.objetoImpuesto = form.objetoImpuesto; //?: ControlMaestroMultiple;
        to_send.objetoImpuestoId = form.objetoImpuesto?.id;
        to_send.agruparListadosPreciosPorTipoGrupo = false;
        
        if (this.form.valid) {
            this._cursoService.cargando = true;
            this.form.disable();
            this._cursoService.guardar(to_send, '/api/v1/workshop/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
                        });
                        this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._empleadoService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            this._cursoService.cargando = false;
            this.form.enable();
            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    
    }
}