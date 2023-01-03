import { FuseNavigation } from '@fuse/types';

export const navigation: FuseNavigation[] = [
    {
        id: 0,
        title: 'Inicio',
        translate: 'NAV.INICIO',
        type: 'item',
        icon: 'home',
        url: '/inicio'
    }
];

export const navigationGuia: FuseNavigation[] = [
    {
        id: 0,
        title: 'Pixveador',
        icon: 'import_contacts',
        type: 'group',
        children: [
            {
                id: 0,
                title: 'Generador de Código',
                type: 'item',
                icon: 'home',
                url: '/pixveador/generador',
                children: []
            }
        ]
    },
    {

        id: 0,
        title: 'Documentation',
        icon: 'import_contacts',
        type: 'group',
        children: [
            {
                id: 0,
                title: 'Pixvs',
                type: 'collapsable',
                icon: 'import_contacts',
                children: [
                    {
                        id: 0,
                        title: 'Fichas',
                        type: 'collapsable',
                        icon: 'import_contacts',
                        children: [
                            {
                                id: 0,
                                title: 'Listado',
                                type: 'item',
                                url: '/documentation/pixvs/fichas/listado'
                            },
                            {
                                id: 0,
                                title: 'Detalle',
                                type: 'item',
                                url: '/documentation/pixvs/fichas/detalle'
                            },
                            {
                                id: 0,
                                title: 'Usuarios',
                                type: 'item',
                                url: '/control/usuarios/listado'
                            }
                        ]
                    },
                ]
            },
            {
                id: 0,
                title: 'Changelog',
                type: 'item',
                icon: 'update',
                url: '/documentation/changelog',
                badge: {
                    title: '9.0.0',
                    bg: '#EC0C8E',
                    fg: '#FFFFFF'
                }
            },
            {
                id: 0,
                title: 'Getting Started',
                type: 'collapsable',
                icon: 'import_contacts',
                children: [
                    {
                        id: 0,
                        title: 'Introduction',
                        type: 'item',
                        url: '/documentation/getting-started/introduction'
                    },
                    {
                        id: 0,
                        title: 'Installation',
                        type: 'item',
                        url: '/documentation/getting-started/installation'
                    }
                ]
            },
            {
                id: 0,
                title: 'Working with Fuse',
                type: 'collapsable',
                icon: 'import_contacts',
                children: [
                    {
                        id: 0,
                        title: 'Server',
                        type: 'item',
                        url: '/documentation/working-with-fuse/server'
                    },
                    {
                        id: 0,
                        title: 'Production',
                        type: 'item',
                        url: '/documentation/working-with-fuse/production'
                    },
                    {
                        id: 0,
                        title: 'Directory Structure',
                        type: 'item',
                        url: '/documentation/working-with-fuse/directory-structure'
                    },
                    {
                        id: 0,
                        title: 'Updating Fuse',
                        type: 'item',
                        url: '/documentation/working-with-fuse/updating-fuse'
                    },
                    {
                        id: 0,
                        title: 'Multi Language',
                        type: 'item',
                        url: '/documentation/working-with-fuse/multi-language'
                    },
                    {
                        id: 0,
                        title: 'Material Theming',
                        type: 'item',
                        url: '/documentation/working-with-fuse/material-theming'
                    },
                    {
                        id: 0,
                        title: 'Theme Layouts',
                        type: 'item',
                        url: '/documentation/working-with-fuse/theme-layouts'
                    },
                    {
                        id: 0,
                        title: 'Page Layouts',
                        type: 'item',
                        url: '/documentation/working-with-fuse/page-layouts'
                    }
                ]
            },
            {
                id: 0,
                title: 'Directives',
                type: 'collapsable',
                icon: 'import_contacts',
                children: [
                    {
                        id: 0,
                        title: 'fuseIfOnDom',
                        type: 'item',
                        url: '/documentation/directives/fuse-if-on-dom'
                    },
                    {
                        id: 0,
                        title: 'fuseInnerScroll',
                        type: 'item',
                        url: '/documentation/directives/fuse-inner-scroll'
                    },
                    {
                        id: 0,
                        title: 'fuseMatSidenav',
                        type: 'item',
                        url: '/documentation/directives/fuse-mat-sidenav'
                    },
                    {
                        id: 0,
                        title: 'fusePerfectScrollbar',
                        type: 'item',
                        url: '/documentation/directives/fuse-perfect-scrollbar'
                    }
                ]
            },
            {
                id: 0,
                title: 'Services',
                type: 'collapsable',
                icon: 'import_contacts',
                children: [
                    {
                        id: 0,
                        title: 'Fuse Config',
                        type: 'item',
                        url: '/documentation/services/fuse-config'
                    },
                    {
                        id: 0,
                        title: 'Fuse Splash Screen',
                        type: 'item',
                        url: '/documentation/services/fuse-splash-screen'
                    }
                ]
            }
        ]
    }
];
