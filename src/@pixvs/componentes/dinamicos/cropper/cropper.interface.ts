export interface CropperConfig {
    id?: number | string;
    backgroundColor?: string;
    resize?: number[];
    min?: number[];
    aspect?: string;
    mantainAspect?: boolean;
    fileRoute?: string;
    defaultImage?: string;
}