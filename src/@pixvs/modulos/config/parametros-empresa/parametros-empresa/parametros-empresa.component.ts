import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormArray, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { PixvsMatTreeComponent } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.component';
import { FichasDataService } from '@services/fichas-data.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ParametrosEmpresaService } from './parametros-empresa.service';
import { EmpresaDiaNoLaboralEditarProjection } from '@models/empresa-dia-no-laboral';
import { EmpresaDiaNoLaboralFijoEditarProjection } from '@models/empresa-dia-no-laboral-fijo';
import { UsuarioComboProjection } from '@models/usuario';
import { JsonResponse } from '@models/json-response';
import { ValidatorService } from '@services/validators.service';
import { HashidsService } from '@services/hashids.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from '../parametros-empresa/i18n/en';
import { locale as spanish } from '../parametros-empresa/i18n/es';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { Location } from '@angular/common';
import * as moment from 'moment';
//import { PixvsMatTreeNodo } from '@models/pixvs-mat-tree';
//import { DepartamentoComboProjection, DepartamentoNodoProjection } from '@models/departamento';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AgregarDiaComponent, AgregarDiaData } from './dialogs/agregar-dia/agregar-dia.dialog';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { Pais, PaisComboProjection } from '@pixvs/models/pais';
import { Estado, EstadoComboProjection } from '@pixvs/models/estado';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { SATRegimenFiscalComboProjection } from '@models/sat-regimen-fiscal';

@Component({
    selector: 'parametros-empresa',
    templateUrl: './parametros-empresa.component.html',
    styleUrls: ['./parametros-empresa.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class ParametrosEmpresaComponent {

    private _unsubscribeAll: Subject<any>;
    pageType: string = 'nuevo';
    titulo: string;
    config: FichaCRUDConfig;
    controles = ControlesMaestrosMultiples;
    
    

    form: FormGroup = null;
    diasNoLaboralFormArray: FormArray = new FormArray([]);;
    diasNoLaboral: EmpresaDiaNoLaboralEditarProjection;
    diasNoLaborales: EmpresaDiaNoLaboralEditarProjection[];
    diasNoLaboralFijoFormArray: FormArray = new FormArray([]);;
    diasNoLaboralFijo: EmpresaDiaNoLaboralFijoEditarProjection;
    diasNoLaboralesFijos: EmpresaDiaNoLaboralFijoEditarProjection[];
    responsables: UsuarioComboProjection[];
    listRegimenFiscal: SATRegimenFiscalComboProjection[];
    regimenFiscal: SATRegimenFiscalComboProjection;
    directorGeneral: UsuarioComboProjection;
    directorRecursosHumanos: UsuarioComboProjection;

    regimenFiscalControl: FormControl;
    directorGeneralControl: FormControl;
    directorRecursosHumanosControl: FormControl;

    rfc: string;
    razonSocial: string;
    nombreEmpresa: string;
    precioTotal: string;
    precioUnitario: string;
    plazoDiasReinscripcion: string;
    sumaDiasFechaFin: string;
    aniosDiasNoLaborales = [];

    //Domicilio Fiscal
    domicilio: string;
	colonia: string;
    cp: string;
    pais: Pais;
	estado: Estado;
	ciudad: string;
	telefono: string;
	extension: string;
	correoElectronico: string;
	paginaWeb: string;

    paises: PaisComboProjection[];
    estados: EstadoComboProjection[];

    paisControl: FormControl = new FormControl();
    estadoControl: FormControl = new FormControl();

    @ViewChild('estadoSelect') estadoSelect: PixvsMatSelectComponent;

    demo1TabIndex = 1;
    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _fichasDataService: FichasDataService,
        private _parametrosEmpresaService: ParametrosEmpresaService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
        private route: ActivatedRoute,
        private hashid: HashidsService,
        public validatorService: ValidatorService,
        private changeDetectorRef: ChangeDetectorRef) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            this.titulo = this.translate.instant('TITULO');

            this.config = {
                rutaAtras: null,
                rutaBorrar: "/api/v1/parametros-empresa/delete/",
                icono: "settings"
            };
        });
        
        this.createSuscriptions();
    };

    createSuscriptions(): void {
        this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                datos => {
                    this.razonSocial = datos.razonSocial?.valor;
                    this.nombreEmpresa = datos.nombre?.valor;
                    this.rfc = datos.rfc?.valor;
                    this.precioTotal = datos.precioTotal?.valor;
                    this.precioUnitario = datos.precioUnitario?.valor;
                    this.plazoDiasReinscripcion = datos.plazoDiasReinscripcion?.valor;
                    this.sumaDiasFechaFin = datos.sumaDiasFechaFin?.valor;
                    
                    this.responsables = datos.responsables;
                    this.listRegimenFiscal = datos.listRegimenFiscal;
                    this.regimenFiscal = datos.regimenFiscal;
                    this.directorGeneral = datos.directorGeneral;
                    this.directorRecursosHumanos = datos.directorRecursosHumanos;
                    this.regimenFiscalControl = new FormControl(this.regimenFiscal);
                    this.directorGeneralControl = new FormControl(this.directorGeneral);
                    this.directorRecursosHumanosControl = new FormControl(this.directorRecursosHumanos);
                    this.diasNoLaborales = datos.diasNoLaborales;
                    this.diasNoLaboralesFijos = datos.diasNoLaboralesFijos;
                    if(this.diasNoLaborales)
                        this.diasNoLaborales.sort((a, b) => {
                            return this.getTime(a.fecha) - this.getTime(b.fecha);
                        });
                    if(this.diasNoLaboralesFijos)
                        this.diasNoLaboralesFijos.sort((a, b) => {
                            return this.getTime(moment('2020'+this.pad(a.mes)+this.pad(a.dia)).toDate()) - this.getTime(moment('2020'+this.pad(b.mes)+this.pad(b.dia)).toDate());
                        });
                    if(this.diasNoLaborales){
                        this.getAnios(this.diasNoLaborales);
                    }

                    this.paises = datos.paises;
                    this.estados = datos.estados;

                    this.domicilio = datos.datosFiscales?.data?.domicilio;
                    this.colonia = datos.datosFiscales?.data?.colonia;
                    this.cp = datos.datosFiscales?.data?.cp;
                    this.pais = datos.datosFiscales?.data?.pais;
                    this.estado = datos.datosFiscales?.data?.estado;
                    this.ciudad = datos.datosFiscales?.data?.ciudad;
                    this.telefono = datos.datosFiscales?.data?.telefono;
                    this.extension = datos.datosFiscales?.data?.extension;
                    this.correoElectronico = datos.datosFiscales?.data?.correoElectronico;
                    this.paginaWeb = datos.datosFiscales?.data?.paginaWeb;

                    this.form = this.createForm();
                }
            );

            this.regimenFiscalControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if (this.regimenFiscalControl.value) {
                    this._parametrosEmpresaService.guardar(this.regimenFiscalControl.value.codigo, '/v1/parametros-empresa/save/regimenFiscal').then(
                        function (result: JsonResponse) {
                            if (result.status == 200) {
                                this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                                    duration: 5000,
                                });
                                this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                                    this.router.navigate(['/config/parametros-empresa']);
                                });
                            } else {
                                this._parametrosEmpresaService.cargando = false;
                            }
                        }.bind(this)
                    );
                }
            });

            this.directorGeneralControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.directorGeneralControl.value){
                    this._parametrosEmpresaService.guardar(this.directorGeneralControl.value.nombre, '/v1/parametros-empresa/save/directorGeneral').then(
                        function (result: JsonResponse) {
                            if (result.status == 200) {
                                this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                                    duration: 5000,
                                });
                                this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                                    this.router.navigate(['/config/parametros-empresa']);
                                }); 
                            } else {
                                this._parametrosEmpresaService.cargando = false;
                            }
                        }.bind(this)
                    );
                }
            });

            this.directorRecursosHumanosControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
                if(this.directorRecursosHumanosControl.value){
                    this._parametrosEmpresaService.guardar(this.directorRecursosHumanosControl.value.nombre, '/v1/parametros-empresa/save/directorRecursosHumanos').then(
                        function (result: JsonResponse) {
                            if (result.status == 200) {
                                this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                                    duration: 5000,
                                });
                                this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                                    this.router.navigate(['/config/parametros-empresa']);
                                }); 
                            } else {
                                this._parametrosEmpresaService.cargando = false;
                            }
                        }.bind(this)
                    );
                }
            });
        
    }

    getTime(date?: Date) {
        return date != null ? new Date(date).getTime() : 0;
      }
    
    pad(d) {
        return (d < 10) ? '0' + d.toString() : d.toString();
    }

    //Crea el formulario de una etapa, el parametro object se usa para inicializar el formulario
    createForm(): FormGroup {
        this.paisControl = new FormControl(this.pais, [Validators.required]);
        this.estadoControl = new FormControl(this.estado, [Validators.required]);

        this.paisControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (!!this.estadoSelect) {
                if (this.paisControl.value) {
                    this._parametrosEmpresaService.getComboEstados(this.paisControl.value.id).then(value => {
                        this.estados = value.data;
                        this.estadoSelect.setDatos(this.estados);
                    });
                }
            }
        });

        let form = this._formBuilder.group({
            id: new FormControl(null, []),
            rfc: new FormControl(this.rfc,[Validators.required]),
            razonSocial: new FormControl(this.razonSocial,[Validators.required]),
            nombre: new FormControl(this.nombreEmpresa,[Validators.required]),
            precioTotal: new FormControl(this.precioTotal == "1" ? true : false),
            precioUnitario: new FormControl(this.precioUnitario == "1" ? true : false),
            plazoDiasReinscripcion: new FormControl(this.plazoDiasReinscripcion,[]),
            sumaDiasFechaFin: new FormControl(this.sumaDiasFechaFin),

            domicilio: new FormControl(this.domicilio, [Validators.required, Validators.maxLength(200),]),
            colonia: new FormControl(this.colonia, [Validators.required, Validators.maxLength(100),]),
            cp: new FormControl(this.cp, [Validators.required, Validators.maxLength(5),]),
            pais: this.paisControl,
            estado: this.estadoControl,
            ciudad: new FormControl(this.ciudad, [Validators.required, Validators.maxLength(100),]),
            telefono: new FormControl(this.telefono, [Validators.required, Validators.maxLength(25),]),
            extension: new FormControl(this.extension),
            correoElectronico: new FormControl(this.correoElectronico, [Validators.maxLength(50),]),
            paginaWeb: new FormControl(this.paginaWeb, [Validators.maxLength(200),]),
        });

        return form;
    }


    onSave() {
        if(this.diasNoLaborales){
            this.setDiasNoLaborales(this.diasNoLaborales);
            this.form.addControl("diasNoLaborales",this.diasNoLaboralFormArray);
        }
        if(this.diasNoLaboralesFijos){
            this.setDiasNoLaboralesFijos(this.diasNoLaboralesFijos);
            this.form.addControl("diasNoLaboralesFijos",this.diasNoLaboralFijoFormArray);
        }
        this.nombreEmpresa = this.form.get("nombre").value;
        this._parametrosEmpresaService.guardar(JSON.stringify(this.form.getRawValue()), '/v1/parametros-empresa/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this.diasNoLaborales = [];
                    this.diasNoLaboralesFijos = [];
                    this.diasNoLaboralFormArray = [];
                    this.diasNoLaboralFijoFormArray = [];
                    this.form.addControl("diasNoLaborales",[]);
                    this.form.addControl("diasNoLaboralesFijos",[]);
                    this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                        duration: 5000,
                    });
                    this._fichasDataService.getDatos();
                    
                } else {
                    this._parametrosEmpresaService.cargando = false;
                }
            }.bind(this)
        );

    }

    onSaveRazonSocial() {
        this.razonSocial = this.form.get("razonSocial").value;

        if (this.razonSocial) {
            this._parametrosEmpresaService.guardar((this.razonSocial || '').toUpperCase(), '/v1/parametros-empresa/save/razonSocial').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                            duration: 5000,
                        });

                        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                            this.router.navigate(['/config/parametros-empresa']);
                        });
                    } else {
                        this._parametrosEmpresaService.cargando = false;
                    }
                }.bind(this)
            );
        }
    }

    onSaveNombre() {
        this.nombreEmpresa = this.form.get("nombre").value;

        if (this.nombreEmpresa) {
            this._parametrosEmpresaService.guardar((this.nombreEmpresa || '').toUpperCase(), '/v1/parametros-empresa/save/nombre').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                            duration: 5000,
                        });
                        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                            this.router.navigate(['/config/parametros-empresa']);
                        });
                    } else {
                        this._parametrosEmpresaService.cargando = false;
                    }
                }.bind(this)
            );
        }
    }

    onSaveRfc() {
        this.rfc = this.form.get("rfc").value;

        if (this.rfc) {
            this._parametrosEmpresaService.guardar((this.rfc || '').toUpperCase(), '/v1/parametros-empresa/save/rfc').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                            duration: 5000,
                        });
                        this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                            this.router.navigate(['/config/parametros-empresa']);
                        });
                    } else {
                        this._parametrosEmpresaService.cargando = false;
                    }
                }.bind(this)
            );
        }
    }

    onSumaDiasFechaFin() {
        this.sumaDiasFechaFin = this.form.get("sumaDiasFechaFin").value;
        this._parametrosEmpresaService.guardar(this.sumaDiasFechaFin, '/v1/parametros-empresa/save/sumaDiasFechaFin').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                        duration: 5000,
                    });
                    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/config/parametros-empresa']);
                    }); 
                } else {
                    this._parametrosEmpresaService.cargando = false;
                }
            }.bind(this)
        );

    }

    onSavePrecio() {
        let json ={
            precioTotal: this.form.get("precioTotal").value? "1" : "0",
            precioUnitario: this.form.get("precioUnitario").value ? "1" : "0"
        }
        this._parametrosEmpresaService.guardar(json, '/v1/parametros-empresa/save/precio').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                        duration: 5000,
                    });
                    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/config/parametros-empresa']);
                    }); 
                } else {
                    this._parametrosEmpresaService.cargando = false;
                }
            }.bind(this)
        );

    }

    clickPrecio(precio: string){
        this.form.get("precioUnitario").setValue(!this.form.get("precioUnitario").value);
        this.form.get("precioTotal").setValue(!this.form.get("precioTotal").value);
        this.onSavePrecio();  
    }



    isRequired(campo: string) {
        if (!this.form)
            return false;
        let form_field_seccion = this.form.controls[campo];
        if (!form_field_seccion.validator)
            return false;
        let validator_seccion = form_field_seccion.validator({} as AbstractControl);
        return !!(validator_seccion && validator_seccion.required);
    }

    convertDiaFijo(diaFijo: EmpresaDiaNoLaboralFijoEditarProjection){
        let fecha = diaFijo.mes+'-'+diaFijo.dia;
        var momentObj = moment(fecha.toString(), 'MM-DD');
        return momentObj.format('MMMM DD');
    }

    getAnios(diasNoLaborales: EmpresaDiaNoLaboralEditarProjection[]){
        this.aniosDiasNoLaborales = [];
        console.log(this.aniosDiasNoLaborales);
        diasNoLaborales.forEach(dia =>{
            let year = moment(dia.fecha,'YYYY/MM/DD').format('YYYY').toString();
            if(this.search(year,this.aniosDiasNoLaborales)){
                this.aniosDiasNoLaborales.forEach(anio =>{
                    if(anio.anio == year && dia.activo){
                        anio.datos.push(moment(dia.fecha,'YYYY/MM/DD').format('MMMM DD')+' '+dia.descripcion)
                    }
                });
            }
            else{
                if(dia.activo){
                    this.aniosDiasNoLaborales.push({
                        anio: moment(dia.fecha,'YYYY/MM/DD').format('YYYY'),
                        datos: [moment(dia.fecha,'YYYY/MM/DD').format('MMMM DD')+' '+dia.descripcion]
                    });
                }
                

                //this.aniosDiasNoLaborales[year].datos.push();
            }
        });
        this.aniosDiasNoLaborales.sort(function(a, b) {
          return b.anio - a.anio;
        })
        const tabCount = this.aniosDiasNoLaborales.length;
        this.demo1TabIndex = 1;
    }

    search(nameKey, myArray){
        for (var i=0; i < myArray.length; i++) {
            if (myArray[i].anio === nameKey) {
                return myArray[i];
            }
        }
    }

    abrirModal(){
        let dialogData: AgregarDiaData = {
            onAceptar: this.onAceptarComponenteDialog.bind(this)
        };

        const dialogRef = this.dialog.open(AgregarDiaComponent, {
            width: '500px',
            data: dialogData
        });
    }

    onAceptarComponenteDialog(datos){
           
        if(datos.tipoDia.id == 1){

            let dia = moment(datos.fecha,'YYYY-MM-DD').format('DD');
            let mes = moment(datos.fecha,'YYYY-MM-DD').format('MM');
            let nuevoDiaLaboraFijo: EmpresaDiaNoLaboralFijoEditarProjection = new EmpresaDiaNoLaboralFijoEditarProjection();
            nuevoDiaLaboraFijo.descripcion = datos.descripcion;
            nuevoDiaLaboraFijo.dia = Number(dia);
            nuevoDiaLaboraFijo.mes = Number(mes);
            nuevoDiaLaboraFijo.activo = true;
            let index = this.diasNoLaboralesFijos.findIndex(dia =>{
                return (dia.dia == nuevoDiaLaboraFijo.dia) && (dia.mes == nuevoDiaLaboraFijo.mes)
            });

            let diaNoLaboral = this.diasNoLaborales.find(item => item.fecha == datos.fecha)
            if(!!diaNoLaboral){
                this._matSnackBar.open(this.translate.instant('Este día ya esta registrado como: '+diaNoLaboral.descripcion), 'OK', {
                    duration: 5000,
                });
            }

            if(index == -1 && !!!diaNoLaboral){
                this.diasNoLaboralesFijos.push(nuevoDiaLaboraFijo);
                this.onSave();
            }else{
                this.abrirModal();
                this._matSnackBar.open(this.translate.instant('Este día ya se encuentra registrado'), 'OK', {
                    duration: 5000,
                });
            }
            
        }
        else if(datos.tipoDia.id == 0){
            let nuevoDiaLaboral: EmpresaDiaNoLaboralEditarProjection = new EmpresaDiaNoLaboralEditarProjection;
            nuevoDiaLaboral.descripcion = datos.descripcion;
            nuevoDiaLaboral.fecha = moment(datos.fecha).toDate();
            nuevoDiaLaboral.activo = true;
            let index = this.diasNoLaborales.findIndex(dia =>{
                return moment(dia.fecha).format('YYYY-MM-DD') ==  moment(nuevoDiaLaboral.fecha).format('YYYY-MM-DD');
            });

            let index2 = this.diasNoLaboralesFijos.findIndex(dia =>{
                let d = Number(moment(datos.fecha,'YYYY-MM-DD').format('DD'));
                let m = Number(moment(datos.fecha,'YYYY-MM-DD').format('MM'));
                return (dia.dia == d) && (dia.mes == m)
            });

            if(index == -1 && index2 == -1){
               this.diasNoLaborales.push(nuevoDiaLaboral); 
               this.onSave();
            }else{
                this.abrirModal();
                this._matSnackBar.open(this.translate.instant('Este día ya se encuentra registrado'), 'OK', {
                    duration: 5000,
                });
            }
            //this.getAnios(this.diasNoLaborales);
        }else{
            var fechaInicio = moment(datos.fecha);
            var fechaFin = moment(datos.fechaFin);
            for(var i=1; fechaInicio <= fechaFin; i++){
                let nuevoDiaLaboral: EmpresaDiaNoLaboralEditarProjection = new EmpresaDiaNoLaboralEditarProjection;
                nuevoDiaLaboral.descripcion = datos.descripcion;
                nuevoDiaLaboral.fecha = new Date(fechaInicio.format("YYYY-MM-DD"));
                nuevoDiaLaboral.activo = true;
                let index = this.diasNoLaborales.findIndex(dia =>{
                    return moment(dia.fecha).format('YYYY-MM-DD') ==  fechaInicio.format('YYYY-MM-DD');
                });

                let index2 = this.diasNoLaboralesFijos.findIndex(dia =>{
                    let d = Number(fechaInicio.format('DD'));
                    let m = Number(fechaInicio.format('MM'));
                    return (dia.dia == d) && (dia.mes == m)
                });

                if(index == -1 && index2 == -1){
                    this.diasNoLaborales.push(nuevoDiaLaboral); 
                }else{
                    if(index != -1)
                        this.diasNoLaborales[index].descripcion = datos.descripcion;
                }
                fechaInicio = moment(fechaInicio).add(1,'days');
            }
            this.onSave();
        }
        
    }

    setDiasNoLaborales(diasNoLaborales: EmpresaDiaNoLaboralEditarProjection[]){
        this.diasNoLaboralFormArray = new FormArray([]);
        let formArray: FormArray = new FormArray([]);
        diasNoLaborales.forEach(dia =>{
            let form = this._formBuilder.group({
                id: [dia.id],
                fecha: new FormControl(dia.fecha),
                descripcion: new FormControl(dia.descripcion),
                activo: new FormControl(dia.activo),
                fechaModificacion: null
            });
            this.diasNoLaboralFormArray.push(form);
        });
    }

    setDiasNoLaboralesFijos(diasNoLaboralesFijos: EmpresaDiaNoLaboralFijoEditarProjection[]){
        this.diasNoLaboralFijoFormArray = new FormArray([]);
        let formArray: FormArray = new FormArray([]);
        diasNoLaboralesFijos.forEach(dia =>{
            let form = this._formBuilder.group({
                id: [dia.id],
                dia: new FormControl(dia.dia),
                mes: new FormControl(dia.mes),
                descripcion: new FormControl(dia.descripcion),
                activo: new FormControl(dia.activo),
                fechaModificacion: null
            })
            this.diasNoLaboralFijoFormArray.push(form);
        });
        
    }

    deleteDia(diaBuscar,anio){
        this.diasNoLaborales.forEach(dia =>{
            let diaABorrar = moment(dia.fecha).format('MMMM-DD').replace('-',' ')+' '+dia.descripcion;
            if(moment(dia.fecha,'YYYY/MM/DD').format('YYYY') == anio  && diaBuscar.match(dia.descripcion) && diaBuscar == diaABorrar ){
                dia.activo = false;
            }
        });
        this.onSave();
    }

    deleteDiaFijo(dia: EmpresaDiaNoLaboralFijoEditarProjection){
        console.log(dia);
        dia.activo = false;
        this.onSave();
    }

    onSavePlazoDiasReinscripcion(){
        this.plazoDiasReinscripcion = this.form.get("plazoDiasReinscripcion").value;
        this._parametrosEmpresaService.guardar(this.plazoDiasReinscripcion, '/v1/parametros-empresa/save/plazoDiasReinscripcion').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                        duration: 5000,
                    });
                    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/config/parametros-empresa']);
                    }); 
                } else {
                    this._parametrosEmpresaService.cargando = false;
                }
            }.bind(this)
        );
    }

    onSaveDatosFiscales() {
        let json = {
            domicilio: this.form.get("domicilio").value,
            colonia: this.form.get("colonia").value,
            cp: this.form.get("cp").value,
            pais: this.form.get("pais").value?.id,
            estado: this.form.get("estado").value?.id,
            ciudad: this.form.get("ciudad").value,
            telefono: this.form.get("telefono").value,
            extension: this.form.get("extension").value,
            correoElectronico: this.form.get("correoElectronico").value,
            paginaWeb: this.form.get("paginaWeb").value || ""
        }

        if (!this.form.valid) {
            return;
        }
        
        this._parametrosEmpresaService.guardar(json, '/v1/parametros-empresa/save/datosFiscales').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.ACTUALIZADO'), 'OK', {
                        duration: 5000,
                    });
                    this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
                        this.router.navigate(['/config/parametros-empresa']);
                    });
                } else {
                    this._parametrosEmpresaService.cargando = false;
                }
            }.bind(this)
        );
    }
}