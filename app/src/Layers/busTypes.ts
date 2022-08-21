import { Style, Icon } from "ol/style";
import Bus from "../static/bus.png";
import BlueBus from "../static/bus_blue.png";
import LongBus from "../static/bus_long.png";
import OldBus from "../static/bus_old.png";
import PrideBus from "../static/bus_pride.png";
import RightBus from "../static/right-bus.png";
import RightBlueBus from "../static/right-bus_blue.png";
import RightLongBus from "../static/right-bus_long.png";
import RightOldBus from "../static/right-bus_old.png";
import RightPrideBus from "../static/right-bus_pride.png";

export const busTypes = {
  new: {
    prob: 63,
    left: new Style({ image: new Icon({ src: Bus }) }),
    right: new Style({ image: new Icon({ src: RightBus }) }),
  },
  old: {
    prob: 23,
    left: new Style({ image: new Icon({ src: OldBus }) }),
    right: new Style({ image: new Icon({ src: RightOldBus }) }),
  },
  long: {
    prob: 8,
    left: new Style({ image: new Icon({ src: LongBus }) }),
    right: new Style({ image: new Icon({ src: RightLongBus }) }),
  },
  blue: {
    prob: 5,
    left: new Style({ image: new Icon({ src: BlueBus }) }),
    right: new Style({ image: new Icon({ src: RightBlueBus }) }),
  },
  pride: {
    prob: 1,
    left: new Style({ image: new Icon({ src: PrideBus }) }),
    right: new Style({ image: new Icon({ src: RightPrideBus }) }),
  },
};
