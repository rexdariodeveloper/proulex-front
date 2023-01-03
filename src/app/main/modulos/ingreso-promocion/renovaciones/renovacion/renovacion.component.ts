import { Component, ElementRef, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import * as moment from 'moment';
import { RenovacionService } from './renovacion.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { HashidsService } from '@services/hashids.service';
import { takeUntil } from 'rxjs/operators';
import { SolicitudRenovacionContratacionEditarProjection } from '@app/main/modelos/solicitud-renovacion-contratacion';
import { SolicitudRenovacionContratacionDetalleEditarProjection } from '@app/main/modelos/solicitud-renovacion-contratacion-detalle';
import { EmpleadoEditarProjection } from '@app/main/modelos/empleado';
import { EmpleadoContratoEditarProjection } from '@app/main/modelos/empleado-contrato';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { JsonResponse } from '@models/json-response';
import { fuseAnimations } from '@fuse/animations';
import { MatDialog } from '@angular/material/dialog';
import { RenovacionEditarDialogComponent, RenovacionEditarDialogData, RenovacionEditarDialogModel } from './dialogs/renovacion-editar/renovacion-editar.dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { DepartamentoComboResponsabilidadProjection } from '@app/main/modelos/departamento';


@Component({
  selector: 'app-renovacion',
  templateUrl: './renovacion.component.html',
  styleUrls: ['./renovacion.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class RenovacionComponent implements OnInit {

  // Configuracion de la Ficha
  contadorRegistrosNuevos: number = -1;
  pageType: string = 'nuevo';
  deshabilitarBotones: boolean = true;
  config: FichaCRUDConfig;
  titulo: String;
  fechaActual = moment(new Date()).format('YYYY-MM-DD');
  currentId: number;

  // Ficha
  form: FormGroup;
  solicitudRenovacionContratacion: SolicitudRenovacionContratacionEditarProjection;
  listaSolicitudRenovacionContratacionDetalle: FormArray = new FormArray([]);
  empleadoContratoFormGroup: FormGroup;
  listaDepartamento: DepartamentoComboResponsabilidadProjection[] = [];

  // Listado DataSource
  listaDataSource: any[] = [];
  datas: any[];
  displayedColumns: string[] = ['ContratoAnterior', 'Empleado', 'TipoDeContrato', 'Puesto', 'FechaInicioYFechaFin', 'SueldoMensual', 'Acciones'];

  // Private
	private _unsubscribeAll: Subject < any > ;

  constructor(
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    private _translateService: TranslateService,
    public _renovacionService: RenovacionService,
    private _route: ActivatedRoute,
    private _formBuilder: FormBuilder,
    private _matSnackBar: MatSnackBar,
    private _el: ElementRef,
    public _validatorService: ValidatorService,
    private _hashid: HashidsService,
    public _dialog: MatDialog,
    private _router: Router
  ) { 
    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

    // Set the private defaults
		this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    this._route.paramMap.subscribe(params => {
      this.pageType = params.get("handle");
      let id: string = params.get("id");

      this.currentId = this._hashid.decode(id);
      if (this.pageType == 'nuevo') {
          //this.empleado = new Empleado();
      }

      this.config = {
          rutaAtras: "/app/ingreso-promocion/renovaciones",
          icono: "store"
      }

    });


    // Subscribe to update datos on changes
    this._renovacionService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
      if (datos && datos.solicitudRenovacionContratacion) {
        this.solicitudRenovacionContratacion = new SolicitudRenovacionContratacionEditarProjection(datos.solicitudRenovacionContratacion);
        this.titulo = this.solicitudRenovacionContratacion.codigo;
      } else {
        this.solicitudRenovacionContratacion = new SolicitudRenovacionContratacionEditarProjection();
        this.solicitudRenovacionContratacion.id = this.contadorRegistrosNuevos;

        // Descontador
        this.contadorRegistrosNuevos--;
      }

      this.listaDepartamento = datos.listaDepartamento;

      this.createSolicitudRenovacionContratacionForm();
    });

    if (this.pageType == 'ver') {
      this.form.disable();
      this.deshabilitarBotones = false;
    } else {
      this.form.enable();
    }
  }

  deshabilitarCampos(event){
    this.deshabilitarBotones = true;
  }

  // Solicitud Renovacion Contratacion
  createSolicitudRenovacionContratacionForm(){
    // Solicitud Renovacion Contratacion Detalle
    if(this.solicitudRenovacionContratacion.listaSolicitudRenovacionContratacionDetalle.length > 0){
      this.solicitudRenovacionContratacion.listaSolicitudRenovacionContratacionDetalle.map(detalle => {
        this.listaSolicitudRenovacionContratacionDetalle.push(this.createSolicitudRenovacionContratacionDetalleForm(detalle, detalle.empleado));
      });
    }

    this.form = this._formBuilder.group({
      id: new FormControl(this.solicitudRenovacionContratacion.id),
      codigo: new FormControl(this.solicitudRenovacionContratacion.codigo),
      fechaInicio: new FormControl(this.solicitudRenovacionContratacion.fechaInicio ? moment(this.solicitudRenovacionContratacion.fechaInicio).format('YYYY-MM-DD') : null, [Validators.required]),
      fechaFin: new FormControl(this.solicitudRenovacionContratacion.fechaFin ? moment(this.solicitudRenovacionContratacion.fechaFin).format('YYYY-MM-DD') : null, [Validators.required]),
      estatusId: new FormControl(this.solicitudRenovacionContratacion.estatusId),
      listaSolicitudRenovacionContratacionDetalle: this.listaSolicitudRenovacionContratacionDetalle
    });
  }

  // Solicitud Renovacion Contratacion Detalle
  createSolicitudRenovacionContratacionDetalleForm(detalle?: SolicitudRenovacionContratacionDetalleEditarProjection, empleado?: EmpleadoEditarProjection): FormGroup{
    detalle = detalle ? detalle : new SolicitudRenovacionContratacionDetalleEditarProjection();
    if(detalle.id == null){
     detalle.id = this.contadorRegistrosNuevos;

     // Descontador
     this.contadorRegistrosNuevos--;
    }

    let form = this._formBuilder.group({
      id: new FormControl(detalle.id),
      solicitudRenovacionContratacionId: new FormControl(detalle.solicitudRenovacionContratacionId),
      empleadoId: new FormControl(empleado.id),
      empleado: this.createEmpleadoForm(empleado),
      //empleado: new FormControl(empleado
      estatusId: new FormControl(detalle.estatusId)
    });

    return form;
  }

  createEmpleadoForm(empleado?: EmpleadoEditarProjection): FormGroup{
    
    // Empleado Contrato
    //this.empleadoContratoFormGroup = this.createEmpleadoContratoForm(empleado.empleadoContrato);

    let form = this._formBuilder.group({
      id: new FormControl(empleado.id),
      codigoEmpleado: new FormControl(empleado.codigoEmpleado),
      nombre: new FormControl(empleado.nombre),
      primerApellido: new FormControl(empleado.primerApellido),
      segundoApellido: new FormControl(empleado.segundoApellido),
      empleadoContrato: this.createEmpleadoContratoForm(empleado.empleadoContrato)
    });

    return form;
  }

  createEmpleadoContratoForm(empleadoContrato?: EmpleadoContratoEditarProjection): FormGroup {
    empleadoContrato = empleadoContrato ? empleadoContrato : new EmpleadoContratoEditarProjection();

    // if(empleadoContrato.id == null){
    //   empleadoContrato.id = this.contadorRegistrosNuevos;
    //   empleadoContrato.estatusId = ControlesMaestrosMultiples.CMM_EMP_Estatus.RENOVADO;

    //   //Descontador
    //   this.contadorRegistrosNuevos--;
    // }

    let form: FormGroup = this._formBuilder.group({
      id: new FormControl(empleadoContrato.id),
      empleadoId: new FormControl(empleadoContrato.empleadoId),
      codigo: new FormControl(empleadoContrato.codigo),
      justificacion: new FormControl(empleadoContrato.justificacion, [Validators.required]),
      tipoContrato: new FormControl(empleadoContrato.tipoContrato, [Validators.required]),
      puesto: new FormControl(empleadoContrato.puesto, [Validators.required]),
      ingresosAdicionales: new FormControl(empleadoContrato.ingresosAdicionales, [Validators.required]),
      sueldoMensual: new FormControl(empleadoContrato.sueldoMensual, [Validators.required]),
      fechaInicio: new FormControl(empleadoContrato.fechaInicio, [Validators.required]),
      fechaFin: new FormControl(empleadoContrato.fechaFin, [Validators.required]),
      tipoHorario: new FormControl(empleadoContrato.tipoHorario, [Validators.required]),
      cantidadHoraSemana: new FormControl(empleadoContrato.cantidadHoraSemana, []),
      domicilio: new FormControl(empleadoContrato.domicilio, [Validators.required]),
      cp: new FormControl(empleadoContrato.cp, [Validators.required]),
      colonia: new FormControl(empleadoContrato.colonia, [Validators.required]),
      pais: new FormControl(empleadoContrato.pais, [Validators.required]),
      estado: new FormControl(empleadoContrato.estado, [Validators.required]),
      municipio: new FormControl(empleadoContrato.municipio, [Validators.required]),
      fechaContrato: new FormControl(empleadoContrato.fechaContrato),
      estatusId: new FormControl(empleadoContrato.estatusId)
    });

    return form;
  }

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  onClickFiltrar(){
    this._renovacionService.cargando = true;
    if (this.form.invalid) {
      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      }); 
      this._renovacionService.cargando = false;
      return;
    }

    this._renovacionService.post(JSON.stringify(this.form.getRawValue()), '/api/v1/renovaciones/filtros', false).then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._renovacionService.cargando = false;

          this.cargaEmpleados(result.data);
          
        } else {
          this._renovacionService.cargando = false;
        }
      }).bind(this)
    );
  }

  cargaEmpleados(listaEmpleado: EmpleadoEditarProjection[]){
    listaEmpleado.map(empleado => {
      if(!this.listaSolicitudRenovacionContratacionDetalle.controls.some(detalle => detalle.value.empleadoId == empleado.id)){
        this.listaSolicitudRenovacionContratacionDetalle.push(this.createSolicitudRenovacionContratacionDetalleForm(null, empleado));
      }
    });
  }

  // Listado //
  cargaDataSourceListaSolicitud(){
    return this.listaSolicitudRenovacionContratacionDetalle.value.filter(detalle => detalle.estatusId == ControlesMaestrosMultiples.CMM_EMP_Estatus.AUTORIZADO);
  }

  getFechas(empleadoContrato: EmpleadoContratoEditarProjection){
    return moment(empleadoContrato.fechaInicio).format('DD/MM/YYYY') + '  ' + moment(empleadoContrato.fechaFin).format('DD/MM/YYYY');
  }
  /////////////

  // Dialog //
  abrirRenovacionEditarModal(detalle: SolicitudRenovacionContratacionDetalleEditarProjection): void {      
    let dialogData: RenovacionEditarDialogData = {
      detalle: detalle,
      listaDepartamento: this.listaDepartamento,
      onAceptar: this.aceptarRenovacionEditarModal.bind(this)
    };

    const dialogRef = this._dialog.open(RenovacionEditarDialogComponent, {
      width: '600px',
      data: dialogData
    });

    // dialogRef.keydownEvents().pipe(takeUntil(this._unsubscribeAll)).subscribe(event => {
    //   if(event.key === "Enter"){
    //     event.preventDefault();
    //     event.stopPropagation();
    //     dialogRef.componentInstance.aceptar();
    //   }
    // });
		
	}

  aceptarRenovacionEditarModal(detalle: SolicitudRenovacionContratacionDetalleEditarProjection, empleadoContrato: RenovacionEditarDialogModel){
		event.stopPropagation();

    var actualizarSolicitud = ((this.listaSolicitudRenovacionContratacionDetalle.controls.find(_detalle => _detalle.value.id == detalle.id) as FormGroup).controls['empleado'] as FormGroup).controls['empleadoContrato'] as FormGroup;
    actualizarSolicitud.controls['fechaFin'].setValue(empleadoContrato.fechaFin);
    actualizarSolicitud.controls['puesto'].setValue(empleadoContrato.puesto);
    actualizarSolicitud.controls['sueldoMensual'].setValue(empleadoContrato.sueldoMensual);
    actualizarSolicitud.markAsDirty();

	}

  abrirRenovacionEliminarModal(detalle: SolicitudRenovacionContratacionDetalleEditarProjection): void {

		let dialogData: any = {
			mensaje: '',
			titulo: '¿Deseas eliminar este solicitud?',
			aceptar: 'Aceptar',
			cancelar: 'Cancelar',
		};

		const dialogRef = this._dialog.open(FuseConfirmDialogComponent, {
			width: '600px',
			data: dialogData,
			autoFocus: true
		});

		dialogRef.beforeClosed().pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
			if(!!data) {//If confirmation is affirmative
				this.renovacionEliminar(detalle)
			} else {
				//console.log('no');
			}
		});
	}

  renovacionEliminar(detalle: SolicitudRenovacionContratacionDetalleEditarProjection){
    if(detalle.id <= 0){
      this.listaSolicitudRenovacionContratacionDetalle.removeAt(this.listaSolicitudRenovacionContratacionDetalle.controls.findIndex(_detalle => _detalle.value.id == detalle.id));
    }else{
      // Actualizamos el estatus como borrado
      // Solicitud Detalle
      var actualizarSolicitud = this.listaSolicitudRenovacionContratacionDetalle.controls.find(_detalle => _detalle.value.id == detalle.id) as FormGroup;
      actualizarSolicitud.controls['estatusId'].setValue(ControlesMaestrosMultiples.CMM_EMP_Estatus.BORRADO);
      //actualizarSolicitud.value.estatusId = ControlesMaestrosMultiples.CMM_EMP_Estatus.BORRADO;
      actualizarSolicitud.markAsDirty();
      // Empleado Contrato
      var actualizarEmpleadoContrato = (actualizarSolicitud.controls['empleado'] as FormGroup).controls['empleadoContrato'] as FormGroup;
      actualizarEmpleadoContrato.controls['estatusId'].setValue(ControlesMaestrosMultiples.CMM_EMP_Estatus.BORRADO);
      actualizarEmpleadoContrato.markAsDirty();
    }
  }
  ////////////

  guardar(){
    // Validaciones
    // Validar no se puede guardar 0 empleado
    if((this.form.controls['listaSolicitudRenovacionContratacionDetalle'] as FormArray).length == 0){
      this._matSnackBar.open(this._translateService.instant('VALIDACION.AGREGAR_EMPLEADO'), 'OK', {
        duration: 5000,
      });
      return;
    }

    this._renovacionService.cargando = true;
    this._renovacionService.guardar(JSON.stringify(this.form.getRawValue()), '/api/v1/renovaciones/save').then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
            duration: 5000,
          });
          this._router.navigate(['/app/ingreso-promocion/renovaciones/'])
        } else {
          this._renovacionService.cargando = false;
        }
      }).bind(this)
    );
  }

}
