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
import { GruposService } from '../grupos/grupos.service';
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
import { ProgramaGrupoEditarProjection, ProgramaGrupo } from '@app/main/modelos/programa-grupo';
import { PACicloComboProjection } from '@app/main/modelos/paciclo';
import { ProgramacionAcademicaComercialEditarProjection } from '@app/main/modelos/programacion-academica-comercial';
import { ProgramaIdiomaComboProjection } from '@app/main/modelos/programa-idioma';
import { PAModalidadComboProjection } from '@app/main/modelos/pamodalidad';
import { UnidadMedidaComboProjection } from '@app/main/modelos/unidad-medida';
import { EmpleadoComboProjection } from '@app/main/modelos/empleado';
import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { SucursalPlantelComboProjection } from '@app/main/modelos/sucursal-plantel';
import { ComponentCanDeactivate } from '@pixvs/guards/pending-changes.guard';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import * as moment from 'moment';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { AddExamenComponent } from './dialogs/add-examen/add-examen.dialog';
//import { VerificarRfcComponent, VerificarRfcData } from './dialogs/verificar-rfc/verificar-rfc.dialog';

const ALFABETO: string[] =['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

@Component({
    selector: 'grupos-multiple',
    templateUrl: './grupos-multiple.component.html',
    styleUrls: ['./grupos-multiple.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class GruposMultiplesComponent implements ComponentCanDeactivate {

	@HostListener('window:beforeunload')
	canDeactivate(): Observable<boolean> | boolean {
		return this.form.disabled || this.form.pristine;
	}


    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    grupo: ProgramaGrupoEditarProjection;
    form: FormGroup;

    grupos: FormArray;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    plataformas : ControlMaestroMultipleComboProjection[];
    modalidades: PAModalidadComboProjection[];
    profesores: EmpleadoComboProjection[];
    cursos: ProgramaIdiomaComboProjection[];
    sucursales: SucursalComboProjection[];
    tipoGrupo: ControlMaestroMultipleComboProjection[];
    programaciones: ProgramacionAcademicaComercialEditarProjection[];
    planteles: SucursalPlantelComboProjection[];
    ciclos: PACicloComboProjection[];
    //programas: ProgramaComboProjection[];

    activoControl: FormControl = new FormControl();
	@ViewChild('modalidadSelect') modalidadSelect: PixvsMatSelectComponent;
    @ViewChild('programacionSelect') programacionSelect: PixvsMatSelectComponent;
    @ViewChild('cursoSelect') cursoSelect: PixvsMatSelectComponent;
    @ViewChild('horaInicioSelect') horaInicioSelect: PixvsMatSelectComponent;


    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;


    sucursalControl: FormControl = new FormControl();
    cursoControl: FormControl = new FormControl();
    modalidadControl: FormControl = new FormControl();
    plataformaControl: FormControl = new FormControl();   
    cicloControl: FormControl = new FormControl();
    programacionComercialControl: FormControl = new FormControl(); 
    

    displayedColumns: string[] = ['codigoGrupo', 'nivel','grupo','modalidadHorario.nombre','tipoGrupo.valor','borrar','boton'];

    deshabilitarBotones: boolean = true;

    diasInicioControl: FormControl = new FormControl();
    diasInicio = [];

    fechaFinFormateada: string;
    esJobs: boolean;
    ocultarGuardar: boolean = false;
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
        public _grupoService: GruposService,
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
                rutaAtras: "/app/programacion-academica/grupos",
                rutaBorrar: "/api/v1/grupos/delete/",
                icono: "book"
            }

        });
        // Subscribe to update proveedor on changes
        this._grupoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.grupo = new ProgramaGrupo();
                this.titulo = "Nuevo grupo";
                //this.cursos = datos.cursos;
                this.sucursales = datos.sucursales;
                this.plataformas = datos.plataformas;
                this.profesores = datos.profesores;
                this.tipoGrupo = datos.tipoGrupo;
                //this.modalidades = datos.modalidades;
                this.ciclos = datos.paCiclos;
                this.form = this.createProgramaForm();
                this.form.get('fechaInicio').disable;
                this.form.get('fechaFin').disable;
                this.grupos = new FormArray([]);
            });
        /*this._grupoService.onComboModalidadChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoModalidades => {
            if (listadoModalidades) {
                this._grupoService.onComboModalidadChanged.next(null);
                this.modalidades = listadoModalidades;
                this.modalidadSelect.setDatos(this.modalidades);
            }
        });*/

        /*this._grupoService.onComboProgramacionChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(listadoProgramaciones => {
            if (listadoProgramaciones) {
                this._grupoService.onComboProgramacionChanged.next(null);
                //this.programaciones = listadoProgramaciones;
                const uniqueObjects = [...new Map(listadoProgramaciones.map(item => [item.nombre, item])).values()];;
                this.programacionSelect.setDatos(listadoProgramaciones);
            }
        });*/

        this.form.get('programacionComercial').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.programacionComercialControl.value){
                this.form.get('diasInicioControl').reset();
                this.fechaFinFormateada = null;
                this.diasInicio = [];
                const dateToCheckFor = moment().format('YYYY-MM-DD');

                let nearestDate;

                this.programacionComercialControl.value.detalles.forEach(date => {
                  let diff = moment(date.fechaInicio).diff(moment(date.fechaInicioToCheckFor), 'days');
                  if (diff > 0) {
                    if (nearestDate) {
                      if (moment(date.fechaInicio).diff(moment(nearestDate), 'days') < 0) {
                        nearestDate = date.fechaInicio;
                      }
                    } else {
                      nearestDate = date.fechaInicio;
                    }
                  }
                });
  
                if(this.programacionComercialControl.value.detalles && this.programacionComercialControl.value.detalles.length >0){
                    let fechaTemp = this.programacionComercialControl.value.detalles.filter(x =>{return x.fechaInicio >= moment(nearestDate)});
                    fechaTemp = fechaTemp.sort(function(a,b){
                      var da = new Date(a.fechaInicio).getTime();
                      var db = new Date(b.fechaInicio).getTime();
                      
                      return da < db ? -1 : da > db ? 1 : 0
                    });
                    const closest = fechaTemp[0];
                    let index = this.programacionComercialControl.value.detalles.findIndex(dia =>{
                        return dia?.fechaInicio == nearestDate;
                    });
                    this.programacionComercialControl.value.detalles.forEach(detalle=>{
                        this.diasInicio.push({
                            id: detalle.id,
                            fechaInicio: moment(detalle.fechaInicio).locale('es').format('MMMM DD YYYY'),
                            fechaFin: moment(detalle.fechaFin).locale('es').format('MMMM DD YYYY'),
                            fechaInicioNoFormat: moment(detalle.fechaInicio).format('YYYY-MM-DD'),
                            fechaFinNoFormat: moment(detalle.fechaFin).format('YYYY-MM-DD')
                        });
                    });
                    if(this.diasInicio && this.diasInicio.length >0){
                        this.diasInicio = this.diasInicio.reverse();
                        this.diasInicio = [...new Map(this.diasInicio.map(item => [item.fechaInicio, item])).values()];
                    }
                    let temp;
                    if(index > -1){
                        let fechaInicioFormat = moment(this.programacionComercialControl.value.detalles[index].fechaInicio).locale('es').format('MMMM DD YYYY');
                        let fechaInicioNoFormat = moment(this.programacionComercialControl.value.detalles[index].fechaInicio).format('YYYY-MM-DD');
                        let fechaFinFormat = moment(this.programacionComercialControl.value.detalles[index].fechaFin).locale('es').format('MMMM DD YYYY');
                        let fechaFinNoFormat = moment(this.programacionComercialControl.value.detalles[index].fechaFin).format('YYYY-MM-DD');
                        temp ={
                            id: this.programacionComercialControl.value.detalles[index].id,
                            fechaInicio: fechaInicioFormat,
                            fechaFin: fechaFinFormat,
                            fechaInicioNoFormat: fechaInicioNoFormat,
                            fechaFinNoFormat: fechaFinNoFormat
                        }
                    }
                    this.form.get('diasInicioControl').setValue(temp);
                    this.horaInicioSelect.setDatos(this.diasInicio);
                }
            }
            
        });

        this.form.get('diasInicioControl').valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if(this.form.get('diasInicioControl').value){
                this.form.get('fechaInicio').reset();
                this.form.get('fechaInicio').setValue(moment(this.form.get('diasInicioControl').value.fechaInicioNoFormat).format('YYYY-MM-DD'));
                this.form.get('fechaFin').reset();
                this.form.get('fechaFin').setValue(moment(this.form.get('diasInicioControl').value.fechaFinNoFormat).format('YYYY-MM-DD'));
                this.fechaFinFormateada = this.form.get('diasInicioControl').value.fechaFin;
            }
            
        })        
        
    }

    ngAfterView(){

    }

    createProgramaForm(): FormGroup {
       
        this.cursoControl = new FormControl(null, [Validators.required]);
        this.sucursalControl = new FormControl(null, [Validators.required]);
        this.modalidadControl = new FormControl(null, [Validators.required]);
        this.plataformaControl = new FormControl(null);
        this.diasInicioControl = new FormControl(null);
        this.cicloControl = new FormControl();

        this.sucursalControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.sucursalControl.value) {
                this._grupoService.getSucursales(this.sucursalControl.value.id).then(value =>{
                    this.cursos = value.data;
                    this.cursoSelect.setDatos(this.cursos);
                });
                this._grupoService.getPlanteles(this.sucursalControl.value.id).then(value =>{
                    this.planteles = value.data;
                });
            }
        });

        this.modalidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            //this.estadoSelect.setDatos([]);
            //this.estadoControl.setValue(null);
            if (this.cursoControl.value && this.modalidadControl.value && !this.esJobs) {
                this._grupoService.getComboProgramacion(this.cursoControl.value.programaId,this.modalidadControl.value.id,this.cursoControl.value.idiomaId).then(value =>{
                    this.programaciones = value.data;
                    let temp = [];
                    this.programaciones.forEach(progra =>{
                        let agregarNuevo = true;
                        if(temp.length == 0){
                            temp.push(progra);
                            agregarNuevo = false;
                        }else{
                            temp.forEach(t =>{
                                if(t.id == progra.id){
                                    t.detalles.push(progra.detalles[0]);
                                    agregarNuevo = false;
                                }
                            });
                            if(agregarNuevo){
                                temp.push(progra);
                            }
                        }
                    });
                    //const uniqueObjects = [...new Map(temp.map(item => [item.nombre, item])).values()];;
                    this.programacionSelect.setDatos(temp);
                    this.programacionComercialControl.setValue(temp[0]);
                });
                //this.form.get('plataforma').setValue(this.cursoControl.value.plataforma);
            }
            
        });

        this.cursoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.esJobs = this.cursoControl.value.jobs || this.cursoControl.value.jobsSems || this.cursoControl.value.pcp || this.cursoControl.value.codigo == 'JBP'
            if (this.cursoControl.value && this.modalidadControl.value && !this.esJobs) {
                this._grupoService.getComboProgramacion(this.cursoControl.value.programaId,this.modalidadControl.value.id,this.cursoControl.value.idiomaId).then(value =>{
                    this.programaciones = value.data;
                    const uniqueObjects = [...new Map(this.programaciones.map(item => [item.nombre, item])).values()];;
                    this.programacionSelect.setDatos(uniqueObjects);
                    this.programacionComercialControl.setValue(uniqueObjects[0]);
                }); 
            }
            if(this.cursoControl.value){
                this._grupoService.getComboModalidades(this.cursoControl.value.id).then(value =>{
                    this.modalidades = value.data;
                    this.modalidades.sort(function(a, b) { 
                      return a.id - b.id  ||  a.nombre.localeCompare(b.nombre);
                    });
                    
                    const modalidadesUnicas = [...new Map(this.modalidades.map(item => [item.id, item])).values()];
                    this.modalidades = modalidadesUnicas;
                    this.modalidadSelect.setDatos(this.modalidades);
                });
            }
            this.form.get('plataforma').setValue(this.cursoControl.value.plataforma);
        });

        if(this.ciclos?.length > 0){
            this.cicloControl = new FormControl(this.ciclos[this.ciclos.length-1]);
        }


        let form: FormGroup = this._formBuilder.group({
            id: [null],
            curso: this.cursoControl,
            sucursal: this.sucursalControl,
            modalidad: this.modalidadControl,
            plataforma: this.plataformaControl,
            programacionComercial: this.programacionComercialControl,
            fechaInicio: new FormControl(null, [Validators.required]),
            fechaFin: new FormControl(null, [Validators.required]),
            diasInicioControl: this.diasInicioControl,
            paCiclo: this.cicloControl
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
        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }
        this.ocultarGuardar = true;
        if (this.form.valid) {
            this._grupoService.cargando = true;

    		this.form.disable();
            this._grupoService.guardar(JSON.stringify(this.grupos.getRawValue()), '/api/v1/grupos/save/multiple').then(
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
                        this.ocultarGuardar = false;
                        this.form.enable();
                    }
                }.bind(this)
            );
        } else {
            this.ocultarGuardar = false;
            for (const key of Object.keys(this.form.controls)) {
                if (this.form.controls[key].invalid) {
                    const invalidControl = this.el.nativeElement.querySelector('[formcontrolname="' + key + '"]');

                    if (invalidControl) {                          
                        invalidControl.focus();
                        break;
                    }

                }
            }

            this._grupoService.cargando = false;
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
                    curso: this.cursoControl,
                    modalidad: this.modalidadControl,
                    tipoGrupo: this.tipoGrupo,
                    niveles: this.form.get('curso').value.numeroNiveles,
                    planteles: this.planteles
                }
            });
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    //this.guardar();
                    this.addGrupo(confirm);
                }
            });
        }
        
    }

    
    async addGrupo(grupo: any){
        if(grupo.sucursalPlantel.value != null){
            for(var k=0;k<grupo.sucursalPlantel.value.length;k++){
                
               let index = 0;
               /*if(gruposTemp && gruposTemp.length){
                   index = gruposTemp.length;
               }*/
                for(var j=0;j<grupo.modalidadHorario.value.length;j++){
                   let json = {
                       sucursalId: this.sucursalControl.value.id,
                       cursoId: this.cursoControl.value.id,
                       modalidadId: this.modalidadControl.value.id,
                       nivel: grupo.nivel,
                       plantelId: grupo.sucursalPlantel.value[k].id,
                       horarioId: grupo.modalidadHorario.value[j].id,
                       fechaInicio: this.form.get('fechaInicio').value
                   }
                   let gruposTemp = this.grupos.value.filter(grupoBuscar =>{
                       return grupoBuscar.sucursalPlantel == grupo.sucursalPlantel.value[k] && grupo.nivel==grupoBuscar.nivel && grupo.modalidadHorario.value[j] == grupoBuscar.modalidadHorario
                   });
                   if(!gruposTemp || gruposTemp.length == 0){
                       let ultimoGrupo;
                       await this._grupoService.getConsecutivoUltimoGrupo(json).then(result =>{
                           ultimoGrupo = result.data;
                       });
                       index = Number(ultimoGrupo) + 1;
                   }else{
                       index = gruposTemp[gruposTemp.length - 1].grupo + 1;
                   }
                   
                   for(var i=0;i<Number(grupo.total);i++){
                        let form: FormGroup = this._formBuilder.group({
                            id:[null],
                            codigoGrupo:this.sucursalControl.value.codigoSucursal.length >4 ? this.sucursalControl.value.codigoSucursal.slice(0,3) : this.sucursalControl.value.codigoSucursal +(grupo.sucursalPlantel.value[k] == null ? '' : grupo.sucursalPlantel.value[k].codigoSucursal)+this.form.get('curso').value.codigo+this.form.get('curso').value.idioma.referencia+this.form.get('modalidad').value.codigo+("0" + Number(grupo.nivel)).slice(-2)+grupo.modalidadHorario.value[j].codigo+("0" + Number(index)).slice(-2),
                            sucursal: this.sucursalControl,
                            programaIdioma: this.cursoControl,
                            paModalidad:this.modalidadControl,
                            programacionAcademicaComercial: this.programacionComercialControl,
                            fechaInicio: new FormControl(this.form.get('fechaInicio').value),
                            fechaFin: new FormControl(this.form.get('fechaFin').value),
                            nivel: new FormControl(grupo.nivel),
                            grupo: new FormControl(Number(index)),
                            plataforma: this.plataformaControl,
                            modalidadHorario: grupo.modalidadHorario.value[j],
                            tipoGrupo: grupo.tipoGrupo,
                            cupo: new FormControl(grupo.cupo),
                            sucursalPlantel: new FormControl(grupo.sucursalPlantel.value[k]),
                            paCiclo: this.cicloControl,
                            calificacionMinima: new FormControl(this.cursoControl.value.calificacionMinima),
                            faltasPermitidas: new FormControl(this.cursoControl.value.faltasPermitidas)
                        });
                        this.grupos.push(form);
                        index = index + 1;

                    }
                   
                }
            }
        }else{
            for(var j=0;j<grupo.modalidadHorario.value.length;j++){
               let index = 0;
               let json = {
                   sucursalId: this.sucursalControl.value.id,
                   cursoId: this.cursoControl.value.id,
                   modalidadId: this.modalidadControl.value.id,
                   nivel: grupo.nivel,
                   plantelId: null,
                   horarioId: grupo.modalidadHorario.value[j].id,
                   fechaInicio: this.form.get('fechaInicio').value
               }
               let gruposTemp = this.grupos.value.filter(grupoBuscar =>{
                   return grupo.nivel==grupoBuscar.nivel && grupo.modalidadHorario.value[j] == grupoBuscar.modalidadHorario
               });
               if(!gruposTemp || gruposTemp.length == 0){
                   let ultimoGrupo;
                   await this._grupoService.getConsecutivoUltimoGrupo(json).then(result =>{
                       ultimoGrupo = Number(result.data);
                   });
                   index = Number(ultimoGrupo) + 1;
               }else{
                   index = Number(Number(gruposTemp[gruposTemp.length - 1].grupo) + 1);
               }
               for(var i=0;i<Number(grupo.total);i++){
                    let form: FormGroup = this._formBuilder.group({
                        id:[null],
                        codigoGrupo:this.sucursalControl.value.codigoSucursal.length >4 ? this.sucursalControl.value.codigoSucursal.slice(0,3) : this.sucursalControl.value.codigoSucursal + this.form.get('curso').value.codigo+this.form.get('curso').value.idioma.referencia+this.form.get('modalidad').value.codigo+("0" + Number(grupo.nivel)).slice(-2)+grupo.modalidadHorario.value[j].codigo+("0" + Number(index)).slice(-2),
                        sucursal: this.sucursalControl,
                        programaIdioma: this.cursoControl,
                        paModalidad:this.modalidadControl,
                        programacionAcademicaComercial: this.programacionComercialControl,
                        fechaInicio: new FormControl(this.form.get('fechaInicio').value),
                        fechaFin: new FormControl(this.form.get('fechaFin').value),
                        nivel: new FormControl(grupo.nivel),
                        grupo: new FormControl(Number(index)),
                        plataforma: this.plataformaControl,
                        modalidadHorario: grupo.modalidadHorario.value[j],
                        tipoGrupo: grupo.tipoGrupo,
                        cupo: new FormControl(grupo.cupo),
                        sucursalPlantel: new FormControl(null),
                        paCiclo: this.cicloControl,
                        calificacionMinima: new FormControl(this.cursoControl.value.calificacionMinima),
                        faltasPermitidas: new FormControl(this.cursoControl.value.faltasPermitidas)
                    });
                    this.grupos.push(form);
                    index = index + 1;
                } 
            }
        }
        
                      
    }

    borrarGrupo(index: number){
        this.grupos.removeAt(index)
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