import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatRippleModule } from "@angular/material/core";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule, FuseSidebarModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsCalculadoraComponent } from "./calculadora.component";

@NgModule({
    declarations: [
        PixvsCalculadoraComponent
    ],
    imports: [
        CommonModule,
		RouterModule,

        MatButtonModule,
        MatRippleModule,
        MatIconModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule
    ],
    exports: [
        PixvsCalculadoraComponent
    ]
})
export class PixvsCalculadoraModule {
}