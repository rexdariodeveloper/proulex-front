export class ProgramaIdiomaCertificacionValeListadoProjection{
	public id?: number;
    public codigo?: string;
    public alumno?: string;
    public sede?: string;
    public curso?: string;
    public nivel?: number;
    public certificacion?: string;
    public descuento?: string;
    public vigencia?: string;
    public costoFinal?: number;
    public estatus?: string;
}

export class ProgramaIdiomaCertificacionValeListadoPVProjection{
	public id?: number;
    public alumnoCodigo?: string;
    public alumnoPrimerApellido?: string;
    public alumnoSegundoApellido?: string;
    public curso?: string;
    public certificacion?: string;
    public descuento?: number;
}