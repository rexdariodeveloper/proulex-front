import { ArchivoProjection } from "@models/archivo";

export class CXPSolicitudPagoRHBecarioDocumento{
    public id: number;
    public cpxSolicitudPagoRhId: number;
    public archivoId: number;
}

export class CXPSolicitudPagoRHBecarioDocumentoEditarProjection {
    public id: number;
    public cpxSolicitudPagoRhId: number;
    public archivo: ArchivoProjection;
}