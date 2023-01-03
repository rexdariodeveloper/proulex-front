import { Usuario } from '@models/usuario';
import { ControlMaestroMultiple, ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { UnidadMedida, UnidadMedidaComboProjection } from './unidad-medida';
import { ProgramaComboProjection } from './programa';
import { ProgramaIdiomaCertificacion, ProgramaIdiomaCertificacionEditarProjection } from './programa-idioma-certificacion';
import { ProgramaIdiomaLibroMaterialEditarProjection, ProgramaIdiomaLibroMaterial } from './programa-idioma-libro-material';
import { ProgramaIdiomaModalidad, ProgramaIdiomaModalidadEditarProjection } from './programa-idioma-modalidad';
import { ProgramaIdiomaSucursalEditarProjection, ProgramaIdiomaSucursal } from './programa-idioma-sucursal';
import { ProgramaIdiomaNivel, ProgramaIdiomaNivelEditarProjection } from './programa-idioma-nivel';
import { Tabulador, TabuladorComboProjection } from './tabulador';

export class ProgramaIdioma {
	public id: number;
    public codigo?: string;
    public nombre?: string;
    public programa: ProgramaIdioma;
    public programaId: number;
    public idioma: ControlMaestroMultiple;
    public idiomaId: number;
    public tipoWorkshopId?: number;
    public tipoWorkshop?: ControlMaestroMultipleComboProjection;
    public plataforma: ControlMaestroMultiple;
    public plataformaId: number;
    public horasTotales: number;
    public numeroNiveles: number;
    public calificacionMinima: number;
    public mcer: string;
    public unidadMedida: UnidadMedida;
    public unidadMedidaId: number;
    public clave: string;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
    public examenEvaluacion: boolean;
    public descripcion: string;
    public iva: number;
    public ivaExento: boolean;
    public faltasPermitidas: number;
    public ieps: number;
    public cuotaFija: boolean;
    public activo: boolean;
    public certificaciones: ProgramaIdiomaCertificacion[];
    public librosMateriales: ProgramaIdiomaLibroMaterial[];
    public modalidades: ProgramaIdiomaModalidad[];
    public sucursales: ProgramaIdiomaSucursal[];
    public niveles?: ProgramaIdiomaNivel[];
    public esJobs?: boolean;
    public esJobsSems?: boolean;
    public esAcademy?: boolean;
    public tabulador?: Tabulador;
    public objetoImpuesto?: ControlMaestroMultiple;
    public agruparListadosPreciosPorTipoGrupo?: boolean;
}

export class ProgramaIdiomaEditarProjection {
	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public programaId?: number;
    public programa?: ProgramaComboProjection;
    public tipoWorkshopId?: number;
    public tipoWorkshop?: ControlMaestroMultipleComboProjection;
    public idioma?: ControlMaestroMultipleComboProjection;
    public idiomaId?: number;
    public plataforma?: ControlMaestroMultipleComboProjection;
    public plataformaId?: number;
    public horasTotales?: number;
    public numeroNiveles?: number;
    public calificacionMinima?: number;
    public mcer?: string;
    public unidadMedida?: UnidadMedidaComboProjection;
    public unidadMedidaId: number;
    public clave?: string;
    public examenEvaluacion?: boolean;
    public descripcion?: string;
    public iva?: number;
    public ivaExento?: boolean;
    public ieps?: number;
    public cuotaFija?: boolean;
    public faltasPermitidas?: number;
    public activo?: boolean;
    public fechaModificacion?: Date;
    public certificaciones?: ProgramaIdiomaCertificacionEditarProjection[];
    public librosMateriales?: ProgramaIdiomaLibroMaterialEditarProjection[];
    public modalidades?: ProgramaIdiomaModalidadEditarProjection[];
    public sucursales?: ProgramaIdiomaSucursalEditarProjection[];
    public niveles?: ProgramaIdiomaNivelEditarProjection[];
    public esJobs?: boolean;
    public esJobsSems?: boolean;
    public esPcp?: boolean;
    public esAcademy?: boolean;
    public tabulador?: TabuladorComboProjection;
    public objetoImpuesto?: ControlMaestroMultipleComboProjection;
    public objetoImpuestoId?: number;
    public agruparListadosPreciosPorTipoGrupo?: boolean;
}

export class ProgramaIdiomaComboProjection{
    public id?: number;
    public nombre?: string;
    public programaId?: number;
    public idiomaId?: number;
    public codigo?: string;
    public numeroNiveles?: number;
    public calificacionMinima?: number;
    public faltasPermitidas?: number;
    public plataforma?: ControlMaestroMultipleComboProjection;
    public idioma?: ControlMaestroMultipleComboProjection;
    public esJobs?: boolean;
    public esJobsSems?: boolean;
    public esPcp?: boolean;
    public esAcademy?: boolean;
}

export class ProgramaIdiomaComboSimpleProjection{
    public id?: number;
    public nombre?: string;
}

export class ProgramaIdiomaComboDescuentoCertificacionProjection{
    public id?: number;
    public idioma?: string;
    public numeroNiveles?: number;
}