import Bus from "./static/bus.png";
import RightBus from "./static/right-bus.png";
import OldBus from "./static/bus_old.png";
import RightOldBus from "./static/right-bus_old.png";
import LongBus from "./static/bus_long.png";
import RightLongBus from "./static/right-bus_long.png";
import BlueBus from "./static/bus_blue.png";
import RightBlueBus from "./static/right-bus_blue.png";
import PrideBus from "./static/bus_pride.png";
import RightPrideBus from "./static/right-bus_pride.png";
import { Style, Icon } from "ol/style";

const busTypes = {
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

function hashCode(value: string) {
  var hash = 0,
    i = 0,
    len = value.length;
  while (i < len) {
    hash = ((hash << 5) - hash + value.charCodeAt(i++)) << 0;
  }
  return hash;
}

export function getBusStyle(properties: { [x: string]: any }) {
  const roll = Math.abs(hashCode(properties.tripId) % 100);
  let cumsum = 0;
  const options = Object.keys(busTypes);
  let option = options.pop();
  while (roll > cumsum) {
    option = options.pop();
    cumsum += busTypes[option].prob;
  }
  let rotation = (2 * Math.PI - properties.orientation) % (2 * Math.PI);
  let style;
  if (rotation >= Math.PI / 2 && rotation <= (3 * Math.PI) / 2) {
    style = busTypes[option].right.clone();
    rotation += Math.PI;
  } else {
    style = busTypes[option].left.clone();
  }

  const image = style.getImage();
  image.setRotation(rotation);
  return style;
}
