import { NgModule } from '@angular/core';

import { ComingSoonModule } from '@pixvs/modulos/sistema/coming-soon/coming-soon.module';
import { Error404Module } from '@pixvs/modulos/sistema/errors/404/error-404.module';
import { Error500Module } from '@pixvs/modulos/sistema/errors/500/error-500.module';
import { MaintenanceModule } from '@pixvs/modulos/sistema/maintenance/maintenence.module';
import { PerfilModule } from '@pixvs/modulos/sistema/perfil/perfil.module';
import { FaqModule } from '@pixvs/modulos/sistema/faq/faq.module';


@NgModule({
    imports: [

        // Coming-soon
        ComingSoonModule,

        // Errors
        Error404Module,
        Error500Module,

        // Maintenance
        MaintenanceModule,

        // Profile
        PerfilModule,

        // Faq
        FaqModule,

    ]
})
export class SistemaModule {

}
