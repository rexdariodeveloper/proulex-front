import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Input, Output, EventEmitter, ChangeDetectionStrategy, SimpleChanges } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Subject } from 'rxjs';
import { FichaCRUDConfig } from '@models/ficha-crud-config';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { MatDialog } from '@angular/material/dialog';
import { FuseConfirmDialogComponent } from '@fuse/components/confirm-dialog/confirm-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { FichaDataService } from '@services/ficha-data.service';
import { Router } from '@angular/router';
import { JsonResponse } from '@models/json-response';
import { HashidsService } from '@services/hashids.service';
import { RolMenu } from '@models/rol';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { FichaCrudHistorialComponent } from './ficha-crud-historial.component';
import { FichaListadoConfig, ListadoMenuOpciones } from '@models/ficha-listado-config';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { PixvsConfirmComentarioDialogComponent } from '@pixvs/componentes/confirm-comentario-dialog/confirm-comentario-dialog.component';

@Component({
    selector: 'ficha-crud',
    templateUrl: './ficha-crud.component.html',
    styleUrls: ['./ficha-crud.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FichaCrudComponent {

    @Input() config: FichaCRUDConfig;
    @Input() currentId: number;
    @Input() currentFechaModificacion: number;
    @Input() titulo: String;
    @Input() subTitulo: String;
    @Input() subTituloTraduccion: String;
    @Input() subTextoExtra: string;
    @Input() pageType: string = 'new';
    @Input() etiquetaBotonGuardar: String;
    @Input() etiquetaBotonEliminar: String;
    @Input() form: FormGroup | FormGroup[];
    @Output() output: EventEmitter<any> = new EventEmitter();
    @Output() outputEnviar: EventEmitter<any> = new EventEmitter();
    @Output() outputAprobar: EventEmitter<any> = new EventEmitter();
    @Output() outputDesHabilitarCampos: EventEmitter<any> = new EventEmitter();
    @Output() outputCancelar: EventEmitter<any> = new EventEmitter();
    @Input() isGuardadoPersonalizado: boolean = false;
    @Input() isEnviarPersonalizado: boolean = false;
	@Input() isAprobarPersonalizado: boolean = false;
    @Input() isDesHabilitarPersonalizado: boolean = false;
    @Input() isCancelarPersonalizado: boolean = false;
    @Input() dataService: FichaDataService;
    @Input() mostrarCancelar: boolean = false;
    @Input() mostrarBorrar: boolean = false;
    @Input() mostrarEditar: boolean = false;
    @Input() mostrarGuardar: boolean = false;
    @Input() ocultarGuardar: boolean = false;
    @Input() mostrarRechazar: boolean = false;
    @Input() mostrarAprobar: boolean = false;
    @Input() mostrarAfectar: boolean = false;
    @Input() mostrarEnviar: boolean = false;
    @Input() cargando: boolean = false;
    @Input() historial: any;
	@Input() listadoAcciones: ListadoMenuOpciones[];
    @Output() onActionClicked: EventEmitter<any> = new EventEmitter();
	@Input() mostrarVolver: boolean = false;
    @Output() onVolver: EventEmitter<boolean> = new EventEmitter();
    @Input() mostrarImprimir: boolean = false;
    @Output() outputImprimir: EventEmitter<any> = new EventEmitter();

    @Input() isBorrarPersonalizado: boolean = false;
    @Output() outputBorrar: EventEmitter<any> = new EventEmitter();

    product: any;

    productForm: FormGroup;

    rolMenu: RolMenu;

    // Private
    public _unsubscribeAll: Subject<any>;


    constructor(
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _fuseNavigationService: FuseNavigationService,
        public _formBuilder: FormBuilder,
        public _location: Location,
        public _matSnackBar: MatSnackBar,
        public dialog: MatDialog,
        private translate: TranslateService,
        private router: Router,
        private hashid: HashidsService,
        private _historial: MatBottomSheet,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the default
        this.product = {};
        this.product.name = 'Coca-Cola';

        this.productForm = this._formBuilder.group({
            id: [this.product.id],
            name: [this.product.name],
            handle: [this.product.handle],
            description: [this.product.description],
            categories: [this.product.categories],
            tags: [this.product.tags],
            images: [this.product.images],
            priceTaxExcl: [this.product.priceTaxExcl],
            priceTaxIncl: [this.product.priceTaxIncl],
            taxRate: [this.product.taxRate],
            comparedPrice: [this.product.comparedPrice],
            quantity: [this.product.quantity],
            sku: [this.product.sku],
            width: [this.product.width],
            height: [this.product.height],
            depth: [this.product.depth],
            weight: [this.product.weight],
            extraShippingFee: [this.product.extraShippingFee],
            active: [this.product.active]
        });

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit() {

        this.rolMenu = this._fuseNavigationService.getSelectedPermisos();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if(changes.currentFechaModificacion){
            this.currentFechaModificacion = changes.currentFechaModificacion.currentValue;
        }
    }

    guardar() {

    }

    borrar() {
        if(!this.isBorrarPersonalizado){
            const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
                width: '400px',
                data: {
                    mensaje: this.etiquetaBotonEliminar ? '¿Deseas cancelar este registro?' : this.translate.instant('MENSAJE.CONFIRMACION_BORRAR')
                }
            });
    
            dialogRef.afterClosed().subscribe(confirm => {
                if (confirm) {
                    this.dataService.eliminar(this.config.rutaBorrar + this.hashid.encode(this.currentId)).then(
                        function (result: JsonResponse) {
    
                            if (result.status == 200) {
                                this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                                    duration: 5000,
                                });
                                this.router.navigate([this.config.rutaAtras])
                            }
    
                        }.bind(this)
                    );
                }
            });
        }else{
            this.outputBorrar.emit();
        }
    }

    editar() {
        this.pageType = 'editar'
        this.subTituloTraduccion = this.pageType;
        if (this.form instanceof FormGroup) {
            this.form.enable({ emitEvent: false });
        } else if(this.form instanceof FormArray){
            this.form.enable({emitEvent: false});
        } else {
            this.form.forEach((f) => { f.enable({ emitEvent: false }); });
        }

        if (this.isDesHabilitarPersonalizado) {
            this.outputDesHabilitarCampos.emit();
        }

        return;
    }

    action(option: ListadoMenuOpciones) {
		console.log('option',option);

        if (option.tipo == FichaListadoConfig.PERSONALIZADO) {
            this.dataService.getPDF(option.url + this.currentId);
            this._matSnackBar.openFromComponent(IconSnackBarComponent, {
                data: {
                    message: 'Descargando...',
                    icon: 'cloud_download',
                },
                duration: 1 * 1000, horizontalPosition: 'right'
            });
        } else if (option.tipo == FichaListadoConfig.ARCHIVO_BY_ID) {
            this.dataService.getArchivo(option.url + this.currentId);
            this._matSnackBar.openFromComponent(IconSnackBarComponent, {
                data: {
                    message: 'Descargando...',
                    icon: 'cloud_download',
                },
                duration: 1 * 1000, horizontalPosition: 'right'
            });
        } else if (option.tipo == FichaListadoConfig.ARCHIVO_BY_HASHID) {
            this.dataService.getArchivo(option.url + this.hashid.encode(this.currentId));
            this._matSnackBar.openFromComponent(IconSnackBarComponent, {
                data: {
                    message: 'Descargando...',
                    icon: 'cloud_download',
                },
                duration: 1 * 1000, horizontalPosition: 'right'
            });
        }
        else
            this.onActionClicked.emit({ id: this.currentId, option: option });
    }

    recargar() {
        this.dataService.getDatos();
        return this.pageType;
    }

    cancelar() {
        if (this.isCancelarPersonalizado) {
            this.outputCancelar.emit();
        } else {
            const dialogRef = this.dialog.open(PixvsConfirmComentarioDialogComponent, {
                width: '400px',
                data: {
                    mensaje: this.translate.instant('MENSAJE.CONFIRMACION_CANCELAR'),
                    comentarioObligatorio: true
                }
            });

            dialogRef.afterClosed().subscribe(comentario => {
                if (comentario) {
                    this.dataService.cancelar(JSON.stringify({ id: this.currentId, comentario: comentario, fechaModificacion: this.currentFechaModificacion }), this.config.rutaCancelar).then(
                        function (result: JsonResponse) {
                            if (result.status == 200) {
                                this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                                this.router.navigate([this.config.rutaAtras])
                            }
                        }.bind(this)
                    );
                }
            });
        }
    }

    rechazar() {
        const dialogRef = this.dialog.open(PixvsConfirmComentarioDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_RECHAZAR'),
				comentarioObligatorio: true
            }
        });

        dialogRef.afterClosed().subscribe(comentario => {
            if (comentario) {
                this.dataService.rechazar(JSON.stringify({id: this.currentId, comentario: comentario, fechaModificacion: this.currentFechaModificacion}), this.config.rutaRechazar).then(
                    function (result: JsonResponse) {
                        if (result.status == 200) {
                            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                            this.router.navigate([this.config.rutaAtras])
                        }
                    }.bind(this)
                );
            }
        });
    }

    aprobar() {
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_APROBAR')
            }
        });
		dialogRef.afterClosed().subscribe(confirm => {
			if (confirm) {
				if(this.isAprobarPersonalizado){
					this.aprobarPersonalizado();
				}else{
					this.dataService.aprobar(this.currentId, this.config.rutaAprobar).then(
						function (result: JsonResponse) {
							if (result.status == 200) {
								this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
								this.router.navigate([this.config.rutaAtras])
							}
						}.bind(this)
					);
				}
			}
		});
    }

    guardarPersonalizado() {
        if (this.form && this.dataService) {
            this.dataService.validateAllFormFields(this.form);
        }

        this.output.emit()
    }

    abrirHistorial() {
        this._historial.open(FichaCrudHistorialComponent, {
            data: this.historial,
        });
    }

    enviar() {
        const dialogRef = this.dialog.open(FuseConfirmDialogComponent, {
            width: '400px',
            data: {
                mensaje: this.translate.instant('MENSAJE.CONFIRMACION_ENVIAR')
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
                this.dataService.enviar(JSON.stringify({ id: this.currentId }), this.config.rutaEnviar).then(
                    function (result: JsonResponse) {
                        if (result.status == 200) {
                            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', { duration: 5000 });
                            this.router.navigate([this.config.rutaAtras])
                        }
                    }.bind(this)
                );
            }
        });
    }

    enviarPersonalizado() {
        this.outputEnviar.emit()
    }

    imprimir() {
        this.outputImprimir.emit();
    }

	aprobarPersonalizado() {
        this.outputAprobar.emit()
    }
}
