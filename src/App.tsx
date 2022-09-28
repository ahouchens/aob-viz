import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import multisats from "./data/data.json";
// import SunburstChart from "./components/SunburstChart";
import Papa, { ParseResult } from "papaparse";
import { DataNode, Node } from "sunburst-chart";
import { faker } from "@faker-js/faker";
import { exit } from "process";
import { builtinModules } from "module";
import { JsxElement } from "typescript";
import { CirclePacking, ResponsiveCirclePacking } from "@nivo/circle-packing";
import { randomUUID } from "crypto";

type Data = {
  name?: string;
  family?: string;
  email?: string;
  date?: string;
  job?: string;
  userType: string;
  gender: string;
  birthYear: string;
  state: string;
  // Q1?: string;
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

type Values = {
  data: Data[];
};

interface SetItem {
  name: string;
  color: string;
}

function App() {
  const [values, setValues] = React.useState<Node | undefined>({
    name: "ok",
  });
  const [legendItems, setLegendItems] = React.useState<
    Array<JSX.Element> | undefined
  >();

  const getCSV = () => {
    Papa.parse("/needs-data.csv", {
      header: true,
      download: true,
      skipEmptyLines: true,
      delimiter: ",",
      complete: (results: ParseResult<Data>) => {
        let level1Field = "Q1";
        let returnItems: Node = {
          children: [],
        };
        let setOfAnswers = new Set();
        results.data.forEach((row) => {
          //@ts-ignore
          setOfAnswers.add(row[level1Field].trim().replace(/"$/, ""));
        });
        console.log("setOfANswers", setOfAnswers);
        let tmpLegendItems: Array<JSX.Element> = [];

        //@ts-ignore
        Array.from(setOfAnswers).forEach((i: string) => {
          if (i == "") {
            return;
          }
          //@ts-ignore
          let name = i ? i : "";
          // let color = faker.color.rgb();
          let color = "green";

          let totalLaityCount = results.data.filter(
            (i) => i["userType"] == "Laity"
          );

          let totalClergyCount = results.data.filter(
            (i) => i["userType"] == "Clergy"
          );
          console.log("totalLaityCount", totalLaityCount.length);
          let laityCount = 0;

          let count = results.data.reduce((sum, item) => {
            let toAdd = 0;
            //@ts-ignore

            if (item[level1Field]?.trim() == name) {
              toAdd = toAdd + 1;
            }
            //@ts-ignore

            if (item["Q2"]?.trim() == name) {
              toAdd = toAdd + 1;
            }
            //@ts-ignore

            if (item["Q3"]?.trim() == name) {
              toAdd = toAdd + 1;
            }
            return sum + toAdd;
          }, 0);
          tmpLegendItems.push(
            <div style={{ display: "flex" }}>
              <div
                style={{
                  backgroundColor: color,
                  width: "50px",
                  paddingTop: "0.2em",
                  marginBottom: "8px",
                }}
              >
                {count}
              </div>
              <h6
                style={{
                  fontSize: "12px",
                  marginLeft: "14px",
                  margin: "10px",
                  textAlign: "left",
                }}
              >
                {i}
              </h6>
            </div>
          );

          let possibleChildren = results.data.filter(
            (i) => i["Q1"] == name || i["Q2"] == name || i["Q3"] == name
          );

          let childrenLaity = possibleChildren.filter(
            (i) => i.userType == "Laity"
          );
          let childrenClergy = possibleChildren.filter(
            (i) => i.userType == "Clergy"
          );

          let percentageLaity =
            (childrenLaity.length / totalLaityCount.length) * 100;
          let percentageClergy =
            (childrenClergy.length / totalClergyCount.length) * 100;
          console.log("name", name);
          console.log("possibleChildren", possibleChildren);
          console.log("childrenLaity", childrenLaity);
          console.log("childrenClergy", childrenClergy);
          console.log("percentageLaity");
          console.log(
            "percentageClergy",
            totalClergyCount.length / childrenClergy.length
          );

          if (possibleChildren.length) {
            returnItems?.children?.push({
              name: name,
              value: count,
              size: count,
              loc: count,
              color: color,
              children: [
                {
                  name: "Laity",
                  value: 11,
                  size: 11,
                  loc: percentageLaity,
                  color: color,
                },
                {
                  name: "Clergy",
                  value: 11,
                  size: 11,
                  loc: percentageClergy,
                  color: color,
                },
                // { name: "Clergy", color: "blue", size: 11 },
                // { name: "Laity", color: "blue", size: percentageLaity },
                // {
                //   name: "Clergy",
                //   size: percentageClergy,
                //   loc: percentageClergy,
                //   color: "black",
                // },
              ],
            });
          }
        });
        console.log("returnItems", returnItems);

        setValues(returnItems);
        setLegendItems(tmpLegendItems);
      },
    });
  };

  useEffect(() => {
    getCSV();
    // console.log("values", values);
  }, []);

  let [testData, setTestData] = React.useState<Node | undefined>({
    name: "ok",
    color: "red",
    children: [
      {
        name: "viz",
        children: [
          {
            name: "ok",
            color: "green",
            loc: 8654,
          },
        ],
      },
    ],
  });

  useEffect(() => {
    console.log("values changed >>", values);
    let returnTestData = {
      name: "ok222",
      color: "red",
      children: [],
      loc: 8654,
    };
    //@ts-ignore

    setTestData(values);
  }, [values]);
  console.log("legendItems", legendItems);

  const commonProperties = {
    width: 900,
    height: 500,
    padding: 2,
    id: "name",
    value: "loc",
    // labelsSkipRadius: 16,
  };
  const [zoomedId, setZoomedId] = useState<string | null>(null);

  return (
    <div className="App">
      <header className="App-header">
        <div
          className="chart"
          style={{
            height: "1000px",
          }}
        >
          <CirclePacking
            {...commonProperties}
            data={testData}
            enableLabels
            tooltip={({ id, value, color }) => (
              <div style={{ backgroundColor: "#666", padding: "8px" }}>
                <strong style={{ color }}>
                  {id}: {value}
                </strong>
              </div>
            )}
            label={(input: any) => {
              //@ts-ignore
              return input?.data?.name?.length > 9
                ? `${input.data?.name?.substring(0, 5)}...`
                : input?.data?.name;
            }}
            labelsSkipRadius={16}
            // colors={{ scheme: "blue_purple" }}
            labelsFilter={(label) => label.node.height === 0}
            // labelComponent={(ar) => <div>{ar.label}</div>}
            labelTextColor="black"
            // labelTextColor={{
            //   from: "color",
            // }}
            zoomedId={zoomedId}
            motionConfig="slow"
            onClick={(node) => {
              setZoomedId(zoomedId === node.id ? null : node.id);
            }}
          />
        </div>
        <div
          className="legend"
          style={{
            display: "flex",
            flexDirection: "column",
            width: "40%",
            marginRight: "141px",
            marginLeft: "40px",
          }}
        >
          {" "}
          {legendItems}
        </div>{" "}
        *
      </header>
    </div>
  );
}

export default App;
