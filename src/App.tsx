import React, { useEffect, useState } from "react";
import "./App.css";
import Papa, { ParseResult } from "papaparse";
import { DataNode, Node } from "sunburst-chart";
import { faker } from "@faker-js/faker";
import { exit } from "process";
import { builtinModules } from "module";
import { JsxElement } from "typescript";
import { CirclePacking, ResponsiveCirclePacking } from "@nivo/circle-packing";
import { randomUUID } from "crypto";
import { Radar } from "@nivo/radar";

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
  Q1?: string;
  Q2?: string;
  Q3?: string;
};

function App() {
  const [values, setValues] = React.useState<any | Node | undefined>([]);
  const [filteredValues, setFilteredValues] = React.useState<
    any | Node | undefined
  >([]);
  const [legendItems, setLegendItems] = React.useState<
    Array<JSX.Element> | undefined
  >();
  const [minPercentage, setMinPercentage] = useState<null | number | string>(0);

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
        //@ts-ignore
        let returnRadarItems = [];

        let setOfAnswers = new Set();
        results.data.forEach((row) => {
          //@ts-ignore
          setOfAnswers.add(row[level1Field].trim().replace(/"$/, ""));
        });
        let tmpLegendItems: Array<JSX.Element> = [];

        //@ts-ignore
        Array.from(setOfAnswers).forEach((i: string) => {
          if (i == "") {
            return;
          }
          //@ts-ignore
          let name = i ? i : "";
          let color = faker.color.rgb();

          let totalLaityCount = results.data.filter(
            (i) => i["userType"] == "Laity"
          );

          let totalClergyCount = results.data.filter(
            (i) => i["userType"] == "Clergy"
          );

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
          // console.log("name", name);
          // console.log("possibleChildren", possibleChildren);
          // console.log("childrenLaity", childrenLaity);
          // console.log("childrenClergy", childrenClergy);
          // console.log("percentageLaity");
          // console.log(
          //   "percentageClergy",
          //   totalClergyCount.length / childrenClergy.length
          // );

          if (possibleChildren.length) {
            returnRadarItems.push({
              issue: name,
              Clergy: percentageClergy,
              Laity: percentageLaity,
            });

            returnItems?.children?.push({
              name: name,
              value: count,
              color: color,
              children: [
                {
                  name: "Laity",
                  value: percentageLaity,
                  color: color,
                },
                {
                  name: "Clergy",
                  value: percentageClergy,
                  color: color,
                },
              ],
            });
          }
        });
        //@ts-ignore
        setValues(returnRadarItems);
        //@ts-ignore
        setFilteredValues(returnRadarItems);
        setLegendItems(tmpLegendItems);
      },
    });
  };

  useEffect(() => {
    getCSV();
  }, []);

  useEffect(() => {
    console.log("minPercentageChanged");

    if (minPercentage != null && values.length > 1) {
      console.log("values", values);
      let tmpValues = values.filter((i: any) => {
        return i["Clergy"] > minPercentage && i["Laity"] > minPercentage;
      });
      console.log("tmpValues", tmpValues);
      setFilteredValues(tmpValues);
    } else {
      setFilteredValues(values);
    }
  }, [minPercentage]);

  return (
    <div className="App">
      <div style={{ margin: "20px" }}>
        <label style={{ marginRight: "10px" }}>
          Minimum Percentage
          <select
            style={{ marginLeft: "10px" }}
            defaultValue={0}
            onChange={(e) => {
              console.log(e.target.value);
              setMinPercentage(e.target.value);
            }}
          >
            <option value={0}>0</option>
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={12}>12</option>
            <option value={15}>15</option>
          </select>
        </label>
      </div>

      <Radar
        data={filteredValues}
        height={800}
        width={1700}
        keys={["Clergy", "Laity"]}
        indexBy="issue"
        margin={{ top: 70, right: 80, bottom: 40, left: 80 }}
        valueFormat={(val) => {
          return Math.round(val) + `%`;
        }}
        borderColor={{ from: "color" }}
        gridLabelOffset={24}
        dotSize={15}
        dotColor={{ theme: "background" }}
        dotBorderWidth={2}
        colors={{ scheme: "category10" }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={[
          {
            anchor: "top-left",
            direction: "column",
            translateX: -50,
            translateY: -40,
            itemWidth: 80,
            itemHeight: 20,
            itemTextColor: "#999",

            symbolSize: 12,
            symbolShape: "square",
            effects: [
              {
                on: "hover",
                style: {
                  itemTextColor: "#000",
                },
              },
            ],
          },
        ]}
      />
    </div>
  );
}

export default App;
