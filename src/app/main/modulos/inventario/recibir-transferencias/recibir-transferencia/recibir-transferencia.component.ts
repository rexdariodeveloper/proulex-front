import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Transferencia, TransferenciaProjection } from '@app/main/modelos/transferencia';
import { TransferenciaDetalleProjection } from '@app/main/modelos/transferencia-detalle';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
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
import { RecibirTransferenciaDetalleService } from './recibir-transferencia-detalle.service';
import { RecibirTransferenciaService } from './recibir-transferencia.service';

@Component({
    selector: 'recibir-transferencia',
    templateUrl: './recibir-transferencia.component.html',
    styleUrls: ['./recibir-transferencia.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class TransferenciaComponent {

    private URL: string = '/api/v1/transferencias';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

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
    mostrarRechazar: boolean;
    cambios: boolean = false;

    // Private
    private transferencia: Transferencia;
    private historial: any;
    private _unsubscribeAll: Subject<any>;

    // Tabla Artículos
    columnasTabla: any[] = [
        {
            name: 'articulo.codigoArticulo',
            values: ['articulo.codigoArticulo', 'articulo.nombreArticulo'],
            title: this.translate.instant('ARTICULO'),
            class: "mat-column-flex flex-40",
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
            name: 'cantidad',
            title: 'Enviada',
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'restante',
            title: 'Por recibir',
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        {
            name: 'cantidadTransferida',
            title: 'Recibir',
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },
        /*{
            name: 'cantidadDevuelta',
            title: this.translate.instant('DEVUELTO'),
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        },*/
        {
            name: 'spill',
            title: 'Ajuste',
            class: "mat-column-flex",
            centrado: false,
            type: 'decimal2',
            tooltip: false
        }
    ];
    columnasFechas: string[] = [];
    displayedColumns: string[] = ['articulo.codigoArticulo', 'articulo.unidadMedidaInventario.nombre', 'cantidad', 'restante', 'cantidadTransferida', /*'cantidadDevuelta',*/ 'spill'];
    camposListado: FieldConfig[] = [];
    localidades: any[] = [];

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
        public _transferenciaService: RecibirTransferenciaService,
        public _detallesService: RecibirTransferenciaDetalleService,
        public validatorService: ValidatorService,
        public fechaPipe: FechaPipe,
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);

            this.config = {
                rutaAtras: "/app/inventario/recibir-transferencias",
                rutaRechazar: this.URL + "/rechazar",
                icono: "compare_arrows"
            }
        });

        // Subscribe to update on changes
        this._transferenciaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    this.transferencia = datos.transferencia || new Transferencia();
                    let transferenciaDetalles = datos.transferenciaDetalles || [];
                    this.mostrarRechazar = datos.mostrarRechazar;
                    this.historial = datos.historial;
                    this.localidades = datos.localidades;

                    transferenciaDetalles.forEach(registro => {
                        registro.nombreArticulo = registro.articulo.codigoArticulo + ' - ' + registro.articulo.nombreArticulo;
                        registro.restante = registro.cantidad - registro.cantidadTransferida - registro.cantidadDevuelta - registro.spill;
                        registro.cantidadTransferida = 0;
                        registro.cantidadDevuelta = 0;
                        registro.spill = 0;
                    });

                    this.form = this.createForm();
                    this.form.disable({ emitEvent: false });

                    this.titulo = this.transferencia.codigo;

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
                            label: 'Por recibir',
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'restante',
                            validations: [],
                            readonly: true,
                        },
                        {
                            type: 'input',
                            label: 'Recibir',
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'cantidadTransferida',
                            validations: [
                                {
                                    name: 'required',
                                    validator: Validators.required,
                                    message: this.translate.instant('REQUERIDO')
                                }
                            ],
                        },
                        /*{
                            type: 'input',
                            label: this.translate.instant('DEVUELTO'),
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'cantidadDevuelta',
                            validations: [
                                {
                                    name: 'required',
                                    validator: Validators.required,
                                    message: this.translate.instant('REQUERIDO')
                                }
                            ],
                        },*/
                        {
                            type: 'input',
                            label: 'Ajuste',
                            inputType: 'text',
                            mask: "separator.4",
                            name: 'spill',
                            validations: [
                                {
                                    name: 'required',
                                    validator: Validators.required,
                                    message: this.translate.instant('REQUERIDO')
                                }
                            ],
                        }
                    ];

                    this._detallesService.setDatos(transferenciaDetalles);
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        let form = this._formBuilder.group({
            id: [this.transferencia.id],
            codigo: [this.transferencia.codigo],
            enviadoPor: [this.transferencia.creadoPor.nombreCompleto],
            fecha: [new Date(this.transferencia.fecha).toISOString().split("T")[0]],
            fechaRecibo: [new Date().toISOString().split("T")[0]],
            localidadOrigen: [this.transferencia.localidadOrigen],
            localidadDestino: [this.transferencia.localidadDestino],
            comentario: [this.transferencia.comentario],
            estatus: [this.transferencia.estatus.valor],
            fechaModificacion: [this.transferencia.fechaModificacion]
        });

        return form;
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
        if(this._transferenciaService.cargando)
            return;
        
        this._transferenciaService.cargando = true;

        if (!this.form.invalid) {
            this.form.disable({ emitEvent: false });

            let transferenciaDetalles: TransferenciaDetalleProjection[] = [];
            this._detallesService.getDatos().forEach(registro => {
                transferenciaDetalles.push(new TransferenciaDetalleProjection(registro));
            });

            let transferencia = new TransferenciaProjection(this.form.value, transferenciaDetalles);

            this._transferenciaService.guardar(transferencia, this.URL + '/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._transferenciaService.cargando = false;
                    }
                }.bind(this)
            );
        } else {
            this._transferenciaService.cargando = false;
            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    onEditar(articuloId: number) {
        let articuloEditar = this._detallesService.getDatos()[this.getRowIndex(articuloId)];
        this.modalShow(articuloEditar);
    }

    onAceptarDialog(articulo: any) {
        let tablaArticulos: any[] = this._detallesService.getDatos();

        let articuloEditar: any = {};
        Object.assign(articuloEditar, articulo);

        let index = this.getRowIndex(articuloEditar.id);

        tablaArticulos[index].cantidadTransferida = articuloEditar.cantidadTransferida;
        tablaArticulos[index].cantidadDevuelta = articuloEditar.cantidadDevuelta;
        tablaArticulos[index].spill = articuloEditar.spill;

        this.cambios = articuloEditar.cantidadTransferida > 0 || articuloEditar.cantidadDevuelta > 0 || articuloEditar.spill > 0 ? true : this.cambios;

        this._detallesService.setDatos(tablaArticulos);
    }

    modalShow(articulo: any): void {
        let dialogData: ArticuloDialogData = {
            esNuevo: !articulo,
            articulo,
            camposListado: this.camposListado,
            onAceptar: this.onAceptarDialog.bind(this)
        };

        const dialogRef = this.dialog.open(ArticuloDialogComponent, {
            width: '50%',
            data: dialogData
        });
    }

    getRowIndex(id: number) {
        let index: number = null;
        this._detallesService.getDatos().forEach((registro, i) => { index = registro.id == id ? i : index; });
        return index;
    }
}