import { FuseConfig } from '@fuse/types';

/**
 * Default Fuse Configuration
 *
 * You can edit these options to change the default options. All these options also can be
 * changed per component basis. See `app/main/pages/authentication/login/login.component.ts`
 * constructor method to learn more about changing these options per component basis.
 */

/*
    theme-blue-light
    theme-indigo
    theme-red-light
    theme-green-light
    theme-green-light-2
    theme-deep-orange-light
    theme-blue-gray-dark
    theme-blue-dark
    theme-red-dark 
*/

//Escoger el Tema para la aplicación
export const fuseTheme = 'theme-green-light'

export const fuseConfig: FuseConfig = {
    // Color themes can be defined in src/app/app.theme.scss
    colorTheme: fuseTheme,
    customScrollbars: true,
    customBackground: false,
    layout: {
        style: 'vertical-layout-1',
        width: 'fullwidth',
        navbar: {
            primaryBackground: (fuseTheme.includes('dark') ? 'accent-900' : 'grey-200' ),
            secondaryBackground: 'accent-800',
            folded: false,
            hidden: false,
            position: 'left',
            variant: 'vertical-style-1'
        },
        toolbar: {
            customBackgroundColor: true,
            background: 'accent-800',
            hidden: false,
            position: 'below-static'
        },
        footer: {
            customBackgroundColor: true,
            background: 'accent-800',
            hidden: false,
            position: 'below-fixed'
        },
        sidepanel: {
            hidden: false,
            position: 'right'
        }
    }
};
