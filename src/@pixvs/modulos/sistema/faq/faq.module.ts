import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { MatExpansionModule } from '@angular/material/expansion';

import { FaqService } from '@pixvs/modulos/sistema/faq/faq.service';
import { FaqComponent } from '@pixvs/modulos/sistema/faq/faq.component';
import { MatIconModule } from '@angular/material/icon';

const routes = [
    {
        path: 'faq',
        component: FaqComponent,
        resolve: {
            faq: FaqService
        }
    }
];

@NgModule({
    declarations: [
        FaqComponent
    ],
    imports: [
        RouterModule.forChild(routes),

        MatExpansionModule,
        MatIconModule,

        FuseSharedModule
    ],
    providers: [
        FaqService
    ]
})
export class FaqModule {
}
