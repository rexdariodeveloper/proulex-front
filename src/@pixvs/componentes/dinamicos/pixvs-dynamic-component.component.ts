import { Component, ViewChild, Output, EventEmitter, Input } from "@angular/core";
import { Validators, FormControl } from "@angular/forms";
import { FieldConfig } from "./field.interface";
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';

@Component({
  selector: "pixvs-dynamic-components",
  templateUrl: "./pixvs-dynamic-component.component.html",
  styleUrls: ["./pixvs-dynamic-component.component.css"]
})
export class PixvsDynamicComponent {

  @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
  @Output() output: EventEmitter<any> = new EventEmitter();

  @Input() regConfig: FieldConfig[] = [];

  submit(value: any) {
    this.output.emit(value)
  }
}
