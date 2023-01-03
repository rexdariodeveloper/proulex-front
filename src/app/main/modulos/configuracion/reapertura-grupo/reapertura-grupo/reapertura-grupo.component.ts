import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ProgramaGrupo, ProgramaGrupoEditarProjection, ProgramaGrupoReaperturaGrupoProjection } from '@app/main/modelos/programa-grupo';
import { FichaCRUDConfig } from '@models/ficha-crud-config';
import { ValidatorService } from '@services/validators.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ReaperturaGrupoService } from './reapertura-grupo.service';
import * as moment from 'moment';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { JsonResponse } from '@models/json-response';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-reapertura-grupo',
  templateUrl: './reapertura-grupo.component.html',
  styleUrls: ['./reapertura-grupo.component.scss']
})
export class ReaperturaGrupoComponent {

  // Configuracion de la Ficha
  config: FichaCRUDConfig;

  // Ficha
  form: FormGroup = null;
  listaGrupoFormArray: FormArray = new FormArray([]);

  // Private
	private _unsubscribeAll: Subject <any> ;

  constructor(
    public _reaperturaGrupoService: ReaperturaGrupoService,
    private _formBuilder: FormBuilder,
    public _validatorService: ValidatorService,
    private _matSnackBar: MatSnackBar,
    private _translateService: TranslateService
  ) {
    // Set the private defaults
		this._unsubscribeAll = new Subject();
    //this.form = this._formBuilder.group({});
  }

  ngOnInit(): void {
    this.config = {
      icono: "assignment"
    }

    this.createForm();

    // Datos del Empleado
    this._reaperturaGrupoService.onListaGrupoChanged.pipe(takeUntil(this._unsubscribeAll)).subscribe((listaGrupo: ProgramaGrupoReaperturaGrupoProjection[]) => {
      if(listaGrupo){
        this.listaGrupoFormArray = new FormArray([]);
        listaGrupo.map(grupo => {
          this.listaGrupoFormArray.push(this.createGrupoFormGroup(grupo));
        });
      }
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  onSearchIsCheck(): boolean{
    return this.listaGrupoFormArray.controls.filter(grupo => grupo.value.esCheck == true).length > 0 ? false : true
  }

  // Form
  createForm(){
    this.listaGrupoFormArray = new FormArray([]);

    let form = this._formBuilder.group({
      codigo: new FormControl(null, [Validators.required]),
      listaGrupo: this.listaGrupoFormArray
    });

    this.form = form;
  }

  // Form lista
  createGrupoFormGroup(grupo: ProgramaGrupoReaperturaGrupoProjection): FormGroup{
    let form = this._formBuilder.group({
      esCheck: new FormControl(false),
      id: new FormControl(grupo.id),
      sede: new FormControl(grupo.sede),
      programa: new FormControl(grupo.programa),
      idioma: new FormControl(grupo.idioma),
      nivel: new FormControl(grupo.nivel),
      horario: new FormControl(grupo.horario),
      fechaInicio: new FormControl(grupo.fechaInicio),
      fechaFinInscripcion: new FormControl(grupo.fechaFinInscripcion),
      fechaFinInscripcionBeca: new FormControl(grupo.fechaFinInscripcionBeca),
      aFechaFinInscripcion: new FormControl(null),
      aFechaFinInscripcionBeca: new FormControl(null)
    });

    return form;
  }

  isRequired(campo: string, form: FormGroup) {
    let form_field = form.get(campo);
    if (!form_field.validator) {
        return false;
    }

    let validator = form_field.validator({} as AbstractControl);
    return !!(validator && validator.required);

  }

  onSave(): void{
    // Verificar si los campos estan validaciones
    if(this.listaGrupoFormArray.invalid){
      this.listaGrupoFormArray.markAllAsTouched();
      this._matSnackBar.open(this._translateService.instant('MENSAJE.CAMPOS_REQUERIDOS'), 'OK', {
        duration: 5000,
      });
      return;
    }

    let json: ProgramaGrupoEditarProjection[] = [];

    this.listaGrupoFormArray.controls.filter((grupo: FormGroup) => grupo.controls.esCheck.value == true).map((grupo: FormGroup) =>{
      // Actualiza los datos de programa de grupo
      let aProgramaGrupo: ProgramaGrupoEditarProjection = new ProgramaGrupo();
      aProgramaGrupo.id = grupo.controls.id.value;
      aProgramaGrupo.fechaFinInscripciones = grupo.controls.aFechaFinInscripcion.value;
      aProgramaGrupo.fechaFinInscripcionesBecas = grupo.controls.aFechaFinInscripcionBeca.value;

      json.push(aProgramaGrupo);
    });

    this._reaperturaGrupoService.cargando = true;
    this._reaperturaGrupoService.guardar(JSON.stringify(json), '/api/v1/reapertura-grupo/save').then(
      ((result: JsonResponse) => {
        if (result.status == 200) {
          this._reaperturaGrupoService.cargando = false;

          this._matSnackBar.open(this._translateService.instant('MENSAJE.GUARDADO_EXITO'), 'OK', {
            duration: 5000,
          });
          // Limpia los campos
          this.limpiaCampos();
        } else {
          this._reaperturaGrupoService.cargando = false;
          this._matSnackBar.open(result.data.message, 'OK', {
            duration: 5000,
          });
        }
      }).bind(this)
    );
  }

  limpiaCampos(){
    this.form = null;    
    setTimeout(() => {
      this.createForm();
    }, 0)
  }

  onSearchCodigo(): void{
    // Verificar si estan validaciones del Form
    if(this.form.invalid)
      return;

    this._reaperturaGrupoService.getListaGrupo(this.form.controls['codigo'].value);

  }

  // Mat Check
  onChangeEsCheck(event, grupo: FormGroup): void{
    grupo.controls.esCheck.setValue(event.checked);

    if(event.checked)
    {
      let field = grupo.controls['aFechaFinInscripcion'];
      field.setValidators([Validators.required]);
      field.markAsPristine();
      field.markAsUntouched();
      field.updateValueAndValidity();

      field = grupo.controls['aFechaFinInscripcionBeca'];
      field.setValidators([Validators.required]);
      field.markAsPristine();
      field.markAsUntouched();
      field.updateValueAndValidity();
      
    }else{
      let field = grupo.controls['aFechaFinInscripcion'];
      field.setValue(null);
      field.clearValidators();
      field.markAsPristine();
      field.markAsUntouched();
      field.updateValueAndValidity();

      field = grupo.controls['aFechaFinInscripcionBeca'];
      field.setValue(null);
      field.clearValidators();
      field.markAsPristine();
      field.markAsUntouched();
      field.updateValueAndValidity();
    }
  }

  onCheckDisabled(grupo): boolean{
    const id: number = grupo.controls.id.value;
    if(this.listaGrupoFormArray.controls.filter((_grupo: FormGroup) => _grupo.controls.esCheck.value == true).length > 0){
      if(this.listaGrupoFormArray.controls.some((_grupo: FormGroup) => _grupo.controls.esCheck.value == true && _grupo.controls.id.value == id))
        return false;
      else
        return true;
    }else
      return false;
  }
}
