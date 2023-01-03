import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { RolService } from './rol.service';
import { Rol } from '@models/rol';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from '../roles/i18n/en';
import { locale as spanish } from '../roles/i18n/es';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { Subject } from 'rxjs';
import { PixvsMatTreeComponent } from '@pixvs/componentes/material/mat-tree/pixvs-mat-tree.component';
import { ValidatorService } from '@services/validators.service';
import { RestriccionDialogComponent, RestriccionDialogData } from './dialogs/restriccion.dialog';

@Component({
    selector: 'rol',
    templateUrl: './rol.component.html',
    styleUrls: ['./rol.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class RolComponent {

    @ViewChild('tree', { static: true }) tree: PixvsMatTreeComponent;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;

    rol: Rol;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    restriccionesNuevoRol: any[] = [];


    /** Select Controls */
    rolControl: FormControl;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;
    roles: any;


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
        public _rolService: RolService,
        public validatorService : ValidatorService,) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        // Set the default
        this.rol = new Rol();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.rol = new Rol();
            }

            this.config = {
                rutaAtras: "/config/roles",
                rutaBorrar: "/api/v1/roles/delete/",
                icono: "person"
            }

        });

        // Subscribe to update rol on changes
        this._rolService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {

                if (datos && datos.rol) {
                    this.rol = datos.rol;
                    this.titulo = this.rol.nombre
                } else {
                    this.rol = new Rol();
                    this.titulo = this.translate.instant('TITULO')
                }

                if (datos && datos.menu) {
                    this.addActions(datos.menu['navigation']);
                    this.tree.setDatos(datos.menu["navigation"]);
                }


                this.form = this.createRolForm();

                if (this.pageType == 'ver') {
                    this.form.disable({ emitEvent: false });
                } else {
                    this.form.enable({ emitEvent: false });
                }

            });

    }

    createRolForm(): FormGroup {

        let form = this._formBuilder.group({
            id: [this.rol.id],
            nombre: new FormControl(this.rol.nombre, [Validators.required, Validators.maxLength(200)]),
            activo: new FormControl(this.rol.activo, [Validators.required]),
            menu: [],
        });

        return form;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    isRequired(campo: string) {

        let form_field = this.form.get(campo);
        if (!form_field.validator) {
            return false;
        }

        let validator = form_field.validator({} as AbstractControl);
        return !!(validator && validator.required);

    }

    guardar() {

        this._rolService.cargando = true;

        if (this.form.valid) {

            this.form.get('menu').setValue(this.tree.getNodosSeleccionados())

            this.form.disable({ emitEvent: false });
            this._rolService.guardar(JSON.stringify(this.form.value), '/api/v1/roles/save').then(
                function (result: JsonResponse) {
                    if (result.status == 200) {
                        if(!!this.restriccionesNuevoRol.length){
                            for (let j = 0, tr = this.restriccionesNuevoRol.length; j < tr; j++) {
                                this.restriccionesNuevoRol[j].rolId = Number(result.data);
                                this._rolService.togglePermiso(this.restriccionesNuevoRol[j],'/api/v1/roles/permiso');
                                
                            }
                            

                        }
                        this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                            duration: 5000,
                        });
                        
                        this.router.navigate([this.config.rutaAtras])
                        
                    } else {
                        this._rolService.cargando = false;
                        this.form.enable({ emitEvent: false });
                    }
                }.bind(this)
            );


        } else {

            this._rolService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }

    addActions(children){
        children.forEach(child => {

            if(child?.rolMenuPermisos?.length > 0){
                child['accionesExtra'] = [{
                    icono: 'lock',
                    accion: this.onConfigChanged.bind(this),
                    tooltip: "Restricciones"
                }];
            }

            if(child?.children?.length > 0 )
                this.addActions(child.children);
        });
    }

    onConfigChanged(nodo){
        this.abrirModalRestricciones(nodo);
    }

    abrirModalRestricciones(nodo): void {

		let dialogData: RestriccionDialogData = {
            data: nodo,
            onAceptar: this.onAceptarRestriccionDialog.bind(this)
        };

		const dialogRef = this.dialog.open(RestriccionDialogComponent, {
			width: '500px',
			data: dialogData
		});
	}

    onAceptarRestriccionDialog(data){
        //this._rolService.getDatos();
        //console.log(data);
        if(!!data)
            this.restriccionesNuevoRol.push(data)
    }

}