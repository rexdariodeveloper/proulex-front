import { Location } from '@angular/common';
import { Component, ElementRef, HostListener, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Banco } from '@app/main/modelos/banco';
import { ProgramaIdiomaDescuentoDetalle,ProgramaIdiomaDescuentoDetalleEditarProjection } from '@app/main/modelos/programa-idioma-descuento-detalle';
import { PADescuento,PADescuentoEditarProjection } from '@app/main/modelos/padescuento';
import { PADescuentoDetalle,PADescuentoDetalleEditarProjection } from '@app/main/modelos/padescuento-detalle';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { ControlMaestroMultipleComboProjection } from '@pixvs/models/control-maestro-multiple';
import { ProgramaComboProjection } from '@app/main/modelos/programa';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { ArticuloFamiliaComboProjection } from '@app/main/modelos/articulo-familia';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { PADescuentoSucursalEditarProjection } from '@app/main/modelos/padescuento-sucursal';
import { PADescuentoArticuloEditarProjection } from '@app/main/modelos/padescuento-articulo';
import { PADescuentoUsuarioAutorizadoEditarProjection } from '@app/main/modelos/padescuento-usuario-autorizado';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { ClienteComboProjection } from '@app/main/modelos/cliente';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { UsuarioComboProjection } from '@pixvs/models/usuario';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DescuentoService } from './descuento.service';
import * as moment from 'moment';
import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';
import { AgregarArticuloComponent } from './dialogs/agregar-articulo/agregar-articulo.dialog';
import { AgregarUsuarioComponent } from './dialogs/agregar-usuario/agregar-usuario.dialog';

@Component({
    selector: 'descuento',
    templateUrl: './descuento.component.html',
    styleUrls: ['./descuento.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class DescuentoComponent implements ComponentCanDeactivate {

    @HostListener('window:beforeunload')
    canDeactivate(): Observable<boolean> | boolean {
        return this.form.disabled || this.form.pristine;
    }

    CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    descuento: PADescuento;
    form: FormGroup;

    //Detalles
    detalles: FormArray;

    //Cursos
    cursosDescuento: FormArray;

    //Artículos
    articulos: FormArray;

    //Usuarios
    usuarios: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    programas: ProgramaComboProjection[];
    modalidades: PAModalidadComboProjection[];
    clientes: ClienteComboProjection[];
    tipos: ControlMaestroMultipleComboProjection[];
    familias: ArticuloFamiliaComboProjection[];
    usuariosCombo: UsuarioComboProjection[];

    programaControl: FormControl = new FormControl();
    clienteControl: FormControl = new FormControl();
    tipoControl: FormControl = new FormControl();
    

    @ViewChild('cursoSelect') cursoSelect: PixvsMatSelectComponent;
    @ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
    @ViewChild('modalidadHorarioSelect') modalidadHorarioSelect: PixvsMatSelectComponent;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };

    displayedColumns: string[] = ['programa', 'idioma', 'modalidad','acciones','boton'];
    displayedColumnsArticulos: string[] = ['codigo', 'articulo', 'categoria','acciones','boton'];
    displayedColumnsUsuarios: string[] = ['usuario','sucursal','acciones','boton'];

    deshabilitarBotones: boolean = true;

    sucursales: SucursalComboProjection[];
    sucursalControl: FormControl = new FormControl();
    sucursalForm: FormArray;

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
        public _descuentoService: DescuentoService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.descuento = new PADescuento();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            
            if (this.pageType == 'nuevo') {
                this.descuento = new PADescuento();
            }

            this.config = {
                rutaAtras: "/app/ventas/descuentos",
                rutaBorrar: "/api/v1/descuentos/delete/",
                icono: "strikethrough_s"
            }
        });

        // Subscribe to update cliente on changes
        this._descuentoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.descuento) {
                    this.descuento = datos.descuento;
                    this.titulo = this.descuento.codigo
                } else {
                    this.descuento = new PADescuento();
                }

                this.programas = datos.programas;
                this.modalidades = datos.modalidades;
                this.sucursales = datos.sucursales;
                this.clientes = datos.clientes;
                this.tipos = datos.tiposDescuentos;
                this.familias = datos.familias;
                this.usuariosCombo = datos.usuarios;

                this.form = this.createClienteForm();                

                if (this.pageType == 'ver') {
                    this.form.disable();
                    this.deshabilitarBotones = false;
                } else {
                    this.form.enable();
                }

            });
        /*this._clienteService.onComboEstadosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoEstados => {
            if (listadoEstados) {
                this._clienteService.onComboEstadosChanged.next(null);
                this.estados = listadoEstados;
                this.estadoSelect.setDatos(this.estados);
            }
        });*/
    }

    createClienteForm(): FormGroup {
        let sucursalSelected = [];
        this.detalles = new FormArray([]);
        this.articulos = new FormArray([]);
        this.sucursalControl = new FormControl([]);
        this.usuarios = new FormArray([]);
        this.sucursalForm = new FormArray([]);
        this.clienteControl = new FormControl(this.descuento.cliente);
        this.tipoControl = new FormControl(this.descuento.tipo, [Validators.required]);

        if (this.descuento.detalles) {
            this.descuento.detalles.forEach(detalle => {
                this.detalles.push(this.createDescuentoDetalleForm(detalle, this.descuento));
            });
        }

        if(this.descuento.sucursales){
            this.descuento.sucursales.forEach(sucursal =>{
               this.sucursalForm.push(this.createDescuentoSucursalForm(sucursal,this.descuento.id,null));
                sucursalSelected.push(sucursal.sucursal);
            });
            this.sucursalControl = new FormControl(sucursalSelected, [Validators.required]);
        }

        if(this.descuento.articulos){
            this.descuento.articulos.forEach(articulo =>{
                this.articulos.push(this.createDescuentoArticulosForm(articulo,this.descuento.id));
            });
        }

        if(this.descuento.usuariosAutorizados){
            this.descuento.usuariosAutorizados.forEach(usuario =>{
                this.usuarios.push(this.createDescuentoUsuariosForm(usuario,this.descuento.id));
            });
        }

        let form = this._formBuilder.group({
            id: [this.descuento.id],
            codigo: new FormControl(this.descuento.codigo, []),
            concepto: new FormControl(this.descuento.concepto, [Validators.required, Validators.maxLength(100),]),
            porcentajeDescuento: new FormControl(this.descuento.porcentajeDescuento, [Validators.required]),
            fechaInicio: new FormControl(this.descuento.fechaInicio ? moment(this.descuento.fechaInicio).format('YYYY-MM-DD') : null),
            fechaFin: new FormControl(this.descuento.fechaFin ? moment(this.descuento.fechaFin).format('YYYY-MM-DD') : null),
            descuentoRelacionadoCliente: new FormControl(this.descuento.descuentoRelacionadoCliente != null ? this.descuento.descuentoRelacionadoCliente : false),
            activo: new FormControl(this.descuento.activo != null ? this.descuento.activo : true),
            detalles: this.detalles,
            sucursalesControl: this.sucursalControl,
            //prioridadEvaluacion: new FormControl(this.descuento.prioridadEvaluacion, [Validators.required]),
            cliente: this.clienteControl,
            tipo: this.tipoControl,
            articulos: this.articulos,
            usuariosAutorizados: this.usuarios 
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createDescuentoDetalleForm(detalle: PADescuentoDetalleEditarProjection, descuento: PADescuentoEditarProjection): FormGroup {
        detalle = detalle ? detalle : new PADescuentoDetalleEditarProjection();
        let cursos = new FormArray([]);
        if(detalle.cursos){
            detalle.cursos.forEach(curso =>{
                cursos.push(this.createCursosDetalleForm(curso,detalle));
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [detalle.id],
            descuentoDetalleId: new FormControl(descuento.id),
            programa: new FormControl(detalle.programa),
            paModalidad: new FormControl(detalle.paModalidad),
            paModalidadHorario: new FormControl(detalle.paModalidadHorario),
            cursos: cursos,
        });

        return form;
    }

    createCursosDetalleForm(curso: ProgramaIdiomaDescuentoDetalleEditarProjection, detalle: PADescuentoDetalleEditarProjection): FormGroup {
        curso = curso ? curso : new ProgramaIdiomaDescuentoDetalleEditarProjection();

        let form = this._formBuilder.group({
            id: [curso.id],
            descuentoDetalleId: new FormControl(detalle.id),
            programaIdioma: new FormControl(curso.programaIdioma)
        });
        return form;
    }

    createDescuentoSucursalForm(sucursal: PADescuentoSucursalEditarProjection, descuentoId: number, sucursalEdit: SucursalComboProjection): FormGroup {
        sucursal = sucursal ? sucursal : new PADescuentoSucursalEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [null],
            descuentoId: new FormControl(null),
            sucursal: new FormControl(sucursal.sucursal ? sucursal.sucursal: sucursalEdit),
            activo: new FormControl(true)
        })

        return form;
    }

    createDescuentoArticulosForm(articulo: PADescuentoArticuloEditarProjection, descuentoId: number): FormGroup {
        articulo = articulo ? articulo : new PADescuentoArticuloEditarProjection();

        let form = this._formBuilder.group({
            id: [articulo.id],
            descuentoId: new FormControl(descuentoId),
            articulo: new FormControl(articulo.articulo),
            activo: new FormControl(articulo.activo == null ? true : articulo.activo)
        });
        return form;
    }

    createDescuentoUsuariosForm(usuario: PADescuentoUsuarioAutorizadoEditarProjection, descuentoId: number): FormGroup {
        usuario = usuario ? usuario : new PADescuentoUsuarioAutorizadoEditarProjection();

        let form = this._formBuilder.group({
            id: [usuario.id],
            descuentoId: new FormControl(descuentoId),
            usuario: new FormControl(usuario.usuario),
            sucursal: new FormControl(usuario.sucursal),
            activo: new FormControl(usuario.activo == null ? true : usuario.activo)
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
        let modelo = this.form.getRawValue();

        this._descuentoService.cargando = true;
        this.form.disable();

        let descuentoSucursalForm = new FormArray([]);
        this.form.get('sucursalesControl').value.forEach(sucursal =>{
           descuentoSucursalForm.push(this.createDescuentoSucursalForm(null,this.form.value,sucursal));
        });
        (this.form as FormGroup).removeControl('sucursales');
        (this.form as FormGroup).addControl('sucursales',descuentoSucursalForm);        

        this._descuentoService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/descuentos/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
                    });
                    this.form.disable();
                    this.router.navigate([this.config.rutaAtras])
                } else {
                    this._clienteService.cargando = false;
                    this.form.enable();
                }
            }.bind(this)
        );
    }

    abrirModal(){
        const dialogRef = this.dialog.open(VerificarRfcComponent, {
            width: '500px',
            data: {
                programas: this.programas,
                modalidades: this.modalidades
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.nuevoCurso(confirm);
            }
        });
    }

    abrirModalArticulo(){
        const dialogRef = this.dialog.open(AgregarArticuloComponent, {
            width: '500px',
            data: {
                familias: this.familias
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarArticulos(confirm);
            }
        });
    }

    abrirModalUsuario(){
        const dialogRef = this.dialog.open(AgregarUsuarioComponent, {
            width: '500px',
            data: {
                usuarios: this.usuariosCombo
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.agregarUsuario(confirm);
            }
        });
    }

    nuevoCurso(curso){   
        this.detalles.push(curso);
    }

    agregarArticulos(articulos: PADescuentoArticuloEditarProjection[]){
        articulos.forEach(articulo =>{
            this.articulos.push(this.createDescuentoArticulosForm(articulo,null));
        });
    }

    agregarUsuario(usuario: PADescuentoUsuarioAutorizadoEditarProjection){
        debugger;
        this.usuarios.push(this.createDescuentoUsuariosForm(usuario,this.descuento.id));
    }

    confirmarBorrarGrupo(i){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deseas borrar el curso seleccionado?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarGrupo(i);
            }
        });
    }

    confirmarBorrarArticulo(i){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deseas borrar el artículo seleccionado?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarArticulo(i);
            }
        });
    }

    confirmarBorrarUsuario(i){
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: '¿Deseas borrar el usuario seleccionado?'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.borrarUsuario(i);
            }
        });
    }

    borrarGrupo(i){
        //debugger;
        ((this.form.get('detalles') as FormArray).controls[i] as FormGroup).addControl('borrado',new FormControl(true));
        console.log(this.form.get('detalles'));
    }

    borrarArticulo(i){
        //debugger;
        ((this.form.get('articulos') as FormArray).controls[i] as FormGroup).get('activo').setValue(false);
        console.log(this.form.get('articulos'));
    }

    borrarUsuario(i){
        //debugger;
        ((this.form.get('usuariosAutorizados') as FormArray).controls[i] as FormGroup).get('activo').setValue(false);
        console.log(this.form.get('usuariosAutorizados'));
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
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