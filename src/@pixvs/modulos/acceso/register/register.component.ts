import { ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/internal/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { fuseAnimations } from '@fuse/animations';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as english } from './i18n/en';
import { locale as spanish } from './i18n/es';
import { TranslateService } from '@ngx-translate/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { Usuario } from '@models/usuario';
import { UsuarioLocalService } from '@services/usuario.service';
import { registerService } from './register.service';
import { JsonResponse } from '@models/json-response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector     : 'register',
    templateUrl  : './register.component.html',
    styleUrls    : ['./register.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations   : fuseAnimations
})
export class RegisterComponent implements OnInit, OnDestroy
{
    registerForm: FormGroup;
    languages: any;
    checked : boolean = false;
    linkTerminosyCondiciones : string = environment?.linkTerminosCondiciones || '';

    paises: any[] = [];
    estados: any[] = [];
    municipios: any[] = [];
    isRequeridoEstadosMunicipios: boolean = false;
    // Private
    private _unsubscribeAll: Subject<any>;

    @ViewChild('selectPaises') selectPaises: PixvsMatSelectComponent;
    @ViewChild('selectEstados') selectEstados: PixvsMatSelectComponent;
    @ViewChild('selectMunicipios') selectMunicipios: PixvsMatSelectComponent;


    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _translateService: TranslateService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _registerService: registerService,
        private _matSnackBar: MatSnackBar,
        private router: Router,
        public dialog: MatDialog
        )
    {
        // Configure the layout
        this._fuseConfigService.config = {
            layout: {
                navbar   : {
                    hidden: true
                },
                toolbar  : {
                    hidden: true
                },
                footer   : {
                    hidden: true
                },
                sidepanel: {
                    hidden: true
                }
            }
        };
        this._fuseTranslationLoaderService.loadTranslations(english, spanish);

        this.languages = [
            {
                id: 'en',
                title: 'English',
                flag: 'us'
            },
            {
                id: 'es',
                title: 'Español',
                flag: 'mx'
            }
        ];
        // Set the private defaults
        this._unsubscribeAll = new Subject();

        fetch('app/main/assets/registro/registro-dialogo.html')
            .then(response => {
                if(response.ok)
                    response.text().then(data => { this.openDialog(data); })
            })
            .catch(error => {
                console.log('Dialogo no encontrado');
              });
            ;
        
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void
    {
        this.registerForm = this._formBuilder.group({
            name            : ['', Validators.required],
            first           : ['', Validators.required],
            second          : ['', []],
            pais            : [null, [Validators.required]],
            paisId          : [null, []],
            estado          : [null, []],
            estadoId        : [null, []],
            municipio       : [null, []],
            municipioId     : [null, []],
            email           : ['', [Validators.required, Validators.email]],
            emailConfirm    : ['', [Validators.required, Validators.email,confirmEmailValidator]],
            password        : ['', Validators.required],
            passwordConfirm : ['', [Validators.required, confirmPasswordValidator]]
        });

        // Update the validity of the 'passwordConfirm' field
        // when the 'password' field changes
        this.registerForm.get('password').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe(() => {
                this.registerForm.get('passwordConfirm').updateValueAndValidity();
            });
        
        this.registerForm.get('pais').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                //Leer el valor, si es México: Estado y Municipio son requeridos
                if(value?.id == 1){
                    this.registerForm.get('estado').setValidators(Validators.required);
                    this.registerForm.get('estado').updateValueAndValidity();
                    this.registerForm.get('municipio').setValidators(Validators.required);
                    this.registerForm.get('municipio').updateValueAndValidity();
                    this.isRequeridoEstadosMunicipios = true;
                } else {
                    this.registerForm.get('estado').setValidators(null);
                    this.registerForm.get('estado').updateValueAndValidity();
                    this.registerForm.get('municipio').setValidators(null);
                    this.registerForm.get('municipio').updateValueAndValidity();
                    this.isRequeridoEstadosMunicipios = false;
                }

                this.registerForm.get('estado').setValue(null);
                this.registerForm.get('municipio').setValue(null);
                //Llamar al listado de estados del país
                if(!!value?.id)
                    this._registerService.getEstados(value?.id);
            });

        this.registerForm.get('estado').valueChanges
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                this.registerForm.get('municipio').setValue(null);
                //Llamar al listado de municipios del estado
                if(!!value?.id)
                    this._registerService.getMunicipios(value?.id);
            });
        
        this._registerService.onPaisesChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if(value)
                    this.paises = value;
                else
                    this.paises = [];
                if(!!this.selectPaises)
                    this.selectPaises.setDatos(this.paises);
            });

        this._registerService.onEstadosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if(value)
                    this.estados = value;
                else
                    this.estados = [];
                if(!!this.selectEstados)
                    this.selectEstados.setDatos(this.estados);
            });

        this._registerService.onMunicipiosChanged
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((value) => {
                if(value)
                    this.municipios = value;
                else
                    this.municipios = [];
                if(!!this.selectMunicipios)
                    this.selectMunicipios.setDatos(this.municipios);
            });
        
        this._registerService.getPaises();
    }

    /**
     * On destroy
     */
    ngOnDestroy(): void
    {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();
    }

    onCreateAccount(){
        let usuario = new Usuario();
        let  usuarioProvisional = this.registerForm.value;

        usuario.nombre = usuarioProvisional.name;
        usuario.primerApellido = usuarioProvisional.first;
        usuario.segundoApellido = usuarioProvisional.second;
        usuario.correoElectronico = usuarioProvisional.email;
        usuario.contrasenia = usuarioProvisional.password;
        usuario.rolId = 1;
        usuario.paisId = usuarioProvisional?.pais?.id;
        usuario.estadoId = usuarioProvisional?.estado?.id;
        usuario.municipioId = usuarioProvisional?.municipio?.id;

        this._registerService.register(usuario).subscribe( (result: JsonResponse) => {
            if (result.status == 200) {
                this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
                    duration: 5000,
                });
                this.router.navigate(['/acceso/mail-confirm'])
            } else {
                this._matSnackBar.open(result.message, 'OK', {
                    duration: 5000,
                });
                this.registerForm.enable();
            }
        });
               
    }

    showOptions(event :any){
        this.checked = event.checked;
    }

    openDialog(textHTML : string) {
        const dialogRef = this.dialog.open(RegisterDialog, 
            {
                data: {
                    textoHTML: textHTML,
            }
        });
    
        dialogRef.afterClosed().subscribe(result => {
          console.log(`Dialog result: ${result}`);
        });
      }
}

/**
 * Confirm password validator
 *
 * @param {AbstractControl} control
 * @returns {ValidationErrors | null}
 */
export const confirmPasswordValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {

    if ( !control.parent || !control )
    {
        return null;
    }

    const password = control.parent.get('password');
    const passwordConfirm = control.parent.get('passwordConfirm');

    if ( !password || !passwordConfirm )
    {
        return null;
    }

    if ( passwordConfirm.value === '' )
    {
        return null;
    }

    if ( password.value === passwordConfirm.value )
    {
        return null;
    }

    return {'passwordsNotMatching': true};
};

/**
 * Confirm email validator
 *
 * @param {AbstractControl} controlEmail
 * @returns {ValidationErrors | null}
 */
 export const confirmEmailValidator: ValidatorFn = (controlEmail: AbstractControl): ValidationErrors | null => {

    if ( !controlEmail.parent || !controlEmail )
    {
        return null;
    }

    const email = controlEmail.parent.get('email');
    const emailConfirm = controlEmail.parent.get('emailConfirm');

    if ( !email || !emailConfirm )
    {
        return null;
    }

    if ( emailConfirm.value === '' )
    {
        return null;
    }

    if ( email.value === emailConfirm.value )
    {
        return null;
    }

    return {'emailNotMatching': true};
};

@Component({
    selector: 'register-dialogo',
    templateUrl: 'register-dialogo.html',
  })
  export class RegisterDialog {
    textoHTML: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private cdRef: ChangeDetectorRef
    ) {
        if (data) {
            this.textoHTML = data.textoHTML;
        }
    }
  }