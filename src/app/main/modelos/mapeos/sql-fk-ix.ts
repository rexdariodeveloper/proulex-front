export class SqlFkIx {

    static FK_IX: any = {
        CHK_ALU_CMM_CentroUniversitarioJOBSId: 'El centro universitario es obligatorio para el programa JOBS',
        CHK_ALU_CMM_CarreraJOBSId: 'La carrera es obligatoria para el programa JOBS',
        CHK_ALU_CMM_PreparatoriaJOBSId: 'La preparatoria es obligatoria para el programa JOBS SEMS',
        IX_ALU_CURP: 'Ya existe un alumno con la CURP ingresada',
        IX_ALU_CodigoAlumnoUDG: 'Ya existe un alumno con el código ingresado',
        IX_AlumnoAsistencia: 'Ya existen asistencias registradas para la fecha seleccionada',
        TABC_UNIQUE:'No pueden existir dos cursos en distintos tabuladores',
        IX_TAB_DetalleTabuladores: 'Esta categoria ya se encuentra agregada',
        UNQ_AFAM_Prefijo:'Ya existe una familia con este prefijo',
        IX_SCC_SUC_SucursalId_SCC_USU_UsuarioAbreId: 'Ya existe un corte abierto con este usuario y misma sucursal',
        UNQ_SCC_Codigo: 'Ya existe un corte con el mismo código',
        UNQ_PUE_Codigo: 'Ya existe un puesto con el mismo código'
        /*FK_NOMBRE: 'Este es un mensaje Personalizado',*/   
    }



    public static encuentraErrorPersonalizado(mensaje: string): string {

        for (let key in this.FK_IX) {
            if (mensaje.includes(key)) {

                return this.FK_IX[key];
            }
        }

        return null;
    }

}