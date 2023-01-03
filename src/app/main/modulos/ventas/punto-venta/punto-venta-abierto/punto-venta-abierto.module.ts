import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { FuseConfirmDialogModule, FuseHighlightModule } from '@fuse/components';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { PixvsMatSelectModule } from '@pixvs/componentes/mat-select-search/pixvs-mat-select.module';
import { TranslateModule } from '@ngx-translate/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { UtilsModule } from '@app/main/utils/utils.module';
import { PuntoVentaAbiertoComponent } from './punto-venta-abierto.component';
import { PuntoVentaAbiertoService } from './punto-venta-abierto.service';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatRippleModule } from '@angular/material/core';
import { PuntoVentaDetalleDialogComponent } from './dialogs/detalle/detalle.dialog';
import { PixvsBloqueoPantallaModule } from '@pixvs/componentes/bloqueo-pantalla/bloqueo-pantalla.module';
import { PuntoVentaAlumnoDialogComponent } from './dialogs/alumno/alumno.dialog';
import { ArraySubdividirPipe } from '@app/main/utils/pipes/array-subdividir.pipe';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PuntoVentaSumaTotalPipe } from './pipes/suma-total.pipe';
import { PuntoVentaSumaSubtotalPipe } from './pipes/suma-subtotal.pipe';
import { PuntoVentaSumaDescuentoPipe } from './pipes/suma-descuento.pipe';
import { PuntoVentaSumaIVAPipe } from './pipes/suma-iva.pipe';
import { PuntoVentaSumaIEPSPipe } from './pipes/suma-ieps.pipe';
import { PixvsCalculadoraModule } from '@pixvs/componentes/calculadora/calculadora.module';
import { PVArticulosPipe } from './pipes/articulos.pipe';
import { PVGruposPipe } from './pipes/grupos.pipe';
import { PVInicioPipe } from './pipes/inicio.pipe';
import { PVProgramasPipe } from './pipes/programas.pipe';
import { PVModalidadesPipe } from './pipes/modalidades.pipe';
import { PVCategoriasPipe } from './pipes/categorias.pipe';
import { PVSubcategoriasPipe } from './pipes/subcategorias.pipe';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatSelectModule } from '@angular/material/select';
import { AlumnosReinscripcionesCountPipe } from './pipes/alumnos-reinscripciones-count.pipe';
import { PuntoVentaEditarReinscripcionDialogComponent } from './dialogs/editar-reinscripcion/editar-reinscripcion.dialog';
import { PuntoVentaAlumnoSinGrupoDialogComponent } from './dialogs/alumno-sin-grupo/alumno-sin-grupo.dialog';
import { PuntoVentaSeleccionarLocalidadDialogComponent } from './dialogs/seleccionar-localidad/seleccionar-localidad.dialog';
import { PuntoVentaCartaCompromisoDialogComponent } from './dialogs/carta-compromiso/carta-compromiso.dialog';
import { PuntoVentaCobroExitosoDialogComponent } from './dialogs/cobro-exitoso/cobro-exitoso.dialog';
import { PuntoVentaCerrarTurnoDialogComponent } from './dialogs/cerrar-turno/cerrar-turno.dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FechaHistorialPipe } from './pipes/fecha-historial.pipe';
import { MatBadgeModule } from '@angular/material/badge';
import { PVTiposGruposPipe } from './pipes/tipos-grupos.pipe';
import { PVNivelesPipe } from './pipes/niveles.pipe';
import { PuntoVentaDescuentoUsuarioDialogComponent } from './dialogs/descuento-usuario/descuento-usuario.dialog';
import { PuntoVentaPCPComponent } from './componentes/pcp/pcp.component';
import { PuntoVentaBecasProulexComponent } from './componentes/becas-proulex/becas-proulex.component';
import { PuntoVentaInCompanyClientesComponent } from './componentes/in-company-clientes/in-company-clientes.component';
import { PVInCompanyClientesPipe } from './pipes/in-company-clientes.pipe';
import { PuntoVentaInCompanyGruposComponent } from './componentes/in-company-grupos/in-company-grupos.component';
import { PVInCompanyGruposPipe } from './pipes/in-company-grupos.pipe';
import { PuntoVentaValesCertificacionComponent } from './componentes/vales-certificacion/vales-certificacion.component';
import { PuntoVentaAcademyGruposComponent } from './componentes/academy/academy-grupos.component';

const routes = [
    {
        path: 'punto-venta/abierto',
        component: PuntoVentaAbiertoComponent,
        resolve: {
            data: PuntoVentaAbiertoService,
        },
        data: { url: '/api/v1/punto-venta/listados/' }
    }
];

@NgModule({
    declarations: [
        PuntoVentaAbiertoComponent,
        PuntoVentaPCPComponent,
        PuntoVentaBecasProulexComponent,
        PuntoVentaValesCertificacionComponent,

        PuntoVentaDetalleDialogComponent,
        PuntoVentaAlumnoDialogComponent,
        PuntoVentaEditarReinscripcionDialogComponent,
        PuntoVentaAlumnoSinGrupoDialogComponent,
        PuntoVentaSeleccionarLocalidadDialogComponent,
        PuntoVentaCartaCompromisoDialogComponent,
        PuntoVentaCobroExitosoDialogComponent,
        PuntoVentaCerrarTurnoDialogComponent,
        PuntoVentaDescuentoUsuarioDialogComponent,
        PuntoVentaInCompanyClientesComponent,
        PuntoVentaInCompanyGruposComponent,
        PuntoVentaAcademyGruposComponent,

        ArraySubdividirPipe,
        PuntoVentaSumaTotalPipe,
        PuntoVentaSumaSubtotalPipe,
        PuntoVentaSumaDescuentoPipe,
        PuntoVentaSumaIVAPipe,
        PuntoVentaSumaIEPSPipe,
        PVArticulosPipe,
        PVGruposPipe,
        PVInicioPipe,
        PVProgramasPipe,
        PVModalidadesPipe,
        PVCategoriasPipe,
        PVSubcategoriasPipe,
        AlumnosReinscripcionesCountPipe,
        FechaHistorialPipe,
        PVTiposGruposPipe,
        PVNivelesPipe,
        PVInCompanyClientesPipe,
        PVInCompanyGruposPipe
    ],
    imports: [
        RouterModule.forChild(routes),

        MatIconModule,
        MatButtonModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatMenuModule,
        MatTooltipModule,
        MatProgressBarModule,
        MatCardModule,
        MatTableModule,
        MatPaginatorModule,
        MatToolbarModule,
        MatRippleModule,
        MatCheckboxModule,
        ScrollingModule,
        MatSelectModule,
        MatDatepickerModule,
        MatBadgeModule,

        PixvsMatSelectModule,
        PixvsBloqueoPantallaModule,
        PixvsCalculadoraModule,

        TranslateModule,
        UtilsModule,

        FuseSharedModule,
        FuseHighlightModule,
        FuseConfirmDialogModule

    ],
    providers: [
        PuntoVentaAbiertoService
    ],
	entryComponents: [
    ]
})
export class PuntoVentaAbiertoModule {
}