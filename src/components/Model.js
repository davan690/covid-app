import React, { Component } from "react";
import { Row, Col } from "react-bootstrap";
import AppBar from "@material-ui/core/AppBar";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import loading_img from '../assets/loading_img.gif';

import Input from "./Input";
import Output from "./Output";
const config = require("../config.json");

export default class Model extends Component {
    constructor(props) {
        super(props);
        this.state = {
            // Model inputs
            // Intervention lengths
            measureWeeks: [0, 26, 0, 0, 0],

            // Intervention Parameters
            r0_params: ["2.67", "1.68", "1.40", "1.05", "0.32"],

            // Model Parameters
            modelParams: ["80", "30", "0.97", "1.66"],

            // Resource Availability
            // Hospital Beds
            hospBeds: ["23187", "6.66", "40", "80"],
            // ICU Beds
            ICUBeds: ["476", "2.0", "40", "80", "100"],
            // Ventilators
            ventilators: ["358", "1.0", "40", "80", "300", "100"],
            actual_resources: [],

            // Model outputs
            model_results: {},
            newly_infected: [],
            hbeds_required: [],
            icubeds_required: [],
            vents_required: [],
            dates: [],
            currentTab: 0
        };
        this.appbar = React.createRef();
        this.resize = this.resize.bind(this);
    }

    updateMeasureWeeks = (measureWeeks) => {
        this.setState({ measureWeeks: measureWeeks });
    };

    updateModelParams = (modelParams) => {
        this.setState({ modelParams: modelParams });
        this.updateData();
    };

    updateR0Params = (r0_params) => {
        this.setState({ r0_params: r0_params });
        this.updateData();
    };

    updateHospBeds = (hospBeds) => {
        this.setState({ hospBeds: hospBeds });
        this.updateData();
    };

    updateICUBeds = (ICUBeds) => {
        this.setState({ ICUBeds: ICUBeds });
        this.updateData();
    };

    updateVentilators = (ventilators) => {
        this.setState({ ventilators: ventilators });
        this.updateData();
    };

    updateTab = (tabIndx) => {
        this.setState({ currentTab: tabIndx });
    };

    updateData = () => {
        const {
            measureWeeks,
            modelParams,
            r0_params,
            hospBeds,
            ICUBeds,
            ventilators,
            population,
            cases,
        } = this.state;
        const rootUrl = process.env.REACT_APP_DEBUG
            ? config["local_url"]
            : config["api_url"];
        const endPoint = "model";
        var queryParamStr = "?int_len=" + measureWeeks;
        queryParamStr += "&model_vals=" + modelParams;
        queryParamStr += "&r0=" + r0_params;
        queryParamStr +=
            "&resource_vals=" + hospBeds + "," + ICUBeds + "," + ventilators;
        queryParamStr += "&state_info=" + population;
        queryParamStr += "&state_cases=" + cases;
        const url = rootUrl + endPoint + queryParamStr;
        fetch(url)
            .then((res) => res.json())
            .then((json) => {
                json = JSON.parse(json);
                this.setState({
                    model_results: json.results,
                    newly_infected: json.data.newly_infected,
                    hbeds_required: json.data.hbeds_required,
                    icubeds_required: json.data.icubeds_required,
                    vents_required: json.data.vents_required,
                    actual_resources: [
                        json.data.hbed_normal,
                        json.data.hbed_surge,
                        json.data.icubed_normal,
                        json.data.icubed_surge,
                        json.data.vent_normal,
                        json.data.vent_surge,
                    ],
                    dates: json.data.dates,
                });
            })
            .catch((err) => err);
    };

    resize() {
        let isMobile = (window.innerWidth <= 1199);
        if (isMobile !== this.state.isMobile) {
            this.setState({isMobile: isMobile});
        }
    }

    componentDidMount() {
        window.addEventListener("resize", this.resize);
        this.resize();
        this.setState({ appbarHeight: this.appbar.current.clientHeight });
        var { country, state } = this.props.region;
        country = country.replace(/ /g, "_");
        state = state.replace(/ /g, "_");
        const rootUrl = process.env.REACT_APP_DEBUG
            ? config["local_url"]
            : config["api_url"];
        const infoEndpoint = "info";
        const caseEndpoint = "case";
        var queryParamStr = "?country=" + country;
        if (state !== "") {
            queryParamStr += "&state=" + state;
        }
        const infoUrl = rootUrl + infoEndpoint + queryParamStr;
        fetch(infoUrl)
            .then((res) =>
                !res.ok
                    ? res.text().then((text) => {
                          throw Error(text);
                      })
                    : res.json()
            )
            .then((json) => {
                json = JSON.parse(json);
                const hbeds = json["hospital beds"];
                const icu_beds = json["icu beds"];
                const weekly_hosp = json["weekly hospital"];
                var { hospBeds, ICUBeds, ventilators } = this.state;
                hospBeds[0] = hbeds;
                ICUBeds[0] = icu_beds;
                ventilators[0] = Math.round((5.4 / 100000) * json.population);
                this.setState({
                    population: json.population,
                    hospBeds: hospBeds,
                    ICUBeds: ICUBeds,
                    ventilators: ventilators,
                    weeklyHosp: weekly_hosp,
                });

                // Get cases info from API
                // Compute date 15 days before (should be 13 but redundancy to deal with time zone diffs)
                const startDate = new Date();
                startDate.setDate(startDate.getDate() - 15);
                const startDateString = startDate.toISOString().split("T")[0];
                queryParamStr += "&start_date=" + startDateString;
                queryParamStr += "&app=" + 1;
                const caseUrl = rootUrl + caseEndpoint + queryParamStr;
                fetch(caseUrl)
                    .then((res) =>
                        !res.ok
                            ? res.text().then((text) => {
                                  throw Error(text);
                              })
                            : res.json()
                    )
                    .then((json) => {
                        json = JSON.parse(json);
                        const cases = json["cases"];
                        while (cases.length !== 13) {
                            const first = cases.shift();
                            cases[0] += first;
                        }
                        this.setState({ cases: cases });
                        this.updateData();
                    })
                    .catch((err) => console.log(err));
            })
            .catch((err) => console.log(err));
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.resize);
    }

    render() {
        const {
            currentTab,
            measureWeeks,
            modelParams,
            r0_params,
            hospBeds,
            ICUBeds,
            ventilators,
            model_results,
            newly_infected,
            hbeds_required,
            icubeds_required,
            vents_required,
            actual_resources,
            dates,
            appbarHeight,
            isMobile
        } = this.state;
        const navbarHeight = this.props.navbarHeight;
        const loaded = Boolean(Object.keys(model_results).length);
        return (
            <Row style={{ margin: 0 }}>
                <AppBar
                    ref={this.appbar}
                    className="border-bottom border-gray"
                    style={{
                        paddingBottom: 5,
                        position: "fixed",
                        top: navbarHeight,
                    }}
                    color="inherit"
                    elevation={0}
                >
                    <Tabs
                        value={currentTab}
                        onChange={(_, value) => {
                            this.setState({ currentTab: value });
                        }}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="scrollable"
                        scrollButtons="auto"
                        aria-label="full width tabs example"
                    >
                        <Tab
                            label="Infections"
                            id="full-width-tab-0"
                            aria-controls="full-width-tabpanel-0"
                        />
                        <Tab
                            label="Hospital Beds"
                            id="full-width-tab-1"
                            aria-controls="full-width-tabpanel-1"
                        />
                        <Tab
                            label="ICU Beds"
                            id="full-width-tab-2"
                            aria-controls="full-width-tabpanel-2"
                        />
                        <Tab
                            label="Ventilators"
                            id="full-width-tab-3"
                            aria-controls="full-width-tabpanel-3"
                        />
                    </Tabs>
                </AppBar>
                <Col md={3} style={{ paddingRight: 0 }}>
                    <div
                        className="Fixed border-right border-gray"
                        style={{
                            paddingTop:
                                appbarHeight + navbarHeight
                                    ? 20 + appbarHeight + navbarHeight
                                    : 0,
                        }}
                    >
                        <Input
                            params={{
                                measureWeeks: measureWeeks,
                                modelParams: modelParams,
                                r0_params: r0_params,
                                hospBeds: hospBeds,
                                ICUBeds: ICUBeds,
                                ventilators: ventilators,
                            }}
                            currentTab={currentTab}
                            eventHandlers={{
                                updateData: this.updateData,
                                updateMeasureWeeks: this.updateMeasureWeeks,
                                updateModelParams: this.updateModelParams,
                                updateR0Params: this.updateR0Params,
                                updateHospBeds: this.updateHospBeds,
                                updateICUBeds: this.updateICUBeds,
                                updateVentilators: this.updateVentilators,
                            }}
                        />
                    </div>
                </Col>
                <Col
                    md={9}
                    style={{ backgroundColor: "#fefefa", paddingLeft: 0 }}
                >
                    <div style={{ 
                            paddingTop:
                                appbarHeight + navbarHeight && !isMobile
                                    ? 20 + appbarHeight + navbarHeight
                                    : 10, 
                            minHeight: "100vh", 
                            display: "flex", 
                            alignItems: "center", 
                            justifyContent: "center" 
                        }}
                    >
                    {!loaded && <img alt="loading" src={loading_img} style={{ width: "15%" }}/>}
                    {loaded && <Output
                            barHeight={appbarHeight + navbarHeight}
                            results={model_results}
                            measureWeeks={measureWeeks}
                            region={{
                                country: this.props.region.country,
                                state: this.props.region.state,
                            }}
                            currentTab={currentTab}
                            dates={dates}
                            newly_infected={newly_infected}
                            hbeds_required={hbeds_required}
                            icubeds_required={icubeds_required}
                            vents_required={vents_required}
                            resources={actual_resources}
                        />}
                    </div>
                </Col>
            </Row>
        );
    }
}
