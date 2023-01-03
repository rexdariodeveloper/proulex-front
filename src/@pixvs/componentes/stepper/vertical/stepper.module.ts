import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule, FuseSidebarModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsStepperVerticalComponent } from "./stepper.component";

@NgModule({
    declarations: [
		PixvsStepperVerticalComponent
    ],
    imports: [
        CommonModule,
		RouterModule,

        MatButtonModule,
        MatIconModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule
    ],
    exports: [
	    PixvsStepperVerticalComponent
    ]
})
export class PixvsStepperVerticalModule {
}
