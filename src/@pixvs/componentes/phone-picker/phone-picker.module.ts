import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { RouterModule } from "@angular/router";
import { FuseHighlightModule, FuseSidebarModule } from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { TranslateModule } from "@ngx-translate/core";
import { NgxMaskModule } from "ngx-mask";
import { PixvsPhonePickerComponent } from "./phone-picker.component";
import { PhonePickerTiposPipe } from "./pipes/tipos.pipe";

@NgModule({
    declarations: [
        PixvsPhonePickerComponent,
        
        PhonePickerTiposPipe
    ],
    imports: [
        CommonModule,
		RouterModule,

        MatInputModule,
        MatIconModule,
        MatButtonModule,
        MatMenuModule,
        NgxMaskModule,

        TranslateModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseSidebarModule
    ],
    exports: [
        PixvsPhonePickerComponent
    ]
})
export class PixvsPhonePickerModule {
}
