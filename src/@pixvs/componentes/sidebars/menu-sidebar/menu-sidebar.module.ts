import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsMenuSidebarComponent } from "./menu-sidebar.component";

@NgModule({
    declarations: [
		PixvsMenuSidebarComponent
    ],
    imports: [
        CommonModule,
		RouterModule,

        MatIconModule,
        MatButtonModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
		PixvsMenuSidebarComponent
    ]
})
export class PixvsMenuSidebarModule {
}
