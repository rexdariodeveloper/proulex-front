import { Location } from '@angular/common';
import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { InventarioMovimiento } from '@app/main/modelos/inventario-movimiento';
import { ControlesMaestrosMultiples } from '@app/main/modelos/mapeos/controles-maestros-multiples';
import { environment } from '@environments/environment';
import { fuseAnimations } from '@fuse/animations';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
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
import { AjusteInventarioService } from './ajuste-inventario.service';

@Component({
    selector: 'ajuste-inventario',
    templateUrl: './ajuste-inventario.component.html',
    styleUrls: ['./ajuste-inventario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class AjusteInventarioComponent {

    private URL: string = '/api/v1/inventario-movimiento/ajuste-inventario';

    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;
    @ViewChild('localidadSelect') localidadSelect: PixvsMatSelectComponent;

    // Page configurations
    apiUrl: string = environment.apiUrl;
    pageType: string = 'nuevo';
    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    // Controls
    form: FormGroup;
    currentId: number;
    fechaAjuste: any;

    // Private
    private movimiento: InventarioMovimiento;
    private _unsubscribeAll: Subject<any>;

    // Listados
    listadoArticulos: any[] = [];
    listadoAlmacenes: any[] = [];
    localidades: any[] = [];
    listadoLocalidades: any[] = [];
    listadoLocalidadesArticulos: any[] = [];
    listadoMotivos: any[] = [];
    listadoOperaciones: any[] = [];

    // Cbo Controls    
    articuloControl: FormControl = new FormControl();
    cantidadControl: FormControl = new FormControl();
    almacenControl: FormControl = new FormControl();
    localidadControl: FormControl = new FormControl();
    motivoControl: FormControl = new FormControl();
    operacionControl: FormControl = new FormControl();

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
        public _ajusteInventarioService: AjusteInventarioService,
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
                rutaAtras: "/app/inventario/ajuste-inventario",
                rutaBorrar: this.URL + "/ajuste-inventario/delete/",
                icono: "list_alt"
            }
        });

        // Subscribe to update on changes
        this._ajusteInventarioService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(
                datos => {
                    this.movimiento = datos.movimiento || new InventarioMovimiento();
                    this.fechaAjuste = this.fechaPipe.transform(datos.movimiento ? this.movimiento.fechaCreacion : new Date());

                    if (this.pageType == 'ver') {
                        this.listadoLocalidades = !this.movimiento.localidad.localidadGeneral ? [this.movimiento.localidad] : [];
                        this.listadoAlmacenes = [this.movimiento.localidad.almacen];
                        this.listadoArticulos = [this.movimiento.articulo];

                        this.form = this.createForm();
                        this.form.disable({ emitEvent: false });

                        this.titulo = this.movimiento.referencia;
                    } else {
                        this.listadoAlmacenes = datos.almacenes;
                        this.localidades = datos.localidades;
                        this.listadoLocalidades = [];
                        this.listadoArticulos = datos.articulos;
                        this.listadoLocalidadesArticulos = datos.localidaesArticulos;
                        this.listadoMotivos = datos.motivos;
                        this.listadoOperaciones = [{ id: 0, valor: 'Entrada' }, { id: 1, valor: 'Salida' }, { id: 2, valor: 'Remplazar' }];

                        this.form = this.createForm();
                        this.form.enable({ emitEvent: false });
                        this.calcularExistencia();

                        this.titulo = this.translate.instant('TITULO');
                    }

                    this.form.controls.um.disable();
                    this.form.controls.costo.disable();
                    this.form.controls.existencia.disable();
                    this.form.controls.existenciaFinal.disable();
                }
            );
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    createForm(): FormGroup {
        this.articuloControl = new FormControl(this.movimiento.articulo, [Validators.required]);
        this.cantidadControl = new FormControl(this.movimiento.cantidad, [Validators.required, Validators.min(0.0001)]);
        this.almacenControl = new FormControl(this.movimiento.localidad ? this.movimiento.localidad.almacen : null, [Validators.required]);
        this.localidadControl = new FormControl(this.movimiento.localidad, [Validators.required]);
        this.motivoControl = new FormControl(this.movimiento.referenciaMovtoId, [Validators.required]);
        this.operacionControl = new FormControl(null, [Validators.required]);

        this.articuloControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let articuloId: number = this.articuloControl.value ? this.articuloControl.value.id : null;

            this.form.controls.costo.setValue('$ ' + (this.movimiento.costoUnitario || (articuloId ? this.articuloControl.value.costoUltimo : '')) || '');
            this.form.controls.um.setValue(articuloId ? this.articuloControl.value.unidadMedidaInventario.nombre : null);

            this.calcularExistencia();
        });

        this.cantidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.calcularExistencia(false);
        });

        this.almacenControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            let almacenId = this.almacenControl.value ? this.almacenControl.value.id : null;
            let localidadGeneral = this.localidades.filter(registro => { return registro.almacen.id == almacenId && registro.localidadGeneral })[0];

            //this.listadoLocalidades = this.localidades.filter(registro => { return registro.almacen.id == almacenId && !registro.localidadGeneral });
            this.listadoLocalidades = this.localidades.filter(registro => { return registro.almacen.id == almacenId });

            if (this.localidadSelect) {
                this.localidadSelect.setDatos(this.listadoLocalidades);
            }

            this.localidadControl.setValue(localidadGeneral && this.listadoLocalidades.length == 0 ? localidadGeneral : null);

            this.calcularExistencia();
        });

        this.localidadControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
            this.calcularExistencia();
        });

        this.operacionControl.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(() => {
			this.calcularExistencia();
        });

        let articuloId: number = this.articuloControl.value ? this.articuloControl.value.id : null;

        let form = this._formBuilder.group({
            id: [this.movimiento.inventarioMovimientoId],
            articulo: this.articuloControl,
            almacen: this.almacenControl,
            localidad: this.localidadControl,
            cantidad: this.cantidadControl,
            costoUnitario: [this.movimiento.costoUnitario],
            precioUnitario: [this.movimiento.precioUnitario],
            razon: [this.movimiento.razon],
            referencia: [this.movimiento.referencia],
            referenciaMovtoId: [this.movimiento.referenciaMovtoId],
            unidadMedidaId: [this.movimiento.unidadMedidaId],
            tipoCostoId: [this.movimiento.tipoCostoId],
            tipoMovimientoId: [2000011],
            tipoMovimiento: this.motivoControl,
            motivoAjuste: [this.movimiento.razon],
            operacion: this.operacionControl,
            comentario: [null],
            um: [articuloId ? this.articuloControl.value.unidadMedidaInventario.nombre : null],
            costo: ['$ ' + (this.movimiento.costoUnitario || (articuloId ? this.articuloControl.value.costoUltimo : '')) || ''],
            existencia: [null],
            existenciaFinal: [null]
        });

        return form;
    }

    calcularExistencia(actualizarCantidadValidators: boolean = true) {
        let localidadId: number = this.localidadControl.value ? this.localidadControl.value.id : null;
        let articuloId: number = this.articuloControl.value ? this.articuloControl.value.id : null;
        let operacion: number = this.operacionControl.value ? this.operacionControl.value.id : null;

        let localidadArticulo = this.listadoLocalidadesArticulos.filter(registro => { return registro.localidadId == localidadId && registro.articuloId == articuloId })[0];

        if (articuloId && localidadId) {
            let existencia: number = localidadArticulo ? localidadArticulo.cantidad : 0;
            let cantidad: number = parseInt(this.form.controls.cantidad.value || '0');
            let existenciaFinal: number;

            switch (operacion) {
                case 0:
                    existenciaFinal = existencia + cantidad;
                    break;

                case 1:
                    existenciaFinal = existencia - cantidad;
                    break;

                case 2:
                    existenciaFinal = cantidad;
                    break;

                default:
                    existenciaFinal = null;
            }

            this.form.controls.existencia.setValue(existencia);
            this.form.controls.existenciaFinal.setValue(existenciaFinal);
        } else {
            this.form.controls.existencia.setValue(null);
            this.form.controls.existenciaFinal.setValue(null);
		}
		
		if(actualizarCantidadValidators){
			if(this.operacionControl.value?.id == 1){
				this.cantidadControl.setValidators([Validators.required, Validators.min(0.0001), Validators.max(Number(this.form.controls.existencia.value || 0))]);
			}else{
				this.cantidadControl.setValidators([Validators.required, Validators.min(0.0001)]);
			}
			this.cantidadControl.updateValueAndValidity();
		}
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
        this._ajusteInventarioService.cargando = true;

        if (this.form.valid) {
            this.form.disable({ emitEvent: false });

            let operacion: number = this.operacionControl.value.id;

            if (parseInt(this.form.controls.cantidad.value) < 1 && operacion != 2) {
                this._ajusteInventarioService.cargando = false;
                this.form.enable({ emitEvent: false });

                this._matSnackBar.open(this.translate.instant('CANTIDAD_CERO'), 'OK', { duration: 5000 });

                return;
            }

            let movimiento: any = this.form.value;
            movimiento.razon = movimiento.tipoMovimiento.valor + (movimiento.comentario != null ? ' - ' + movimiento.comentario : '');

            if (operacion == 1) {
                movimiento.cantidad = - movimiento.cantidad;
            } else if (operacion == 2) {
                movimiento.cantidad = this.form.controls.existenciaFinal.value - this.form.controls.existencia.value;
            }

            this._ajusteInventarioService.guardar(JSON.stringify(movimiento), this.URL + '/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                        this.router.navigate([this.config.rutaAtras])
                    } else {
                        this._ajusteInventarioService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );
        } else {
            this._ajusteInventarioService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', { duration: 5000 });
        }
    }
}