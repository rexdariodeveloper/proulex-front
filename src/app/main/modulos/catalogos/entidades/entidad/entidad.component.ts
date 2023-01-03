import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Entidad, EntidadComboProjection } from '@app/main/modelos/entidad';
import { EntidadContrato} from '@app/main/modelos/entidad-contrato';
import { EstadoComboProjection } from '@app/main/modelos/estado';
import { PaisComboProjection } from '@app/main/modelos/pais';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
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
import { EntidadService } from './entidad.service';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';

@Component({
    selector: 'entidad',
    templateUrl: './entidad.component.html',
    styleUrls: ['./entidad.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class EntidadComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    entidad: Entidad;
    form: FormGroup;

    //Contactos
    contratoGroup: FormGroup;
    contratoGroupIndex: number = null;
    contratoEnEdicion: boolean = false;
    contratos: FormArray;
    entidadContrato: EntidadContrato;

    @ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
    
    // 
    directorControl: FormControl = new FormControl();
    coordinadorControl: FormControl = new FormControl();
    jefeUnidadAFControl: FormControl = new FormControl();
    paisControl: FormControl = new FormControl();
    estadoControl: FormControl = new FormControl();
    entidadIndependienteControl: FormControl = new FormControl();

    tipoContratoControl: FormControl = new FormControl();

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    paises: PaisComboProjection[];
    estados: EstadoComboProjection[];
    tiposContratos: ControlMaestroMultipleComboProjection[];
    entidades: EntidadComboProjection[];
    empleados: EmpleadoComboProjection[];

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };
    public tienePermisos : boolean = false;

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
        public _entidadService: EntidadService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.entidad = new Entidad();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.entidad = new Entidad();
            }

            this.config = {
                rutaAtras: "/app/catalogos/entidades",
                rutaBorrar: "/api/v1/entidades/delete/",
                icono: "person_pin"
            }
        });

        // Subscribe to update cliente on changes
        this._entidadService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.entidad) {
                    this.entidad = datos.entidad;
                    this.titulo = this.entidad.codigo;
                } else {
                    this.entidad = new Entidad();
                }

                this.entidades = datos.entidadesDependientes;
                this.paises = datos.paises;
                this.empleados = datos.empleados;
                this.tiposContratos = datos.tiposContratos;

                this.form = this.createClienteForm();                

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });
    }

    createClienteForm(): FormGroup {
        this.paisControl = new FormControl(this.entidad.pais, [Validators.required]);
        this.estadoControl = new FormControl(this.entidad.estado, [Validators.required]);
        this.directorControl = new FormControl(this.entidad.director);
        this.coordinadorControl = new FormControl(this.entidad.coordinador);
        this.jefeUnidadAFControl = new FormControl(this.entidad.jefeUnidadAF);
        this.entidadIndependienteControl = new FormControl(this.entidad.entidadIndependiente);

        this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (!!this.estadoSelect) {
                if (this.paisControl.value) {
                    this._entidadService.getComboEstados(this.paisControl.value.id).then(value =>{
                        this.estados = value.data;
                        this.estadoSelect.setDatos(this.estados);
                    });
                }
            }
        });

        if(this.entidad.pais){
            this._entidadService.getComboEstados(this.entidad.pais.id).then(value =>{
                this.estados = value.data;
                this.estadoSelect.setDatos(this.estados);
            });
        }

        this.contratos = new FormArray([]);

        if (this.entidad.contratos) {
            this.entidad.contratos.forEach(contacto => {
                this.contratos.push(this.createContratoForm(contacto, this.entidad));
            });
        }

        let form = this._formBuilder.group({
            id: [this.entidad.id],
            codigo: new FormControl(this.entidad.codigo, [Validators.required, Validators.maxLength(20)]),
            prefijo: new FormControl(this.entidad.prefijo, [Validators.required, Validators.maxLength(20)]),
            nombre: new FormControl(this.entidad.nombre, [Validators.required, Validators.maxLength(150),]),
            razonSocial: new FormControl(this.entidad.razonSocial),            
            nombreComercial: new FormControl(this.entidad.nombreComercial),
            director: this.directorControl,
            coordinador: this.coordinadorControl,
            jefeUnidadAF: this.jefeUnidadAFControl,
            domicilio: new FormControl(this.entidad.domicilio, [Validators.required, Validators.maxLength(250)]),
            colonia: new FormControl(this.entidad.colonia, [Validators.required, Validators.maxLength(250)]),
            cp: new FormControl(this.entidad.cp, [Validators.required, Validators.maxLength(10)]),
            pais: this.paisControl,
            estado: this.estadoControl,
            ciudad: new FormControl(this.entidad.ciudad, [Validators.maxLength(200)]),
            entidadIndependiente: this.entidadIndependienteControl,
            activo: new FormControl(this.entidad.activo == null ? true : this.entidad.activo),
            aplicaSedes: new FormControl(this.entidad.aplicaSedes == null ? false : this.entidad.aplicaSedes),
            contratos: this.contratos
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }

        return form;
    }

    createContratoForm(entidadContrato: EntidadContrato, entidad: Entidad): FormGroup {
        this.entidadContrato = entidadContrato ? entidadContrato : new EntidadContrato();
        this.entidadContrato.activo = this.entidadContrato.activo || true;

        let form: FormGroup = this._formBuilder.group({
            id: [this.entidadContrato.id],
            entidadId: new FormControl(this.entidadContrato.entidadId),
            tipoContrato: new FormControl(this.entidadContrato.tipoContrato),
            documentoContrato: new FormControl(this.entidadContrato.documentoContrato),
            adendumContrato: new FormControl(this.entidadContrato.adendumContrato),
            activo: new FormControl(this.entidadContrato.activo == null ? true : this.entidadContrato.activo)
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

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

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }


    guardar() {
        let modelo = this.form.getRawValue();

        this._entidadService.cargando = true;
        this.form.disable();        

        this._entidadService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/entidades/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
                    });

                    if (!!!this.entidad.id) {
                        this._matSnackBar.open(result.message, 'OK', {
                            duration: 5000,
                        });
                    }

                    this.form.disable();
                    this.router.navigate([this.config.rutaAtras])
                } else {
                    this._entidadService.cargando = false;
                    this.form.enable();
                }
            }.bind(this)
        );
    }

    newContrato(): void {
        this.contratoGroup = this.createContratoForm(null, this.entidad);
        this.contratoGroupIndex = null;
        this.contratos.push(this.contratoGroup);
        this.contratoEnEdicion = true;
    }

    cancelarContrato(form: FormGroup): void {
        if (this.contratoGroupIndex == null) {
            this.contratos.removeAt(this.contratos.controls.length - 1);
        }

        this.contratoEnEdicion = false;
    }

    editarContrato(selectedContrato: FormGroup, index: number): void {
        this.contratoGroup = this.createContratoForm(selectedContrato.getRawValue(), this.entidad);
        this.contratoGroupIndex = index;
        this.contratoEnEdicion = true;
    }

    addContrato(): void {
        if (this.contratoGroup.valid) {
            if (this.contratoGroupIndex != null) {
                this.contratos.controls[this.contratoGroupIndex] = this.createContratoForm(this.contratoGroup.getRawValue(), this.entidad);
            }

            this.contratoEnEdicion = false;
            this.tipoContratoControl.reset();
            console.log(this.contratos);
        } else {
            for (const key of Object.keys(this.contratoGroup.controls)) {
                if (this.contratoGroup.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();

                        break;
                    }
                }
            }

            this._entidadService.cargando = false;

            this.contratoGroup.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
        }
        
    }

    pdfChangeEvent(event: any, form: FormGroup){
        let archivo: File = null;
        if(event?.target?.files?.length){
            for(let file of event.target.files){ archivo = file; }
        }
        if(!!archivo){
            this._entidadService.subirArchivo(archivo).then(archivoResponse =>{
                let contrato = {
                    nombreOriginal: archivo.name,
                    id:archivoResponse.data
                };
                form.get('documentoContrato').setValue(contrato);
            });
        }
    }

    pdfChangeEventAdedum(event: any, form: FormGroup){
        let archivo: File = null;
        if(event?.target?.files?.length){
            for(let file of event.target.files){ archivo = file; }
        }
        if(!!archivo){
            this._entidadService.subirArchivo(archivo).then(archivoResponse =>{
                let adedum = {
                    nombreOriginal: archivo.name,
                    id:archivoResponse.data
                };
                form.get('adendumContrato').setValue(adedum);
            });
        }
    }

    descargarPDF(archivo: any){
        if(archivo){
            this._entidadService.verArchivo(archivo);
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

}