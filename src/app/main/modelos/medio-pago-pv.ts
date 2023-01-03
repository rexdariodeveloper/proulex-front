import { Usuario } from "@models/usuario";

export class MedioPagoPV {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public activo?: boolean;
    public fechaCreacion?: any;
    public fechaModificacion?: any;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;

}

export class MedioPagoPVComboProjection {

    public id?: number;
    public codigo?: string;
    public nombre?: string;

}