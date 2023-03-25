import { chatActionTypes } from "../../constants/actions/chat";
import {Api, baseUrl} from "../../utils/api";
import { ChatApi } from "../../utils/chat_api";
import { fakeUsersActionTypes } from "../../constants/actions/fakeUsers";
import { sessionActionTypes } from "../../constants/actions/session";
import { usersActionTypes } from "../../constants/actions/users";
import AddNewPhoto from "../../components/imageUpload/addNewPhoto";
import React from "react";
import {getToken} from "../../utils/auth";
import audioSrc from '../../assets/media/Ring.wav';
import {workersActionTypes} from "../../constants/actions/workers";
import store from "../../store";
const messageHeader = 'API request failed';
export function updateChatFakeUsers() {
   
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.CHAT_NEED_UPDATE_FAKE_USERS
        });
    }
}

export function selectChatFakeUser(id) {

    return function(dispatch) {
        dispatch({
            type: chatActionTypes.CHAT_SELECT_FAKE_USER,
            data: id
        });
    }
}

export function selectChat(chatId, opponent_id) {
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.SELECT_CHAT,
            data: { chatId, opponent_id }
        });
    }
}

export function changeFakeUserOnlineStatus(uid, online) {
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_REQUEST,
            data: { uid: uid, online: online }
        });
        const payload = { isOnline: online }
        return Api.updateUser(uid, payload).then(response => {
            if (response.status === 401) {
                dispatch({
                    type: chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_FAILURE,
                    data: { uid: uid, online: online }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }

            if (response.status === 404) {
                dispatch({
                    type: chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_FAILURE,
                    data: { uid: uid, online: online }
                });
                return;
            }

            if (response.status !== 200) {
                dispatch({
                    type: chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_FAILURE,
                    data: { uid: uid, online: online }
                });
                return;
            }

            dispatch({
                type: chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_SUCCESS,
                data: { uid: uid, online: online }
            });


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: usersActionTypes.EDIT_USER_DETAILS_FAILURE,
                data: { uid: uid, online: online }
            });
        });
    }
}

export function changeChatMessage(chatMessage) {
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.CHANGE_CHAT_MESSAGE,
            data: chatMessage
        });
    }
}

export function sendChatMessage(chatId, fromName, fromUserId, recipientToken, type, message) {
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.SEND_CHAT_MESSAGE_REQUEST
        });
        return Api.sendChatMessage(chatId, fromName, fromUserId, recipientToken, type, message).then(response => {
            const errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: chatActionTypes.SEND_CHAT_MESSAGE_FAILURE,
                    data: { header: messageHeader }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }

            if (response.status !== 200) {
                dispatch({
                    type: chatActionTypes.SEND_CHAT_MESSAGE_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }

            dispatch({
                type: chatActionTypes.SEND_CHAT_MESSAGE_SUCCESS
            });


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: chatActionTypes.SEND_CHAT_MESSAGE_FAILURE,
                data: { header: messageHeader }
            });
        });
    }
}


export function readChatMessages(uid, chatId, messages) {
    return function(dispatch) {
        dispatch({
            type: chatActionTypes.READ_CHAT_MESSAGES_REQUEST,
            data: { messages, chatId }
        });
        return Api.readChatMessages(uid, chatId, messages).then(response => {
            const errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: chatActionTypes.READ_CHAT_MESSAGES_FAILURE,
                    data: { header: messageHeader }
                });
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }

            if (response.status !== 200) {
                dispatch({
                    type: chatActionTypes.READ_CHAT_MESSAGES_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
                return;
            }

            dispatch({
                type: chatActionTypes.READ_CHAT_MESSAGES_SUCCESS
            });


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: chatActionTypes.READ_CHAT_MESSAGES_FAILURE,
                data: { header: messageHeader }
            });
        });
    }
}

export function saveNotes(chatId, notes) {
    return function(dispatch) {
        return Api.saveChatNotes(chatId, notes).then(response => {
            const errorMessage = "Unknown error. HTTP Status code: " + response.status;
            if (response.status === 401) {
                dispatch({
                    type: sessionActionTypes.LOGOUT_REQUEST,
                });
                return;
            }

            if (response.status !== 200) {
                dispatch({
                    type: chatActionTypes.SAVE_CHAT_NOTES_FAILURE,
                    data: { errors: [errorMessage], header: messageHeader }
                });
            }


        }).catch(error => {
            console.log('fail', error);
            dispatch({
                type: chatActionTypes.SAVE_CHAT_NOTES_FAILURE,
                data: { header: messageHeader }
            });
        });
    }
}


// export function startNewChat(fakeUserId, realUserId) {
//     return function(dispatch) {
//         return Api.startNewChat(fakeUserId, realUserId).then(response => {
//             const errorMessage = "Unknown error. HTTP Status code: " + response.status;
//             if (response.status === 401) {
//                 dispatch({
//                     type: sessionActionTypes.LOGOUT_REQUEST,
//                 });
//                 return;
//             }

//             if (response.status !== 200) {
//                 dispatch({
//                     type: chatActionTypes.START_NEW_CHAT_FAILURE,
//                     data: { errors: [errorMessage], header: messageHeader }
//                 });
//             }


//         }).catch(error => {
//             console.log('fail', error);
//             dispatch({
//                 type: chatActionTypes.START_NEW_CHAT_FAILURE,
//                 data: { header: messageHeader }
//             });
//         });
//     }
// }

export function startNewChat(fakeUserId, realUser) {
     
    // @todo- call django api to attach likes
    return function(dispatch) {
        Api.likeUsers(fakeUserId, realUser.id).then(res => {
            ChatApi.createDialogue(fakeUserId, realUser.username, function(error, result) {
                if (error) {
                    dispatch({type: chatActionTypes.START_NEW_CHAT_FAILURE, data: error.message.message})
                } else {
                    //dispatch(getAllDialogue(fakeUserId))
                    dispatch({ type: chatActionTypes.START_NEW_CHAT_SUCCESS, data: { fakeUserId, dialog: result } })
                    dispatch(cacheUser(result.friendId))

                }
            })
        }).catch(err => dispatch({ type: chatActionTypes.START_NEW_CHAT_FAILURE, message: `${err}` }))

    }
}


export function cacheUser(id) {
    return function(dispatch) {
        Api.getUser(id).then(
            res => {
                res.json().then(user => dispatch({ type: chatActionTypes.CACHE_USER_INFO, data: { id, user } }))
            }
        ).catch(console.warn)
    }
}

export function getAllDialogue(fakeUserId) {
    return function(dispatch) {

        // const external_id = loginResults.find(x => x.login === fakeUserIds).user_id
        const external_id = [];
        ChatApi.listChatDialogue(fakeUserId, external_id, (error, result)=> {
            if (error) {
                console.warn(error)
            } else {
                dispatch({ type: chatActionTypes.UPDATE_CHAT_DIALOGUE_LIST, data: { fakeUserId: fakeUserId, dialogues: result.items } })
                result.items.map(item => cacheUser(item.friendId)(dispatch))
            }
        })
    }
}

export function getChatHistory(id, dialogueId) {
    return function(dispatch) {
        ChatApi.getHistoryWithDialogue(id, dialogueId).then(messages => {

            dispatch({
                type: chatActionTypes.UPDATE_CHAT_HISTORY,
                data: { id: dialogueId, messages }
            })
        }).catch(console.warn)

    }
}

export function sendAttachmentMessage(dialogId, image, userId) {
    return function(dispatch) {
        Api.uploadImage(image.file).then(
            message => {
                if(message.success) {
                    dispatch(sendTextMessage(dialogId, baseUrl + message.img, userId))
                } else {
                    dispatch({ type: chatActionTypes.SEND_CHAT_MESSAGE_FAILURE, data: message.message })
                }
            }
        ).catch(err => dispatch({ type: chatActionTypes.SEND_CHAT_MESSAGE_FAILURE, data: err }))
    }
}

export function sendTextMessage(dialogueId, text, userId) {

    return function(dispatch) {
        ChatApi.sendTextMessage(dialogueId, text, userId).then(message => {
            dispatch({
                type: chatActionTypes.APPEND_CHAT_HISTORY,
                data: { dialogueId, message }
            })
            // sendNotification(message.recipient_id)
        }).catch(console.warn)
    }
}
export function sendNotification(userId) {
    ChatApi.sendNotification(userId)
        .catch(console.warn)
}

export function messageReceiveListener(userId) {
    return async function(dispatch) {
        const observerRoom = await ChatApi.addMessageReceiveListener(getToken(), userId);
        const unSubscribingRoom = await observerRoom.subscribe((result) => {
            if(userId !== result.data.onNewMessage.message.userId.id) {
                const messageData = result.data.onNewMessage.message;
                if(!store.getState().chat.fakeUserChatDialogues[userId]) {
                    dispatch(getAllDialogue(userId))
                } else {
                    const message = {
                        id: messageData.id,
                        created_at: messageData.timestamp,
                        recipient_id: messageData.userId.id,
                        message: messageData.userId.id !== userId ? messageData.content : '',
                        url: '',
                        ir: messageData.read,
                        recieved_message: messageData.userId.id === userId ? messageData.content : ''
                    }

                    dispatch({
                        type: chatActionTypes.APPEND_RECIEVED_MESSAGE_CHAT_HISTORY,
                        data: {
                            dialogueId: result.data.onNewMessage.message.roomId.id,
                            message,
                            userId
                        }
                    })
                }

                dispatch({
                    type: fakeUsersActionTypes.UPDATE_LATEST_TIME_FAKE_USERS,
                    data: { userId }
                })
                dispatch({
                    type:  chatActionTypes.UPDATE_CHAT_DIALOGUE_LATEST_TIME,
                    data: { dialogueId: result.data.onNewMessage.message.roomId.id, userId }
                })


                dispatch({
                    type:  workersActionTypes.ADD_WORKER_MESSAGES_STATISTICS,
                    data: { sentCount: 0, receivedCount:1 }
                })
                const sound = new Audio(audioSrc)
                sound.play()

            } else {
                dispatch({
                    type:  workersActionTypes.ADD_WORKER_MESSAGES_STATISTICS,
                    data: { sentCount: 1, receivedCount:0 }
                })
            }
        });

        return unSubscribingRoom;
    }
}

export function createNotes(roomId, content, forRealUser,callback) {
    return async function(dispatch) {
        await ChatApi.createNotes(roomId, content, forRealUser)
            .catch(console.warn)
        callback();
    }
}