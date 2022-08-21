import Feature, { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";

export abstract class AbstractLayer<T extends Geometry> {
  source: VectorSource<T>;
  layer: VectorLayer<VectorSource<T>>;

  constructor() {
    this.source = new VectorSource();
    this.layer = new VectorLayer({
      source: this.source,
      style: this.getStyle,
    });
  }

  abstract getStyle(feature: FeatureLike, resolution: number): Style;
  abstract getFeatures(currentTime?: number): Feature<T>[];

  draw(currentTime?: number) {
    this.source.clear();
    this.source.addFeatures(this.getFeatures(currentTime));
  }
}
