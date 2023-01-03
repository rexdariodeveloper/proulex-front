import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { fuseAnimations } from '@fuse/animations';
import { FuseUtils } from '@fuse/utils';
import { Location } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Subject, ReplaySubject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { HashidsService } from '@services/hashids.service';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { UsuarioService } from './usuario.service';
import { Usuario } from '@models/usuario';
import { takeUntil, take } from 'rxjs/operators';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { locale as english } from '../usuarios/i18n/en';
import { locale as spanish } from '../usuarios/i18n/es';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { TranslateService } from '@ngx-translate/core';
import { JsonResponse } from '@models/json-response';
import { ValidatorService } from '@services/validators.service';
import { FichaCrudComponent } from '@pixvs/componentes/fichas/ficha-crud/ficha-crud.component';
import { UsuarioDatosAdicionalesComponent } from '@app/main/componentes/usuario-datos-adicionales/usuario-datos-adicionales.component';
import { ContrasenaDialog } from './contrasena-dialog';
import { ControlMaestroMultiple } from '@models/control-maestro-multiple';
import { ControlesMaestrosMultiples } from '@models/mapeos/controles-maestros-multiples';

@Component({
    selector: 'usuario',
    templateUrl: './usuario.component.html',
    styleUrls: ['./usuario.component.scss'],
    animations: fuseAnimations,
    encapsulation: ViewEncapsulation.None
})
export class UsuarioComponent {

    @ViewChild(UsuarioDatosAdicionalesComponent) datosAdicionales: UsuarioDatosAdicionalesComponent;

    pageType: string = 'nuevo';

    config: FichaCRUDConfig;
    titulo: String;
    subTitulo: String;
    tiposUsuarios: ControlMaestroMultiple[] = [];
    tipoUsuario: ControlMaestroMultiple;
    usuarioSIIAU: boolean = false;

    usuario: Usuario;
    form: FormGroup;

    apiUrl: string = environment.apiUrl;
    @ViewChild(FichaCrudComponent) fichaCrudComponent: FichaCrudComponent;

    /** Select Controls */
    rolControl: FormControl;
    estatusControl: FormControl;

    // Private
    private _unsubscribeAll: Subject<any>;
    currentId: number;
    roles: any;
    estatus: any;
    datosAdicionalesMap: any;

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
        public _usuarioService: UsuarioService,
        public validatorService: ValidatorService,
    ) {

        this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);
        this._usuarioService.translate = this.translate;

        // Set the default
        this.usuario = new Usuario();

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            this.pageType = params.get("handle");
            let id: string = params.get("id");

            this.currentId = this.hashid.decode(id);
            if (this.pageType == 'nuevo') {
                this.usuario = new Usuario();
            }

            this.config = {
                rutaAtras: "/config/usuarios",
                rutaBorrar: "/api/v1/usuarios/delete/",
                icono: "person"
            }

        });

        // Subscribe to update usuario on changes
        this._usuarioService.onDatosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(datos => {
                this.tiposUsuarios = datos.cmmTipoUsuario;
                if (datos?.usuario) {
                    this.usuario = datos.usuario;
                    this.tipoUsuario = this.tiposUsuarios.filter(u => u.id == this.usuario.tipoId)[0];
                    if (this.usuario.tipoId == ControlesMaestrosMultiples.CMM_USU_TipoId.SIIAU)
                        this.usuarioSIIAU = true;
                    else
                        this.usuarioSIIAU = false;
                    this.titulo = this.usuario.nombreCompleto
                } else {
                    this.usuario = new Usuario();
                    this.tipoUsuario = this.tiposUsuarios.filter(tu => tu.id == ControlesMaestrosMultiples.CMM_USU_TipoId.PLATAFORMA)[0];
                    this.titulo = this.translate.instant('TITULO')
                }

                if (datos.datosAdicionales) {
                    this.datosAdicionalesMap = datos.datosAdicionales;
                }

                this.form = this.createUsuarioForm();

                if (this.pageType == 'ver') {
                    this.form.disable({ emitEvent: false });
                } else {
                    this.form.enable({ emitEvent: false });
                }

                this.roles = datos?.roles;
                this.estatus = datos?.cmmEstatus;

                // set initial selection
                this.rolControl.setValue(this.usuario?.rol);
                this.estatusControl.setValue(this.usuario?.estatus);

            });

    }

    createUsuarioForm(): FormGroup {

        this.rolControl = new FormControl(this.usuario.rol, [Validators.required]);
        this.estatusControl = new FormControl(this.usuario.rol, []);
        let tipoU = this.tiposUsuarios.find(u => u.id == this.usuario.tipoId);

        let form = this._formBuilder.group({
            id: [this.usuario.id],
            tipoId: new FormControl(tipoU, [Validators.required]),
            nombre: new FormControl(this.usuario.nombre, [Validators.required, Validators.maxLength(200), , this.validatorService.isOnlyLetter]),
            primerApellido: new FormControl(this.usuario.primerApellido, [Validators.required, Validators.maxLength(255), , this.validatorService.isOnlyLetter]),
            segundoApellido: new FormControl(this.usuario.segundoApellido, [Validators.maxLength(255), , this.validatorService.isOnlyLetter]),
            codigo: new FormControl(this.usuario.codigo, []),
            codigoConfirmar: new FormControl(this.usuario.codigo, []),
            correoElectronico: new FormControl(this.usuario.correoElectronico, [Validators.required, Validators.email, Validators.maxLength(255)]),
            confirmacionCorreoElectronico: new FormControl(this.usuario.correoElectronico, [Validators.email, Validators.maxLength(255)]),
            contrasenia: new FormControl(this.usuario.contrasenia, [Validators.minLength(6), Validators.maxLength(20)]),
            contraseniaConfirmar: new FormControl(this.usuario.contrasenia, [Validators.minLength(6), Validators.maxLength(20)]),
            img64: new FormControl(),
            rol: this.rolControl,
            estatus: this.pageType != 'nuevo' ? this.estatusControl : null,
            archivoId: new FormControl(this.usuario.archivoId),
            fechaModificacion: this.usuario.fechaModificacion,
        });

        form.controls.tipoId.valueChanges.pipe(takeUntil(this._unsubscribeAll)).subscribe(datos => {
            if (!!datos) {
                if (datos?.id == ControlesMaestrosMultiples.CMM_USU_TipoId.SIIAU)
                    this.usuarioSIIAU = true;
                else
                    this.usuarioSIIAU = false;
            }
        });

        if (this.pageType == 'editar' || this.pageType == 'ver') {
            form.get('estatus').setValidators([Validators.required]);
            form.get('estatus').updateValueAndValidity();

            form.get('contrasenia').setValidators([Validators.minLength(6), Validators.maxLength(20)]);
            form.get('contrasenia').updateValueAndValidity();

            form.get('contraseniaConfirmar').setValidators([Validators.minLength(6), Validators.maxLength(20)]);
            form.get('contraseniaConfirmar').updateValueAndValidity();
        }

        return form;
    }

    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
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

        if (this.croppedImage) {
            this.form.get('img64').setValue(this.croppedImage);
        }

        this._usuarioService.cargando = true;

        if (this.form.valid) {
            let tipoUsuario = this.form.controls.tipoId.value;
            this.form.get('tipoId').setValue(tipoUsuario.id);
            if (this.form.get('contrasenia').value !== this.form.get('contraseniaConfirmar').value) {
                this._matSnackBar.open("No coinciden las contraseñas", 'OK', {
                    duration: 5000,
                });

                this.form.get('contrasenia').setValue(null);
                this.form.get('contraseniaConfirmar').setValue(null);
                this._usuarioService.cargando = false;
            } else {

                if (this.datosAdicionales) {
                    if (!this.datosAdicionales.validar()) {
                        this._usuarioService.cargando = false;
                        this.form.enable({ emitEvent: false });

                        let mensajeError: string = this.datosAdicionales['mensajeError'] || this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS');

                        this._matSnackBar.open(mensajeError, 'OK', {
                            duration: 5000,
                        });
                        return;
                    }
                    this.datosAdicionales.setDatosForm();
                }
                if (tipoUsuario.id == ControlesMaestrosMultiples.CMM_USU_TipoId.SIIAU) {
                    this.form.get('contrasenia').setValue(".");
                    if (this.form.get('codigo').value !== this.form.get('codigoConfirmar').value) {
                        this._matSnackBar.open("No coinciden los codigos", 'OK', {
                            duration: 5000,
                        });

                        this.form.get('codigo').setValue(null);
                        this.form.get('codigoConfirmar').setValue(null);
                        this._usuarioService.cargando = false;
                    }
                    if (this.form.get('correoElectronico').value !== this.form.get('confirmacionCorreoElectronico').value) {
                        this._matSnackBar.open("No coinciden los correos", 'OK', {
                            duration: 5000,
                        });

                        this.form.get('correoElectronico').setValue(null);
                        this.form.get('confirmacionCorreoElectronico').setValue(null);
                        this._usuarioService.cargando = false;
                    }
                }

                this.form.disable({ emitEvent: false });
                this._usuarioService.guardar(JSON.stringify(this.form.value), '/api/v1/usuarios/save').then(
                    function (result: JsonResponse) {
                        if (result.status == 200) {
                            if (result.data) {
                                if (result.data.archivoId != null) {
                                    result.data.img = environment.apiUrl + '/v1/archivo/' + this.hashid.encode(result.data.archivoId);
                                }
                                localStorage.setItem('usuario', JSON.stringify(result.data));
                            }
                            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                                duration: 5000,
                            });
                            this.router.navigate([this.config.rutaAtras])
                        } else {
                            this._usuarioService.cargando = false;
                            this.form.enable({ emitEvent: false });
                        }
                    }.bind(this)
                );

            }


        } else {

            this._usuarioService.cargando = false;
            this.form.enable({ emitEvent: false });

            this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
                duration: 5000,
            });

        }

    }


    imageChangedEvent: any = '';
    croppedImage: any = '';

    fileChangeEvent(event: any): void {
        this.imageChangedEvent = event;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
    }

    cambiarPassword() {
        const dialogRef = this.dialog.open(ContrasenaDialog, {
            width: '400px',
            data: {
                usuarioId: this.usuario.id,
                mensaje: 'Mensaje'
            }
        });

        dialogRef.afterClosed().subscribe(confirm => {
            if (confirm) {
            }
        });
    }
}