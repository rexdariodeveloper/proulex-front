import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { TranslateService } from '@ngx-translate/core';
import { PixvsMatTreeComponent } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.component';
import { FichasDataService } from '@services/fichas-data.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AlertasService } from './alertas.service';
import { AlertaEtapa, AlertaEtapaAprobacion, AlertaEtapaNotificacion } from '@models/alerta';
import { JsonResponse } from '@models/json-response';
import { ValidatorService } from '@services/validators.service';
import { HashidsService } from '@services/hashids.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { locale as english } from '../alertas/i18n/en';
import { locale as spanish } from '../alertas/i18n/es';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { Location } from '@angular/common';
import { PixvsMatTreeNodo } from '@models/pixvs-mat-tree';
import { DepartamentoComboProjection, DepartamentoNodoProjection } from '@models/departamento';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ControlMaestroMultipleComboProjection } from "@models/control-maestro-multiple";

@Component({
    selector: 'alertas',
    templateUrl: './alertas.component.html',
    styleUrls: ['./alertas.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AlertasComponent {

    private _unsubscribeAll: Subject<any>;
    pageType: string = 'nuevo';
    titulo: string;
    config: FichaCRUDConfig;
    controles = ControlesMaestrosMultiples;
    
    /** ViewChild **/
    @ViewChild('tree', { static: true }) tree: PixvsMatTreeComponent;
    @ViewChild('treeDepartamentos', {static: true}) treeDepartamentos: PixvsMatTreeComponent;

    /** Listados **/
    listadoTiposAlertas    = [];
    listadoTiposAprobacion = [];
    listadoTiposOrden      = [];
    listadoTiposFinalizar  = [];
    listadoUsuarios        = [];
    listadoUsuariosNotificacion = [];
    listadoTiposMontos     = [];

    mostrarCriteriosEconomicos: ControlMaestroMultipleComboProjection = null;
    mostrarUsuarioNotificacion: ControlMaestroMultipleComboProjection = null;

    /** Banderas **/
    esAutorizacion: boolean = false;
    esUsuario:      boolean = false;
    esParalela:     boolean = false;
    usaCriterios:   boolean = false;

    etapas = [];
    etapa: AlertaEtapa = null;

    form: FormGroup = null;
    departamentosTree: PixvsMatTreeNodo<DepartamentoComboProjection, DepartamentoNodoProjection>[] = [];
    configId: number;
    sucursalId: number;

    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _fichasDataService: FichasDataService,
        private _alertaService: AlertasService,
        private _formBuilder: FormBuilder,
        private _location: Location,
        private router: Router,
        private _matSnackBar: MatSnackBar,
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
                rutaBorrar: "/api/v1/alertas/delete/",
                icono: "notifications"
            };
        });
        
        this.createSuscriptions();
    };

    createSuscriptions(): void {
        this._fichasDataService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                datos => {

                    this.mostrarCriteriosEconomicos = datos.criteriosEconomicos ? datos.criteriosEconomicos[0] : null;
                    this.mostrarUsuarioNotificacion = datos.usuarioNotificacion ? datos.usuarioNotificacion[0] : null;

                    this.form = this.createForm({});

                    this.listadoTiposAprobacion = datos.tipoAprobacion;
                    this.listadoTiposOrden = datos.tipoOrden;
                    this.listadoTiposFinalizar = datos.tipoCondicionAprobacion;
                    this.listadoUsuarios = datos.usuarios;
                    this.listadoUsuariosNotificacion = [{
						id: 0,
						nombreCompleto: 'Usuario creador'
					}].concat(datos.usuarios);
                    this.listadoTiposMontos = datos.tipoMonto;
                    this.listadoTiposAlertas = datos.tipoAlerta;

                    this.departamentosTree = [];
                    this.departamentosTree = this.purgeNodes(datos.departamentosTree || []);

                    let d = [];
                    if (datos?.menu) {
                        this.addAction(datos.menu);
                        d = datos.menu;
                    }

                    this.tree.setDatos(d);
                    this.tree.treeControl.collapseAll();
                }
            );

        this._alertaService.onEtapasChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                datos => {
                    //Si se recuperó almenos una etapa, mostrar las etapas en el listado
                    if (!!datos) {
                        this.etapas = [];
                        if (datos.length > 0)
                            this.etapas = [].concat(datos);
                        else {
                            // Agregar una etapa default
                            let etapaInicial = new AlertaEtapa({orden:1});
                            this.etapas.push(etapaInicial);
                        }
                    }
                });

        this._alertaService.onEtapaChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(
                datos => {
                    if(datos){
                        this.etapa = new AlertaEtapa(datos);
                        this.form = this.createForm(this.etapa);
                        this.onDepartamentosChange(this.departamentosTree);
                        //this.treeDepartamentos.setDatos(this.departamentosTree, ['prefijo','-','nombre']);
                    }
                });
    }

    //Agrega las acciones a los nodos hoja del árbol de módulos
    addAction(nodos): void {
        nodos.forEach(nodo => {
            if (!!nodo['children'])
                this.addAction(nodo['children']);
            else if (nodo['type'] === 'item') {
                nodo['accionesExtra'] = [{
                    icono: 'edit',
                    accion: this.onConfigChanged.bind(this),
                    tooltip: "editar"
                }];
            }
        });
    }

    onDepartamentosChange(nodos): void {
        nodos.forEach(nodo => {
            if(!!nodo['children'])
                this.onDepartamentosChange(nodo['children']);

            let d = this.etapa.detalles.find(item => item.departamentoId == nodo.id);
            nodo.activo = !!d && d.activo;
            nodo['selected'] = nodo.activo;
        });
    }    
    
    //Recupera las etapas para una configuración
    onConfigChanged(accion: any): void {
		this.configId    = accion.configId;
		if(accion.aplicaSucursales){
			this.sucursalId  = accion.id;
		}else{
			this.sucursalId  = null;
		}
        this._alertaService.getEtapas(this.configId, this.sucursalId);
        this.etapa = null;
        this.form = this.createForm({});
    }

    //Recupera los detalles de una etapa y crea el formulario de detalle
    getEtapa(etapa): void {
        //debugger;
        if(etapa?.id)
            this._alertaService.getEtapa(etapa.id);
        else{
            this.etapa = new AlertaEtapa({orden: etapa.orden});
            this.form = this.createForm(etapa);
            this.onDepartamentosChange(this.departamentosTree);
            //this.treeDepartamentos.setDatos(this.departamentosTree, ['prefijo','-','nombre']);
        }
    }

    addEtapa(): void {
        let orden = this.etapas.length + 1;
        let nuevaEtapa = new AlertaEtapa({orden: orden});
        this.etapas.push(nuevaEtapa);
    }

    deleteEtapa(): void {
        this.etapas.pop();
    }

    //Crea el formulario de una etapa, el parametro object se usa para inicializar el formulario
    createForm(object): FormGroup {

        this.esAutorizacion = false;
        this.esUsuario      = false;
        this.esParalela     = false;
        this.usaCriterios   = false;

        let form = this._formBuilder.group({
            id: new FormControl(null, []),
            alertaConfigId: new FormControl(null, []),
            orden: new FormControl(null, []),
            tipoAprobacion: new FormControl(null, []),
            tipoAprobacionId: new FormControl(null, []),
            tipoOrden: new FormControl(null, []),
            tipoOrdenId: new FormControl(null, []),
            condicionAprobacion: new FormControl(null, []),
            condicionAprobacionId: new FormControl(null, []),
            criteriosEconomicos: new FormControl(null, []),
            notificarCreador: new FormControl(null, []),
            montoMinimo: new FormControl(null, []),
            montoMaximo: new FormControl(null, []),
            tipoMonto: new FormControl(null, []),
            tipoMontoId: new FormControl(null, []),
            autorizacionDirecta: new FormControl(null, []),
            estatusReferencia: new FormControl(null, []),
            estatusReferenciaId: new FormControl(null, []),
            tipoAlerta: new FormControl(null, []),
            tipoAlertaId: new FormControl(null, []),
            sucursalId: new FormControl(null, []),
			mostrarUsuario: new FormControl(null, []),
            fechaCreacion: new FormControl(null, []),
            creadoPor: new FormControl(null, []),
            creadoPorId: new FormControl(null, []),
            fechaModificacion: new FormControl(null, []),
            modificadoPor: new FormControl(null, []),
            modificadoPorId: new FormControl(null, []),
            detalles: new FormControl(null, []),
            notificadores: new FormControl(null, []),
            notificacionCorreo: new FormControl(null, []),

            iniciales: new FormControl(null, []),
            finales: new FormControl(null, []),
            notificacionInicial: new FormControl(null,[]),
            notificacionFinal: new FormControl(null,[])
        });

        form.controls['tipoAlerta'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(data?.id == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.AUTORIZACION){
                form.controls['tipoAlertaId'].setValue(data?.id);
                this.esAutorizacion = true;
                form.controls['notificadores'].setValue([]);
            } else {
                form.controls['tipoAlertaId'].setValue(data?.id);
                this.esAutorizacion = false;

                form.controls['tipoAprobacion'].setValue(null);
                form.controls['tipoOrden'].setValue(null);
                form.controls['condicionAprobacion'].setValue(null);
                form.controls['criteriosEconomicos'].setValue(false);
                form.controls['montoMinimo'].setValue(null);
                form.controls['montoMaximo'].setValue(null);
                form.controls['tipoMonto'].setValue(null);

                form.controls['detalles'].setValue([]);
                form.controls['iniciales'].setValue([]);
                form.controls['finales'].setValue([]);

                form.controls['notificarCreador'].setValue(false);
                form.controls['notificacionInicial'].setValue(false);
                form.controls['notificacionFinal'].setValue(false);
            }
            //console.log('Tipo alerta:',data);
        });

        form.controls['tipoAprobacion'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(data?.id == ControlesMaestrosMultiples.CMM_ACE_TipoAprobacion.USUARIO){
                form.controls['tipoAprobacionId'].setValue(data?.id);
                this.esUsuario = true;
            } else {
                form.controls['tipoAprobacionId'].setValue(data?.id);
                this.esUsuario = false;
            }
            //console.log('Tipo aprobación:',data);
        });

        form.controls['tipoOrden'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            if(data?.id == ControlesMaestrosMultiples.CMM_ACE_TipoOrden.PARALELA){
                form.controls['tipoOrdenId'].setValue(data?.id);
                this.esParalela = true;
            } else {
                form.controls['tipoOrdenId'].setValue(data?.id);
                this.esParalela = false;
            }
            //console.log('Tipo orden:',data);
        });

        form.controls['condicionAprobacion'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            form.controls['condicionAprobacionId'].setValue(data?.id);
            //console.log('Condición aprobación:',data);
        });

        form.controls['tipoMonto'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe( data => {
            form.controls['tipoMontoId'].setValue(data?.id);
            //console.log('Tipo de monto:',data);
        });
        

        //Se manda a llamar la función setDatos para que se ejecuten las suscripciones
        this.setDatos(form,object);

        return form;
    }

    //Settea los datos de obj en los campos de form
    setDatos(form: FormGroup, obj: any): void {

        let autorizadores = [];
        let notificadores = [];
        let iniciales     = [];
        let finales       = [];

        if(obj?.tipoAprobacionId == ControlesMaestrosMultiples.CMM_ACE_TipoAprobacion.USUARIO){
            obj?.detalles.sort((detalle1: AlertaEtapaAprobacion,detalle2: AlertaEtapaAprobacion) => {
				return detalle1.orden < detalle2.orden ? -1 : (detalle1.orden > detalle2.orden ? 1 : 0);
			}).forEach( (detalle: AlertaEtapaAprobacion) => {
                if(detalle.activo)
                    autorizadores.push(detalle.aprobador);
            });
        }

        if(obj?.tipoAlertaId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.AUTORIZACION){
			if(obj.notificarCreador){
				finales.push({
					id: 0,
					nombreCompleto: 'Usuario creador'
				});
			}
            obj?.notificadores.forEach( (detalle: AlertaEtapaNotificacion) => {
                if(detalle.activo){
                    if(detalle.tipoNotificacionAlerta == ControlesMaestrosMultiples.CMM_ACEN_TipoNotificacion.INICIAL)
                        iniciales.push(detalle.notificador);
                    else if(detalle.tipoNotificacionAlerta == ControlesMaestrosMultiples.CMM_ACEN_TipoNotificacion.FINAL)
                        finales.push(detalle.notificador);
                }
            });
        } else if(obj?.tipoAlertaId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.NOTIFICACION){
			if(obj.notificarCreador){
				notificadores.push({
					id: 0,
					nombreCompleto: 'Usuario creador'
				});
			}
            obj?.notificadores.forEach((detalle: AlertaEtapaNotificacion) => {
                if(detalle.activo)
                    notificadores.push(detalle.notificador);
            });
        }

        if(obj?.id) form.controls['id'].setValue(obj?.id);
        if(obj?.alertaConfigId) form.controls['alertaConfigId'].setValue(obj?.alertaConfigId);
        if(obj?.orden) form.controls['orden'].setValue(obj?.orden);
        if(obj?.tipoAprobacion) form.controls['tipoAprobacion'].setValue(obj?.tipoAprobacion);
        if(obj?.tipoAprobacionId) form.controls['tipoAprobacionId'].setValue(obj?.tipoAprobacionId);
        if(obj?.tipoOrden) form.controls['tipoOrden'].setValue(obj?.tipoOrden);
        if(obj?.tipoOrdenId) form.controls['tipoOrdenId'].setValue(obj?.tipoOrdenId);
        if(obj?.condicionAprobacion) form.controls['condicionAprobacion'].setValue(obj?.condicionAprobacion);
        if(obj?.condicionAprobacionId) form.controls['condicionAprobacionId'].setValue(obj?.condicionAprobacionId);
        form.controls['criteriosEconomicos'].setValue(obj?.criteriosEconomicos || false);
        form.controls['notificarCreador'].setValue(obj?.notificarCreador || false);
        if(obj?.montoMinimo) form.controls['montoMinimo'].setValue(obj?.montoMinimo);
        if(obj?.montoMaximo) form.controls['montoMaximo'].setValue(obj?.montoMaximo);
        if(obj?.tipoMonto) form.controls['tipoMonto'].setValue(obj?.tipoMonto);
        if(obj?.tipoMontoId) form.controls['tipoMontoId'].setValue(obj?.tipoMontoId);
        form.controls['autorizacionDirecta'].setValue(false);
        if(obj?.estatusReferencia) form.controls['estatusReferencia'].setValue(obj?.estatusReferencia);
        if(obj?.estatusReferenciaId) form.controls['estatusReferenciaId'].setValue(obj?.estatusReferenciaId);
        if(obj?.tipoAlerta) form.controls['tipoAlerta'].setValue(obj?.tipoAlerta);
        if(obj?.tipoAlertaId) form.controls['tipoAlertaId'].setValue(obj?.tipoAlertaId);
        if(obj?.sucursalId) form.controls['sucursalId'].setValue(obj?.sucursalId);
		form.controls['mostrarUsuario'].setValue(obj?.mostrarUsuario || false);
        if(obj?.fechaCreacion) form.controls['fechaCreacion'].setValue(obj?.fechaCreacion);
        if(obj?.creadoPor) form.controls['creadoPor'].setValue(obj?.creadoPor);
        if(obj?.creadoPorId) form.controls['creadoPorId'].setValue(obj?.creadoPorId);
        if(obj?.fechaModificacion) form.controls['fechaModificacion'].setValue(obj?.fechaModificacion);
        if(obj?.modificadoPor) form.controls['modificadoPor'].setValue(obj?.modificadoPor);
        if(obj?.modificadoPorId) form.controls['modificadoPorId'].setValue(obj?.modificadoPorId);
        if(obj?.detalles) form.controls['detalles'].setValue(autorizadores);
        if(obj?.notificadores) form.controls['notificadores'].setValue(notificadores);
        form.controls['notificacionCorreo'].setValue(obj?.notificacionCorreo || false);

        form.controls['iniciales'].setValue(iniciales);
        form.controls['finales'].setValue(finales);
        form.controls['notificacionInicial'].setValue(iniciales.length > 0);
        form.controls['notificacionFinal'].setValue(finales.length > 0);
    }

    onCancelar() {
        this.etapa = null;
        this.form = this.createForm({});
    }

    onSave() {
        let actual   = this.form.getRawValue();
        let nodos    = [].concat(this.treeDepartamentos?.getNodosSeleccionados() || []);
        let nInicial = ControlesMaestrosMultiples.CMM_ACEN_TipoNotificacion.INICIAL;
        let nFinal   = ControlesMaestrosMultiples.CMM_ACEN_TipoNotificacion.FINAL;

        //Validaciones iniciales
        if(actual.tipoAlertaId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.NOTIFICACION){
            if(actual.notificadores.length == 0){

                return;
            }
        } else {
            if(actual.tipoAprobacionId == ControlesMaestrosMultiples.CMM_ACE_TipoAprobacion.USUARIO){
                if(actual.detalles.length == 0){
                    this._matSnackBar.open(this.translate.instant('MENSAJE.MENSAJE_USUARIOS'), 'OK', {
                        duration: 5000,
                    });
                    return;
                }
            } else {
                if(nodos.length == 0){
                    this._matSnackBar.open(this.translate.instant('MENSAJE.MENSAJE_DEPTOS'), 'OK', {
                        duration: 5000,
                    });
                    return;
                }
            }
        }

		// Obtener orden de de aprobadores
		let ordenMap: {[usuarioAprobadorId:number]: number} = {};
		let orden: number = 1;
		for(let usuario of actual.detalles){
			ordenMap[usuario.id] = orden;
			orden++;
		}
        //Inactivar todos los aprobadores por si uno se eliminó
        this.etapa.detalles.forEach(d => { d.activo = false });
        //Inactivar todos los notificadoes por si uno se eliminó
        this.etapa.notificadores.forEach(n => { n.activo = false });
        
        if(actual.tipoAlertaId == ControlesMaestrosMultiples.CMM_CALRD_TipoAlerta.NOTIFICACION){
            //Buscar si el notificador ya existía, solo se reactiva. Si no, se crea uno nuevo y se añade al arreglo
            actual.notificadores.forEach(usuario => {
                let n = this.etapa.notificadores.find((n: AlertaEtapaNotificacion) => {return n.usuarioNotificacionId == usuario.id && n.tipoNotificacionAlerta == nInicial}); 
                if(n)
                    n.activo = true;
                else{
                    let e = new AlertaEtapaNotificacion({usuarioNotificacionId: usuario.id, 
                                                         notificador: usuario, 
                                                         tipoNotificacionAlerta: nInicial, 
                                                         activo: true});
                    this.etapa.notificadores.push(e);
                }
            });
        } else { //AUTORIZACION
            if(actual.tipoAprobacionId == ControlesMaestrosMultiples.CMM_ACE_TipoAprobacion.USUARIO){
                //Buscar si el aprobador ya existía, solo se reactiva. Si no, se crea uno nuevo y se añade al arreglo
                actual.detalles.forEach(usuario => {
                    let d = this.etapa.detalles.find((d: AlertaEtapaAprobacion) => {return d.aprobadorId == usuario.id}); 
                    if(d)
                        d.activo = true;
                    else{
                        let e = new AlertaEtapaAprobacion({ aprobadorId: usuario.id, 
                                                            aprobador: usuario, 
                                                            activo: true});
                        this.etapa.detalles.push(e);
                    }
                });
            } else {
                //Buscar si el aprobador ya existía, solo se reactiva. Si no, se crea uno nuevo y se añade al arreglo
                nodos.forEach(nodo => {
                    let d = this.etapa.detalles.find((d: AlertaEtapaAprobacion) => {return d.departamentoId == nodo.id}); 
                    if(d)
                        d.activo = true;
                    else{
                        let e = new AlertaEtapaAprobacion({departamentoId: nodo.id, activo: true});
                        this.etapa.detalles.push(e);
                    }
                });
            }

            actual.iniciales.forEach(usuario => {
                let n = this.etapa.notificadores.find((n: AlertaEtapaNotificacion) => {return n.usuarioNotificacionId == usuario.id && n.tipoNotificacionAlerta == nInicial}); 
                if(n)
                    n.activo = true;
                else{
                    let e = new AlertaEtapaNotificacion({usuarioNotificacionId: usuario.id, 
                                                         notificador: usuario, 
                                                         tipoNotificacionAlerta: nInicial, 
                                                         activo: true});
                    this.etapa.notificadores.push(e);
                }
            });

            actual.finales.forEach(usuario => {
                let n = this.etapa.notificadores.find((n: AlertaEtapaNotificacion) => {return n.usuarioNotificacionId == usuario.id && n.tipoNotificacionAlerta == nFinal}); 
                if(n)
                    n.activo = true;
                else{
                    let e = new AlertaEtapaNotificacion({usuarioNotificacionId: usuario.id, 
                                                         notificador: usuario, 
                                                         tipoNotificacionAlerta: nFinal, 
                                                         activo: true});
                    this.etapa.notificadores.push(e);
                }
            });
        }

        this.etapa.detalles.forEach((detalle: AlertaEtapaAprobacion) => {
            if(ordenMap[detalle.aprobadorId]){
				detalle.orden = ordenMap[detalle.aprobadorId];
            }else{
				detalle.orden = orden;
                orden++;
			}
        });

        actual.alertaConfigId = this.configId;
        actual.sucursalId = this.sucursalId;
        actual.detalles = this.etapa.detalles;
        actual.notificadores = this.etapa.notificadores;

        this.etapa = new AlertaEtapa(actual);

        this._alertaService.guardar(this.etapa, '/v1/alerta/save').then(
            function (result: JsonResponse) {
                if (result.status == 200) {
                    this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                        duration: 5000,
                    });
                    this.etapas = [];
                    this.onCancelar();
                    this._alertaService.getEtapas(this.configId, this.sucursalId);
                } else {
                    this._alertaService.cargando = false;
                }
            }.bind(this)
        );

    }

    toogleCheckbox(event: MatCheckboxChange, control: FormControl | AbstractControl) {
        control.setValue(event.checked);
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

    purgeNodes(nodos): any[] {
        let nodosFiltrados = [].concat(nodos.filter(nodo => nodo.activo && nodo.autoriza));

        nodosFiltrados.forEach(nodo => {
            if (nodo?.children && nodo.children.length > 0)
                nodo.children = [].concat(this.purgeNodes(nodo.children));
        });

        return nodosFiltrados;
    }
}