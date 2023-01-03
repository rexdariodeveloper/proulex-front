import { NgModule } from '@angular/core';
import { PixvsMatTreeComponent } from './pixvs-mat-tree.component';
import { MatTreeModule } from '@angular/material/tree';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CommonModule } from '@angular/common';

@NgModule({
    declarations: [
        PixvsMatTreeComponent
    ],
    imports: [
        CommonModule, 
        
        MatTreeModule,
        MatCheckboxModule,
        MatButtonModule,
        MatIconModule,
        MatTooltipModule,

    ],
    exports: [
        PixvsMatTreeComponent
    ],
})
export class PixvsMatTreeModule {
}
