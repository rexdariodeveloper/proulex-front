export class ClienteContacto {
    
    public id?: number;
    public clienteId?: number;
    public nombre?: string;
    public primerApellido?: string;
    public segundoApellido?: string;
    public departamento?: string;
    public telefono?: string;
    public extension?: string;
    public correoElectronico?: string;
    public horarioAtencion?: string;
    public predeterminado?: boolean;
    public activo?: boolean;
    public fechaCreacion?: Date;
    public fechaModificacion?: Date;
    public creadoPorId?: number;
    public modificadoPorId?: number;
}