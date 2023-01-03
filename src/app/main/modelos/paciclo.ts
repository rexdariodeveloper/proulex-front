import { Usuario } from "@models/usuario";

export class PACiclo {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: any;
    public fechaFin?: any;
    public activo?: boolean;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public fechaCreacion?: any;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: any;

}

export class PACicloComboProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;

}

export class PACicloListadoProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: any;
    public fechaFin?: any;
    public fechaModificacion?: any;
    public fecha?: string;

}

export class PACicloFechaProjection {

	public id?: number;
    public codigo?: string;
    public nombre?: string;
    public fechaInicio?: any;
    public fechaFin?: any;

}