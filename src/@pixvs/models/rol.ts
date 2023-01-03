import { Usuario } from '@models/usuario';

export class Rol {
    public id: number;
    public nombre: string;
    public activo: boolean = true;

    public creadoPor?: Usuario;
    public creadoPorId?: number;
    public modificadoPor?: Usuario;
    public modificadoPorId?: number;
    public fechaModificacion?: Date;
    public fechaCreacion?: Date;

}

export class RolMenu {
    public id?: number;
    public rolId?: number;
    public nodoId?: number;
    public crear?: boolean;
    public modificar?: boolean;
    public eliminar?: boolean;
}