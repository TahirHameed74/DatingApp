import {Button, Form, Grid, Loader} from "semantic-ui-react";
import React, {Component} from "react";

export default class Notes extends Component {


    constructor(props) {
        super(props);
        this.state = {newValue: this.props.value, oldValue: this.props.value, loading: false};
    }

    changeValue = (e, data) => {
        this.setState({newValue: data.value});
    };

    saveValue = () => {
        this.setState({loading: true});
        this.props.saveValue(
            this.props.id,
            this.state.newValue,
            () => this.setState({loading: false})
        )
    };

    componentWillReceiveProps(props) {
        if (props.value !== this.state.oldValue) {
            this.setState({newValue: props.value || '', oldValue: props.value || '', loading: false});
        }
    }


    render() {
        const disabled = this.state.newValue === this.state.oldValue;
        const {id} =  this.props;
        const {newValue} = this.state;
        return (
            <Form reply style={{flex:1}}>
                <Loader active={this.state.loading}/>
                <div style={{display:"flex", paddingRight: "5px"}}>
                    <div style={{flex:1}}>
                        <Form.TextArea  rows={2} value={this.state.newValue} onChange={this.changeValue} disabled={this.state.loading}/>
                    </div>
                    <div style={{padding: "5px"}}>
                        <Button
                            style={{height: "100%", width: 80}}
                            content='Save notes'
                            primary
                            //chatId, value
                            onClick={(e) => {
                                e.preventDefault();
                                this.saveValue(id, newValue);
                            }}
                            disabled={disabled || this.state.loading}/>
                    </div>

                </div>
            </Form>)
    }
}
