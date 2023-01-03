import { Component, ElementRef, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlumnoComboProjection } from '@app/main/modelos/alumno';
import { JsonResponse } from '@models/json-response';
import { TranslateService } from '@ngx-translate/core';
import { ValidatorService } from '@services/validators.service';
import { ValidacionBoletasDialogComponent, ValidacionBoletasDialogData } from './dialogs/validacion-boletas/validacion-boletas.dialog';
import { ValidacionBoletasService } from './validacion-boletas.service';

@Component({
  selector: 'app-validacion-boletas',
  templateUrl: './validacion-boletas.component.html',
  styleUrls: ['./validacion-boletas.component.scss']
})
export class ValidacionBoletasComponent implements OnInit {

  form: FormGroup;

  constructor(
    private _validacionBoletasService: ValidacionBoletasService,
    private _translateService: TranslateService,
    private _formBuilder: FormBuilder,
    public _validatorService: ValidatorService,
    private _matSnackBar: MatSnackBar,
    public _dialog: MatDialog,
    private _el: ElementRef
  ) { 

    this.createForm();
    this.form.enable();
  }

  ngOnInit(): void {
  }

  createForm(): void {
		this.form = this._formBuilder.group({
			codigo: new FormControl(null, [Validators.required])
		});
	}

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  buscar(){
    // Validaciones
    if(this.form.invalid){

      let campoKey = '';

      for (const key of Object.keys(this.form.controls)) {
        // Verificamos si es group con Form
        // Normalmente Form
        if(this.form.controls[key].invalid){
          this.form.controls[key].markAsTouched();
          if(campoKey == ''){
            campoKey = key;
          }
        }
      }

      const invalidControl = this._el.nativeElement.querySelector('[formcontrolname="' + campoKey + '"]');
      if (invalidControl) {
        invalidControl.focus();
      }

      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });

      return;
    }
    

    this._validacionBoletasService.cargando = true;
    this._validacionBoletasService.post(this.form.controls.codigo.value, '/api/v1/captura_calificaciones/validacion-boletas', true).then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._validacionBoletasService.cargando = false;

          let dialogData: ValidacionBoletasDialogData = {
            esValidar: result.data.esValidar,
            alumnoGrupoBoleta: result.data.alumnoGrupoBoleta
          };
      
          const dialogRef = this._dialog.open(ValidacionBoletasDialogComponent, {
            width: '600px',
            data: dialogData,
            autoFocus: true
          });

        } else {
          this._validacionBoletasService.cargando = false;
        }
      }).bind(this)
    );
  }

}
