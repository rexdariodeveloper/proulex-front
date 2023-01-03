import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation, IterableDiffers } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { PrecioIncompany, PrecioIncompanyEditarProjection } from '@app/main/modelos/precio-incompany';
import { PrecioIncompanyDetalle, PrecioIncompanyDetalleEditarProjection } from '@app/main/modelos/precio-incompany-detalles';
import { PrecioIncompanySucursal, PrecioIncompanySucursalEditarProjection } from '@app/main/modelos/precio-incompany-sucursal';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
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
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrecioIncompanyService } from './precio-incompany.service';
import * as moment from 'moment';
import { AgregarSalarioComponent,AgregarSalarioData } from './dialogs/agregar-salario/agregar-salario.dialog';

@Component({
    selector: 'precio-incompany',
    templateUrl: './precio-incompany.component.html',
    styleUrls: ['./precio-incompany.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class PrecioIncompanyComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    precioIncompany: PrecioIncompany;
    form: FormGroup;

    //Detalles
    detalles: FormArray;

    //Cursos
    //cursos: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    //categorias: PAProfesorComboProjection[];
    programas: ProgramaComboProjection[];
    sucursales: SucursalComboProjection[];

    categoriaControl: FormControl = new FormControl();

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    salario: string;

    displayedColumns: string[] = ['zona', 'precio','transporte','idioma','programa','modalidad','horario','acciones'];
    //displayedColumnsCursos: string[] = ['idioma', 'programa','modalidad','horario','acciones'];

    cambioDetalles: boolean = false;
    inicial: boolean = true;
    iterableDiffer: any;

    idiomas: ControlMaestroMultipleComboProjection[];
    zonas: ControlMaestroMultipleComboProjection[];
    modalidades: PAModalidadComboProjection[];

    estatusControl: FormControl = new FormControl();

    sucursalesChipsArray: string[] = [];
    sucursalesSelected: string[] = [];

    sucursalForm: FormArray;

    sucursalControl: FormControl = new FormControl();

    deshabilitarBotones: boolean = true;

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
        public _precioIncompanyService: PrecioIncompanyService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private iterableDiffers: IterableDiffers
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.precioIncompany = new PrecioIncompany();

        // Set the private defaults
        this._unsubscribeAll = new Subject();

        this.iterableDiffer = iterableDiffers.find([]).create(null);
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.precioIncompany = new PrecioIncompany();
            }

            this.config = {
                rutaAtras: "/app/catalogos/precio-incompany",
                rutaBorrar: "/api/v1/precios-incompany/delete/",
                icono: "receipt"
            }
        });

        // Subscribe to update cliente on changes
        this._precioIncompanyService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.precio) {
                    this.precioIncompany = datos.precio;
                    this.titulo = this.precioIncompany.codigo
                } else {
                    this.precioIncompany = new PrecioIncompany();
                }

                this.idiomas = datos.idiomas;
                this.zonas = datos.zonas;
                this.programas = datos.programas;
                this.modalidades = datos.modalidades;
                this.sucursales = datos.sucursales;

                this.sucursales.forEach(sucursal =>{
                    this.sucursalesChipsArray.push(sucursal.nombre);
                });

                this.form = this.createClienteForm();                

                if (this.pageType == 'ver') {
                    this.form.disable();
                    this.deshabilitarBotones = false;
                } else {
                    this.form.enable();
                }

                this.form.get('indeterminado').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    if(this.form.get('indeterminado').value == true){
                        this.form.get('fechaInicio').setValue(null);
                        this.form.get('fechaFin').setValue(null);

                        this.form.get('fechaInicio').disabled;
                        this.form.get('fechaFin').disabled;
                    }else{
                        this.form.get('fechaInicio').enable;
                        this.form.get('fechaFin').enable;
                    }
                });

            });

    }

    ngAfterViewInit(){
        this.inicial = false;
    }

    ngDoCheck() {
        
    }

    createClienteForm(): FormGroup {
        let sucursalSelected = [];
        this.detalles = new FormArray([]);
        this.sucursalForm = new FormArray([]);
        this.sucursalControl = new FormControl([], [Validators.required]);
        if (this.precioIncompany.detalles) {
            
            this.precioIncompany.detalles.forEach(detalle => {
                this.detalles.push(this.createDetalleForm(detalle, this.precioIncompany));
            });
        }

        if(this.precioIncompany.sucursales){
            this.precioIncompany.sucursales.forEach(sucursal =>{
               this.sucursalForm.push(this.createSucursalForm(sucursal,this.precioIncompany,null));
                sucursalSelected.push(sucursal.sucursal);
            });
            this.sucursalControl = new FormControl(sucursalSelected, [Validators.required]);
        }
        /*this.cursos = new FormArray([]);
        if(this.tabulador.cursos){
           this.tabulador.cursos.sort(function(a, b){
                if(a.programa.codigo < b.programa.codigo) { return -1; }
                if(a.programa.codigo > b.programa.codigo) { return 1; }
                return 0;
            });
           this.tabulador.cursos.forEach(curso =>{
               this.cursos.push(this.createTabuladorCursoForm(curso,this.tabulador));
           });
        }*/

        let form = this._formBuilder.group({
            id: [this.precioIncompany.id],
            codigo: new FormControl(this.precioIncompany.codigo, [Validators.required, Validators.maxLength(10),]),
            nombre: new FormControl(this.precioIncompany.nombre, [Validators.required, Validators.maxLength(50),]),
            fechaInicio: new FormControl(this.precioIncompany.id == null ? null : moment(this.precioIncompany.fechaInicio).format('YYYY-MM-DD')),
            fechaFin: new FormControl(this.precioIncompany.id == null ? null : moment(this.precioIncompany.fechaInicio).format('YYYY-MM-DD')),
            estatus: new FormControl(this.precioIncompany.estatus),
            indeterminado: new FormControl(this.precioIncompany.id == null ? false : this.precioIncompany.indeterminado),
            detalles: this.detalles,
            sucursales: this.sucursalForm,
            sucursalesControl: this.sucursalControl
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }

        return form;
    }

    createDetalleForm(detalle: PrecioIncompanyDetalle, precioIncompany: PrecioIncompany): FormGroup {
        detalle = detalle ? detalle : new PrecioIncompanyDetalle();

        let form: FormGroup = this._formBuilder.group({
            id: [detalle.id],
            precioIncompanyIdId: new FormControl(precioIncompany.id, []),
            zona: new FormControl(detalle.zona, [Validators.required,]),
            precioVenta: new FormControl(detalle.precioVenta, [Validators.required]),
            porcentajeTransporte: new FormControl(detalle.porcentajeTransporte, [Validators.required]),
            idioma: new FormControl(detalle.idioma, [Validators.required]),
            programa: new FormControl(detalle.programa, [Validators.required]),
            modalidad: new FormControl(detalle.modalidad, [Validators.required]),
            horario: new FormControl(detalle.horario, [Validators.required]),
            activo: new FormControl(detalle.id != null ? detalle.activo : true, [Validators.required,])
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    /*createTabuladorCursoForm(tabuladorCurso: TabuladorCurso, tabulador: Tabulador): FormGroup {
        tabuladorCurso = tabuladorCurso ? tabuladorCurso : new TabuladorDetalle();

        let form: FormGroup = this._formBuilder.group({
            id: [tabuladorCurso.id],
            tabuladorId: new FormControl(tabulador.id, []),
            programa: new FormControl(tabuladorCurso.programa, [Validators.required]),
            modalidad: new FormControl(tabuladorCurso.modalidad, [Validators.required]),
            modalidadHorario: new FormControl(tabuladorCurso.modalidadHorario, [Validators.required]),
            programaIdioma: new FormControl(tabuladorCurso.programaIdioma, [Validators.required]),
            activo: new FormControl(tabuladorCurso.id != null ? tabuladorCurso.activo : true, [Validators.required,]),
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }*/

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

    /*actualizarDatos(){
        if(this.cambioDetalles){
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                    width: '400px',
                    data: {
                        mensaje: this.translate.instant('¿Quieres actualizar los grupos activos?')
                    }
                });

                dialogRef.afterClosed().subscribe(confirm => {
                    if (confirm) {
                        this.form.addControl("actualizarGrupos",new FormControl(true));
                    }else{
                        this.form.addControl("actualizarGrupos",new FormControl(false));
                    }
                    this.guardar();
                });
            }else{
                this.guardar();
            }
    }*/

    guardar() {
        
        if (this.form.valid) {
            
            //let detallesTemp = Object.assign([],this.detalles.value);
            /*detallesTemp.forEach(detalle =>{
                detalle.sueldo = Number(detalle.sueldo);
            });
            this.detalles = new FormArray([]);
            detallesTemp.forEach(det =>{
                this.detalles.push(this.createTabuladorDetalleForm(det, this.tabulador));
            });*/
            this.form.removeControl("detalles");
            this.form.addControl("detalles",this.detalles);
            let idiomaProgramaSucursalForm = new FormArray([]);
            this.form.get('sucursalesControl').value.forEach(sucursal =>{
               idiomaProgramaSucursalForm.push(this.createSucursalForm(null,this.form.value,sucursal));
            });
            (this.form as FormGroup).removeControl('sucursales');
            (this.form as FormGroup).addControl('sucursales',idiomaProgramaSucursalForm);
            this.form.disable();
            
            this._precioIncompanyService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/precios-incompany/save').then(
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
            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {
                        invalidControl.focus();
                        
                        break;
                    }

                }
            }

            this._precioIncompanyService.cargando = false;
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

    borrarCategoria(index: number){
        this.detalles.controls[index].get('activo').setValue(false);
    }

    abrirModalCategoria(){
        const dialogRef = this.dialog.open(AgregarSalarioComponent, {
            width: '500px',
            data: {
                zonas: this.zonas,
                programas: this.programas,
                idiomas: this.idiomas
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarCategoria(confirm);
            }
        });
    }

    agregarCategoria(form: FormArray){
        form.controls.forEach(nuevo =>{
            let index = this.detalles.value.findIndex(detalle =>{
                return nuevo.get('programa').value.nombre == detalle.programa.nombre && detalle.activo &&
                 nuevo.get('idioma').value.valor == detalle.idioma.valor && nuevo.get('horario').value.nombre == detalle.horario.nombre
                 && nuevo.get('modalidad').value.nombre == detalle.modalidad.nombre && nuevo.get('zona').value.valor == detalle.zona.valor
            });
            if(index == -1){
                this.detalles.push(nuevo);
            }
        });
        this.precioIncompany.detalles = this.detalles.value;
        this.precioIncompany.detalles.sort(function(a, b){
            if(a.programa.nombre < b.programa.nombre) { return -1; }
            if(a.programa.nombre > b.programa.nombre) { return 1; }
            return 0;
        });
        this.detalles = new FormArray([]);
        this.precioIncompany.detalles.forEach(detalle => {
            if(detalle.activo){
                this.detalles.push(this.createDetalleForm(detalle, this.precioIncompany));
            }
        });

        /*if(index == -1){
            this.detalles.push(form);
            this.tabulador.detalles = this.detalles.value;
            this.tabulador.detalles.sort(function(a, b){
                if(a.profesorCategoria.categoria < b.profesorCategoria.categoria) { return -1; }
                if(a.profesorCategoria.categoria > b.profesorCategoria.categoria) { return 1; }
                return 0;
            });
            this.detalles = new FormArray([]);
            this.tabulador.detalles.forEach(detalle => {
                if(detalle.activo){
                    this.detalles.push(this.createTabuladorDetalleForm(detalle, this.tabulador));
                }
            });
        }else{
            this._matSnackBar.open(this.translate.instant('Esta categoria ya se encuentra agregada'), 'OK', {
                duration: 5000,
            });
        }*/
        
    }

    createSucursalForm(sucursal: PrecioIncompanySucursal, precio: PrecioIncompany, sucursalEdit: SucursalComboProjection): FormGroup {
        sucursal = sucursal ? sucursal : new PrecioIncompanySucursal;

        let form: FormGroup = this._formBuilder.group({
            id: [null],
            precioIncompanyId: new FormControl(precio.id),
            sucursal: new FormControl(sucursal.sucursal ? sucursal.sucursal: sucursalEdit)
        })

        return form;
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

}