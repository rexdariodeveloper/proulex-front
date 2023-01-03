import { Component, OnInit } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FieldConfig } from "../field.interface";

import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { environment } from '@environments/environment';
import { CropperConfig } from './cropper.interface';

@Component({
  selector: "app-cropper",
  template: `
    <div *ngIf="!field?.croppOptions" class="message-box warning">
        Missing configuration for <strong>CropperComponent</strong>
    </div>
    <div *ngIf="field?.croppOptions">
        <span class="mat-title" fxLayoutAlign="center" style="text-align: center;">{{ field.label }}</span>
        <div fxLayoutAlign="center" style="text-align: center; display: block; margin-left: auto; margin-right: auto;">
            <div *ngIf="croppedImage" [ngStyle]="{'background-image': 'url('+croppedImage+')'}"
                style="background-size: cover; height: 50px; width: 50px; border-radius: 30px; margin-bottom: 15px;">
            </div>
        </div>
        <div fxLayoutAlign="center">
            <image-cropper *ngIf="imageChangedEvent" style="height: 100%;" [imageChangedEvent]="imageChangedEvent" 
                [backgroundColor]="options.backgroundColor" [resizeToWidth]="options.resize[0]" [resizeToHeight]="options.resize[1]" [cropperMinWidth]="options.min[0]"
                [cropperMinHeight]="options.resize[1]" [aspectRatio]="3/2" [maintainAspectRatio]="true" format="png" (imageCropped)="imageCropped($event)">
            </image-cropper>
        </div>
        <img *ngIf="!imageChangedEvent"
                style="display: block; margin-left: auto; margin-right: auto; height: 100%;"
                src="{{(options.id != null) ? options.fileRoute + (options.id | hashId) : options.defaultImage }}" />
        <div class="px-16 my-8" fxLayout="row" fxLayoutAlign="space-between center" style="text-align: center;">
            <a (click)="fileInput.click()" mat-buttoncolor="accent" style="width: 100%;">
                <mat-icon class="s-16">add_a_photo</mat-icon>
                <span> Cambiar </span>
                <input #fileInput type="file" (change)="fileChangeEvent($event)"style="display:none;" />
            </a>
        </div>
    </div>
`,
  styles: []
})
export class CropperComponent implements OnInit {
    field: FieldConfig;
    group: FormGroup;
    constructor() {}
    ngOnInit() {
        this.options = this.field?.croppOptions;
        if(this.options){
            this.options.id = this.options?.id || null;
            this.options.backgroundColor = this.options?.backgroundColor || '#148999';
            this.options.resize = this.options?.resize || [100,100];
            this.options.min = this.options?.min || [100,100];
            this.options.aspect = this.options?.aspect || '4/4';
            this.options.mantainAspect = this.options?.mantainAspect || true;
            this.options.fileRoute = this.options?.fileRoute || '';
            this.options.defaultImage = this.options?.defaultImage || 'assets/images/avatars/profile.jpg';
        }
    }

    imageChangedEvent: any = '';
    croppedImage: any = '';
    apiUrl: string = environment.apiUrl;
    options: CropperConfig;
    
    fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
    }

    imageCropped(event: ImageCroppedEvent) {
        this.croppedImage = event.base64;
        this.group.controls[this.field.name].setValue(event.base64);
    }
}
