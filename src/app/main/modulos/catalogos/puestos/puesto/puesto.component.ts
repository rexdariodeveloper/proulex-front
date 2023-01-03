import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PuestoEditarProjection } from '@app/main/modelos/puesto';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
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
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PuestoService } from './puesto.service';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PuestoHabilidadResponsabilidad } from '@models/puesto-habilidad-responsabilidad';
import { HabilidadResponsabilidadDialogComponent, HabilidadResponsabilidadDialogData } from './dialogs/habilidadResponsabilidad/habilidad-responsabilidad.dialog';

@Component({
    selector: 'puesto',
    templateUrl: './puesto.component.html',
    styleUrls: ['./puesto.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PuestoComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    puesto: PuestoEditarProjection;
    form: FormGroup;

    estadosCmm: ControlMaestroMultipleComboProjection[] = [];
    estadoPuestoControl: FormControl = new FormControl();
    habilidadesResponsabilidades: FormArray = new FormArray([]);

    camposListado: FieldConfig[] = [];


    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;


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
        public _puestoService: PuestoService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.puesto = new PuestoEditarProjection();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.puesto = new PuestoEditarProjection();
            }

            this.config = {
                rutaAtras: "/app/catalogos/puestos",
                rutaBorrar: "/api/v1/puestos/delete/",
                icono: "work_outline"
            }
        });

        // Subscribe to update cliente on changes
        this._puestoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                this.estadosCmm = datos.listaEstatus;
                if(!!datos.puesto)
                    this.puesto = datos.puesto;

                this.form = this.createPuestoForm();

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });
        
        
    }

    createPuestoForm(): FormGroup {
        this.estadoPuestoControl = new FormControl(this.puesto.estadoPuesto, [Validators.required,]);
        this.habilidadesResponsabilidades = this._formBuilder.array([]);

        let form = this._formBuilder.group({
            id: [this.puesto.id],
            codigo: new FormControl(this.puesto.codigo, [Validators.required, Validators.minLength(3), Validators.maxLength(5)]),
            nombre: new FormControl(this.puesto.nombre, [Validators.required, Validators.maxLength(100),]),
            descripcion: new FormControl(this.puesto.descripcion, [Validators.maxLength(150),]),
            proposito: new FormControl(this.puesto.proposito, [Validators.maxLength(150),]),
            observaciones: new FormControl(this.puesto.observaciones, [Validators.maxLength(150),]),
            habilidadesResponsabilidades: this.habilidadesResponsabilidades,
            estadoPuesto: this.estadoPuestoControl
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }

        if(!!this.puesto.habilidadesResponsabilidades && this.puesto.habilidadesResponsabilidades.length){
            for(let index = 0, t = this.puesto.habilidadesResponsabilidades.length; index < t ; index++){
                let item = this.createResposabilidadHabilidad(this.puesto.habilidadesResponsabilidades[index]);
                this.habilidadesResponsabilidades.push(item);
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

    recargar() {
        this.pageType = this.fichaCrudComponent.recargar();
    }



    guardar() {
        let modelo = this.form.getRawValue();

        this._puestoService.cargando = true;
        this.form.disable();


        this._puestoService.guardar(JSON.stringify(modelo), '/api/v1/puestos/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
                    });

                    this.form.disable();
                    this.router.navigate([this.config.rutaAtras])
                } else {
                    this._puestoService.cargando = false;
                    this.form.enable();
                }
            }.bind(this)
        );
    }


    addHabilidadResponsabilidad(datos){
        let responsabilidadesArray = this.form.controls["habilidadesResponsabilidades"] as FormArray;
        if(datos.index === -1){
            responsabilidadesArray.push(this.createResposabilidadHabilidad(datos));
        }else if(datos.index !== -1){
            // this.form.get('municipioNacimiento').setValue(null);
            responsabilidadesArray.at(datos.index).get('descripcion').setValue(datos.descripcion)
        }
            
    }

    createResposabilidadHabilidad(item){
		return this._formBuilder.group({
            id:[item?.id],
            puestoId: new FormControl(this.puesto?.id),
            descripcion: new FormControl(item?.descripcion),
            esHabilidad: new FormControl(item?.esHabilidad)
        })
	}

    abrirModal(data, tipo){
        // buscar index
        let hr: PuestoHabilidadResponsabilidad = !!data ? data.value : new PuestoHabilidadResponsabilidad();

        if(!!this.puesto.id){
            hr.puestoId = this.puesto.id
        }

        this.camposListado = [{
            type: 'input',
            label: 'Descripción',
            inputType: 'text',
            name: 'descripcion',
            validations: [{
                    name: 'required',
                    validator: Validators.required,
                    message: 'Descripción requerida'
                },
                {
                    name: 'minlength',
                    validator: Validators.minLength(10),
                    message: 'La descripción debe contener al menos 10 caracteres'
                },
                {
                    name: 'maxlength',
                    validator: Validators.maxLength(250),
                    message: 'La descripción no debe sobrepasar los 250 caracteres'
                }
            ]
        }];

        let index: number = -1;
        if(!!data){
            if(data.id){
                index = this.form.controls["habilidadesResponsabilidades"].value.findLastIndex(hrItem => hrItem.id == hr.id);
            }else{
                index = this.form.controls["habilidadesResponsabilidades"].value.findLastIndex(hrItem => hrItem.descripcion == hr.descripcion);
            }
        }
        
        let info: HabilidadResponsabilidadDialogData = {
            esNuevo: (!!hr && hr.id ? true: false),
            habilidadResponsabilidad: hr,
            esHabilidad: (tipo == 'Habilidad' ? true: false),
            titulo: tipo,
            index: index,
            camposListado: this.camposListado,
            onAceptar: this.addHabilidadResponsabilidad.bind(this)
        }

        const dialogRef = this.dialog.open(HabilidadResponsabilidadDialogComponent, {
            width: '500px',
            data: info
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.addHabilidadResponsabilidad(confirm);
            }
        });
    }

    get habilidades(){
        if(!!this.form){
            let responsabilidadesArray = this.form.controls["habilidadesResponsabilidades"] as FormArray;
            return new FormArray(responsabilidadesArray.controls.filter(r => !!r.value.esHabilidad))
        }else{
            return new FormArray([]);
        }
    }

    get responsabilidades(){
        if(!!this.form){
            let habilidadesArray = this.form.controls["habilidadesResponsabilidades"] as FormArray;
            return new FormArray(habilidadesArray.controls.filter(r => !!!r.value.esHabilidad))
        }else{
            return new FormArray([]);
        }
    }

    
}