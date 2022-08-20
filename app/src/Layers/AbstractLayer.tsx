import { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";

export abstract class AbstractLayer<T extends Geometry> {
  source: VectorSource<T>;
  layer: VectorLayer<VectorSource<T>>;

  abstract getStyle(feature: FeatureLike, resolution: number): Style;

  abstract draw();
}
