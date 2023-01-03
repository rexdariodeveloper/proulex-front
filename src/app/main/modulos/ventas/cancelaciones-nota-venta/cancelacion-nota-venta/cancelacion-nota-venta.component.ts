import { Component, ElementRef, QueryList, ViewChild, ViewChildren, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { takeUntil } from 'rxjs/operators';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as en } from './i18n/en';
import { locale as es } from './i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { ListadoMenuOpciones } from '@models/ficha-listado-config';
import { OrdenVentaCancelacion, OrdenVentaCancelacionEditarProjection } from '@app/main/modelos/orden-venta-cancelacion';
import { CancelacionNotaVentaService } from './cancelacion-nota-venta.service';
import { SucursalComboProjection } from '@app/main/modelos/sucursal';
import { ControlMaestroMultipleComboSimpleProjection } from '@models/control-maestro-multiple';
import { OrdenVentaDetalleHistorialPVResumenProjection } from '@app/main/modelos/orden-venta-detalle';
import { MatTableDataSource } from '@angular/material/table';
import { MatCheckbox } from '@angular/material/checkbox';
import { OrdenVentaHistorialPVResumenProjection } from '@app/main/modelos/orden-venta';
import { OrdenVentaCancelacionDetalleEditarProjection } from '@app/main/modelos/orden-venta-cancelacion-detalle';
import { CancelacionNotaVentaDocumentosDialogComponent, CancelacionNotaVentaDocumentosDialogData } from './dialogs/documentos/documentos.dialog';
import { OrdenVentaCancelacionArchivo } from '@app/main/modelos/orden-venta-cancelacion-archivo';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';

@Component({
    selector: 'cancelacion-nota-venta',
    templateUrl: './cancelacion-nota-venta.component.html',
    styleUrls: ['./cancelacion-nota-venta.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class CancelacionNotaVentaComponent {
    CMM_OVC_TipoMovimiento = ControlesMaestrosMultiples.CMM_OVC_TipoMovimiento;

    // Propiedades de configuración de la ficha
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    currentId: number;
    acciones: ListadoMenuOpciones[] = [];

    // Propiedades de edición de la ficha
    ordenVentaCancelacion: OrdenVentaCancelacionEditarProjection;

    // Propiedades de formulario principal
    form: FormGroup;
    tipoMovimientoControl: FormControl;
    sucursalControl: FormControl;
    notaVentaControl: FormControl;
    motivoDevolucionControl: FormControl;
    motivoCancelacionControl: FormControl;

    // Listados
    tiposMovimiento: ControlMaestroMultipleComboSimpleProjection[] = [];
    sucursales: SucursalComboProjection[] = [];
    motivosDevolucion: ControlMaestroMultipleComboSimpleProjection[] = [];
    motivosCancelacion: ControlMaestroMultipleComboSimpleProjection[] = [];
    tiposDocumentos: ControlMaestroMultipleComboSimpleProjection[] = [];

    // Tabla detalles de OV
    dataSourceDetalles: MatTableDataSource<OrdenVentaDetalleHistorialPVResumenProjection> = new MatTableDataSource([]);
    displayedColumnsDetalles: string[] = [
        'check',
        'nombre',
        'cantidad',
        'precio',
        'descuento',
        'total',
        'regresaLibro'
    ];
    detallesMap: { [detalleId: number]: OrdenVentaDetalleHistorialPVResumenProjection } = {};
    detallesSeleccionadosMap: { [detalleId: number]: boolean } = {};
    detallesLibrosSeleccionadosMap: { [detalleId: number]: boolean } = {};
    @ViewChildren('chkDetalle')
    detallesChk: QueryList<MatCheckbox>;
    @ViewChild('chkDetalles')
    chkDetalles: MatCheckbox;

    // Tabla documentos
    dataSourceDocumentos: MatTableDataSource<OrdenVentaCancelacionArchivo> = new MatTableDataSource([]);
    displayedColumnsDocumentos: string[] = [
        'archivo',
        'tipoDocumento',
        'codigo',
        'borrar'
    ];

    // Misc
    ordenVentaHistorial: OrdenVentaHistorialPVResumenProjection = null;
    archivosMapTipo: { [tipoId: string]: OrdenVentaCancelacionArchivo } = {};
    detallesCanceladosMap: { [id: string]: boolean } = {};
    codigoCorteCaja: string = '';
    detallesRegresoLibroMap: { [id: string]: boolean } = {};

    // Private
    private _unsubscribeAll: Subject<any>;

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
        public _cancelacionNotaVentaService: CancelacionNotaVentaService,
        private el: ElementRef,
        public validatorService: ValidatorService
    ) {
        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(en, es);

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get('handle');
            let id: string = params.get('id');

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.ordenVentaCancelacion = new OrdenVentaCancelacionEditarProjection();
            }

            this.acciones = [
                // { title: '<título en menú>', tipo: null, icon: '<ícono_en_menú>' } // Ejemplo
            ];

            this.config = {
                rutaAtras: '/app/ventas/cancelacion-nota-venta',
                rutaBorrar: `${this.apiUrl}/delete/`,
                icono: 'assignment'
            };
        });

        // Subscribe to update datos on changes
        this._cancelacionNotaVentaService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (datos && datos.ordenVentaCancelacion) {
                    this.ordenVentaCancelacion = datos.ordenVentaCancelacion;
                    this.titulo = this.ordenVentaCancelacion.codigo;
                    this.ordenVentaHistorial = datos.ordenVenta;
                    this.dataSourceDetalles.data = datos.ovDetalles;
                    this.dataSourceDocumentos.data = this.ordenVentaCancelacion.archivos;

                    this.ordenVentaCancelacion.detalles.forEach(detalle => {
                        this.detallesCanceladosMap[detalle.ordenVentaDetalleId] = true;

                        if (detalle.regresoLibro) {
                            this.detallesRegresoLibroMap[detalle.ordenVentaDetalleId] = true;
                        }
                    });
                } else {
                    this.ordenVentaCancelacion = new OrdenVentaCancelacionEditarProjection();
                }

                this.tiposMovimiento = datos.tiposMovimiento;
                this.sucursales = datos.sucursales;
                this.motivosDevolucion = datos.motivosDevolucion;
                this.motivosCancelacion = datos.motivosCancelacion;
                this.tiposDocumentos = datos.tiposDocumentos;

                this.form = this.createCancelacionNotaVentaForm();
                this.updateDatosBancariosRequired(this.tipoMovimientoControl.value);

                if (this.pageType == 'ver') {
                    this.form.disable();
                } else {
                    this.form.enable();
                }
            });

        // Subscribe to update notaVenta on changes
        this._cancelacionNotaVentaService.onNotaVentaChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (!!datos) {
                    this._cancelacionNotaVentaService.onNotaVentaChanged.next(null);
                    this.limpiarVista();
                    this.detallesCanceladosMap = {};

                    datos.detallesCanceladosIds.forEach(id => {
                        this.detallesCanceladosMap[String(id)] = true;
                    });

                    this.ordenVentaHistorial = datos.ordenVenta;
                    this.dataSourceDetalles.data = datos.detalles;

                    this.dataSourceDetalles.data.forEach(detalle => {
                        this.detallesMap[detalle.id] = detalle;

                        if (!this.detallesCanceladosMap[String(detalle.id)]) {
                            this.detallesSeleccionadosMap[detalle.id] = this.tipoMovimientoControl.value?.id == this.CMM_OVC_TipoMovimiento.CANCELACION || detalle.esInscripcion || detalle.esExamenUbicacion;
                            this.detallesLibrosSeleccionadosMap[detalle.id] = detalle.esInscripcion;
                        }
                    });

                    this.codigoCorteCaja = datos.codigoCorteCaja;
                }
            });

        // Subscribe to update formato impreso on changes
        this._cancelacionNotaVentaService.onFormatoImpresoChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                if (!!datos) {
                    this._cancelacionNotaVentaService.onFormatoImpresoChanged.next(null);
                    this.router.navigate([this.config.rutaAtras]);
                }
            });
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createCancelacionNotaVentaForm(): FormGroup {
        var tipoMovtoPredeterminado = this.tiposMovimiento.filter(model => { return model.id === this.CMM_OVC_TipoMovimiento.DEVOLUCION; })[0];

        this.tipoMovimientoControl = new FormControl(!this.ordenVentaCancelacion?.id ? tipoMovtoPredeterminado : null, [Validators.required]);
        this.sucursalControl = new FormControl(null, [Validators.required]);
        this.notaVentaControl = new FormControl(!!this.ordenVentaCancelacion?.id ? this.ordenVentaHistorial.codigo : '', []);
        this.motivoDevolucionControl = new FormControl(null, []);
        this.motivoCancelacionControl = new FormControl(null, []);

        this.tipoMovimientoControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe((tipoMovimiento: ControlMaestroMultipleComboSimpleProjection) => {
            this.updateDatosBancariosRequired(tipoMovimiento);

            if (tipoMovimiento?.id == this.CMM_OVC_TipoMovimiento.CANCELACION) {
                this.dataSourceDetalles.data.forEach(detalle => {
                    this.detallesLibrosSeleccionadosMap[detalle.id] = true;

                    if (!this.ordenVentaCancelacion?.id && !this.detallesCanceladosMap[detalle.id]) {
                        this.detallesSeleccionadosMap[detalle.id] = true;
                    }
                });
            } else {
                this.dataSourceDetalles.data.forEach(detalle => {
                    if (!this.ordenVentaCancelacion?.id && !this.detallesCanceladosMap[detalle.id] && !detalle.esInscripcion && !detalle.esExamenUbicacion) {
                        this.detallesSeleccionadosMap[detalle.id] = false;
                    }
                });
            }
        });

        let form = this._formBuilder.group({
            id: [this.ordenVentaCancelacion.id],
            tipoMovimiento: this.tipoMovimientoControl,
            motivoDevolucion: this.motivoDevolucionControl,
            motivoCancelacion: this.motivoCancelacionControl,
            banco: new FormControl(this.ordenVentaCancelacion.banco),
            beneficiario: new FormControl(this.ordenVentaCancelacion.beneficiario),
            numeroCuenta: new FormControl(this.ordenVentaCancelacion.numeroCuenta),
            clabe: new FormControl(this.ordenVentaCancelacion.clabe),
            telefonoContacto: new FormControl(this.ordenVentaCancelacion.telefonoContacto),
            importeReembolsar: new FormControl(this.ordenVentaCancelacion.importeReembolsar, [Validators.required])
        });

        return form;
    }

    updateDatosBancariosRequired(tipoMovimiento) {
        this.form.controls['motivoDevolucion'].clearValidators();
        this.form.controls['motivoCancelacion'].clearValidators();
        this.form.controls['banco'].clearValidators();
        this.form.controls['beneficiario'].clearValidators();
        this.form.controls['numeroCuenta'].clearValidators();
        this.form.controls['clabe'].clearValidators();
        this.form.controls['telefonoContacto'].clearValidators();
        this.form.controls['importeReembolsar'].clearValidators();

        if (!!tipoMovimiento) {
            switch (tipoMovimiento.id) {
                case this.CMM_OVC_TipoMovimiento.DEVOLUCION:
                    this.form.controls['motivoDevolucion'].setValidators([Validators.required]);
                    this.form.controls['banco'].setValidators([Validators.maxLength(255), Validators.required]);
                    this.form.controls['beneficiario'].setValidators([Validators.maxLength(255), Validators.required]);
                    this.form.controls['numeroCuenta'].setValidators([Validators.maxLength(255), Validators.required]);
                    this.form.controls['clabe'].setValidators([Validators.maxLength(255), Validators.required]);
                    this.form.controls['telefonoContacto'].setValidators([Validators.maxLength(10), Validators.required]);
                    this.form.controls['importeReembolsar'].setValidators([Validators.min(0), Validators.required]);
                break;

                case this.CMM_OVC_TipoMovimiento.CANCELACION:
                    this.form.controls['motivoCancelacion'].setValidators([Validators.required]);
                    
                    this.form.controls['banco'].setValue(null);
                    this.form.controls['beneficiario'].setValue(null);
                    this.form.controls['numeroCuenta'].setValue(null);
                    this.form.controls['clabe'].setValue(null);
                    this.form.controls['telefonoContacto'].setValue(null);
                    this.form.controls['importeReembolsar'].setValue(0);
                break;
            }
        }
        
        this.form.controls['motivoDevolucion'].updateValueAndValidity();
        this.form.controls['motivoCancelacion'].updateValueAndValidity();
        this.form.controls['banco'].updateValueAndValidity();
        this.form.controls['beneficiario'].updateValueAndValidity();
        this.form.controls['numeroCuenta'].updateValueAndValidity();
        this.form.controls['clabe'].updateValueAndValidity();
        this.form.controls['telefonoContacto'].updateValueAndValidity();
        this.form.controls['importeReembolsar'].updateValueAndValidity();
    }

    isRequired(cambo: string) {
        let form_field = this.form.get(cambo);

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
        if (!!this._cancelacionNotaVentaService.cargando) {
            return;
        }
        
        if (this.form.valid) {
            this._cancelacionNotaVentaService.cargando = true;
            this.form.disable({ emitEvent: false });

            let detallesSeleccionados: boolean = false;
            let detallesCancelar: OrdenVentaCancelacionDetalleEditarProjection[] = [];
            let importeReembolsar: number = 0;

            for (let detalle of this.dataSourceDetalles.data) {
                if (this.detallesSeleccionadosMap[detalle.id]) {
                    detallesSeleccionados = true;
                    detallesCancelar.push({
                        ordenVentaDetalleId: detalle.id,
                        regresoLibro: !!detalle.esInscripcion ? (this.detallesLibrosSeleccionadosMap[String(detalle.id)]) : null
                    });

                    importeReembolsar += detalle.montoTotal;
                }
            }

            if (!detallesSeleccionados) {
                this._matSnackBar.open('No se han seleccionado notas de venta por cancelar.', 'OK', {
                    duration: 5000,
                });

                this._cancelacionNotaVentaService.cargando = false;
                this.form.enable({ emitEvent: false });

                return;
            }

            if (this.ordenVentaHistorial?.montoTotal < this.form.get('importeReembolsar').value) {
                this._matSnackBar.open('El monto a reembolsar no puede ser mayor al total pagado.', 'OK', {
                    duration: 5000,
                });

                this._cancelacionNotaVentaService.cargando = false;
                this.form.enable({ emitEvent: false });

                return;
            }

            let formRaw: OrdenVentaCancelacion = this.form.getRawValue();
            formRaw.detalles = detallesCancelar;
            formRaw.archivos = this.tipoMovimientoControl.value?.id == this.CMM_OVC_TipoMovimiento.DEVOLUCION ? this.dataSourceDocumentos.data : null;

            if (this.tipoMovimientoControl.value?.id == this.CMM_OVC_TipoMovimiento.CANCELACION) {
                formRaw.importeReembolsar = importeReembolsar;
            }

            this._cancelacionNotaVentaService.guardar(JSON.stringify(formRaw), `${this._cancelacionNotaVentaService.urlApi}/save`).then(
                ((result: JsonResponse) => {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
                        });

                        if (this.tipoMovimientoControl.value?.id == this.CMM_OVC_TipoMovimiento.DEVOLUCION) {
                            this._cancelacionNotaVentaService.imprimirFormato(result.data);
                        } else {
                            this.router.navigate([this.config.rutaAtras]);
                        }
                    } else {
                        this._cancelacionNotaVentaService.cargando = false;
                        this.form.enable();
                    }
                }).bind(this)
            );
        } else {
            this._cancelacionNotaVentaService.cargando = false;
            this.form.enable();

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }

    onBuscarNotaVenta() {
        if (!this.sucursalControl?.value?.id) {
            this._matSnackBar.open('Favor de seleccionar una sede.', 'OK', {
                duration: 5000,
            });

            return;
        }

        this._cancelacionNotaVentaService.getNotaVenta(this.sucursalControl.value.id, this.notaVentaControl.value || '');
    }

    limpiarVista() {
        this.dataSourceDetalles.data = [];
        this.detallesMap = {};
        this.detallesSeleccionadosMap = {};
        this.detallesLibrosSeleccionadosMap = {};
        this.ordenVentaHistorial = null;
        this.detallesCanceladosMap = {};
    }

    onSeleccionarTodosDetalles(chkDetalles: MatCheckbox) {
        if (chkDetalles.checked) {
            for (let chk of this.detallesChk) {
                if (!chk.checked) {
                    chk.toggle();
                    let requisicionId = chk.id.substr(1);
                    this.onSeleccionarDetalle(this.detallesMap[requisicionId], chk)
                }
            }
        } else {
            for (let chk of this.detallesChk) {
                if (chk.checked) {
                    chk.checked = false;
                    let requisicionId = chk.id.substr(1);
                    this.onSeleccionarDetalle(this.detallesMap[requisicionId], chk)
                }
            }
        }
    }

    onSeleccionarDetalle(detalle: OrdenVentaDetalleHistorialPVResumenProjection, chk: MatCheckbox) {
        this.detallesSeleccionadosMap[detalle.id] = chk.checked;

        if (chk.checked) {
            if (this.estanTodosDetallesSeleccionados()) {
                this.chkDetalles.indeterminate = false;
                this.chkDetalles.checked = true;
            } else if (this.hayDetallesSeleccionados()) {
                this.chkDetalles.checked = false;
                this.chkDetalles.indeterminate = true;
            }
        } else {
            this.chkDetalles.checked = false;
            if (this.hayDetallesSeleccionados()) {
                this.chkDetalles.indeterminate = true;
            } else {
                this.chkDetalles.indeterminate = false;
            }
        }
    }

    estanTodosDetallesSeleccionados(): boolean {
        for (let detalle of this.dataSourceDetalles.data) {
            if ((detalle.esInscripcion || detalle.esInscripcion) && !this.detallesSeleccionadosMap[detalle.id] && !this.detallesCanceladosMap[detalle.id]) {
                return false;
            }
        }

        return true;
    }

    hayDetallesSeleccionados(): boolean {
        for (let detalle of this.dataSourceDetalles.data) {
            if (this.detallesSeleccionadosMap[detalle.id]) {
                return true;
            }
        }

        return false;
    }

    onClickMatCheckbox(chk: MatCheckbox) {
        chk._elementRef?.nativeElement?.getElementsByClassName('mat-checkbox-inner-container')[0]?.click();
    }

    onSeleccionarLibro(detalle: OrdenVentaDetalleHistorialPVResumenProjection, chk: MatCheckbox) {
        this.detallesLibrosSeleccionadosMap[detalle.id] = chk.checked;
    }

    onNuevoDocumento() {
        if (!this.ordenVentaHistorial) {
            this._matSnackBar.open('Favor de seleccionar una nota de venta.', 'OK', {
                duration: 5000,
            });

            return;
        }

        let dialogData: CancelacionNotaVentaDocumentosDialogData = {
            tiposDocumentos: this.tiposDocumentos,
            codigoOV: this.ordenVentaHistorial.codigo,
            codigoCorte: this.codigoCorteCaja,
            onAceptar: this.onAceptarDocumentoDialog.bind(this)
        };

        const dialogRef = this.dialog.open(CancelacionNotaVentaDocumentosDialogComponent, {
            width: '500px',
            data: dialogData
        });
    }

    onAceptarDocumentoDialog(tipoDocumento: ControlMaestroMultipleComboSimpleProjection, valor: string, documento: any) {
        if (!!this.archivosMapTipo[String(tipoDocumento.id)]) {
            this.dataSourceDocumentos.data = this.dataSourceDocumentos.data.filter(archivo => {
                return archivo.tipoDocumentoId != tipoDocumento.id;
            });
        }

        let archivo: OrdenVentaCancelacionArchivo = {
            tipoDocumento: tipoDocumento,
            tipoDocumentoId: tipoDocumento.id,
            valor,
            archivo: documento,
            archivoId: documento.id
        };

        this.archivosMapTipo[String(tipoDocumento.id)] = archivo;
        this.dataSourceDocumentos.data = this.dataSourceDocumentos.data.concat(archivo);
    }
}