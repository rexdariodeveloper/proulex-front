import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatBadgeModule } from '@angular/material/badge';

import { FuseSearchBarModule, FuseShortcutsModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';

import { ToolbarComponent } from 'app/layout/components/toolbar/toolbar.component';
import { TranslateModule } from '@ngx-translate/core';
import { LoginService } from '@services/login.service';

@NgModule({
    declarations: [
        ToolbarComponent
    ],
    imports: [
        RouterModule,
        MatButtonModule,
        MatIconModule,
        MatMenuModule,
        MatToolbarModule,
        MatBadgeModule,

        FuseSharedModule,
        FuseSearchBarModule,
        FuseShortcutsModule,

        TranslateModule
    ],
    providers: [
        LoginService
    ],
    exports: [
        ToolbarComponent
    ]
})
export class ToolbarModule {
}
