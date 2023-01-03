import { Component, OnDestroy, OnInit, ViewEncapsulation, Input, ChangeDetectionStrategy, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { fuseAnimations } from '@fuse/animations';
import { PixvsDynamicComponent } from '@pixvs/componentes/dinamicos/pixvs-dynamic-component.component';
import { FichasDataService } from '@services/fichas-data.service';
import { FichaListadoConfig } from '@models/ficha-listado-config';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IconSnackBarComponent } from '@pixvs/componentes/snackbars/icon-snack-bar.component';
import { FieldConfig } from '@pixvs/componentes/dinamicos/field.interface';
import { TranslateService } from '@ngx-translate/core';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { Router } from '@angular/router';
import { FichaListadoService } from '@services/ficha-listado.service';

@Component({
    selector: 'listado-filtro-sidebar',
    templateUrl: './listado-filtrado-sidebar.component.html',
    styleUrls: ['./listado-filtrado-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ListadoFiltradoSidebarComponent implements OnInit, OnDestroy {

    @Input() titulo: string = "TITULO";
    @Input() modulo: string = "MODULO";
    @Input() icon: string = "payment";
    @ViewChild(PixvsDynamicComponent) form: PixvsDynamicComponent;

    @Input() listadoMenuOpciones = [];

    @Input() regConfig: FieldConfig[] = [];

    @Output() outputFiltro: EventEmitter<any> = new EventEmitter();

    // Private
    private _unsubscribeAll: Subject<any>;
    dynamic: any;

    constructor(
        public _FichasDataService: FichasDataService,
        private _snackBar: MatSnackBar,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private translate: TranslateService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private _fichaListadoService: FichaListadoService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

        // Set the private defaults
        this._unsubscribeAll = new Subject();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
    }


    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    buscar() {
        this.filtar(this.form.form.form)
    }

    filtar(form: FormGroup) {
        if (form.valid) {
            this._fuseSidebarService.getSidebar('listado-filtro-sidebar').close();
            this._fichaListadoService.setFiltros(this._router.url, form.value);
            this._FichasDataService.getDatosFiltros(form.value);
        } else {
            this._snackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            this._FichasDataService.validateAllFormFields(form);
        }
    }

    selectedOpcion(opc: any) {

        let form = this.form.form.form;

        if (form.valid) {
            if (FichaListadoConfig.EXCEL == opc.tipo) {

                this._snackBar.openFromComponent(IconSnackBarComponent, {
                    data: {
                        message: this.translate.instant('INTERFAZ.DESCARGANDO')+'...',
                        icon: 'cloud_download',
                    },
                    horizontalPosition: 'right'
                });

                this._FichasDataService.getExcelConFiltros(opc.url, form.value).finally(() => {
                    this._snackBar.dismiss();
                });
            }
            if (opc.tipo === 'download_zip'){
                this._snackBar.openFromComponent(IconSnackBarComponent, {
                    data: {
                        message: this.translate.instant('INTERFAZ.DESCARGANDO')+'...',
                        icon: 'cloud_download',
                    },
                    horizontalPosition: 'right'
                });

                this._FichasDataService.getZipConFiltros(opc.url, form.value).finally(() => {
                    this._snackBar.dismiss();
                });
            }
            if (opc.tipo == 'download') {
                this._snackBar.openFromComponent(IconSnackBarComponent, {
                    data: {
                        message: this.translate.instant('INTERFAZ.DESCARGANDO')+'...',
                        icon: 'cloud_download',
                    },
                    horizontalPosition: 'right'
                });

                this._FichasDataService.getPDFConFiltros(opc.url, form.value).finally(() => {
                    this._snackBar.dismiss();
                });
            }
            if (FichaListadoConfig.PERSONALIZADO == opc.tipo) {
                let json: any = {
                    opcion: opc,
                    datos: form.value
                }
                this.outputFiltro.emit(json);
            }
        } else {
            this._snackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });
            this._FichasDataService.validateAllFormFields(form);
        }

    }


}
