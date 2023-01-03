import { NgModule } from "@angular/core";

import { MaterialModule } from "./material.module";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { InputComponent } from "./input/input.component";
import { ButtonComponent } from "./button/button.component";
import { SelectComponent } from "./select/select.component";
import { DateComponent } from "./date/date.component";
import { RadiobuttonComponent } from "./radiobutton/radiobutton.component";
import { CheckboxComponent } from "./checkbox/checkbox.component";
import { CheckboxListComponent } from "./checkbox-list/checkbox-list.component";
import { DynamicFieldDirective } from "./dynamic-field/dynamic-field.directive";
import { DynamicFormComponent } from "./dynamic-form/dynamic-form.component";
import { PixvsDynamicComponent } from './pixvs-dynamic-component.component';
import { FuseSharedModule } from '@fuse/shared.module';
import { CommonModule } from '@angular/common';
import { PixvsMatSelectComponent } from './pixvs-mat-select/pixvs-mat-select.component';
import { TranslateModule } from '@ngx-translate/core';
import { PixvsMatSelectSimpleModule } from '../mat-select-search-simple/mat-select-search-simple.module';
import { CropperComponent } from './cropper/cropper.component';
import { ImageCropperModule } from 'ngx-image-cropper';
import { TextAreaComponent } from "./text-area/text-area.component";
import { CheckboxMatrizComponent } from "./checkbox-matriz/checkbox-matriz.components";
import { InputMatrizComponent } from "./input-matriz/input-matriz.component";
import { EscalaLinealComponent } from "./escala-lineal/escala-lineal.component";
import { RankingComponent } from "./ranking/ranking.component";
import { MatrizPersonalizadaComponent } from "./matriz-peronalizada/matriz-personalizada.component";

@NgModule({
  declarations: [
    PixvsDynamicComponent,
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    CheckboxListComponent,
    TextAreaComponent,
    DynamicFieldDirective,
    DynamicFormComponent, 
    CropperComponent,
    PixvsMatSelectComponent,
    CheckboxMatrizComponent,
    InputMatrizComponent,
    EscalaLinealComponent,
    RankingComponent,
    MatrizPersonalizadaComponent
  ],
  imports: [
    CommonModule,

    PixvsMatSelectSimpleModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    ImageCropperModule,

    TranslateModule,
    FuseSharedModule
  ],
  providers: [    
  ],
  exports: [
    PixvsDynamicComponent
  ],
  entryComponents: [
    InputComponent,
    ButtonComponent,
    SelectComponent,
    DateComponent,
    RadiobuttonComponent,
    CheckboxComponent,
    PixvsMatSelectComponent,
    CropperComponent,
    CheckboxListComponent,
    TextAreaComponent,
    CheckboxMatrizComponent,
    InputMatrizComponent,
    EscalaLinealComponent,
    RankingComponent,
    MatrizPersonalizadaComponent
  ]
})
export class PixvsDynamicComponentModule { }
