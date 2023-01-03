import { Usuario } from '@models/usuario';

export class PAModalidad{
	public id: number;
    public codigo: string;
    public nombre: string;
    public horasPorDia: number;
    public diasPorSemana: number;
    public lunes: boolean;
    public martes: boolean;
    public miercoles: boolean;
    public jueves: boolean;
    public viernes: boolean;
    public sabado: boolean;
    public domingo: boolean;
    public activo: boolean;
    public creadoPor: Usuario;
    public creadoPorId: number;
    public fechaCreacion: Date;
    public modificadoPor: Usuario;
    public modificadoPorId: number;
    public fechaModificacion: Date;
}

export class PAModalidadComboProjection{
	public id?: number;
    public nombre?: string;
    public horasPorDia?: number;
    public codigo?: string;
    public color?: string;
    public lunes?: boolean;
    public martes?: boolean;
    public miercoles?: boolean;
    public jueves?: boolean;
    public viernes?: boolean;
    public sabado?: boolean;
    public domingo?: boolean;
}

export class PAModalidadDiasProjection {

	public id?: number;
    public nombre?: string;
    public codigo?: string;
	public diasPorSemana?: number;
    public lunes?: boolean;
    public martes?: boolean;
    public miercoles?: boolean;
    public jueves?: boolean;
    public viernes?: boolean;
    public sabado?: boolean;
    public domingo?: boolean;
    public color?: string;

	public diasSemanaActivos?: boolean[];

}

export class PAModalidadCardProjection {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public imagenId?: number;

}

export class PAModalidadComboSimpleProjection {
    public id?: number;
    public codigo?: string;
    public nombre?: string;
}