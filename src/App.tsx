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
          let color = faker.color.rgb();
          // let color = "green";

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
              // size: count,
              // loc: count,
              color: color,
              children: [
                {
                  name: "Laity",
                  // value: 11,
                  // size: 11,
                  value: percentageLaity,
                  color: color,
                },
                {
                  name: "Clergy",
                  // value: 11,
                  // size: 11,
                  value: percentageClergy,
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
    // value: "loc",
    // labelsSkipRadius: 16,
  };
  const [zoomedId, setZoomedId] = useState<string | null>(null);

  const CircleChart = (testData: Node | undefined) => {
    return (
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
        labelsSkipRadius={30}
        // colors={{ scheme: "nivo" }}

        colors={(node: Node) => {
          console.log("node", node);
          return node.y > 5 ? "red" : "black";
        }}
        // colors={{ scheme: "category10" }}
        // colors={[]}
        // inheritColorFromParent={true}
        colorBy="id"
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
    );
  };

  let staticValues = {
    children: [
      {
        name: "Sexual morality",
        value: 20,
        color: "#e45a1c",
        children: [
          {
            name: "Laity",
            value: 5.019305019305019,
            color: "hsl(353, 70%, 50%)",
          },
          {
            name: "Clergy",
            value: 3.4246575342465753,
            color: "hsl(353, 70%, 50%)",
          },
        ],
      },
      {
        name: "Support for clergy (to avoid burnout)",
        value: 72,
        color: "hsl(353, 70%, 50%)",
        children: [
          {
            name: "Laity",
            value: 18.146718146718147,
            color: "#550fba",
          },
          {
            name: "Clergy",
            value: 13.013698630136986,
            color: "#550fba",
          },
        ],
      },
      {
        name: "Strategies for parish education, catechization, outreach, etc.",
        value: 83,
        color: "rgb(0,0,0)",
        children: [
          {
            name: "Laity",
            value: 20.463320463320464,
            color: "#1bc3aa",
          },
          {
            name: "Clergy",
            value: 17.123287671232877,
            color: "#1bc3aa",
          },
        ],
      },
      {
        name: "Financial contributions/donations/stability",
        value: 56,
        color: "#c21ffc",
        children: [
          {
            name: "Laity",
            value: 11.96911196911197,
            color: "#c21ffc",
          },
          {
            name: "Clergy",
            value: 16.43835616438356,
            color: "#c21ffc",
          },
        ],
      },
      {
        name: "Growing the parish",
        value: 91,
        color: "#7163cb",
        children: [
          {
            name: "Laity",
            value: 20.84942084942085,
            color: "#7163cb",
          },
          {
            name: "Clergy",
            value: 23.972602739726025,
            color: "#7163cb",
          },
        ],
      },
      {
        name: 'Depth of engagement" in parish life (frequency of confession  attendance at non-Sunday services  participation in ministries)',
        value: 114,
        color: "#1ecc9c",
        children: [
          {
            name: "Laity",
            value: 27.413127413127413,
            color: "#1ecc9c",
          },
          {
            name: "Clergy",
            value: 29.45205479452055,
            color: "#1ecc9c",
          },
        ],
      },
      {
        name: "Mental health needs of parishioners",
        value: 29,
        color: "#5fbda9",
        children: [
          {
            name: "Laity",
            value: 8.108108108108109,
            color: "#5fbda9",
          },
          {
            name: "Clergy",
            value: 4.794520547945205,
            color: "#5fbda9",
          },
        ],
      },
      {
        name: "Influx of new inquirers",
        value: 44,
        color: "#a0b16c",
        children: [
          {
            name: "Laity",
            value: 10.81081081081081,
            color: "#a0b16c",
          },
          {
            name: "Clergy",
            value: 8.904109589041095,
            color: "#a0b16c",
          },
        ],
      },
      {
        name: "Youth Ministry (retention and return of youth & young adults)",
        value: 101,
        color: "#a8abea",
        children: [
          {
            name: "Laity",
            value: 25.482625482625483,
            color: "#a8abea",
          },
          {
            name: "Clergy",
            value: 21.232876712328768,
            color: "#a8abea",
          },
        ],
      },
      {
        name: "Effects of COVID-19 (attendance, stewardship, parish life, return & retention)",
        value: 46,
        color: "#fad6f9",
        children: [
          {
            name: "Laity",
            value: 7.335907335907336,
            color: "#fad6f9",
          },
          {
            name: "Clergy",
            value: 8.904109589041095,
            color: "#fad6f9",
          },
        ],
      },
      {
        name: "Demographic shifts (how to balance the needs of different groups)",
        value: 67,
        color: "#ecbc88",
        children: [
          {
            name: "Laity",
            value: 16.216216216216218,
            color: "#ecbc88",
          },
          {
            name: "Clergy",
            value: 12.32876712328767,
            color: "#ecbc88",
          },
        ],
      },
      {
        name: "Clergy shortage",
        value: 20,
        color: "#bedc4c",
        children: [
          {
            name: "Laity",
            value: 4.247104247104247,
            color: "#bedc4c",
          },
          {
            name: "Clergy",
            value: 5.47945205479452,
            color: "#bedc4c",
          },
        ],
      },
      {
        name: "Continuing education/training for clergy",
        value: 30,
        color: "#caa4ab",
        children: [
          {
            name: "Laity",
            value: 5.405405405405405,
            color: "#caa4ab",
          },
          {
            name: "Clergy",
            value: 9.58904109589041,
            color: "#caa4ab",
          },
        ],
      },
    ],
  };
  return (
    <div className="App">
      <header className="App-header">
        <div
          className="chart"
          style={{
            height: "1000px",
          }}
        >
          {CircleChart(staticValues)}
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
