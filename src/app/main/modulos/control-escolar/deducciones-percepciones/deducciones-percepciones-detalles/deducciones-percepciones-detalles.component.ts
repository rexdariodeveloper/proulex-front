import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject, HostListener } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, FormArray, } from '@angular/forms';
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
import { DeduccionComboProjection } from '@app/main/modelos/deduccion-percepcion';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';




@Component({
    selector: 'deducciones-percepciones-detalles',
    templateUrl: './deducciones-percepciones-detalles.component.html',
    styleUrls: ['./deducciones-percepciones-detalles.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DeduccionesPercepcionesDetallesComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}


    pageType: string = 'ver';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    deduccionPercepcion: EmpleadoDeduccionPercepciónEditarProjection;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    tipos : ControlMaestroMultipleComboProjection[];
    percepciones: DeduccionComboProjection[];
    deducciones: DeduccionComboProjection[];
    empleados: EmpleadoComboProjection[];

    archivos: any[] = [];


    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;


    //dataSource: MatTableDataSource<any> = new MatTableDataSource([]);
    //@ViewChild(MatSort) sort: MatSort;
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
        public validatorService: ValidatorService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        //this.curso = new Programa();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = 'ver';
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
               console.log(datos); 
               this.deduccionPercepcion = datos.deduccionPercepcion;
               this.titulo = this.deduccionPercepcion.codigo;
               this.form = this.createProgramaForm();
               this.form.disable();
            });
    }

    ngAfterViewInit(){
        
    }

    createProgramaForm(): FormGroup {
        if(this.deduccionPercepcion.documentos){
            this.deduccionPercepcion.documentos.forEach(documento =>{
                this.archivos.push(documento.archivo);
            });
        }
        console.log(this.archivos);
        let form: FormGroup = this._formBuilder.group({
            id:[this.deduccionPercepcion.id],
            empleado: new FormControl(this.deduccionPercepcion.empleado.nombreCompleto),
            fecha: new FormControl(moment(this.deduccionPercepcion.fecha).format('DD/MM/YYYY')),
            tipoMovimiento: new FormControl(this.deduccionPercepcion.tipoMovimiento.valor),
            concepto: new FormControl(this.deduccionPercepcion.deduccionPercepcion.codigo),
            valorFijo: new FormControl(this.deduccionPercepcion.valorFijo),
            cantidadHoras: new FormControl(this.deduccionPercepcion.cantidadHoras),
            total: new FormControl(this.deduccionPercepcion.total)
        });
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
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        if (this.form.valid) {
            this._deduccionesPercepcionesService.cargando = true;

    		this.form.disable();
            this._deduccionesPercepcionesService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/grupos/save').then(
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

            /*for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }*/
            this.markFormGroupTouched(this.form);

            this._deduccionesPercepcionesService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
          control.markAsTouched();

          if (control.controls) {
            this.markFormGroupTouched(control);
          }
        });
      }

    descargarPDF(archivo: any){
        if(archivo){
            this._deduccionesPercepcionesService.verArchivo(archivo);
        }
    }


    deshabilitarCampos(event){
        //this.deshabilitarBotones = true;
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