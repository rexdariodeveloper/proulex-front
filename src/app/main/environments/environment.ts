export const environment_dev = {
    name: 'CUCEA Programación Académica (DEV)',
    production: false,
    hmr: false,
    apiUrl: 'http://localhost:8000',
    hashidSecret: 'local_pass',
	cryptoSecret: 'local_pass',
	noRequiredLogin: false,
    aplicacionAlumnosSIIAU: false,
    linkTerminosCondiciones:'',
    registroPublico:null,
    loginEnlaceExterno: false,
    loginEnlaceExternoTexto: '',
    loginEnlaceExternoLink: '',
    loginSIIAU: false
};

export const environment_prod = {
    name: 'CUCEA Programación Académica',
    production: true,
    hmr: false,
    apiUrl: 'https://api.pa.cucea.pixvs.com',
    hashidSecret: 'local_pass',
	cryptoSecret: 'local_pass',
	noRequiredLogin: false,
    aplicacionAlumnosSIIAU: false,
    linkTerminosCondiciones:'',
    registroPublico:null,
    loginEnlaceExterno: false,
    loginEnlaceExternoTexto: '',
    loginEnlaceExternoLink: '',
    linkTerminosyCondiciones : ''
};

export const environment_hmr = {
    name: 'CUCEA Programación Académica (HMR)',
    production: false,
    hmr: true,
    apiUrl: 'http://localhost:8000',
    hashidSecret: 'local_pass',
	cryptoSecret: 'local_pass',
	noRequiredLogin: false,
    aplicacionAlumnosSIIAU: false,
    linkTerminosCondiciones:'',
    registroPublico:null,
    loginEnlaceExterno: false,
    loginEnlaceExternoTexto: '',
    loginEnlaceExternoLink: '',
    linkTerminosyCondiciones : ''
};

