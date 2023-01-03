export class SucursalImpresoraFamilia {
    public id: number;
    public sucursalId: number;
    public familiaId: number;
    public tipoImpresoraId: number;
    public ip: string;
    public fechaCreacion: Date;
    public fechaModificacion: Date;

    constructor(datos){
        this.id = datos.id || null;
        this.sucursalId = datos.sucursalId || null;
        this.familiaId = datos.familiaId || null;
        this.tipoImpresoraId = datos.tipoImpresoraId || null;
        this.ip = datos.ip || null;
        this.fechaCreacion = datos.fechaCreacion || null;
        this.fechaModificacion = datos.fechaModificacion || null;
    }
}

export class SucursalImpresoraFamiliaEditarProjection{
    public id: number;
    public sucursalId: number;
    public familiaId: number;
    public tipoImpresoraId: number;
    public ip?: string;
}