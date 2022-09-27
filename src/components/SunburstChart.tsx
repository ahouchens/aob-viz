import React from "react";

import SunburstChart from "sunburst-chart";
import fromKapsule from "react-kapsule";

export interface Node {
  __dataNode?: DataNode;
  name?: string;
  children?: Node[];
  [key: string]: any;
}

export interface DataNode {
  data: Node;
  id: number;
  value: number;
  depth: number;
  height: number;
  parent: DataNode | null;
  children?: DataNode[];
  x0?: number;
  y0?: number;
  x1?: number;
  y1?: number;
}

type TooltipFn = (node: Node, dataNode: DataNode) => string;

const ReactSunburst = fromKapsule<{
  width: number;
  height: number;
  excludeRoot: boolean;
  label: string;
  size: string;
  color: string;
  centerRadius: number;
  minSliceAngle: number;
  radiusScaleExponent: number;
  // tooltipContent(): TooltipFn;
  // tooltipContent(fn: TooltipFn): ChainableInstance;
  tooltipContent: (node: Node, dataNode: DataNode) => string;
  data(): Node;
}>(SunburstChart, {
  methodNames: ["focusNode"],
});
//@ts-ignore
function secondsToHms(d) {
  d = Number(d);

  if (d === 20) {
    return "<i>No video</i>";
  }

  d = d - 20;

  var h = Math.floor(d / 3600);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);

  var hDisplay = h > 0 ? h + (h === 1 ? " hr, " : " hrs, ") : "";
  var mDisplay = m > 0 ? m + (m === 1 ? " min, " : " mins, ") : "";
  var sDisplay = s > 0 ? s + (s === 1 ? " sec" : " secs") : "";

  return hDisplay + mDisplay + sDisplay;
}

//@ts-ignore
const Chart = ({ data }) => (
  <ReactSunburst
    width={800}
    height={800}
    excludeRoot
    label="name"
    size="size"
    // size={(d, node) => `${node.value + 20}`}
    color={"color"}
    centerRadius={0.3}
    minSliceAngle={0}
    // labelOrientation="angular"
    radiusScaleExponent={1.8}
    // tooltipContent={(d, node) => `${node.value} seconds`}
    // tooltipContent={(d, node) => `${secondsToHms(d.displayVal)}`}
    // tooltipContent={(d, node) => `${secondsToHms(d.displaySize)}`}
    tooltipContent={(d, node) => `${node.value}`}
    // tooltipContent={(d, node) => `${getToolTip(d, node)}`}
    data={data}
  />
);

export default Chart;
