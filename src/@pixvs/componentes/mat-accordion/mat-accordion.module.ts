import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from "@angular/material/icon";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsMatSelectModule } from "../mat-select-search/pixvs-mat-select.module";
import { PixvsMatAccordionComponent } from './mat-accordion.component';

@NgModule({
    declarations: [
		PixvsMatAccordionComponent
    ],
    imports: [
        CommonModule,
		RouterModule,
		
		MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatTooltipModule,

		TranslateModule,
		
		PixvsMatSelectModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
      PixvsMatAccordionComponent
    ]
})
export class PixvsMatAccordionModule {
}
