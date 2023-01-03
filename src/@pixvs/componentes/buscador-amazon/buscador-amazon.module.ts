import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsMatSelectModule } from "../mat-select-search/pixvs-mat-select.module";
import { PixvsBuscadorAmazonComponent } from "./buscador-amazon.component";

@NgModule({
    declarations: [
		PixvsBuscadorAmazonComponent
    ],
    imports: [
        CommonModule,
		RouterModule,
		
		MatButtonModule,
		MatIconModule,

		TranslateModule,
		
		PixvsMatSelectModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
		PixvsBuscadorAmazonComponent
    ]
})
export class PixvsBuscadorAmazonModule {
}
