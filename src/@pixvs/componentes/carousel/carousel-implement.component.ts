import { Component, Inject } from '@angular/core';

import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';
import { fuseAnimations } from '@fuse/animations';
import { environment } from '@environments/environment';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'carousel-implement',
  templateUrl: 'carousel-implement.component.html',
})
export class CarouselImplementComponent {

  constructor(
    public dialogRef: MatDialogRef<CarouselImplementComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {

  }

  ngOnInit(): void {
      console.log(this.data);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

}