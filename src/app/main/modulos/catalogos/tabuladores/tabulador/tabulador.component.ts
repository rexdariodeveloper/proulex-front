import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation, IterableDiffers } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Tabulador, TabuladorEditarProjection } from '@app/main/modelos/tabulador';
import { TabuladorDetalle, TabuladorDetalleEditarProjection } from '@app/main/modelos/tabulador-detalle';
import { TabuladorCurso, TabuladorCursoEditarProjection } from '@app/main/modelos/tabulador-curso';
import { PAProfesorComboProjection } from '@app/main/modelos/paprofesor-categoria';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
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
import { TabuladorService } from './tabulador.service';
import { AgregarSalarioComponent,AgregarSalarioData } from './dialogs/agregar-salario/agregar-salario.dialog';
import { AgregarCursoComponent,AgregarCursoData } from './dialogs/agregar-curso/agregar-curso.dialog';

@Component({
    selector: 'tabulador',
    templateUrl: './tabulador.component.html',
    styleUrls: ['./tabulador.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TabuladorComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    tabulador: Tabulador;
    form: FormGroup;

    //Detalles
    detalles: FormArray;

    //Cursos
    cursos: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    categorias: PAProfesorComboProjection[];
    programas: ProgramaComboProjection[];

    categoriaControl: FormControl = new FormControl();

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    salario: string;

    displayedColumns: string[] = ['categoria', 'salario','acciones'];
    displayedColumnsCursos: string[] = ['idioma', 'programa','modalidad','horario','acciones'];

    filaEdicion: number;

    cambioDetalles: boolean = false;
    inicial: boolean = true;
    iterableDiffer: any;

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
        public _tabuladorService: TabuladorService,
        private el: ElementRef,
        public validatorService: ValidatorService,
        private iterableDiffers: IterableDiffers
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.tabulador = new Tabulador();

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
                this.tabulador = new Tabulador();
            }

            this.config = {
                rutaAtras: "/app/catalogos/tabuladores",
                rutaBorrar: "/api/v1/tabuladores/delete/",
                icono: "receipt"
            }
        });

        // Subscribe to update cliente on changes
        this._tabuladorService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.tabulador) {
                    this.tabulador = datos.tabulador;
                    this.titulo = this.tabulador.codigo
                } else {
                    this.tabulador = new Tabulador();
                }

                this.categorias = datos.categoriasProfesores;
                this.programas = datos.programas;

                this.form = this.createClienteForm();                

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }

            });

    }

    ngAfterViewInit(){
        this.inicial = false;
        console.log(this.detalles.controls[0].get('sueldo').value)
    }

    ngDoCheck() {
        if(this.detalles.value != null && this.pageType == 'ver'){
            let changes = this.iterableDiffer.diff(this.detalles.value);
            if (changes && !this.inicial) {
                this.cambioDetalles = true;
                console.log("Cambio");
            }
        }
    }

    createClienteForm(): FormGroup {
        this.detalles = new FormArray([]);
        if (this.tabulador.detalles) {
            this.tabulador.detalles.sort(function(a, b){
                if(a.profesorCategoria.categoria < b.profesorCategoria.categoria) { return -1; }
                if(a.profesorCategoria.categoria > b.profesorCategoria.categoria) { return 1; }
                return 0;
            });
            this.tabulador.detalles.forEach(detalle => {
                this.detalles.push(this.createTabuladorDetalleForm(detalle, this.tabulador));
            });
        }
        this.cursos = new FormArray([]);
        if(this.tabulador.cursos){
           this.tabulador.cursos.sort(function(a, b){
                if(a.programa.codigo < b.programa.codigo) { return -1; }
                if(a.programa.codigo > b.programa.codigo) { return 1; }
                return 0;
            });
           this.tabulador.cursos.forEach(curso =>{
               this.cursos.push(this.createTabuladorCursoForm(curso,this.tabulador));
           });
        }

        let form = this._formBuilder.group({
            id: [this.tabulador.id],
            codigo: new FormControl(this.tabulador.codigo, [Validators.required, Validators.maxLength(500),]),
            descripcion: new FormControl(this.tabulador.descripcion, [Validators.required, Validators.maxLength(500),]),
            pagoDiasFestivos: new FormControl(this.tabulador.pagoDiasFestivos == null ? false : this.tabulador.pagoDiasFestivos),
            activo: new FormControl(this.tabulador.id == null ? true : this.tabulador.activo),
            detalles: this.detalles,
            cursos: this.cursos
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('codigo').disabled;
        }

        return form;
    }

    createTabuladorDetalleForm(tabuladorDetalle: TabuladorDetalle, tabulador: Tabulador): FormGroup {
        tabuladorDetalle = tabuladorDetalle ? tabuladorDetalle : new TabuladorDetalle();

        let form: FormGroup = this._formBuilder.group({
            id: [tabuladorDetalle.id],
            tabuladorId: new FormControl(tabulador.id, []),
            profesorCategoria: new FormControl(tabuladorDetalle.profesorCategoria, [Validators.required,]),
            sueldo: new FormControl(tabuladorDetalle.sueldo, [Validators.required]),
            activo: new FormControl(tabuladorDetalle.id != null ? tabuladorDetalle.activo : true, [Validators.required,]),
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createTabuladorCursoForm(tabuladorCurso: TabuladorCurso, tabulador: Tabulador): FormGroup {
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

    actualizarDatos(){
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
    }

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
            debugger;
            this.form.removeControl("cursos");
            this.form.addControl("cursos",this.cursos);
            this.form.removeControl("detalles");
            this.form.addControl("detalles",this.detalles);
            this.form.disable();
            
            this._tabuladorService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/tabuladores/save').then(
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

            this._tabuladorService.cargando = false;
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

    abrirModalCategoria(){
        const dialogRef = this.dialog.open(AgregarSalarioComponent, {
            width: '500px',
            data: {
                categorias: this.categorias
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarCategoria(confirm);
            }
        });
    }

    agregarCategoria(form: FormGroup){
        let index = this.detalles.value.findIndex(detalle =>{
            return detalle.profesorCategoria.categoria == form.value.profesorCategoria.categoria && detalle.activo;
        });
        debugger;
        if(index == -1){
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
        }
        
    }

    abrirModalCurso(){
        const dialogRef = this.dialog.open(AgregarCursoComponent, {
            width: '500px',
            data: {
                programas: this.programas
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarCurso(confirm);
            }
        });
    }

    agregarCurso(form: FormArray){
        let cursosRepetidos = [];
        let i = 0;
        form.value.forEach(curso =>{
            let index = this.cursos.value.findIndex(cursoBuscar =>{
                return cursoBuscar.programa.nombre == curso.programa.nombre 
                && cursoBuscar.programaIdioma.nombre == curso.programaIdioma.nombre 
                && cursoBuscar.modalidad.nombre == curso.modalidad.nombre 
                && cursoBuscar.modalidadHorario.nombre == curso.modalidadHorario.nombre 
                && cursoBuscar.activo;
            });

            if(index == -1){
                this.cursos.push(form.controls[i]);
            }else{
                cursosRepetidos.push(form.controls[i].get('programaIdioma').value.nombre+' '+form.controls[i].get('modalidad').value.nombre+' '+form.controls[i].get('modalidadHorario').value.nombre);
            }
            i = i + 1;
        });
        
        var cursosTemp = this.cursos.value;
        cursosTemp.sort(function(a, b){
            if(a.programa.codigo < b.programa.codigo) { return -1; }
            if(a.programa.codigo > b.programa.codigo) { return 1; }
            return 0;
        });
        this.cursos = new FormArray([]);
        cursosTemp.forEach(curso =>{
           this.cursos.push(this.createTabuladorCursoForm(curso,this.tabulador));
        });
        if(cursosRepetidos.length > 0){
            this._matSnackBar.open(this.translate.instant('Los siguientes cursos ya se encuentran añadidos en el horario y modalidad elegidos '+cursosRepetidos.join()), 'OK', {
                duration: 10000,
            });
        }


    }

    editarRegistro(index: number, close: boolean){
        if(!close){
           this.filaEdicion = index; 
       }else{
           this.filaEdicion = null;
       }
        
    }

    getControl(index){
        return (this.form.get('detalles') as FormArray).controls[index].get('sueldo');
    }

    siguienteRegistro(index){
        if(index == (this.detalles.length -1)){
            this.filaEdicion = 0;
        }else{
            this.filaEdicion = index + 1;
        }
    }

    borrarCategoria(index: number){
        this.detalles.controls[index].get('activo').setValue(false);
    }

    borrarCurso(index: number){
        this.cursos.controls[index].get('activo').setValue(false);
    }
}