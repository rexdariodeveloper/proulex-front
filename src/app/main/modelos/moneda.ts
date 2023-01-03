import { Usuario } from '@models/usuario';

export class Moneda {

    public id?: number;
    public codigo?: string;
    public nombre?: string;
    public simbolo?: string;
    public predeterminada?: boolean;
    public activo?: boolean;
    public sistema?: boolean;
    public fechaCreacion?: Date;
    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
}

export class MonedaComboProjection {

    public id?: number;
    public nombre?: string;
    public simbolo?: string;
    public predeterminada?: boolean;

    public tipoCambioOficial?: number;
}