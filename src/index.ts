export {hasDisallowedCStickCoords} from './disallowed_analog_values'

export class Coord {
    x: number
    y: number

    constructor() {
      this.x = 0
      this.y = 0
    }
}

export enum JoystickRegion {
    DZ = 0,
    NE = 1,
    SE = 2,
    SW = 3,
    NW = 4,
    N = 5,
    E = 6,
    S = 7,
    W = 8,
  }

export function getJoystickRegion(x: number, y: number): JoystickRegion {
    let region = JoystickRegion.DZ;
  
    if (x >= 0.2875 && y >= 0.2875) {
      region = JoystickRegion.NE;
    } else if (x >= 0.2875 && y <= -0.2875) {
      region = JoystickRegion.SE;
    } else if (x <= -0.2875 && y <= -0.2875) {
      region = JoystickRegion.SW;
    } else if (x <= -0.2875 && y >= 0.2875) {
      region = JoystickRegion.NW;
    } else if (y >= 0.2875) {
      region = JoystickRegion.N;
    } else if (x >= 0.2875) {
      region = JoystickRegion.E;
    } else if (y <= -0.2875) {
      region = JoystickRegion.S;
    } else if (x <= -0.2875) {
      region = JoystickRegion.W;
    }
  
    return region;
  }