import { workersActionTypes } from "../../constants/actions/workers";
import { sessionActionTypes } from "../../constants/actions/session";
import { Api } from "../../utils/api";
import { getWorkerFakeUsers } from "../fakeUsers";
import {ChatApi} from "../../utils/chat_api";
import _ from "lodash";

var messageHeader = 'API request failed';

export function getWorkersList() {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.GET_WORKERS_LIST_REQUEST
        });
        return Api.getWorkers().then(response => {
            var errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: workersActionTypes.GET_WORKERS_LIST_FAILURE,
                    data: { errors: ['Authorization failed'], header: messageHeader }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }
            if (response.status !== 200) {
                dispatch({
                    type: workersActionTypes.GET_WORKERS_LIST_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }
            response.json().then(json => {
                if (!json.results) {
                    dispatch({
                        type: workersActionTypes.GET_WORKERS_LIST_FAILURE,
                        data: { errors: ['Unexpected API response'], header: messageHeader }
                    });
                    return
                }

                dispatch({
                    type: workersActionTypes.GET_WORKERS_LIST_SUCCESS,
                    data: { workers: json.results || [] }
                })
            }).catch(error => {
                dispatch({
                    type: workersActionTypes.GET_WORKERS_LIST_FAILURE,
                    data: { errors: [error], header: messageHeader }
                });
                return error;
            });


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: workersActionTypes.GET_WORKERS_LIST_FAILURE,
                data: { errors: [error], header: messageHeader }
            });
        });
    };
}


export function deleteWorker(id) {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.DELETE_WORKER_REQUEST
        });
        return Api.deleteWorker(id).then(response => {
            var errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: workersActionTypes.DELETE_WORKER_FAILURE,
                    data: { errors: ['Authorization failed'], header: messageHeader }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }
            if (response.status !== 204) {
                dispatch({
                    type: workersActionTypes.DELETE_WORKER_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }

            getWorkersList()(dispatch);

        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: workersActionTypes.DELETE_WORKER_FAILURE,
                data: { errors: [error], header: messageHeader }
            });
        });
    };
}


export function changeInvitationEmail(email) {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.CHANGE_EMAIL,
            data: email
        });
    }
}

export function changeInvitationAdminPermission(isAdmin) {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.CHANGE_ADMIN_PERMISSION,
            data: isAdmin
        });
    }
}

export function changeInvitationChatAdminPermission(isChatAdmin) {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.CHANGE_CHAT_ADMIN_PERMISSION,
            data: isChatAdmin
        });
    }
}

export function createInvitation(invitation) {

    return function(dispatch) {
        dispatch({
            type: workersActionTypes.CREATE_INVITATION_REQUEST
        });
        return Api.generateInvitation(invitation).then(response => {
            var errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: workersActionTypes.CREATE_INVITATION_FAILURE,
                    data: { header: messageHeader }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }

            if (response.status === 400) {
                response.json().then(json => {
                    if (!json.errors) {
                        dispatch({
                            type: workersActionTypes.CREATE_INVITATION_FAILURE
                        });
                        return
                    }
                    dispatch({
                        type: workersActionTypes.CREATE_INVITATION_FAILURE,
                        data: { errors: json.errors, header: messageHeader }
                    });
                    return
                });

                dispatch({
                    type: workersActionTypes.CREATE_INVITATION_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }
            if (response.status !== 200) {
                dispatch({
                    type: workersActionTypes.CREATE_INVITATION_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }

            response.json().then(json => {
                if (!json) {
                    dispatch({
                        type: workersActionTypes.CREATE_INVITATION_FAILURE,
                        data: { errors: ['Unexpected API response'], header: messageHeader }
                    });
                    return;
                }
                dispatch({
                    type: workersActionTypes.CREATE_INVITATION_SUCCESS,
                    data: json.link
                });
            }).catch(error => {
                dispatch({
                    type: workersActionTypes.CREATE_INVITATION_FAILURE
                });
                return error;
            });


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: workersActionTypes.CREATE_INVITATION_FAILURE,
                data: { errors: [error], header: messageHeader }
            });
        });
    }
}

export function hideError() {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.HIDE_ERROR
        });
    }
}

export function clearInvitation() {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.CLEAR_INVITATION
        });
    }
}

export function selectWorker(id) {
    return function(dispatch) {
        dispatch({
            type: workersActionTypes.SELECT_WORKER,
            data: id
        });
        getWorkerFakeUsers(id)(dispatch);
    }
}

export function getMessagesStatistics(workerId, month) {
    return async function (dispatch) {
        const response = await ChatApi.getMessagesStatistics(workerId, month);
        dispatch({
            type: workersActionTypes.UPDATE_WORKER_STATS,
            data: response.data.messagesStatistics
        });
    }
}
export function getMessagesStatisticsWorker(month) {
    return async function (dispatch) {
        try {
            const response = await ChatApi.getMessagesStatisticsWorker(month);
            let sentCount = 0;
            let receivedCount = 0;
            _.each(response.data.messagesStatistics, (item) => {
                sentCount+=item.sentCount;
                receivedCount+=item.receivedCount;
            })
            dispatch({
                type: workersActionTypes.INIT_WORKER_MESSAGES_STATISTICS,
                data: {sentCount, receivedCount}
            });
        } catch (error) {console.log('fail', error);}

    }
}

export function sameDayMessagesStatistics(workerId) {
    return async function (dispatch) {
        const response = await ChatApi.sameDayMessagesStatistics(workerId);
        dispatch({
            type: workersActionTypes.UPDATE_WORKER_STATS,
            data: response.data.sameDayMessagesStatistics
        });
    }
}

export function moderatorsInQueue() {
    return async function (dispatch) {
        ChatApi.moderatorsInQueue().then(moderators => {
            dispatch({
                type: workersActionTypes.UPDATE_MODERATOR_IN_QUEUE,
                data: moderators.data.moderatorsInQueue
            })
        }).catch(console.warn)

    }
}