import { ControlMaestroMultipleComboProjection } from '@models/control-maestro-multiple';
import { Usuario, UsuarioComboProjection } from '@models/usuario';
import { PuestoHabilidadResponsabilidad } from '@models/puesto-habilidad-responsabilidad';

export class PuestoEditarProjection{
    public id?: number;
    public codigo?: string;
	public nombre?: string;
    public descripcion?: string;
    public proposito?: string;
    public observaciones?: string;
    public estadoPuesto?: ControlMaestroMultipleComboProjection;
    public estadoPuestoId?: number;
    public fechaCreacion?: Date;
	public fechaModificacion?: Date;
    public habilidadesResponsabilidades?: PuestoHabilidadResponsabilidad[];
}

export class PuestoComboProjection{
    public id?: number;
    public codigo?: string;
	public nombre?: string;
    public codigoNombre?: string;
}

export class PuestoComboContratosProjection{
    public id?: number;
    public codigo?: string;
	public nombre?: string;
    public habilidadesResponsabilidades?: PuestoHabilidadResponsabilidad[];
}



export class PuestoListadoProjection{
    public id?: number;
    public codigo?: string;
	public nombre?: string;
    public descripcion?: string;
    public proposito?: string;
    public observaciones?: string;
    public estadoPuesto?: ControlMaestroMultipleComboProjection;
}