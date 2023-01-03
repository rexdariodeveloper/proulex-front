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
import { ProgramaService } from './programa.service';
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
import { ProgramaEditarProjection, Programa } from '@app/main/modelos/programa';
import { ProgramaIdiomaEditarProjection, ProgramaIdioma } from '@app/main/modelos/programa-idioma';
import { ProgramaIdiomaCertificacionEditarProjection, ProgramaIdiomaCertificacion } from '@app/main/modelos/programa-idioma-certificacion';
import { ProgramaIdiomaModalidadEditarProjection, ProgramaIdiomaModalidad } from '@app/main/modelos/programa-idioma-modalidad';
import { ProgramaIdiomaSucursalEditarProjection, ProgramaIdiomaSucursal } from '@app/main/modelos/programa-idioma-sucursal';
import { ProgramaIdiomaLibroMaterialEditarProjection, ProgramaIdiomaLibroMaterial } from '@app/main/modelos/programa-idioma-libro-material';
import { ProgramaIdiomaLibroMaterialReglaEditarProjection } from '@app/main/modelos/programa-idioma-libro-material-regla';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { ArticuloComboProjection } from '@app/main/modelos/articulo';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MonedaComboProjection } from '@app/main/modelos/moneda';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { DepartamentoComboProjection } from '@models/departamento';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { UsuarioDatosAdicionalesComponent } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.component';
import { AddlibroComponent, AddlibroData } from './dialogs/add-libro/add-libro.dialog';
import { VerreglasComponent, VerreglasData } from './dialogs/ver-reglas/ver-reglas.dialog';
import { AgrupadorListadoPrecio, EnumAgrupadoresListadosPrecios } from './programa.extra';
//import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';


@Component({
    selector: 'programa',
    templateUrl: './programa.component.html',
    styleUrls: ['./programa.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ProgramaComponent implements ComponentCanDeactivate {
    @ViewChild(UsuarioDatosAdicionalesComponent) datosAdicionales: UsuarioDatosAdicionalesComponent;

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}

	CMM_CXPP_FormaPago = ControlesMaestrosMultiples.CMM_CXPP_FormaPago;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    programa: ProgramaEditarProjection;
    form: FormGroup;

    idiomaProgramaGroup: FormGroup;
    idiomaProgramaForm: FormArray;
    idiomaProgramaIndex: number = null;
    idiomaPrograma: ProgramaIdiomaEditarProjection;

    idiomaProgramaCertificacionForm: FormArray;
    idiomaProgramaCertificacion: ProgramaIdiomaCertificacionEditarProjection;

    idiomaProgramaLibroMaterialForm: FormArray;
    idiomaProgramaLibroMaterial: ProgramaIdiomaLibroMaterialEditarProjection;

    idiomaProgramaModalidadForm: FormArray;
    idiomaProgramaLibroModalidad: ProgramaIdiomaLibroMaterialEditarProjection;

    idiomaProgramaSucursalForm: FormArray;
    idiomaProgramaLibroSucursal: ProgramaIdiomaLibroMaterialEditarProjection;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    idiomas : ControlMaestroMultipleComboProjection[];
    plataformas : ControlMaestroMultipleComboProjection[];
    modalidadesDatos: PAModalidadComboProjection[];
    unidadesMedidas: UnidadMedidaComboProjection[];
    articulos: ArticuloComboProjection[];
    sucursales: SucursalComboProjection[];
    certificaciones: ArticuloComboProjection[];
    examenes: ArticuloComboProjection[];

    filtradas: ArticuloComboProjection[];
    activoControl: FormControl = new FormControl();
	@ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;
    @ViewChild('certificacionSelect') certificacionSelect: PixvsMatSelectComponent;

    idiomasControl: FormControl = new FormControl();
    idiomasSelected: ControlMaestroMultipleComboProjection[];
    carreras: ControlMaestroMultipleComboProjection[];

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;

    public patternRFC = { 'A': { pattern: new RegExp('^[a-z0-9]$') } };

    fechaActual = moment(new Date()).format('YYYY-MM-DD');


    sucursalesChipsArray: string[] = [];
    sucursalesSelected: string[] = [];

    modalidadControl: FormControl = new FormControl();
    sucursalControl: FormControl = new FormControl();
    plataformaControl: FormControl = new FormControl();

    certificacionNivel: string = '';
    certificacionNombre: string = '';
    certificacionPrecio: number = 0;

    displayedColumns: string[] = ['nivel', 'certificacion','borrar'];
    displayedColumnsArticulo: string[] = ['nivel', 'nombreArticulo','borrar'];

    tabNivel: number = 0;
    articuloNivel: number = 0;
    articuloControl: FormControl = new FormControl();
    certificacionControl: FormControl = new FormControl();

    tempIdiomasForm: FormArray = new FormArray([]);

    tabIndex: number = 0;

    deshabilitarBotones: boolean = true;

    datosTablaLibro = [];
    datosTablaCertificaciones = [];

    tiposCertificaciones = [
        { id: 0, nombre: 'Certificación' },
        { id: 1, nombre: 'Examen de ubicación' }
    ];

    tiposCertificacionesControl: FormControl = new FormControl({
            id: 0,
            nombre: 'Certificación'
    });

    inicial: boolean = true;

    agrupadoresListadosPrecios: AgrupadorListadoPrecio[] = [
        { id: EnumAgrupadoresListadosPrecios.MODALIDAD, nombre: 'Modalidad' },
        { id: EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO, nombre: 'Modalidad y tipo de grupo' }
    ];
    agrupadorListadosPreciosControlMap: {[idiomaId:string]: FormControl} = {};
    nuevoIdiomaIdTmp: number = -1;

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
        public _programaService: ProgramaService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        // Set the default
        this.programa = new Programa();
        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.tabIndex = 0;
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.programa = new Programa();
            }

            this.config = {
                rutaAtras: "/app/catalogos/programas",
                rutaBorrar: "/api/v1/programas/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._programaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos && datos.programa) {
                    this.programa = datos.programa;
                    this.titulo = this.programa.nombre;
                } else {
                    this.programa = new Programa();
                }
                this.idiomas = datos.idiomas;
                this.modalidadesDatos = datos.modalidades;
                this.unidadesMedidas = datos.unidadesMedidas;
                this.articulos = datos.articulos;
                this.sucursales = datos.sucursales;
                this.plataformas = datos.plataformas;
                this.certificaciones = datos.certificaciones;
                this.examenes = datos.examenes;
                this.carreras = datos.carreras;
                this.carreras.forEach(carrera =>{
                    carrera.referencia = carrera.cmmReferencia == null ? carrera.valor : (carrera.cmmReferencia.referencia + ' ' + carrera.valor)
                });

                this.sucursales.forEach(sucursal =>{
                    this.sucursalesChipsArray.push(sucursal.nombre);
                });
                this.idiomaProgramaForm = new FormArray([]);
                this.form = this.createProgramaForm();
                if (this.pageType == 'ver') {
                    this.form.disable();
                    //this.usuarioGroup.disable();
                    this.deshabilitarBotones = false;
                } else {
                    this.form.enable();
                    //this.usuarioGroup.enable();
                }

                this.form.get('idiomasControl').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                    this.idiomaProgramaForm = new FormArray([]);
                    let i=0;
                    this.form.get('idiomasControl').value.forEach(idioma =>{
                        let index = this.tempIdiomasForm.controls.findIndex(x =>{
                            return x.get('idioma').value.valor == idioma.valor
                            //x.get('idioma').value == idioma
                        });
                        if(index > -1){
                           this.idiomaProgramaForm.push(this.tempIdiomasForm.controls[index]);
                        }
                        else if (this.pageType == 'nuevo'){
                            this.idiomaProgramaForm.push(this.createIdiomaForm(null,this.programa,idioma));
                        }
                        else{
                           this.idiomaProgramaForm.push(this.createIdiomaForm(this.pageType == 'ver' || this.programa.idiomas[i] ? this.programa.idiomas[i] : null,this.programa,idioma)); 
                        } 
                        i = i + 1;
                    });

                    this.tempIdiomasForm = this.idiomaProgramaForm;
                });

                if(!!this.idiomaProgramaForm.at(0)){
                    this.filtradas = this.certificaciones.filter((item) => {
                        return item.idiomaId == this.idiomaProgramaForm.at(0).get('idioma')?.value?.id
                    });
                }
            });
        
    }

    ngAfterView(){

    }

    createProgramaForm(): FormGroup {
		this.idiomaProgramaForm = new FormArray([]);
        this.idiomasSelected = [];
        if(this.programa.idiomas){
            this.programa.idiomas.sort(function(a, b) { 
              return a.idioma.id - b.idioma.id;
            });
            this.programa.idiomas.forEach(idioma =>{
                this.idiomaProgramaForm.push(this.createIdiomaForm(idioma,this.programa));
                this.idiomasSelected.push(idioma.idioma);
                this.idiomasControl = new FormControl(this.idiomasSelected);
            });
            this.tempIdiomasForm = this.idiomaProgramaForm;
        }

        let form = this._formBuilder.group({
            id: [this.programa.id],
            codigo: new FormControl(this.programa.codigo, [Validators.required, Validators.maxLength(10)]),
            nombre: new FormControl(this.programa.nombre, [Validators.required, Validators.maxLength(50)]),
            idiomas: this.idiomaProgramaForm,
            idiomasControl: this.idiomasControl,
            activo: new FormControl(this.programa.activo),
            botonAgregarCertificacion: null,
            botonAgregarLibro: null,
            //contactoGroup: this.contactoGroup

        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            //form.get('codigoEmpleado').disabled;
        }

        return form;
    }

    createIdiomaForm(idioma: ProgramaIdiomaEditarProjection, programa: ProgramaEditarProjection, idiomaCMM: ControlMaestroMultipleComboProjection = null): FormGroup {

        idioma = idioma ? idioma : new ProgramaIdiomaEditarProjection();
        if(!idioma?.id){
            idioma.id = this.nuevoIdiomaIdTmp--;
        }
        let modalidadesSelected = [];
        let sucursalSelected = [];
        let groups: any;
        this.idiomaProgramaCertificacionForm = new FormArray([]);
        this.idiomaProgramaLibroMaterialForm = new FormArray([]);
        this.idiomaProgramaModalidadForm = new FormArray([]);
        this.idiomaProgramaSucursalForm = new FormArray([]);
        this.modalidadControl = new FormControl([], [Validators.required]);
        this.sucursalControl = new FormControl([], [Validators.required]);
        this.plataformaControl = new FormControl(idioma.plataforma,[Validators.required] );

        if(idioma.agruparListadosPreciosPorTipoGrupo){
            this.agrupadorListadosPreciosControlMap[String(idioma.id)] = new FormControl(this.agrupadoresListadosPrecios[EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO], []);
        }else{
            this.agrupadorListadosPreciosControlMap[String(idioma.id)] = new FormControl(this.agrupadoresListadosPrecios[EnumAgrupadoresListadosPrecios.MODALIDAD], []);
        }

        if(idioma.certificaciones){
            idioma.certificaciones.forEach(certificacion =>{
                this.idiomaProgramaCertificacionForm.push(this.createIdiomaCertificacionForm(certificacion,idioma));
            });
            this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];
        }
        if(idioma.librosMateriales){
            idioma.librosMateriales.forEach(libroMaterial =>{
                this.idiomaProgramaLibroMaterialForm.push(this.createIdiomaLibrosMaterialesForm(libroMaterial,idioma));
            });
            this.datosTablaLibro = [...this.idiomaProgramaLibroMaterialForm.value];
            var group_to_values = this.datosTablaLibro.reduce(function (obj, item) {
                    if(!item.borrado){
                    obj[item.nivel] = obj[item.nivel] || [];
                    obj[item.nivel].push(item);
                    return obj;
                }
            }, {});

            groups = Object.keys(group_to_values).map(function (key) {
                return {nivel: key, articulo: group_to_values[key]};
            });
        }

        if(idioma.modalidades){
            idioma.modalidades.forEach(modalidad =>{
                this.idiomaProgramaModalidadForm.push(this.createIdiomaModalidadForm(modalidad,idioma,null));
                modalidadesSelected.push(modalidad.modalidad);
            });
            this.modalidadControl = new FormControl(modalidadesSelected, [Validators.required]);
        }

        if(idioma.sucursales){
            idioma.sucursales.forEach(sucursal =>{
               this.idiomaProgramaSucursalForm.push(this.createIdiomaSucursalForm(sucursal,idioma,null));
                sucursalSelected.push(sucursal.sucursal);
            });
            this.sucursalControl = new FormControl(sucursalSelected, [Validators.required]);
        }

        this.tiposCertificacionesControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.tiposCertificacionesControl.value.id == 0){
                this.certificacionSelect.setDatos(this.certificaciones);
            }else{
                this.certificacionSelect.setDatos(this.examenes);
            }
        });


        let form: FormGroup = this._formBuilder.group({
            id: [idioma.id],
            programaId: new FormControl(programa.id),
            horasTotales: new FormControl(idioma.horasTotales, [Validators.required]),
            idioma: new FormControl(idioma.idioma ? idioma.idioma : idiomaCMM, [Validators.required]),
            modalidadesControl: this.modalidadControl,
            modalidades: this.idiomaProgramaModalidadForm,
            numeroNiveles: new FormControl(idioma.numeroNiveles, [Validators.required]),
            mcer: new FormControl(idioma.mcer, [Validators.required]),
            //unidadMedida: new FormControl(idioma.unidadMedida, [Validators.required]),
            calificacionMinima: new FormControl(idioma.calificacionMinima, [Validators.required]),
            clave: new FormControl(idioma.clave),
            descripcion: new FormControl(idioma.descripcion, [Validators.required]),
            examenEvaluacion: new FormControl(idioma.examenEvaluacion ? idioma.examenEvaluacion : false),
            certificaciones: this.idiomaProgramaCertificacionForm,
            librosMateriales: this.idiomaProgramaLibroMaterialForm,
            sucursales: this.idiomaProgramaSucursalForm,
            sucursalesControl: this.sucursalControl,
            botonAgregarCertificacion: null,
            articuloControl: null, 
            certificacionControl: null,
            plataforma: this.plataformaControl,
            librosMaterialesTemp: new FormControl(groups),
            iva: new FormControl(idioma.iva),
            ivaExento: new FormControl(idioma.ivaExento),
            ieps: new FormControl(idioma.ieps),
            cuotaFija: new FormControl(idioma.cuotaFija),
            faltasPermitidas: new FormControl(idioma.faltasPermitidas, [Validators.required]),
            objetoImpuesto: new FormControl(idioma.objetoImpuesto),
            agrupadorListadosPrecios: this.agrupadorListadosPreciosControlMap[String(idioma.id)]
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {

        }

        return form;
    }

    createIdiomaCertificacionForm(certificacion: ProgramaIdiomaCertificacionEditarProjection, idioma: ProgramaIdiomaEditarProjection): FormGroup {
        certificacion = certificacion ? certificacion : new ProgramaIdiomaCertificacionEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [certificacion.id],
            programaIdiomaId: new FormControl(idioma.id),
            nivel: new FormControl(certificacion.nivel),
            certificacion: new FormControl(certificacion.certificacion),
            precio: new FormControl(certificacion.precio),
            borrado: new FormControl(certificacion.borrado != null ? certificacion.borrado : false)
        })

        return form;
    }

    createIdiomaLibrosMaterialesForm(libroMaterial: ProgramaIdiomaLibroMaterialEditarProjection, idioma: ProgramaIdiomaEditarProjection): FormGroup {
        libroMaterial = libroMaterial ? libroMaterial : new ProgramaIdiomaLibroMaterialEditarProjection;
        let reglasArray = new FormArray([]);
        if(libroMaterial.reglas){
            libroMaterial.reglas.forEach(regla =>{
                reglasArray.push(this.createIdiomaLibrosMaterialesReglaForm(regla,libroMaterial))
            });
        }

        let form: FormGroup = this._formBuilder.group({
            id: [libroMaterial.id],
            programaIdiomaId: new FormControl(idioma.id),
            nivel: new FormControl(libroMaterial.nivel),
            articulo: new FormControl(libroMaterial.articulo),
            borrado: new FormControl(libroMaterial.borrado != null ? libroMaterial.borrado : false),
            reglas: reglasArray
        })
        return form;
    }

    createIdiomaLibrosMaterialesReglaForm(libroMaterialRegla: ProgramaIdiomaLibroMaterialReglaEditarProjection, libroMaterial: ProgramaIdiomaLibroMaterialEditarProjection): FormGroup {
        libroMaterialRegla = libroMaterialRegla ? libroMaterialRegla : new ProgramaIdiomaLibroMaterialReglaEditarProjection;
        
        
        let form: FormGroup = this._formBuilder.group({
            id: [libroMaterialRegla.id],
            programaLibroMateriallId: new FormControl(libroMaterial.id),
            carrera: new FormControl(libroMaterialRegla.carrera),
            borrado: new FormControl(false),
        })
        return form;
    }

    createIdiomaModalidadForm(modalidad: ProgramaIdiomaModalidadEditarProjection, idioma: ProgramaIdiomaEditarProjection, modalidadCMM: PAModalidadComboProjection): FormGroup {
        modalidad = modalidad ? modalidad : new ProgramaIdiomaModalidadEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: null,
            programaIdiomaId: new FormControl(idioma.id),
            modalidad: new FormControl(modalidad.modalidad ? modalidad.modalidad : modalidadCMM)
        })

        return form;
    }

    createIdiomaSucursalForm(sucursal: ProgramaIdiomaSucursalEditarProjection, idioma: ProgramaIdiomaEditarProjection, sucursalEdit: SucursalComboProjection): FormGroup {
        sucursal = sucursal ? sucursal : new ProgramaIdiomaSucursalEditarProjection;

        let form: FormGroup = this._formBuilder.group({
            id: [sucursal.id],
            programaIdiomaId: new FormControl(idioma.id),
            sucursal: new FormControl(sucursal.sucursal ? sucursal.sucursal: sucursalEdit)
        })

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

    modificarIvaExento(form){
        if(form.get('ivaExento').value){
            form.get('iva').setValue(0);
            form.get('iva').disable();
        }else{
            form.get('iva').enable();
        }
    }

    modificarCuotaFija(form){
        if(form.get('cuotaFija').value){
            form.get('ieps').setValue(0);
            form.get('ieps').disable();
        }else{
            form.get('ieps').enable();
        }
    }

    actualizarDatos(){
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
    }

    guardar() {
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        this.form.removeControl('idiomas');
        this.form.addControl('idiomas',this.idiomaProgramaForm);
        (this.form.get("idiomas") as FormArray).controls.forEach(idioma =>{
            let idiomaProgramaModalidadForm = new FormArray([]);
            idioma.clearValidators
            idioma.get('modalidadesControl').value.forEach(modalidad =>{
                idiomaProgramaModalidadForm.push(this.createIdiomaModalidadForm(null,idioma.value,modalidad));
            });
            (idioma as FormGroup).removeControl('modalidades');
            (idioma as FormGroup).addControl('modalidades',idiomaProgramaModalidadForm);

            let idiomaProgramaSucursalForm = new FormArray([]);
            idioma.get('sucursalesControl').value.forEach(sucursal =>{
               idiomaProgramaSucursalForm.push(this.createIdiomaSucursalForm(null,idioma.value,sucursal));
            });
            (idioma as FormGroup).removeControl('sucursales');
            (idioma as FormGroup).addControl('sucursales',idiomaProgramaSucursalForm);
            
            let idiomaRaw: ProgramaIdiomaEditarProjection = (idioma as FormGroup).getRawValue();
            if(this.agrupadorListadosPreciosControlMap[idiomaRaw.id].value.id == EnumAgrupadoresListadosPrecios.MODALIDAD_Y_TIPO_GRUPO){
                (idioma as FormGroup).addControl('agruparListadosPreciosPorTipoGrupo',new FormControl(true));
            }else{
                (idioma as FormGroup).addControl('agruparListadosPreciosPorTipoGrupo',new FormControl(false));
            }
            if(idiomaRaw.id <= 0){
                (idioma as FormGroup).removeControl('id');
            }
        });
        if (this.form.valid) {

            this._programaService.cargando = true;

    		this.form.disable();
            this._programaService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/programas/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
    					});
    					this.form.disable();
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._programaService.cargando = false;
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

            (this.form.get("idiomas") as FormArray).controls.forEach(idioma=>{
                this.markFormGroupTouched((idioma)as FormGroup);
            });

            this._programaService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    addCertificacion(form: FormGroup ){
        if(!form.get('numeroNiveles')?.value && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación'){
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel antes de agregar un libro'), 'OK', {
                duration: 5000,
            });
        }
        else if(form.get('numeroNiveles')?.value < Number(this.certificacionNivel) && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación'){
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel menor al nivel máximo'), 'OK', {
                duration: 5000,
            });
        }
        else if( (this.certificacionNivel == '' && this.tiposCertificacionesControl.value.nombre != 'Examen de ubicación') || !this.certificacionControl ){
            this._matSnackBar.open(this.translate.instant('Datos faltantes'), 'OK', {
                duration: 5000,
            });
        }
        else{
            let certificacion : ProgramaIdiomaCertificacionEditarProjection = new ProgramaIdiomaCertificacionEditarProjection();    
            let certificacionArray: ProgramaIdiomaCertificacionEditarProjection[] = form.get('certificaciones').value   ;
            this.idiomaProgramaCertificacionForm = new FormArray([]);
            certificacion.nivel = this.tiposCertificacionesControl.value.nombre == 'Examen de ubicación' ? '0' : this.certificacionNivel;
            certificacion.certificacion = this.certificacionControl.value;
            certificacion.precio = 0;
            certificacionArray.push(certificacion);
            certificacionArray.forEach(cert =>{
                this.idiomaProgramaCertificacionForm.push(this.createIdiomaCertificacionForm(cert,form.getRawValue()));
            });
            form.removeControl('certificaciones');
            form.addControl('certificaciones',this.idiomaProgramaCertificacionForm);
            this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];
            this.certificacionNivel = '';
            this.certificacionNombre = '';
            this.certificacionPrecio = 0;
            this.certificacionControl.reset();
        }
        
    }

    borrarCertificacion(form: FormGroup, index: number){
        (form.get('certificaciones') as FormArray).controls[index].get('borrado').setValue(true);
        this.datosTablaCertificaciones = [...this.idiomaProgramaCertificacionForm.value];  
    }

    addLibros(form: FormArray, formIdioma){
        console.log(form);
        this.idiomaProgramaLibroMaterialForm = new FormArray([]);
        let articulosArray: ProgramaIdiomaLibroMaterialEditarProjection[] = formIdioma.get('librosMateriales').value ;
        form.controls.forEach(libro =>{
            let libroGuardar = libro.value;
            let articulo : ProgramaIdiomaLibroMaterialEditarProjection = new ProgramaIdiomaLibroMaterialEditarProjection();
            articulo.articulo = libroGuardar.articulo;
            articulo.nivel = libroGuardar.nivel;
            articulo.reglas = libroGuardar.reglas;
            articulosArray.push(articulo);
        });
        articulosArray.forEach(libro =>{
            this.idiomaProgramaLibroMaterialForm.push(this.createIdiomaLibrosMaterialesForm(libro,formIdioma.getRawValue()));
        });
        formIdioma.removeControl('librosMateriales');
        formIdioma.addControl('librosMateriales',this.idiomaProgramaLibroMaterialForm);
        this.datosTablaLibro = [...this.idiomaProgramaLibroMaterialForm.value];
        var group_to_values = this.datosTablaLibro.reduce(function (obj, item) {
            obj[item.nivel] = obj[item.nivel] || [];
            if(!item.borrado){
                obj[item.nivel].push(item);
            }
            return obj;
        }, {});
        let groups: any;
        groups = Object.keys(group_to_values).map(function (key) {
            return {nivel: key, articulo: group_to_values[key]};
        });
        groups.forEach(grupo =>{
            if(grupo.articulo.length == 0){
                grupo['borrado'] = true;
            }
        });
        formIdioma.removeControl('librosMaterialesTemp');
        formIdioma.addControl('librosMaterialesTemp',new FormControl(groups));
    }

    borrarLibro(form: FormGroup, nivel: number){
        (form.get('librosMateriales') as FormArray).controls.forEach(libro =>{
            if(libro.get('nivel').value == nivel){
                libro.get('borrado').setValue(true)
            }
        });
        var group_to_values = (form.get('librosMateriales') as FormArray).value.reduce(function (obj, item) {
                if(!item.borrado){
                    obj[item.nivel] = obj[item.nivel] || [];
                    obj[item.nivel].push(item);
                }
                return obj;
            
        }, {});
        let groups: any;
        groups = Object.keys(group_to_values).map(function (key) {
            return {nivel: key, articulo: group_to_values[key]};
        });
        form.removeControl('librosMaterialesTemp');
        form.addControl('librosMaterialesTemp',new FormControl(groups));
    }

    abrirModalAgregarLibro(formIdioma){
        console.log(formIdioma);
        this.carreras.sort(function(a, b){
            if(a.referencia < b.referencia) { return -1; }
            if(a.referencia > b.referencia) { return 1; }
            return 0;
        });
        if(formIdioma.get('numeroNiveles').value){
            const dialogRef = this.dialog.open(AddlibroComponent, {
                width: '500px',
                data: {
                    articulos: this.articulos,
                    nivel: formIdioma.get('numeroNiveles').value,
                    carreras: this.carreras
                }
            });
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    //console.log(confirm);
                    this.addLibros(confirm, formIdioma);
                }
            });
        }else{
            this._matSnackBar.open(this.translate.instant('Selecciona un nivel de programa antes de agregar un libro'), 'OK', {
                duration: 5000,
            });
        }
        
    }

    tieneReglas(element){
        let tieneReglas = false;
        for(var i=0;i<element.articulo.length;i++){
            if(element.articulo[i].reglas && element.articulo[i].reglas.length >0 ){
                tieneReglas = true;
                break;
            }
        }

        return tieneReglas;
    }

    abrirVerReglas(element){
        const dialogRef = this.dialog.open(VerreglasComponent, {
            width: '1000px',
            data: {
                datos: element,
            }
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                //console.log(confirm);
                //this.addLibros(confirm, formIdioma);
            }
        });
    }

    deshabilitarCampos(event){
        this.deshabilitarBotones = true;
    }

    markFormGroupTouched(formGroup: FormGroup) {
        (<any>Object).values(formGroup.controls).forEach(control => {
          control.markAsTouched();

          if (control.controls) {
            this.markFormGroupTouched(control);
          }
        });
      }

    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }
    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    private getDataFiltered(tipo: number){
        if(tipo == 0){
            this.filtradas = [...this.certificaciones.filter((item) => {
                return item.idiomaId == this.idiomaProgramaForm.at(this.tabIndex).get('idioma')?.value?.id
            })];
        } else {
            this.filtradas = [...this.examenes.filter((item) => {
                return item.idiomaId == this.idiomaProgramaForm.at(this.tabIndex).get('idioma')?.value?.id
            })];
        }
    }

}