import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { HashidsService } from '@services/hashids.service';
import { Router, RoutesRecognized, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { Validators, FormGroup, FormBuilder, AbstractControl, FormControl, FormArray } from '@angular/forms';
import { FieldConfig, FieldConfigUtils } from '@pixvs/componentes/dinamicos/field.interface';
import { MatDialog } from '@angular/material/dialog';
import { takeUntil } from 'rxjs/operators';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ValidatorService } from '@services/validators.service';
import { JsonResponse } from '@models/json-response';
import { environment } from '@environments/environment';
import { DepartamentosService } from './departamentos.service';
import { UsuarioComboProjection } from '@models/usuario';
import { type } from 'os';
import { DepartamentoNodoProjection, DepartamentoComboProjection } from '@models/departamento';
import { PixvsMatTreeComponent } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.component';
import { PixvsMatTreeNodo } from '@models/pixvs-mat-tree';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { Puesto } from '@models/puesto';
import { HabilidadResponsabilidadDialogComponent, HabilidadResponsabilidadDialogData } from './dialogs/habilidadResponsabilidad/habilidad-responsabilidad.dialog';

const MAX_28: number = 9999999999999999999999999999.99;

@Component({
	selector: 'organigrama',
	templateUrl: './departamentos.component.html',
	styleUrls: ['./departamentos.component.scss']
})
export class DepartamentosComponent {

	@ViewChild('treeDepartamentos', { static: true }) treeDepartamentos: PixvsMatTreeComponent;

	localeEN = english;
	localeES = spanish;

	apiUrl: string = environment.apiUrl;

	config: FichaCRUDConfig;

    camposListado: FieldConfig[] = [];

	form: FormGroup;

	departamentosTree: PixvsMatTreeNodo<DepartamentoComboProjection,DepartamentoNodoProjection>[];
	departamentoEditar: DepartamentoNodoProjection = null;
    puestos: Puesto[] = [];

	responsableControl: FormControl = new FormControl();
	usuariosPermisosControl: FormControl = new FormControl();
	usuarios: UsuarioComboProjection[];

	departamentoPadreControl: FormControl = new FormControl();
	departamentos: DepartamentoComboProjection[];

	idControl: FormControl = new FormControl();
	prefijoControl: FormControl = new FormControl();
	nombreControl: FormControl = new FormControl();
	autorizarControl: FormControl = new FormControl();
	activoControl: FormControl = new FormControl();
    numeroVacantes: FormControl = new FormControl();
    propositoPuesto: FormControl = new FormControl();
    observaciones: FormControl = new FormControl();
    puestoControl: FormControl = new FormControl();
    responsabilidadesHabilidades: FormArray = new FormArray([]);
    responsabilidadesHabilidadesEliminar: FormArray = new FormArray([]);

	private prevActivo: boolean = false;

	// Private
	private _unsubscribeAll: Subject < any > ;

	constructor(
		private _fuseTranslationLoaderService: FuseTranslationLoaderService,
		private _snackBar: MatSnackBar,
		private _fuseSidebarService: FuseSidebarService,
		private _fuseNavigationService: FuseNavigationService,
		private _departamentosService: DepartamentosService,
		private hashid: HashidsService,
		private router: Router,
		private translate: TranslateService,
		public dialog: MatDialog,
		private route: ActivatedRoute,
		private _formBuilder: FormBuilder,
		public validatorService: ValidatorService,
		private _matSnackBar: MatSnackBar
	) {
		// Set the private defaults
		this._unsubscribeAll = new Subject();
	}

	ngOnInit() {
		this._fuseTranslationLoaderService.loadTranslations(english, spanish);

		this.route.paramMap.subscribe(params => {
			let id: string = params.get("id");
			
			this.config = {
				rutaAtras: null,
				rutaBorrar: "/api/v1/departamentos/delete/",
				icono: "card_travel"
			}

		});

		this.serviceSubscriptions();
	}

	ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

	serviceSubscriptions() {
		this._departamentosService.onDatosChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
			if (datos) {
				this._departamentosService.onDatosChanged.next(null);

				this.departamentosTree = (datos.departamentosTree || []);
				this.setAccionesExtra(this.departamentosTree);
				this.treeDepartamentos.setDatos(this.departamentosTree,['prefijo','-','nombre']);

				this.createForms();

				this.usuarios = datos.usuarios;
                this.puestos = datos.puestos;
				this.departamentos = [{
					id: null,
					nombre: 'Raiz',
					prefijo: ''
				}].concat(datos.departamentos);
			}
		});
	}

	setAccionesExtra(departamentos: PixvsMatTreeNodo<DepartamentoComboProjection,DepartamentoNodoProjection>[]){
		departamentos.forEach(departamento => {
			departamento.accionesExtra = [{
				icono: 'edit',
				tooltip: 'editar',
				accion: this.onEditarDepartamento.bind(this)
			}];
			this.setAccionesExtra(departamento.children);
		});
	}

	onEditarDepartamento(departamento: DepartamentoNodoProjection){
		let raiz = this.departamentos.find(depto => !depto?.id);
		this.departamentoEditar = departamento;
		departamento.departamentoPadre = departamento.departamentoPadre? departamento.departamentoPadre : raiz;
		this.idControl.setValue(departamento.id);
		this.prefijoControl.setValue(departamento.prefijo);
		this.nombreControl.setValue(departamento.nombre);
		this.responsableControl.setValue(departamento.responsable);
		this.usuariosPermisosControl.setValue(departamento.usuariosPermisos);
		this.departamentoPadreControl.setValue(departamento.departamentoPadre);
		this.activoControl.setValue(departamento.activo);
		this.autorizarControl.setValue(departamento.autoriza);
        this.numeroVacantes.setValue(departamento.numeroVacantes);
        this.propositoPuesto.setValue(departamento.propositoPuesto);
        this.puestoControl.setValue(departamento.puesto);
        this.observaciones.setValue(departamento.observaciones);
        this.responsabilidadesHabilidades.clear();
        this.responsabilidadesHabilidadesEliminar.clear();
        // this.responsabilidadesHabilidades.setValue( [] ); // aqui editar
		this.prevActivo = departamento.activo || false;
        //let hrTemp = this._formBuilder.array([]);
        if(!!departamento.responsabilidadHabilidad && departamento.responsabilidadHabilidad.length){
            for(let index = 0, t = departamento.responsabilidadHabilidad.length; index < t ; index++){
                let item: FormGroup = this.createResposabilidadHabilidad(departamento.responsabilidadHabilidad[index]);
                //hrTemp.push(item);
                this.responsabilidadesHabilidades.push(item);
            }
        }
        this.form.setControl('responsabilidadHabilidad', this.responsabilidadesHabilidades);

	}

	onCancelarEdicion(departamento: DepartamentoNodoProjection){
		this.departamentoEditar = null;
		this.createForms();
	}

	createForms() {
		if(this.form){
			this.habilitarForm(true);
		}else{
			this.form = this.createForm();
		}
	}

	habilitarForm(limpiarForm: boolean = false){
		this.form.enable({
			emitEvent: false
		});
		if(limpiarForm){
			this.idControl.setValue(null);
			this.prefijoControl.setValue(null);
			this.nombreControl.setValue(null);
			this.responsableControl.setValue(null);
			this.usuariosPermisosControl.setValue([]);
			this.departamentoPadreControl.setValue(null);
			this.activoControl.setValue(null);
			this.autorizarControl.setValue(null);
            this.numeroVacantes.setValue(null);
            this.propositoPuesto.setValue(null);
            this.puestoControl.setValue(null);
            this.observaciones.setValue(null);
            this.responsabilidadesHabilidades.clear();
			this.form.markAsUntouched();
		}
	}

	deshabilitarForm(){
		this.form.disable({
			emitEvent: false
		});
	}

	createForm(): FormGroup {

		this.responsableControl = new FormControl(null, [Validators.required]);
		this.usuariosPermisosControl = new FormControl([], []);
		this.departamentoPadreControl = new FormControl(null, []);
		
		this.idControl = new FormControl(null, []);
		this.prefijoControl = new FormControl(null, [Validators.required]);
		this.nombreControl = new FormControl(null, [Validators.required]);
		this.autorizarControl = new FormControl(false, []);
		this.activoControl = new FormControl(false, []);
        this.numeroVacantes = new FormControl(null, []);
        this.propositoPuesto = new FormControl(null, []);
        this.puestoControl = new FormControl(null, []);
        this.observaciones = new FormControl(null, []);
        this.responsabilidadesHabilidades = this._formBuilder.array([]);
        this.responsabilidadesHabilidadesEliminar = this._formBuilder.array([]);
		let form = this._formBuilder.group({
			id: this.idControl,
			prefijo: this.prefijoControl,
			nombre: this.nombreControl,
			departamentoPadre: this.departamentoPadreControl,
			responsable: this.responsableControl,
			usuariosPermisos: this.usuariosPermisosControl,
			autoriza: this.autorizarControl,
			activo: this.activoControl,
            numeroVacantes: this.numeroVacantes,
            propositoPuesto: this.propositoPuesto,
            puesto: this.puestoControl,
            observaciones: this.observaciones,
            responsabilidadHabilidad: this.responsabilidadesHabilidades,
            responsabilidadesHabilidadesEliminar: this.responsabilidadesHabilidadesEliminar
		});

        form.controls['puesto'].valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((puesto: Puesto) => {
            if(!!puesto && puesto.id){
                //let resps = puesto.habilidadesResponsabilidades.filter(item => !item.esHabilidad);
                form.setControl('responsabilidadHabilidad', this.crearResponsabilidadAray(form.controls["id"].value, puesto.habilidadesResponsabilidades));
                //this.responsabilidades = this.crearResponsabilidadAray(resps);
                //this.empleadoContratoFormGroup.setControl('responsabilidades', this.responsabilidades);
            }else{
                form.setControl('responsabilidadHabilidad', this._formBuilder.array([]));
                //this.responsabilidades = this._formBuilder.array([]);
            }
          });

		return form;
	}

    crearResponsabilidadAray(departamentoId: number, responsabilidades : any[]){
        let arrayHabilidadResponsabilidad = this._formBuilder.array([]);
        for(let index = 0, total = responsabilidades.length; index < total; index++){
            let hr = this._formBuilder.group({
                id:[null],
                departamentoId: new FormControl(departamentoId),
                descripcion: new FormControl(responsabilidades[index]?.descripcion),
                esResponsabilidad: new FormControl(!responsabilidades[index]?.esHabilidad, [])
            });
            arrayHabilidadResponsabilidad.push(hr);
        }
        
        return arrayHabilidadResponsabilidad;
    }
    



	guardar(event) {

		this._departamentosService.cargando = true;


		if (!this.form.valid) {
			this.form.markAllAsTouched();
		}

		if (this.form.valid) {
			
			if(this.prevActivo && !this.activoControl.value){
				const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
					width: '400px',
					data: {
						mensaje: this.translate.instant('MENSAJE.BORRAR_HIJOS')
					}
				});

				dialogRef.afterClosed().subscribe(confirm => {
					if (!confirm) {
						this._departamentosService.cargando = false;
					}else{
						this.deshabilitarForm();

						let departamento = {
							fechaModificacion: this.departamentoEditar?.fechaModificacion || null
						};

						Object.assign(departamento, this.form.value);

						this._departamentosService.guardar(JSON.stringify(departamento), '/api/v1/departamentos/save').then(
							(result: JsonResponse) => {
								if (result.status == 200) {
									this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
										duration: 5000,
									});
									this._departamentosService.getDatos();
								} else {
									this._departamentosService.cargando = false;
									this.habilitarForm();
								}
							}
						);
					}
				});
			}else{
				this.deshabilitarForm();

				let departamento = {
					fechaModificacion: this.departamentoEditar?.fechaModificacion || null
				};

				Object.assign(departamento, this.form.value);

				this._departamentosService.guardar(JSON.stringify(departamento), '/api/v1/departamentos/save').then(
					(result: JsonResponse) => {
						if (result.status == 200) {
							this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
								duration: 5000,
							});
							this._departamentosService.getDatos();
						} else {
							this._departamentosService.cargando = false;
							this.habilitarForm();
						}
					}
				);
			}
		} else {
			this._departamentosService.cargando = false;
			this.habilitarForm();

			this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
				duration: 5000,
			});
		}
	}

	isRequired(form: FormGroup, campo: string) {

		let form_field = form.get(campo);
		if (!form_field.validator) {
			return false;
		}

		let validator = form_field.validator({} as AbstractControl);
		return !!(validator && validator.required);

	}

	onBorrar(){
		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '400px',
			data: {
				mensaje: this.translate.instant('MENSAJE.BORRAR_HIJOS')
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if (!confirm) {
				this._departamentosService.cargando = false;
			}else{
				this.deshabilitarForm();

				this._departamentosService.borrar(this.departamentoEditar.id).then(
					(result: JsonResponse) => {
						if (result.status == 200) {
							this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
								duration: 5000,
							});
							this._departamentosService.getDatos();
						} else {
							this._departamentosService.cargando = false;
							this.habilitarForm();
						}
					}
				);
			}
		});
	}


    addResposabilidadHabilidad(esResponsabilidad: boolean = true){
        let item = this.createResposabilidadHabilidad({
			id: null,
			departamentoId: this.departamentoEditar?.id,
            descripcion: null,
			esResponsabilidad: esResponsabilidad
		});
        (this.form.controls["responsabilidadHabilidad"] as FormArray).push(item);
    }

	createResposabilidadHabilidad(item): FormGroup{
		return this._formBuilder.group({
            id:[item?.id],
            departamentoId: new FormControl(item?.departamentoId),
            descripcion: new FormControl(item?.descripcion),
            esResponsabilidad: new FormControl(item?.esResponsabilidad, [])
        })
	}

    get responsabilidades(){
        if(!!this.form){
            let responsabilidadesArray = this.form.controls["responsabilidadHabilidad"] as FormArray;
            return new FormArray(responsabilidadesArray.controls.filter(r => !!r.value.esResponsabilidad))
        }else{
            return new FormArray([]);
        }
    }

    get habilidades(){
        if(!!this.form){
            let habilidadesArray = this.form.controls["responsabilidadHabilidad"] as FormArray;
            return new FormArray(habilidadesArray.controls.filter(r => !!!r.value.esResponsabilidad))
        }else{
            return new FormArray([]);
        }
    }


    abrirModal(data, tipo){
        // buscar index
        let hr = !!data ? data.value : {};

        if(!!this.departamentoEditar?.id){
            hr.departamentoId = this.departamentoEditar.id
        }

        this.camposListado = [{
            type: 'input',
            label: 'Descripción',
            inputType: 'text',
            name: 'descripcion',
            validations: [{
                    name: 'required',
                    validator: Validators.required,
                    message: 'Descripción requerida'
                },
                {
                    name: 'minlength',
                    validator: Validators.minLength(10),
                    message: 'La descripción debe contener al menos 10 caracteres'
                },
                {
                    name: 'maxlength',
                    validator: Validators.maxLength(250),
                    message: 'La descripción no debe sobrepasar los 250 caracteres'
                }
            ]
        }];

        let index: number = -1;
        if(!!data){
            if(data.id){
                index = this.form.controls["responsabilidadHabilidad"].value.findLastIndex(hrItem => hrItem.id == hr.id);
            }else{
                index = this.form.controls["responsabilidadHabilidad"].value.findLastIndex(hrItem => hrItem.descripcion == hr.descripcion);
            }
        }
        
        let info = {
            esNuevo: (!!hr && hr?.id ? false : true),
            habilidadResponsabilidad: hr,
            esResponsabilidad: (tipo == 'Habilidad' ? false: true),
            titulo: tipo,
            index: index,
            camposListado: this.camposListado,
            onAceptar: this.addHabilidadResponsabilidad.bind(this)
        }

        const dialogRef = this.dialog.open(HabilidadResponsabilidadDialogComponent, {
            width: '500px',
            data: info
        });
        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.addHabilidadResponsabilidad(confirm);
            }
        });
    }

    addHabilidadResponsabilidad(datos){
        let responsabilidadesArray = this.form.controls["responsabilidadHabilidad"] as FormArray;
        if(datos.index === -1){
            responsabilidadesArray.push(this.createResposabilidadHabilidad(datos));
        }else if(datos.index !== -1){
            // this.form.get('municipioNacimiento').setValue(null);
            responsabilidadesArray.at(datos.index).get('descripcion').setValue(datos.descripcion)
        }
            
    }

	deleteHabilidadResponsabilidad(item){
        this._departamentosService.cargando = false;
		let textoMensaje = null;
		if(item.value.esResponsabilidad == true){
			textoMensaje = this.translate.instant('MENSAJE.BORRAR_RESPONSABILIDAD')
		}else{
			textoMensaje = this.translate.instant('MENSAJE.BORRAR_HABILIDAD')
		}

		const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
			width: '400px',
			data: {
				mensaje: textoMensaje
			}
		});

		dialogRef.afterClosed().subscribe(confirm => {
			if (!confirm) {
				this._departamentosService.cargando = false;
			}else{
				if(item.value.id){
                    (this.form.controls["responsabilidadesHabilidadesEliminar"] as FormArray).push(new FormControl(item.value.id));
                    let index = this.form.controls["responsabilidadHabilidad"].value.findLastIndex(hrItem => hrItem.id == item.value.id);
                    this.responsabilidadesHabilidades.removeAt(index);
                }else{
                    let index = this.form.controls["responsabilidadHabilidad"].value.findLastIndex(hrItem => hrItem.descripcion == item.descripcion);
                    this.responsabilidadesHabilidades.removeAt(index);
                }
            }
            this._departamentosService.cargando = false;
		});
	}

}