import { NgModule } from "@angular/core";
import { AgmCoreModule } from "@agm/core";
import { environment } from '@environments/environment';
import { AgmJsMarkerClustererModule } from '@agm/js-marker-clusterer';
import { MapClusteredComponent } from './map-clustered.component'
//import { BrowserModule } from "@angular/platform-browser";
import { FuseSharedModule } from "@fuse/shared.module";
//import { FusePipesModule } from "@fuse/pipes/pipes.module";
//import { MapIconPipe } from "@fuse/pipes/map-icon.pipe";


@NgModule({
    declarations: [
        MapClusteredComponent
    ],
    providers: [
        FuseSharedModule
    ],
    imports:[
        //BrowserModule,
        AgmCoreModule.forRoot({language: 'es', apiKey: environment.apiKeyMaps, libraries: ['places', 'drawing', 'geometry']}),
        AgmJsMarkerClustererModule,
        FuseSharedModule,
    ],
    exports: [
        MapClusteredComponent
    ],
})

export class MapClusteredModule
{
    
}