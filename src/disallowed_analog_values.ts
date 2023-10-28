import {Coord} from './index';

export function hasDisallowedCStickCoords(coordinates: Coord[]): boolean {
    for (var coordinate of coordinates) {   
        if (Math.abs(coordinate.x) == 0.8) {
            return true
        }
        if (Math.abs(coordinate.x) == 0.6625) {
            return true
        }
    }

    return false
}