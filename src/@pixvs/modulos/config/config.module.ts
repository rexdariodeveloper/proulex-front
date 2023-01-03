import { NgModule } from '@angular/core';
import { UsuariosListadoModule } from './usuarios/usuarios.module';
import { RolesListadoModule } from './roles/roles.module';
import { MenuListadosGeneralesListadoModule } from './menu-listados-generales/menu-listados-generales.module';
import { AlertasModule } from './alertas/alertas.module';
import { DepartamentosModule } from './departamentos/departamentos.module';
import { ParametrosEmpresaModule } from './parametros-empresa/parametros-empresa.module';


@NgModule({
    imports: [
        UsuariosListadoModule,
		RolesListadoModule,
        MenuListadosGeneralesListadoModule,
        AlertasModule,
        DepartamentosModule,
        ParametrosEmpresaModule
    ]
})
export class ConfigModule {
}
