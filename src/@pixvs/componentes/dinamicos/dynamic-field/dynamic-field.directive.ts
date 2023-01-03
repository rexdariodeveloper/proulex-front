import {
  ComponentFactoryResolver,
  ComponentRef,
  Directive,
  Input,
  OnInit,
  ViewContainerRef
} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { InputComponent } from "../input/input.component";
import { ButtonComponent } from "../button/button.component";
import { SelectComponent } from "../select/select.component";
import { DateComponent } from "../date/date.component";
import { RadiobuttonComponent } from "../radiobutton/radiobutton.component";
import { CheckboxComponent } from "../checkbox/checkbox.component";
import { FieldConfig } from '../field.interface';
import { PixvsMatSelectComponent } from '../pixvs-mat-select/pixvs-mat-select.component';
import { CropperComponent } from '../cropper/cropper.component';
import { CheckboxListComponent } from '../checkbox-list/checkbox-list.component';
import { TextAreaComponent } from "../text-area/text-area.component";
import { CheckboxMatrizComponent } from "../checkbox-matriz/checkbox-matriz.components";
import { InputMatrizComponent } from "../input-matriz/input-matriz.component";
import { EscalaLinealComponent } from "../escala-lineal/escala-lineal.component";
import { RankingComponent } from "../ranking/ranking.component";
import { MatrizPersonalizadaComponent } from "../matriz-peronalizada/matriz-personalizada.component";

const componentMapper = {
  input: InputComponent,
  button: ButtonComponent,
  select: SelectComponent,
  date: DateComponent,
  radiobutton: RadiobuttonComponent,
  checkbox: CheckboxComponent,
  pixvsMatSelect: PixvsMatSelectComponent,
  imageCropper: CropperComponent,
  checkboxlist: CheckboxListComponent,
  textArea:TextAreaComponent,
  checkboxmatriz: CheckboxMatrizComponent,
  inputmatriz: InputMatrizComponent,
  escalalineal: EscalaLinealComponent,
  ranking : RankingComponent,
  matrizpersonalizada : MatrizPersonalizadaComponent
};
@Directive({
  selector: "[dynamicField]"
})
export class DynamicFieldDirective implements OnInit {
  @Input() field: FieldConfig;
  @Input() group: FormGroup;
  componentRef: any;
  constructor(
    private resolver: ComponentFactoryResolver,
    private container: ViewContainerRef
  ) { }
  ngOnInit() {
    const factory = this.resolver.resolveComponentFactory(
      componentMapper[this.field.type]
    );
    this.componentRef = this.container.createComponent(factory);
    this.componentRef.instance.field = this.field;
    this.componentRef.instance.group = this.group;
  }
}
