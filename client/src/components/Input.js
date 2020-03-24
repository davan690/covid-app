import React, { Component } from 'react';
import { Row, Col, Container, Form, Button } from 'react-bootstrap';
import 'react-bootstrap-range-slider/dist/react-bootstrap-range-slider.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faQuestionCircle, faChevronCircleLeft } from "@fortawesome/free-solid-svg-icons";
import Measures from './Measures';
import Params from './Params';
import Instructions from './Instructions';

export default class Input extends Component {
    constructor(props) {
        super(props);
        this.state = {
            modelParamMode: false,
            showInstructions: false
        };
    }

    toggleInputState = () => {
        this.setState({ modelParamMode: !this.state.modelParamMode });
        console.log(this.state.modelParamMode)
    }

    toggleHowToUse = () => {
        this.setState({ showInstructions: !this.state.showInstructions });
    }

    render() {
        const { modelParamMode, showInstructions } = this.state;
        return(
            <div>
            {/* Left Input */}
                {!modelParamMode && !showInstructions && <Measures/>}
                {!modelParamMode && !showInstructions && <div>
                    <Row style={{ marginTop: 30, margin: 20 }}>
                        <Button onClick={this.toggleInputState} style={{ width: "100%" }}><FontAwesomeIcon icon={faCog}/> Model Parameters</Button>
                    </Row>
                    <Row style={{ marginTop: 30, margin: 20  }}>
                        <Button onClick={this.toggleHowToUse} style={{ width: "100%" }}><FontAwesomeIcon icon={faQuestionCircle}/> How to Use</Button>
                    </Row>
                </div>}
            {/* Right Input */}
                {modelParamMode && !showInstructions && <Params/>}
                {modelParamMode && !showInstructions && <div>
                    <Row style={{ marginTop: 30, margin: 20 }}>
                        <Button onClick={this.toggleInputState} style={{ width: "100%" }}><FontAwesomeIcon icon={faChevronCircleLeft}/> Done</Button>
                    </Row>
                </div>}
            {/* Instructions */}
                {showInstructions && <Instructions/>}
                {showInstructions && <div>
                    <Row style={{ marginTop: 30, margin: 20 }}>
                        <Button onClick={this.toggleHowToUse} style={{ width: "100%" }}><FontAwesomeIcon icon={faChevronCircleLeft}/> Done</Button>
                    </Row>
                </div>}
            </div>
        )
    }
}