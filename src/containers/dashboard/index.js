import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import MainMenu from '../../components/mainMenu';
import { setActiveMenuPosition } from '../../actions/menu';
import { logoutAction } from '../../actions/session';
import WorkerDashboard from "../../components/dashboard/worker";
import { isAllowedRole } from "../../utils/auth";
import { commonConstants } from "../../constants/common";
import Workers from "../../components/workers/list";
import {
    messageReceiveListener,
    updateChatFakeUsers,
    changeFakeUserOnlineStatus,
    selectChat,
    changeChatMessage,
    sendChatMessage,
    readChatMessages,
    saveNotes,
    startNewChat,
    selectChatFakeUser,
    getAllDialogue,
    getChatHistory,
    sendTextMessage,
    sendAttachmentMessage,
    createNotes
} from "../../actions/chat";
import {getWorkerFakeUsers} from "../../actions/fakeUsers";
import {
    getWorkersList,
    selectWorker,
    deleteWorker,
    getMessagesStatistics,
    sameDayMessagesStatistics, getMessagesStatisticsWorker, moderatorsInQueue
} from "../../actions/workers";
import {
    getUsersList,
    hideError,
    onSearchValueChange,
    searchUsersList,
    sortUsersList
} from "../../actions/users";
import moment from "moment";

const HOURLY_LABEL = [
    "00:00",
    "01:00",
    "02:00",
    "03:00",
    "04:00",
    "05:00",
    "06:00",
    "07:00",
    "08:00",
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "13:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
    "21:00",
    "22:00",
    "23:00",
]
const MODERATOR_IN_QUEUE_INTERVAL = 30000
class DashboardView extends Component {
    interval;
    constructor(props) {
        super(props);

        this.state={
            labels: this.getDaysCurrentMonth(),
            isMonthlyChartType: true,
            isLoadWorkerStatisticsMessages: false,
            isLoadModeratorsInQueue: false,
        }
    }


    getDaysCurrentMonth = function() {
        const monthDate = moment();
        let daysInMonth = monthDate.daysInMonth();
        const arrDays = [];

        while(daysInMonth) {
            const current = moment().date(daysInMonth);
            arrDays.push(current.format('MM-DD-YYYY'));
            daysInMonth--;
        }

        return arrDays.reverse();
    };

    componentDidMount() {
        if (this.props.menu.activeMenu !== 'dashboard') {
            this.props.setActiveMenuPosition('dashboard');
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        if(prevState.isMonthlyChartType !== this.state.isMonthlyChartType) {
            this.setState({ labels:
                    this.state.isMonthlyChartType ? this.getDaysCurrentMonth() : HOURLY_LABEL });
        }
        if(this.props.session.isAuthenticated && !this.state.isLoadWorkerStatisticsMessages && this.props.chat?.loading) {
            this.props.getMessagesStatisticsWorker(moment().month() + 1);
            this.setState({isLoadWorkerStatisticsMessages: true})
        }

        // if(this.props.session.isAuthenticated && !this.state.isLoadModeratorsInQueue && this.props.workers.loading) {

        if(this.props.session.isAuthenticated && !this.state.isLoadModeratorsInQueue
            && (this.props.chat?.loading || this.props.workers.loading)) {
            this.props.moderatorsInQueue();
            this.interval = setInterval(() => {
                this.props.moderatorsInQueue();
            }, MODERATOR_IN_QUEUE_INTERVAL)
            this.setState({isLoadModeratorsInQueue: true})
        }
    }
    componentWillUnmount() {
        if( this.interval) {
            clearInterval(this.interval);
        }
    }

    handleChatSelect = (dialogue_id, opponent_id) => {
        this.props.selectChat(dialogue_id, opponent_id)
        if (!this.props.chat.allChats[dialogue_id]) {

            this.props.getChatHistory(this.props.chat.currentFakeUser.id, dialogue_id)
        }
    }

    changeMonthlyChartType = (e) => {
        e.stopPropagation();
        this.setState({isMonthlyChartType: !this.state.isMonthlyChartType})
    }

    render() {
      

        if (!this.props.session.isAuthenticated) {
            return <Redirect to={{ pathname: '/signIn', state: { from: this.props.location } }} />
        }
        return (
            <div>
                <MainMenu
                    needShowPrivateItems={this.props.session.isAuthenticated}
                    menu={this.props.menu}
                    onLogout={this.props.onLogout}
                    setActiveMenuPosition={this.props.setActiveMenuPosition}
                    userDetails={this.props.session.userDetails}
                    workerStatisticsMessages={this.props.workers?.workerStatisticsMessages}
                    moderatorInQueue={this.props.workers?.moderatorInQueue}
                />
                {isAllowedRole([commonConstants.ADMIN_ROLE], this.props.session.userDetails) &&
                    <Workers
                        labels={this.state.labels}
                        userDetails={this.props.session.userDetails}
                        workers={this.props.workers}
                        getWorkerFakeUsers={this.props.getWorkerFakeUsers}
                        getWorkersList={this.props.getWorkersList}
                        selectWorker={this.props.selectWorker}
                        deleteWorker={this.props.deleteWorker}
                        getFakeUsers = {this.props.getFakeUsers}
                        getMessagesStatistics={this.props.getMessagesStatistics}
                        sameDayMessagesStatistics={this.props.sameDayMessagesStatistics}
                        changeMonthlyChartType={this.changeMonthlyChartType}
                        isMonthlyChartType={this.state.isMonthlyChartType}
                    /> || <WorkerDashboard
                        messageReceiveListener={this.props.messageReceiveListener}
                        onSendAttachment={this.props.onSendAttachment}
                        session={this.props.session}
                        chat={this.props.chat}
                        users={this.props.users}
                        iscurrentFakeuserAdd = {this.props.iscurrentFakeuserAdd}
                        getChatUsers={this.props.getChatUsers}
                        getWorkerFakeUsers={this.props.getWorkerFakeUsers}
                        updateFakeUsers={this.props.updateFakeUsers}
                        selectChatFakeUser={this.props.selectChatFakeUser}
                        changeFakeUserOnlineStatus={this.props.changeFakeUserOnlineStatus}
                        changeChatMessage={this.props.changeChatMessage}
                        selectChat={this.handleChatSelect}
                        sendChatMessage={this.props.sendChatMessage}
                        sendTextMessage={this.props.sendTextMessage}
                        readChatMessages={this.props.readChatMessages}
                        saveNotes={this.props.saveNotes}
                        getUsersList={this.props.getUsersList}
                        hideError={this.props.hideError}
                        sortUsersList={this.props.sortUsersList}
                        onSearchValueChange={this.props.onSearchValueChange}
                        searchUsersList={this.props.searchUsersList}
                        startNewChat={this.props.startNewChat}
                        getAllDialogue={this.props.getAllDialogue}
                        currentDialogueMessages = {this.props.currentDialogueMessages}
                        isMessageSend = {this.props.isMessageSend}
                        createNotes={this.props.createNotes}
                    />
                }

            </div>
        );
    }
}

const mapStateToProps = (state) => {
    // calculate total unread message for each fake user
    const allFakeUsers = [...state.chat.currentFakeUsers] || []
    const allDialogues = state.chat.fakeUserChatDialogues || {}
    for (const user of allFakeUsers) {
        const dialogues = allDialogues[user.id] || []
        user.unread_messages_count = dialogues.map(x => parseInt(x.unread_messages_count)).reduce((x, y) => x + y, 0)
    }
    return {
        menu: state.menu,
        users: state.users,
        session: state.session,
        workers: state.workers,
        chat: {...state.chat, currentFakeUsers: allFakeUsers},
        iscurrentFakeuserAdd : state.chat.iscurrentFakeuserAdd,
        currentDialogueMessages : state.chat.currentDialogueMessages,
        isMessageSend : state.chat.isMessageSend
    }
};

const mapDispatchToProps = (dispatch) => {
    return {
        async messageReceiveListener(moderatorId) {
            const fn = messageReceiveListener(moderatorId)
            const t = await fn(dispatch);
            return t;
        },
        onSendAttachment(dialogId, image, userId) {
            sendAttachmentMessage(dialogId, image, userId)(dispatch)
        },
        getChatHistory(id, dialogue_id) {
            getChatHistory(id, dialogue_id)(dispatch)
        },
        getAllDialogue(id) {
            getAllDialogue(id)(dispatch);
        },
        setActiveMenuPosition(activeMenu) {
            setActiveMenuPosition(activeMenu)(dispatch)
        },
        onLogout() {
            logoutAction()(dispatch)
        },
        updateFakeUsers() {
            updateChatFakeUsers()(dispatch)
        },
        getWorkerFakeUsers(id) {
            getWorkerFakeUsers(id)(dispatch);
        },
        selectChatFakeUser(id) {
            selectChatFakeUser(id)(dispatch);
        },
        changeFakeUserOnlineStatus(uid, online) {
            changeFakeUserOnlineStatus(uid, online)(dispatch);
        },
        sendTextMessage(dialogueId, text, userId) {
            sendTextMessage(dialogueId, text, userId)(dispatch)
        },
        selectChat(chatId, opponent_id) {
            selectChat(chatId, opponent_id)(dispatch);
        },
        changeChatMessage(e, data) {
            changeChatMessage(data.value)(dispatch);
        },
        sendChatMessage(chatId, fromName, fromUserId, recipientToken, type, message) {
            sendChatMessage(chatId, fromName, fromUserId, recipientToken, type, message)(dispatch);
        },
        readChatMessages(uid, chatId, messages) {
            readChatMessages(uid, chatId, messages)(dispatch);
        },
        getWorkersList() {
            getWorkersList()(dispatch);
        },
        selectWorker(id) {
            selectWorker(id)(dispatch);
        },
        deleteWorker(id) {
            deleteWorker(id)(dispatch);
        },
        saveNotes(chatId, value) {
            saveNotes(chatId, value)(dispatch);
        },
        getUsersList: (offset, ordered, orderedField) => {
            getUsersList(offset, ordered, orderedField)(dispatch);
        },
        onSearchValueChange: (e, data) => {
            onSearchValueChange(data.value)(dispatch);
        },
        searchUsersList: (value) => {
            searchUsersList(value)(dispatch);
        },
        sortUsersList: (offset, prevColumn, column, prevDirection) => {
            sortUsersList(offset, prevColumn, column, prevDirection)(dispatch);
        },
        startNewChat: (fakeUserId, realUser) => {
            startNewChat(fakeUserId, realUser)(dispatch);
        },
        hideError: () => {
            hideError()(dispatch)
        },
        getMessagesStatistics(workerId, month) {
            getMessagesStatistics(workerId, month)(dispatch);
        },
        getMessagesStatisticsWorker(month) {
            getMessagesStatisticsWorker(month)(dispatch);
        },
        sameDayMessagesStatistics(workerId) {
            sameDayMessagesStatistics(workerId)(dispatch);
        },
        createNotes(roomId, content, forRealUser, callback) {
            createNotes(roomId, content, forRealUser, callback)(dispatch);
        },
        moderatorsInQueue(moderatorId) {
            moderatorsInQueue(moderatorId)(dispatch)
        },
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(DashboardView);

