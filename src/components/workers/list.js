import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
    Segment,
    Table,
    Icon,
    Button,
    Header,
    Dimmer,
    Loader,
    Input,
    List,
    Grid,
    Statistic,
    Image,
    Divider,
    Popup,
    Checkbox
} from 'semantic-ui-react';

import ErrorMessage from '../errorMessage';
import {Line} from 'react-chartjs-2';
import {isAllowedRole} from "../../utils/auth";
import {commonConstants} from "../../constants/common";
import ConfirmationPopup from "../confirmationPopup";
import _ from "lodash";
import moment from "moment";

const CHART_DEFAULT_MONTHLY_DATA = Array(31).fill(0)
const CHART_DEFAULT_DAILY_DATA = Array(24).fill(0)
const FIVE_MINUTES = 60000 * 5;

export default class Workers extends Component {
    interval;
    constructor(props) {
        super(props);
        this.state = {
            sentData: [],
            receivedData: [],
            totalSentData: 0,
            totalReceivedData: 0
        }
    }
    getMessagesStatistics = function() {
        if(this.props.workers.currentWorker.id) {
            const { isMonthlyChartType } = this.props;
            if(isMonthlyChartType) {
                this.props.getMessagesStatistics(this.props.workers.currentWorker.id, moment().month() + 1);
            } else  {
                this.props.sameDayMessagesStatistics(this.props.workers.currentWorker.id);
            }

        }
    }
    componentDidMount() {
        this.props.getWorkersList();
        this.interval = setInterval(() => {
            this.getMessagesStatistics();
        }, FIVE_MINUTES)
    }
    componentWillUnmount() {
        if(this.interval) {
            clearInterval(this.interval);
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if(this.props.workers.currentWorker.id !== prevProps.workers.currentWorker.id || prevProps.isMonthlyChartType !== this.props.isMonthlyChartType) {
            this.getMessagesStatistics();
        }
        if(this.props.workers.workersStats !== prevProps.workers.workersStats) {
            const { isMonthlyChartType } = this.props;
            if(isMonthlyChartType) {
                const newSentData = [...CHART_DEFAULT_MONTHLY_DATA];
                const newReceivedData = [...CHART_DEFAULT_MONTHLY_DATA];
                let newTotalSentData = 0;
                let newTotalReceivedData = 0;
                this.props.workers.workersStats.forEach((item) => {
                    newSentData[item.day - 1] = item.sentCount;
                    newReceivedData[item.day - 1] = item.receivedCount;
                    newTotalSentData += item.sentCount;
                    newTotalReceivedData += item.receivedCount
                })


                this.setState({
                    sentData: newSentData,
                    receivedData: newReceivedData,
                    totalSentData: newTotalSentData,
                    totalReceivedData: newTotalReceivedData,
                });
            } else {
                const newSentData = [...CHART_DEFAULT_DAILY_DATA];
                const newReceivedData = [...CHART_DEFAULT_DAILY_DATA];
                let newTotalSentData = 0;
                let newTotalReceivedData = 0;
                this.props.workers.workersStats.forEach((item) => {
                    newSentData[item.hour] = item.sentCount;
                    newReceivedData[item.hour] = item.receivedCount
                    newTotalSentData += item.sentCount;
                    newTotalReceivedData += item.receivedCount
                })

                this.setState({
                    sentData: newSentData,
                    receivedData: newReceivedData,
                    totalSentData: newTotalSentData,
                    totalReceivedData: newTotalReceivedData,
                });
            }

        }
    }

    render() {
        const lineOptions = {
            legend: {
                display: true,
                position: 'bottom',
            },

        };

        // const preparedWorkerStats = this.props.labels.map((item, index) => {
        //     const ws = this.props.workers.workersStats.find((ws) => ws.worker_id === this.props.workers.currentWorker.id && ws.date === item);
        //     if (ws) {
        //         return {
        //             sent: ws.sent_messages,
        //             received: ws.received_messages
        //         };
        //     }
        //
        //     return {
        //         sent: 0,
        //         received: 0
        //     };
        // });
        //
        // const sentData = preparedWorkerStats.map((item) => item.sent).push("N/A");
        // const receivedData = preparedWorkerStats.map((item) => item.received).push("N/A");
        const data = {
            labels: this.props.labels || [],
            datasets: [
                {
                    label: `Sent messages: ${this.state.totalSentData} (out going chat)`,
                    fill: false,
                    lineTension: 0.4,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 7,
                    pointHitRadius: 20,
                    pointRadius: 5,
                    data: this.state.sentData
                },
                {
                    label: `Received messages: ${this.state.totalReceivedData} (incoming chat)`,
                    fill: false,
                    lineTension: 0.4,
                    backgroundColor: 'rgba(167,63,63,0.4)',
                    borderColor: 'rgba(167,63,63,1)',
                    borderCapStyle: 'butt',
                    pointBackgroundColor: '#fff',
                    pointHoverRadius: 7,
                    pointHitRadius: 20,
                    pointRadius: 5,
                    data: this.state.receivedData
                }
            ]
        };

        const worker = this.props.workers.workers.find((item, index) => this.props.workers.currentWorker.id && item.id === this.props.workers.currentWorker.id);
        const workerLastContact = this.props.workers.workersLastContact[this.props.workers.currentWorker.id];
        // unix nano -> to timestamp in millis
        // 300000 - 5 min
        const date = new Date(workerLastContact / 1000000);
        const now = new Date();
        const milisecondsDiff = now.getTime() - date.getTime();

        const workerLastMessage = this.props.workers.workersLastMessage[this.props.workers.currentWorker.id];
        // unix nano -> to timestamp in millis

        const workerLastMessageDate = new Date(workerLastMessage / 1000000);

        const workerActiveChats = this.props.workers.workersActiveChats.find((item) => this.props.workers.currentWorker.id === item.worker_id);
       
        return (
            <div>

                <Dimmer.Dimmable dimmed={this.props.workers.loading}>
                    <Dimmer active={this.props.workers.loading} inverted>
                        <Loader>Loading</Loader>
                    </Dimmer>
                    {
                        this.props.workers.error && this.props.workers.error.visible &&
                        <ErrorMessage error={this.props.workers.error} hideError={this.props.hideError} />
                    }
                        <Grid columns={2}>
                            <Grid.Row stretched>
                                <Grid.Column width={4} floated='right'>
                                    <Segment>
                                        <List divided relaxed selection>
                                            {this.props.workers.workers.map((item, index) => {
                                                const workerLastContact = this.props.workers.workersLastContact[item.id];
                                                // unix nano -> to timestamp in millis
                                                // 300000 - 5 min
                                                const date = new Date(workerLastContact / 1000000);
                                                const now = new Date();
                                                const milisecondsDiff = now.getTime() - date.getTime();
                                                return <List.Item active={this.props.workers.currentWorker.id === item.id} key={index} onClick={(e) => this.props.selectWorker(item.id)}>
                                                    {isAllowedRole([commonConstants.SUPER_ADMIN_ROLE], this.props.userDetails) &&
                                                    <List.Content floated='right'>
                                                        <ConfirmationPopup
                                                            confirmationText='Are you sure? Delete worker?'
                                                            icon={<Icon name='close' link onClick={e => {e.stopPropagation()}}/>}
                                                            onSuccessConfirm={(e, id) => {e.stopPropagation(); this.props.deleteWorker(id)}}
                                                            entityData={item.id}
                                                            successConfirmButtonText='Delete'
                                                        />
                                                    </List.Content>}
                                                    <List.Content floated='right'>
                                                        <Icon
                                                            name='circle'
                                                            size='tiny'
                                                            color={(!workerLastContact) ? 'grey' : milisecondsDiff < 300000 ? 'green' : 'yellow'}
                                                            corner
                                                        />
                                                    </List.Content>

                                                    <List.Content>
                                                        <List.Header>{'ID: '+' '+ (item.display_name||item.username||item.fullName||(item.first_name + ' ' + item.last_name) || item.id)}</List.Header>
                                                        <List.Description>{workerLastContact ? date.toLocaleString() : 'Last contact date is undefined'}</List.Description>
                                                    </List.Content>
                                                </List.Item>
                                            })}
                                        </List>
                                        <Grid>
                                            <Grid.Column textAlign="center">
                                                <Link to={"/workers/newInvitation/"} >
                                                    <Button circular icon='add' positive/>
                                                </Link>
                                            </Grid.Column>
                                        </Grid>
                                    </Segment>
                                </Grid.Column>
                                <Grid.Column width={12}>

                                    { this.props.workers.currentWorker.id &&
                                    <Segment placeholder>
                                        <Checkbox
                                            slider
                                            checked={this.props.isMonthlyChartType}
                                            onChange={this.props.changeMonthlyChartType}
                                        />

                                        <Grid>
                                            <Grid.Row columns={2}>
                                                <Grid.Column textAlign="right">
                                                    <Header as={'h2'} content={'ID: '+worker.id+' '+worker.first_name + ' ' + worker.last_name}/>
                                                </Grid.Column>

                                                <Grid.Column floated='left'>
                                                    <Icon
                                                        name='circle'
                                                        size='tiny'
                                                        color={(!workerLastContact) ? 'grey' : milisecondsDiff < 300000 ? 'green' : 'yellow'}
                                                        corner
                                                    />
                                                </Grid.Column>
                                            </Grid.Row>

                                            <Grid.Row columns={2}>
                                                <Grid.Column textAlign="center">
                                                    <Statistic size='mini'>
                                                        <Statistic.Value>{workerLastMessage ? workerLastMessageDate.toLocaleString() : 'undefined'} </Statistic.Value>
                                                        <Statistic.Label>Last Message</Statistic.Label>
                                                    </Statistic>
                                                </Grid.Column>
                                                <Grid.Column textAlign="center">
                                                    <Statistic size='mini'>
                                                        <Statistic.Value>{workerActiveChats ? workerActiveChats.active_chats : 0}</Statistic.Value>
                                                        <Statistic.Label>Active chats</Statistic.Label>
                                                    </Statistic>
                                                </Grid.Column>
                                            </Grid.Row>
                                        </Grid>
                                        <Divider hidden/>
                                        <Line data={data} options={lineOptions}/>
                                        <Header as='h2'>Moderators (fake users)</Header>
                                        <List divided relaxed selection>
                                            {this.props.workers.fakeUsers.map((item, index) => {
                                                return <List.Item key={index}>
                                                    <List.Content floated='right'>
                                                        <Link to={"/workers/"+this.props.workers.currentWorker.id+"/fakeUsers/edit/"+item.id} >
                                                            <Icon link name="pencil" size="large" color="blue"/>
                                                        </Link>
                                                    </List.Content>
                                                    <List.Content>
                                                        <List.Header>{item.username}</List.Header>
                                                    </List.Content>
                                                </List.Item>
                                            })}
                                        </List>
                                        <Grid>
                                            <Grid.Column textAlign="center">
                                                <Link to={"/workers/"+this.props.workers.currentWorker.id+"/fakeUsers/new"}>
                                                    <Button circular icon='add' positive/>
                                                </Link>
                                            </Grid.Column>
                                        </Grid>
                                    </Segment>}
                                </Grid.Column>
                            </Grid.Row>
                        </Grid>

                </Dimmer.Dimmable>

            </div>
        )
    }
}
