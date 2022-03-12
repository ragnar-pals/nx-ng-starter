import * as d3 from 'd3';

export interface IForceDirectedGraphDomain {
  index: number;
  domain: string;
  value: number;
}

export interface IForceDirectedGraphEntity {
  index: number;
  name: string;
  img: string;
  linksCount: number;
}

export interface IForceDirectedChartDataNode extends d3.SimulationNodeDatum {
  index: number;
  domain?: string;
  value?: number;
  name?: string;
  pic?: string;
  linksCount?: number;
}

export interface IForceDirectedChartData {
  domains: IForceDirectedGraphDomain[];
  entities: IForceDirectedGraphEntity[];
  links: d3.SimulationLinkDatum<IForceDirectedChartDataNode>[];
  nodes: IForceDirectedChartDataNode[];
}

export interface IForceDirectedChartOptions {
  width: number;
  height: number;
  centerCalcMod: number;
  charge: {
    strength: number;
    theta: number;
    distanceMax: number;
  };
  distance: number;
  fontSize: number;
  collisionRadius: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  strokeWidth: number;
  labelTextWrapWidth: number;
  color: d3.ScaleOrdinal<string, string>;
}
