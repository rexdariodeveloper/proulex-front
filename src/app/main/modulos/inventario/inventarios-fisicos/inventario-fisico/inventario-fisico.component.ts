import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InventarioFisico, InventarioFisicoProjection } from '@app/main/modelos/inventario-fisico';
import { InventarioFisicoDetalleProjection } from '@app/main/modelos/inventario-fisico-detalle';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { FechaPipe } from '@pixvs/utils/pipes/fecha.pipe';
import { HashidsService } from '@services/hashids.service';
import { ValidatorService } from '@services/validators.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { locale as english } from '../i18n/en';
import { locale as spanish } from '../i18n/es';
import { ArticuloDialogComponent, ArticuloDialogData } from './dialogs/articulo.dialog';
import { InventarioFisicoDetalleService } from './inventario-fisico-detalle.service';
import { InventarioFisicoService } from './inventario-fisico.service';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import * as moment from 'moment';

@Component({
    selector: 'inventario-fisico',
    templateUrl: './inventario-fisico.component.html',
    styleUrls: ['./inventario-fisico.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class InventarioFisicoComponent {

    private URL: string = '/api/v1/inventarios-fisicos';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    @ViewChild('localidadSelect') localidadSelect: PixvsMatSelectComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    localeEN = english;
    localeES = spanish;

    // Controls
    form: FormGroup;
    currentId: number;
    editar: boolean;
    cambios: boolean = false;

    // Private
    inventario: InventarioFisico;
    private _unsubscribeAll: Subject<any>;

    // Listados
    familiasSeleccionadas: any[] = [];
    listadoFamilias: any[] = [];
    listadoArticulos: any[] = [];
    listadoAlmacenes: any[] = [];
    localidades: any[] = [];
    listadoLocalidades: any[] = [];
    listadoLocalidadesArticulos: any[] = [];

    // Cbo Controls
    familiasControl: FormControl = new FormControl();
    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();

    // Tabla Artículos
    columnasTabla: any[] = [
        {
            name: 'articulo.codigoArticulo',
            values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
            title: this.translate.instant('ARTICULO'),
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: true
        },
        {
            name: 'articulo.unidadMedidaInventario.nombre',
            title: this.translate.instant('UM'),
            class: "mat-column-flex",
            centrado: false,
            type: null,
            tooltip: false
        },
        {
            name: 'existencia',
            title: this.translate.instant('EXISTENCIA'),
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'conteo',
            title: this.translate.instant('CONTEO'),
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        }
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['articulo.codigoArticulo', 'articulo.unidadMedidaInventario.nombre', 'existencia', 'conteo'];
    camposListado: FieldConfig[] = [];

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
        public _inventarioFisicoService: InventarioFisicoService,
        public _detallesService: InventarioFisicoDetalleService,
        public validatorService: ValidatorService,
        public fechaPipe: FechaPipe,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

	fechaCreacion: any = null;

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/inventario/inventarios-fisicos",
                rutaBorrar: this.URL + "/delete/",
                icono: "widgets"
            }
        });

        // Subscribe to update on changes
        this._inventarioFisicoService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
					if(!!datos.fecha){
						this.fechaCreacion = datos.fecha;
					}
                    this.inventario = datos.inventarioFisico || new InventarioFisico();
                    let detalles = datos.inventarioFisicoDetalles || [];
                    this.listadoLocalidadesArticulos = datos.localidaesArticulos;
                    this.editar = datos.editar;

                    detalles.forEach(registro => {
                        registro.nombreArticulo = registro.articulo.codigoArticulo + ' - ' + registro.articulo.nombreArticulo;
                    });

                    if (this.pageType == 'ver') {
                        this.listadoAlmacenes = [this.inventario.localidad.almacen];
                        this.listadoLocalidades = !this.inventario.localidad.localidadGeneral ? [this.inventario.localidad] : [];

                        this.form = this.createForm();
                        this.form.disable({ emitEvent: false });

                        this.titulo = this.inventario.codigo;
                    } else {
                        this.listadoFamilias = datos.familias;
                        this.listadoAlmacenes = datos.almacenes;
                        this.localidades = datos.localidades;
                        this.listadoLocalidades = [];
                        this.listadoArticulos = datos.articulos;

                        this.form = this.createForm();
                        this.form.enable({ emitEvent: false });

                        this.titulo = this.translate.instant('TITULO');
                    }

                    this.camposListado = [
                        {
                            type: 'input',
                            label: this.translate.instant('ARTICULO'),
                            inputType: 'text',
                            name: 'nombreArticulo',
                            validations: [],
                            readonly: true,
                        },
                        {
                            type: 'input',
                            label: this.translate.instant('EXISTENCIA'),
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'existencia',
                            validations: [],
                            readonly: true,
                        },
                        {
                            type: 'input',
                            label: this.translate.instant('CONTEO'),
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'conteo',
                            validations: [
                                {
                                    name: 'required',
                                    validator: Validators.required,
                                    message: this.translate.instant('REQUERIDO')
                                }
                            ],
                        }
                    ];

                    this._detallesService.setDatos(detalles);
                    this.form.controls.responsable.disable();
                    this.form.controls.fecha.disable();
                    this.form.controls.fechaAfectacion.disable();
                    this.form.controls.familias.disable();
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        this.almacenControl = new FormControl(this.inventario.localidad ? this.inventario.localidad.almacen : null, [Validators.required]);
        this.localidadControl = new FormControl(this.inventario.localidad, [Validators.required]);

        this.almacenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let almacenId = this.almacenControl.value ? this.almacenControl.value.id : null;
            let localidadGeneral = this.localidades.filter(registro => { return registro.almacen.id == almacenId && registro.localidadGeneral })[0];

            //this.listadoLocalidades = this.localidades.filter(registro => { return registro.almacen.id == almacenId && !registro.localidadGeneral });
            this.listadoLocalidades = this.localidades.filter(registro => { return registro.almacen.id == almacenId});

            if (this.localidadSelect) {
                this.localidadSelect.setDatos(this.listadoLocalidades);
            }

            this.localidadControl.setValue(localidadGeneral && this.listadoLocalidades.length == 0 ? localidadGeneral : null);
            this.form.controls.responsable.setValue(almacenId ? this.almacenControl.value.responsable.nombreCompleto : null);
        });

        this.localidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            if (this.localidadControl.value) {
                this.form.controls.familias.enable();
            } else {
                this.form.controls.familias.disable();
            }

            this.familiasControl.setValue(null);
            this._detallesService.setDatos();
        });

        this.familiasControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let familias = this.familiasControl.value || [];

            this.familiasSeleccionadas.forEach(seleccionada => {
                if (familias.filter(familia => { return familia.id == seleccionada.id }).length == 0) {
                    this._detallesService.removerFamilia(seleccionada.id);
                }
            });

            familias.forEach(familia => {
                if (this.familiasSeleccionadas.filter(seleccionada => { return seleccionada.id == familia.id }).length == 0) {
                    this.listadoArticulos.forEach(articulo => {
                        if (articulo.familiaId == familia.id) {
                            articulo.articulo = articulo;
                            articulo.existencia = this.getExistencia(this.localidadControl.value.id, articulo.id);
                            articulo.conteo = 0;
                            this._detallesService.push(articulo);
                        }
                    });
                }
            });

            this.familiasSeleccionadas = familias;
        });

        let form = this._formBuilder.group({
            id: [this.inventario.id],
            codigo: [this.inventario.codigo],
            fecha: [this.inventario.fecha || new Date().toISOString().split("T")[0]],
            fechaAfectacion: [this.inventario.fechaAfectacion || new Date().toISOString().split("T")[0]],
            almacen: this.almacenControl,
            responsable: this.almacenControl.value ? this.almacenControl?.value?.responsable?.nombreCompleto : null,
            localidad: this.localidadControl,
            familias: this.familiasControl,
            estatus: [this.inventario.estatus ? this.inventario.estatus.valor : null],
            estatusId: [this.inventario.estatus ? this.inventario.estatus.id : null],
			fechaCreacionTemp: [this.fechaCreacion]
        });

        return form;
    }

    getExistencia(localidadId: number, articuloId: number) {
        let localidadArticulo = this.listadoLocalidadesArticulos.filter(registro => {
            return registro.localidadId == localidadId && registro.articuloId == articuloId
        })[0];

        return articuloId && localidadId ? (localidadArticulo ? localidadArticulo.cantidad : 0) : null;
    }

    isRequired(campo: string) {
        let form_field = this.form.get(campo);

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
        if (this._inventarioFisicoService.afectar) {
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                width: '400px',
                data: {
                    mensaje: this.translate.instant('CONFIRMACION_AFECTAR')
                }
            });

            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.guardarCambios(true);
                } else {
                    this._inventarioFisicoService.afectar = false;
                }
            });
        } else {
            this.guardarCambios(false);
        }
    }

    guardarCambios(afectar: boolean) {
        this._inventarioFisicoService.cargando = true;

        if (this.form.valid || this.pageType == 'ver') {
            this.form.disable({ emitEvent: false });

            let detalles: InventarioFisicoDetalleProjection[] = [];
            this._detallesService.getDatos().forEach(registro => {
                detalles.push(new InventarioFisicoDetalleProjection(registro));
            });

            if (detalles.length == 0) {
                this._inventarioFisicoService.cargando = false;
                if (!this.editar) {
                    this.form.enable({ emitEvent: false });
                }
                this._matSnackBar.open(this.translate.instant('SIN_ARTICULOS'), 'OK', { duration: 5000 });

                return;
            }

            let inventario = new InventarioFisicoProjection(this.form.value, detalles);
            inventario.afectar = afectar;
            inventario.fechaModificacion = this.inventario?.fechaModificacion || null;

            this._inventarioFisicoService.guardar(inventario, this.URL + '/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._inventarioFisicoService.cargando = false;
                        if (!this.editar) {
                            this.form.enable({ emitEvent: false });
                        }
                    }
                }.bind(this)
            );
        } else {
            this._inventarioFisicoService.cargando = false;

            if (!this.editar) {
                this.form.enable({ emitEvent: false });
            }

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    onEditar(articuloId: number) {
        if (this.editar) {
            let articuloEditar = this._detallesService.getDatos()[this.getRowIndex(articuloId)];
            this.modalShow(articuloEditar);
        }
    }

    onAceptarDialog(articulo: any) {
        let tablaArticulos: any[] = this._detallesService.getDatos();

        let articuloEditar: any = {};
        Object.assign(articuloEditar, articulo);

        let index = this.getRowIndex(this.editar ? articuloEditar.id : articuloEditar.articulo.id);

        if (index != null) {
            this.cambios = tablaArticulos[index].conteo != articuloEditar.conteo ? true : this.cambios;
            tablaArticulos[index].conteo = articuloEditar.conteo;
        } else {
            this.cambios = true;
            articuloEditar.id = articuloEditar.articulo.id;
            tablaArticulos.push(articuloEditar);
        }

        this._detallesService.setDatos(tablaArticulos);
    }

    modalShow(articulo: any): void {
        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            camposListado: this.camposListado,
            onAceptar: this.onAceptarDialog.bind(this),
            localidadId: this.localidadControl.value ? this.localidadControl.value.id : null,
            listadoLocalidadesArticulos: this.listadoLocalidadesArticulos,
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '300px',
            data: dialogData
        });
    }

    getRowIndex(articuloId: number) {
        let index: number = null;
        this._detallesService.getDatos().forEach((registro, i) => { index = registro.id == articuloId ? i : index; });
        return index;
    }
}