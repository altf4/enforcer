import {expect, test} from '@jest/globals';
import {Coord, hasDisallowedCStickCoords} from '../index';

test('Should pass check for disallowed C-Stick values', () => {
    var coords: Coord[] = []
    var coord = new Coord() 
    coord.x = 0
    coord.y = 0
    coords.push(coord)
    coord = new Coord() 
    coord.x = 1
    coord.y = 1
    coords.push(coord)
    
    const result = hasDisallowedCStickCoords(coords);
    expect(result).toEqual(false);
});

test('Should trigger check for disallowed C-Stick values', () => {
    var coords: Coord[] = []
    var coord = new Coord() 
    coord.x = 0.8
    coord.y = 0
    coords.push(coord)
    
    const result = hasDisallowedCStickCoords(coords);
    expect(result).toEqual(true);
});

test('Should trigger check for disallowed C-Stick values', () => {
    var coords: Coord[] = []
    var coord = new Coord() 
    coord.x = 0.6625
    coord.y = 0
    coords.push(coord)
    
    const result = hasDisallowedCStickCoords(coords);
    expect(result).toEqual(true);
});