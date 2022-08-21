import Feature, { FeatureLike } from "ol/Feature";
import { Geometry } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import Style from "ol/style/Style";

type FeatureCollection<T extends Geometry> = { [id: string]: Feature<T> };

export abstract class AbstractLayer<T extends Geometry> {
  source: VectorSource<T>;
  layer: VectorLayer<VectorSource<T>>;
  features: FeatureCollection<T>;

  constructor() {
    this.source = new VectorSource();
    this.layer = new VectorLayer({
      source: this.source,
      style: (...params) => this.getStyle(...params),
    });
  }

  abstract getStyle(feature: FeatureLike, resolution: number): Style;
  abstract getFeatures(currentTime?: number): FeatureCollection<T>;

  draw(currentTime?: number) {
    this.source.clear();
    this.features = this.getFeatures(currentTime);
    this.source.addFeatures(Object.values(this.features));
  }
}
