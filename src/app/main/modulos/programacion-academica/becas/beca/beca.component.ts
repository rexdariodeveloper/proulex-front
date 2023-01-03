import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BecaSolicitud,BecaSolicitudEditarProjection } from '@app/main/modelos/beca-solicitud';
import { BecaUDG, BecaUDGEditarProjection } from '@app/main/modelos/becas-udg';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ControlMaestroMultipleComboProjection } from '@pixvs/models/control-maestro-multiple';
import { PAModalidadComboSimpleProjection } from '@app/main/modelos/pamodalidad';
import { ProgramaIdiomaComboSimpleProjection } from '@app/main/modelos/programa-idioma';
import { AlumnoComboProjection } from '@app/main/modelos/alumno';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BecaService } from './beca.service';
import * as moment from 'moment';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';


@Component({
    selector: 'beca',
    templateUrl: './beca.component.html',
    styleUrls: ['./beca.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class BecaComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form?.disabled || this.form?.pristine || this.formSolicitud?.disabled || this.formSolicitud?.pristine;
    }

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    beca: BecaUDG;
    form: FormGroup;
    formSolicitud: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    @ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;

    cursos: ProgramaIdiomaComboSimpleProjection[];
    modalidades: PAModalidadComboSimpleProjection[];
    alumnos: AlumnoComboProjection[];
    entidadesBecas: any[];

    cursoControl: FormControl = new FormControl();
    modalidadControl: FormControl = new FormControl();
    alumnoControl: FormControl = new FormControl();
    entidadBecaControl: FormControl = new FormControl();

    //@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;


    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;
    esAlerta: boolean = false;

    solicitud: BecaSolicitudEditarProjection = new BecaSolicitudEditarProjection;
    becasSeleccionadas: {[becaId:number]: boolean} = {};
    private rutaNuevoAlumno = '/app/control-escolar/alumnos/nuevo/';

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
        public _becaService: BecaService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english,spanish);

        // Set the default
        this.beca = new BecaUDG();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.queryParamMap.subscribe(qParams => {
            let alumnoId: number = this.hashid.decode(qParams.get("alumno"));
            if(alumnoId){
                this._becaService.getDatosAlumno(alumnoId).then(value =>{
                    this.alumnos = value.data;
                    this.alumnoControl.setValue(value.data);
                });
            }
            
        });

        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.beca = new BecaUDG();
            }
            if (this.pageType == 'alerta'){
                this.esAlerta = true;
                this._becaService.getSolicitudById(this.currentId).then(value =>{
                    this.solicitud = value.data.solicitud;
                    this.titulo = this.solicitud.codigo;
                    this.formSolicitud = this.createSolicitudForm();
                });
            }

            this.config = {
                rutaAtras: "/app/programacion-academica/becas-solicitudes",
                rutaBorrar: "/api/v1/becas-solicitudes/delete/",
                rutaAprobar: "/api/v1/becas-solicitudes/alerta/aprobar/",
                rutaRechazar: "/api/v1/becas-solicitudes/alerta/rechazar/",
                icono: "person_pin"
            }
        });

        // Subscribe to update cliente on changes
        if(this.pageType != 'alerta'){
            this._becaService.onDatosChanged
                .pipe(takeUntil(this._unsubscribeAll))
                .subscribe(datos => {
                    if (datos && datos.beca) {
                        this.beca = datos.beca;
                        this.titulo = this.beca.codigoBeca
                    } else {
                        this.beca = new BecaUDG();
                    }

                    this.cursos = datos.cursos;
                    this.modalidades = datos.modalidades;
                    this.alumnos = datos.alumnos;
                    this.entidadesBecas = datos.entidadesBecas;
                    if(this.pageType == 'alerta'){
                        this.form  = this._formBuilder.group({})
                    }else{
                        this.form =  this.createClienteForm();
                    }

                    if (this.pageType == 'ver') {
                        this.form.disable();
                    } else {
                        this.form.enable();
                    }

                });
        }
        /*this._becaService.onComboEstadosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoEstados => {
            if (listadoEstados) {
                this._becaService.onComboEstadosChanged.next(null);
                this.estados = listadoEstados;
                this.estadoSelect.setDatos(this.estados);
            }
        });*/
    }

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }

    createClienteForm(): FormGroup {
        this.cursoControl = new FormControl(this.beca.programaIdioma, [Validators.required]);
        this.modalidadControl = new FormControl(this.beca.paModalidad, [Validators.required]);
        this.modalidadControl = new FormControl(this.beca.paModalidad, [Validators.required]);
        this.alumnoControl = new FormControl(null, [Validators.required]);
        this.entidadBecaControl = new FormControl(this.beca.entidadBeca, [Validators.required]);
        
        
        this.cursoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.cursoControl.value){
                this._becaService.getComboModalidades(this.cursoControl.value.id).then(value =>{
                    this.modalidades = value.data;
                    this.modalidades.sort(function(a, b) { 
                      return a.id - b.id  ||  a.nombre.localeCompare(b.nombre);
                    });
                    const modalidadesUnicas = [...new Map(this.modalidades.map(item => [item.id, item])).values()];
                    this.modalidades = modalidadesUnicas;
                    this.modalidadSelect.setDatos(this.modalidades);
                });
            }
        });

        if(this.beca.programaIdioma){
            this._becaService.getComboModalidades(this.beca.programaIdioma.id).then(value =>{
                this.modalidades = value.data;
                this.modalidades.sort(function(a, b) { 
                  return a.id - b.id  ||  a.nombre.localeCompare(b.nombre);
                });
                const modalidadesUnicas = [...new Map(this.modalidades.map(item => [item.id, item])).values()];
                this.modalidades = modalidadesUnicas;
                this.modalidadSelect.setDatos(this.modalidades);
            });
        }

        let form = this._formBuilder.group({
            id: [this.beca.id],
            codigoBeca: new FormControl(this.beca.codigoBeca, []),
            nombre: new FormControl(this.beca.nombre),
            primerApellido: new FormControl(this.beca.primerApellido),
            segundoApellido: new FormControl(this.beca.segundoApellido),            
            descuento: new FormControl(this.beca.descuento*100, [Validators.required]),
            programaIdioma: this.cursoControl,
            paModalidad: this.modalidadControl,
            nivel: new FormControl(this.beca.nivel, [Validators.required]),
            fechaAlta: new FormControl(this.beca.fechaAlta),
            estatus: new FormControl(this.beca.estatus),
            entidadBeca: this.entidadBecaControl,
            tipo: new FormControl(this.beca.tipo),
            alumnoTemp: this.alumnoControl,
            codigoAlumno: new FormControl(this.beca.codigoAlumno),
            solicitudId: new FormControl(this.beca.solicitudId),
            comentarios: new FormControl(this.beca.comentarios)
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            if(this.beca.nombre){
                let alumno = this.beca.nombre+' '+this.beca.primerApellido+' '+this.beca.segundoApellido;
                form.addControl('alumno',new FormControl(alumno));
            }
        }

        return form;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string, form: FormGroup) {
        let form_field = form.get(campo);
        
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        
        return !!(validator && validator.required);
    }

    guardar() {
        if (this.form.valid) {
            let modelo = this.form.getRawValue();

            this._becaService.cargando = true;
            this.form.disable();        

            this._becaService.guardar(JSON.stringify(modelo), '/api/v1/becas-solicitudes/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
                        });

                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
                        });
                        this.form.disable();
                        this.router.navigate([this.config.rutaAtras]);
                    } else {
                        this._becaService.cargando = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();
                        
                        break;
                    }

                }
            }

            this._becaService.cargando = false;
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


    //Metodos para alertas
    createSolicitudForm(): FormGroup {
        let becas : FormArray = new FormArray([]);
        if(this.solicitud.becas){
            this.solicitud.becas.forEach(beca =>{
                if(beca.estatus.id != 2000805){
                   becas.push(this.createBecaForm(beca,this.solicitud.id));
                    this.becasSeleccionadas[beca.id] = true; 
                }
            });
        }
        let form = this._formBuilder.group({
            id: [this.solicitud.id],
            codigo: new FormControl(this.solicitud.codigo),
            estatus: new FormControl(this.solicitud.estatus),
            creadoPor: new FormControl(this.solicitud.creadoPor.nombreCompleto),
            fechaCreacion: new FormControl(moment(this.solicitud.fechaCreacion).format('YYYY-MM-DD')),
            becas: becas,
            becasNumero: new FormControl(becas.length)
        });
        return form;
    }

    createBecaForm(beca : BecaUDGEditarProjection, idSolicitud : number): FormGroup{
        let form = this._formBuilder.group({
            id: [beca.id],
            solicitudId: new FormControl(idSolicitud),
            codigoBeca: new FormControl(beca.codigoBeca),
            nombre: new FormControl(beca.nombre),
            primerApellido: new FormControl(beca.primerApellido),
            segundoApellido: new FormControl(beca.segundoApellido),            
            descuento: new FormControl(beca.descuento),
            programaIdioma: new FormControl(beca.programaIdioma),
            paModalidad: new FormControl(beca.paModalidad),
            nivel: new FormControl(beca.nivel, [Validators.required]),
            fechaAlta: new FormControl(beca.fechaAlta),
            estatus: new FormControl(beca.estatus),
            tipo: new FormControl(beca.tipo),
            entidadBeca: new FormControl(beca.entidadBeca),
            codigoAlumno: new FormControl(beca.codigoAlumno),
            comentarios: new FormControl(beca.comentarios)
        });
        return form;
    }

    marcarBeca(beca: BecaUDGEditarProjection){
        this.becasSeleccionadas[beca.id] = !this.becasSeleccionadas[beca.id];
    }

    onAprobar(){
        if(!this.becasSeleccionadas){
            this._matSnackBar.open('Selecciona al menos una beca antes de aprobar', 'OK', {
                duration: 5000,
            });
            this._becaService.cargando = false;
            return;
        }
        this._becaService.aprobarPersonalizado(this.solicitud.id,this.becasSeleccionadas,moment().format('YYYY-MM-DD')).then(v =>{
            this.router.navigate(['/app/compras/listado-alertas']);
        });
    }

    onNuevoAlumno(){
        this.router.navigate([this.rutaNuevoAlumno],{queryParams: {
            fichaVolver: 'Becas'
        }});
    }

    onBorrar(){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Realmente desea cancelar esta beca?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this._becaService.eliminar(this.config.rutaBorrar + this.hashid.encode(this.currentId)).then(function (result: JsonResponse){
                        if (result.status == 200) {
                            this._matSnackBar.open(this.translate.instant('BECA.CANCELADA'), 'OK', {
                                duration: 5000,
                            });
                            this.router.navigate([this.config.rutaAtras])
                        }else{
                            this._matSnackBar.open(result.message, 'OK', {
                                duration: 5000,
                            });
                        }

                    }.bind(this)
                );
            }
        });
    }
}