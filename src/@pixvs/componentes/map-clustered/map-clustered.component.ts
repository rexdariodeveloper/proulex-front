import { Component, Input, OnInit } from '@angular/core';
import { MouseEvent } from '@agm/core';
import { MapConfig, MapMarker } from '@models/map-clustered';
import { MapIconPipe } from '@fuse/pipes/map-icon.pipe';

@Component({
  selector: 'map-clustered',
  templateUrl: './map-clustered.component.html',
  styleUrls: [ './map-clustered.component.scss' ]
})
export class MapClusteredComponent  implements OnInit {

  @Input('mapConfig') config: MapConfig;
  @Input('data') data: MapMarker[];

  mapDefaults: MapConfig = {
    latitude: 51.673858,
    longitude: 7.815982,
    zoom: 5,
    fullscreen: true,
    maxZoom: 20,
    minZoom: 4,
    zoomControl: true
  };

  mapData: MapMarker[];

    /*constructor(
        private mapIcon: MapIconPipe
    ) {
    }*/

  ngOnInit(){
    //Set values from @Input for map
    this.mapDefaults.latitude = this.config.latitude;
    this.mapDefaults.longitude = this.config.longitude;
    this.mapDefaults.zoom = this.config.zoom;
    this.mapDefaults.fullscreen = this.config.fullscreen? this.config.fullscreen : this.mapDefaults.fullscreen;
    this.mapDefaults.maxZoom = this.config.maxZoom? this.config.maxZoom : this.mapDefaults.maxZoom;
    this.mapDefaults.minZoom = this.config.minZoom? this.config.minZoom : this.mapDefaults.minZoom;
    this.mapDefaults.zoomControl = this.config.zoomControl? this.config.zoomControl : this.mapDefaults.zoomControl;

    //Get markers data from @Input
    this.mapData = this.data;
  }

  setData(data){
    this.mapData = data;
  }
  
}