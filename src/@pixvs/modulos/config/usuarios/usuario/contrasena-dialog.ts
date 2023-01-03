import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { UsuarioService } from './usuario.service';
import { JsonResponse } from '@models/json-response';

export interface DialogData {
  usuarioId: number;
  sedeId: number;
}

@Component({
  selector: 'contrasena-dialog',
  templateUrl: 'contrasena-dialog.html',
})
export class ContrasenaDialog {

  form: any;

  private _unsubscribeAll: Subject<any>;

  private usuarioId: number;

  constructor(
    public _profileService: UsuarioService,
    private _matSnackBar: MatSnackBar,
    private translate: TranslateService,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    public dialogRef: MatDialogRef<ContrasenaDialog>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.usuarioId = data.usuarioId;

    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  createForm(): FormGroup {
    let form = this._formBuilder.group({
      usuarioId: this.usuarioId,
      contrasenia: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
      contraseniaConfirmar: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
    });

    return form;
  }

  isRequired(cambo: string) {
    let form_field = this.form.get(cambo);
    
    if (!form_field.validator) {
      return false;
    }

    let validator = form_field.validator({} as AbstractControl);

    return !!(validator && validator.required);
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  ngOnInit(): void {
    this.form = this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  guardar() {
    if (this.form.valid) {
      if (this.form.get('contrasenia').value != this.form.get('contraseniaConfirmar').value) {
        this._matSnackBar.open("No coinciden las contraseñas", 'OK', {
          duration: 5000,
        });

        return;
      }

      this._profileService.cargando = true;
      
      this.form.disable({ emitEvent: false });

      this._profileService.guardar(JSON.stringify(this.form.value), '/api/v1/usuarios/change-password-usuario').then(
        function (result: JsonResponse) {
          if (result.status == 200) {
            this._matSnackBar.open(this.translate.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
              duration: 5000,
            });

            this.dialogRef.close(true);
          } else {
            this._profileService.cargando = false;
            
            this.form.enable({ emitEvent: false });
          }
        }.bind(this)
      );
    } else {
      this._profileService.cargando = false;
      
      this.form.enable({ emitEvent: false });

      this._matSnackBar.open(this.translate.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });
    }
  }
}