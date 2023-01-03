import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule, FuseSidebarModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsBloqueoPantallaComponent } from "./bloqueo-pantalla.component";

@NgModule({
    declarations: [
        PixvsBloqueoPantallaComponent
    ],
    imports: [
        CommonModule,
		RouterModule,

        MatProgressSpinnerModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule
    ],
    exports: [
        PixvsBloqueoPantallaComponent
    ]
})
export class PixvsBloqueoPantallaModule {
}
