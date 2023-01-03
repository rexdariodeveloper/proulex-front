import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { Component, Inject } from '@angular/core';

@Component({
    selector: 'pixvs-snackbar',
    template: `<span><mat-icon class="pixvs-snackbar-icon">{{ data?.icon }}</mat-icon>{{ data?.message }}</span>`,
    styles: [`
    .pixvs-snackbar-icon {
        font-size: 16px;
        height: 16px;
        min-height: 16px;
        vertical-align: text-top;
        margin-right: 5px;
        color: cornflowerblue;
    }
  `]
})
export class IconSnackBarComponent {
    constructor(@Inject(MAT_SNACK_BAR_DATA) public data: any) { }
}