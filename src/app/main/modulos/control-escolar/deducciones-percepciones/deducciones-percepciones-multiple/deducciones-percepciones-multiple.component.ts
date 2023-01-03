import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray } from '@angular/forms';
import { Subject, ReplaySubject, Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { DeduccionesPercepcionesService } from '../deducciones-percepciones/deducciones-percepciones.service';
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
import { Usuario } from '@models/usuario';
import { EmpleadoDeduccionPercepcion, EmpleadoDeduccionPercepciónEditarProjection } from '@app/main/modelos/empleado-deduccion-percepcion';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { DeduccionComboProjection } from '@app/main/modelos/deduccion-percepcion';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { AddExamenComponent,AddExamenData } from './dialogs/add-examen/add-examen.dialog';


@Component({
    selector: 'deducciones-percepciones-multiple',
    templateUrl: './deducciones-percepciones-multiple.component.html',
    styleUrls: ['./deducciones-percepciones-multiple.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DeduccionesPercepcionesMultiplesComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    form: FormGroup;

    deduccionesPercepciones: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    tipos : ControlMaestroMultipleComboProjection[];
    percepciones: DeduccionComboProjection[];
    deducciones: DeduccionComboProjection[];
    empleados: EmpleadoComboProjection[];
    sucursales: SucursalComboProjection[];

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number; 
    
    displayedColumns: string[] = ['fecha', 'empleado','tipoMovimiento','concepto','monto','acciones'];

    deshabilitarBotones: boolean = true;
    esModificarSueldoHora: boolean = false;

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
        public _deduccionesPercepcionesService: DeduccionesPercepcionesService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        //this.curso = new Programa();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            

            this.config = {
                rutaAtras: "/app/control-escolar/deducciones-percepciones",
                rutaBorrar: "/api/v1/empleado-deduccion-percepcion/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._deduccionesPercepcionesService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                let permisos: Object = datos?.permisos || new Object();

                this.titulo = "Nuevo";
                //this.cursos = datos.cursos;
                this.form = this._formBuilder.group({});
                this.tipos = datos.tipos;
                this.percepciones = datos.percepciones;
                this.deducciones = datos.deducciones;
                this.empleados = datos.empleados;
                this.sucursales = datos.sucursales;
                this.deduccionesPercepciones = new FormArray([]);

                if (permisos.hasOwnProperty('MODIFICAR_SUELDO_HORA'))
                    this.esModificarSueldoHora = true;
            });     
        
    }

    ngAfterView(){

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
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        if (this.form.valid) {
            this._deduccionesPercepcionesService.cargando = true;

    		this.form.disable();
            this._deduccionesPercepcionesService.guardar(JSON.stringify(this.deduccionesPercepciones.getRawValue()), '/api/v1/empleado-deduccion-percepcion/save/multiple').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        let cambios = result.data;
                        if(cambios && cambios.length > 0){
                            this._matSnackBar.open(this.translate.instant(cambios.join()), 'OK', {
                                duration: 10000,
                            });
                        }else{
                            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                                duration: 5000,
                            });
                        }
                        
    					this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._empleadoService.cargando = false;
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

            this._deduccionesPercepcionesService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    abrirModal(){
        if(this.form.valid){
            const dialogRef = this.dialog.open(AddExamenComponent, {
                width: '1000px',
                data: {
                    empleados: this.empleados,
                    tipos: this.tipos,
                    deducciones: this.deducciones,
                    percepciones: this.percepciones,
                    sucursales: this.sucursales,
                    esModificarSueldoHora: this.esModificarSueldoHora
                }
            });
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    //this.guardar();
                    this.agregarDeduccionPercepcion(confirm);
                }
            });
        }
        
    }

    agregarDeduccionPercepcion(deduccionPercepcion: FormGroup){
        this.deduccionesPercepciones.push(deduccionPercepcion);
    }

    borrarDeduccionPercepcion(index: number){
        this.deduccionesPercepciones.removeAt(index);
    }

    pdfChangeEvent(event: any, index: number){
        let archivo: File = null;
        if(event?.target?.files?.length){
            for(let file of event.target.files){ archivo = file; }
        }
        if(!!archivo){
            this._deduccionesPercepcionesService.subirArchivo(archivo,"").then(archivoResponse =>{
                let archivoTemp = {
                    nombreOriginal: archivo.name,
                    id:archivoResponse.data
                };
                let form = this._formBuilder.group({
                    id:[null],
                    empleadoDeduccionpercepcionId: new FormControl(null),
                    archivo: new FormControl(archivoTemp)
                });
                ((this.deduccionesPercepciones.controls[index] as FormGroup).get('documentos') as FormArray).push(form);
                this._matSnackBar.open(this.translate.instant('Archivo agregado'), 'OK', {
                    duration: 5000,
                });
            });
        }
    }


    formatDollar(num: number) {
        var p = Number(num).toFixed(2).split(".");
        return "$" + p[0].split("").reverse().reduce(function(acc, num, i, orig) {
            return  num=="-" ? acc : num + (i && !(i % 3) ? "," : "") + acc;
        }, "") + "." + p[1];
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