export interface MapConfig {
    latitude     : number,
    longitude    : number,
    zoom         : number,
    fullscreen?  : boolean,
    maxZoom?     : number,
    minZoom?     : number,
    zoomControl? : boolean
}

export interface MapMarker {
    latitude    : number,
    longitude   : number,
    visible     : boolean,

    clickable?  : boolean,
    draggable?  : boolean,

    title?      : string,
    label?      : string,
    iconUrl?    : string,
    info?       : string
}