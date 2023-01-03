import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { PixvsYearCalendarComponent } from "./year-calendar.component";

@NgModule({
    declarations: [
		PixvsYearCalendarComponent
    ],
    imports: [
        CommonModule,
		RouterModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule
    ],
    exports: [
		PixvsYearCalendarComponent
    ]
})
export class PixvsYearCalendarModule {
}
