import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { locale as generalEN } from '@traducciones-generales-en';
import { locale as generalES } from '@traducciones-generales-es';
import { Usuario } from '@models/usuario';
import { FormGroup, FormControl, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { JsonResponse } from '@models/json-response';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { PixvsMatSelectComponent } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.component';
import { ProfileService } from './profile.service';

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


  constructor(
    public _profileService: ProfileService,
    private _matSnackBar: MatSnackBar,
    private translate: TranslateService,
    private _fuseTranslationLoaderService: FuseTranslationLoaderService,
    public dialogRef: MatDialogRef<ContrasenaDialog>,
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this._fuseTranslationLoaderService.loadTranslations(generalEN, generalES);

    // Set the private defaults
    this._unsubscribeAll = new Subject();
  }

  createForm(): FormGroup {

    let form = this._formBuilder.group({
      contraseniaAnterior: new FormControl(null, [Validators.required, Validators.minLength(6), Validators.maxLength(20)]),
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

      if (this.form.get('contrasenia').value == this.form.get('contraseniaAnterior').value) {
        this._matSnackBar.open("La contraseña nueva debe ser diferente a la anterior", 'OK', {
          duration: 5000,
        });

        return;
      }

      this._profileService.cargando = true;
      this.form.disable({ emitEvent: false });


      this._profileService.guardar(JSON.stringify(this.form.value), '/api/v1/usuarios/change-password').then(
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