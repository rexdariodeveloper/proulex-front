

export class ArchivoEstructuraCarpeta {

	id?: number;
    nombreCarpeta?: string;
    descripcion?: string;
    estructuraReferenciaId?: number;
    archivoEstructuraCarpeta?: ArchivoEstructuraCarpeta;
    activo?: boolean;
    fechaCreacion?: Date;
    creadoPorId?: number;

}

export class ArchivoEstructuraCarpetaProjection {

	nombreCarpeta?: string;
    archivoEstructuraCarpeta?: ArchivoEstructuraCarpetaProjection;

}