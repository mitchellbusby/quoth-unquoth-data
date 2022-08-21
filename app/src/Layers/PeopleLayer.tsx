import Feature, { FeatureLike } from "ol/Feature";
import Geometry from "ol/geom/Geometry";
import { Circle, Fill, Style } from "ol/style";
import { AbstractLayer } from "./AbstractLayer";

export class PeopleLayer extends AbstractLayer<Geometry> {
  getStyle(feature: FeatureLike, resolution: number): Style {
    return new Style({
      image: new Circle({
        radius: 4,
        fill: new Fill({ color: "red" }),
      }),
    });
  }

  getFeatures(): Feature<Geometry>[] {
    return [];
  }
}
