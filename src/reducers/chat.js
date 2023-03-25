import { chatActionTypes } from '../constants/actions/chat';
import { fakeUsersActionTypes } from '../constants/actions/fakeUsers';
import audioSrc from '../assets/media/Ring.wav';
import moment from "moment";
import _ from 'lodash';

const playRingSound = () => {
    let sound = new Audio(audioSrc)
    sound.play()
}

const defaultFakeChatUser = {
    id: 0,
    name: "",
    external_id: "",
    owner_id: 0,
    online: false
};


const initialState = {
    loading: false,
    error: {
        visible: false,
        header: '',
        messages: []
    },
    currentFakeUser: {
        id: 0,
        external_id: "",
    },
    allFakeUsers: {},
    currentFakeUsers: [],
    iscurrentFakeuserAdd : false ,
    allChats: {},
    currentChat: null,
    chatMessage: "",
    /** key is userId(fakeUser) */
    fakeUserChatDialogues: {},
    // cache for user profile data, key is django userId
    usersCache: {},
    currentOpponent: "",
    currentDialogueMessages : [],
    isMessageSend : {}
    
  
};

export default function chat(state = initialState, action) {
    switch (action.type) {
        case chatActionTypes.HIDE_ERROR:
            return {
                ...state,
                error: {
                    ...state.error,
                    visible: false
                }
            };

        case fakeUsersActionTypes.GET_WORKER_FAKE_USERS_REQUEST:
            return {
                ...state,
                loading: true
            };

        case fakeUsersActionTypes.GET_WORKER_FAKE_USERS_FAILURE:
            return {
                ...state,
                loading: false
            };

        case fakeUsersActionTypes.GET_WORKER_FAKE_USERS_SUCCESS:
          {
               return {
                ...state,
                iscurrentFakeuserAdd : !state.iscurrentFakeuserAdd,
                currentFakeUsers: action.data.fake_users.map((item, index) => { return {...defaultFakeChatUser, ...item, online: item.isOnline, latestTime: moment() } }),
                loading: false
            };

        }

        case fakeUsersActionTypes.GET_ALL_FAKE_USERS_UPDATE:
            return {
                ...state,
                allFakeUsers: action.data,
           

            };
        case chatActionTypes.CACHE_USER_INFO:
            return {
                ...state,
                usersCache: {...state.usersCache, [action.data.id]: action.data.user }
            }
        case chatActionTypes.CHAT_NEED_UPDATE_FAKE_USERS:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map((item, index) => {
                    if (!state.allFakeUsers[item.external_id]) {
                        return item;
                    }

                    const fakeUser = state.allFakeUsers[item.external_id];
                    return {
                        ...item,
                        online: fakeUser.online || false
                    };
                })
            };

        case chatActionTypes.CHAT_SELECT_FAKE_USER:
            const currentFakeUser = state.currentFakeUsers.find((item) => item.id === action.data);

            if (!currentFakeUser) {
                return state;
            }
            return {
                ...state,
                currentFakeUser: {
                    ...state.currentFakeUser,
                    id: currentFakeUser.id,
                    external_id: currentFakeUser.external_id
                },
                currentChat: null,
                currentDialogueMessages : []
            };

        case chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_REQUEST:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map((item, index) => {
                    if (action.data.uid !== item.id) {
                        return item;
                    }

                    return {
                        ...item,
                        online: action.data.online
                    }
                })
            };

        case chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_FAILURE:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map((item, index) => {
                    if (action.data.uid !== item.id) {
                        return item;
                    }

                    return {
                        ...item,
                        online: !action.data.online
                    }
                })
            };


        case chatActionTypes.SAVE_CHAT_NOTES_FAILURE:
            return {
                ...state,
                error: {
                    ...state.error,
                    header: action.data.header && action.data.header !== '' ? action.data.header : '',
                    messages: action.data.errors && action.data.errors.length > 0 ? action.data.errors : [],
                    visible: true
                },
                loading: false
            };

        case chatActionTypes.CHAT_CHANGE_FAKE_USER_STATUS_SUCCESS:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map((item, index) => {
                    if (action.data.uid !== item.id) {
                        return item;
                    }

                    return {
                        ...item,
                        online: action.data.online,
                    }
                })
            };
        case chatActionTypes.UPDATE_CHAT_DIALOGUE_LIST:
            const mapping = _.keyBy(state.fakeUserChatDialogues[action.data.fakeUserId], '_id');
            return {
                ...state,
                fakeUserChatDialogues: {...state.fakeUserChatDialogues,
                    [action.data.fakeUserId]: _.map(action.data.dialogues, (item) =>
                    {
                        return mapping[item._id] ? {...item, latestTime: mapping[item._id].latestTime} : item
                    }) }
            }
        case chatActionTypes.START_NEW_CHAT_SUCCESS:
            const dialogList = state.fakeUserChatDialogues[action.data.fakeUserId] || []

            return {
                ...state,
                fakeUserChatDialogues: {...state.fakeUserChatDialogues, [action.data.fakeUserId]: [...dialogList, action.data.dialog] }
            }
         case chatActionTypes.START_NEW_CHAT_FAILURE: 
           return {
               ...state,
               error: {
                ...state.error,
                visible: true , 
                header: 'Error',
                messages: [action.data]

            } 
           }

        case chatActionTypes.UPDATE_CHAT_HISTORY:
            return {
                ...state,
                allChats: {...state.allChats, [action.data.id]: action.data.messages },
                currentDialogueMessages : action.data.messages
            }

            /*case chatActionTypes.READ_CHAT_MESSAGES_REQUEST:
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [action.data.chatId]: {
                            ...state.allChats[action.data.chatId],
                            history: {
                                ...Object.entries(state.allChats[action.data.chatId].history).reduce((acc, [key, value]) => {
                                    if (action.data.messages.some((item) => item === key)) {
                                        return {
                                            ...value,
                                            ir: true
                                        }
                                    }
                                    return value;
                                }, {})
                            }
                        }
                    }
                };*/

        case chatActionTypes.GET_CHAT_MESSAGES_UPDATE:
            if (action.data.path === "/") {
                return {
                    ...state,
                    allChats: action.data.data
                };
            }

            var pathParts = action.data.path.split('/');
            if (pathParts.length < 2) {
                return state;
            }

            var existingChat = state.allChats[pathParts[1]];
            if (!existingChat) {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [pathParts[1]]: {
                            history: {}
                        }
                    }
                };
            }

            if (action.data.path.includes('notes')) {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [pathParts[1]]: {
                            ...state.allChats[pathParts[1]],
                            notes: action.data.data
                        }
                    }
                };
            }

            var existingChat = state.allChats[pathParts[1]];
            if (!existingChat) {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [pathParts[1]]: {
                            ...state.allChats[pathParts[1]],
                            history: {
                                [pathParts[3]]: {
                                    ...action.data.data
                                }
                            }
                        }
                    }
                };
            }
            if (pathParts.length === 4) {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [pathParts[1]]: {
                            ...state.allChats[pathParts[1]],
                            history: {
                                ...state.allChats[pathParts[1]].history,
                                [pathParts[3]]: {
                                    ...state.allChats[pathParts[1]].history[pathParts[3]],
                                    ...action.data.data
                                }
                            }
                        }
                    }
                };
            }
            if (pathParts.length === 5 && pathParts[4] === "ir") {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [pathParts[1]]: {
                            ...state.allChats[pathParts[1]],
                            history: {
                                ...state.allChats[pathParts[1]].history,
                                [pathParts[3]]: {
                                    ...state.allChats[pathParts[1]].history[pathParts[3]],
                                    ir: action.data.data
                                }
                            }
                        }
                    }
                };
            }
            return state;

        case chatActionTypes.GET_CHAT_MESSAGES_NEW:
            if (action.data.path !== "/") {
                return state;
            }
            let sound = new Audio(audioSrc);
            sound.play();
            const key = Object.keys(action.data.data)[0];

            var existingChat = state.allChats[key];
            if (!existingChat) {
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [key]: {
                            history: {}
                        }
                    }
                };
            }


            return state;

        case chatActionTypes.GET_CHAT_USERS_UPDATE:
            if (action.data.path === "/") {
                return {
                    ...state,
                    allUsers: action.data.data
                };
            }

            if (!action.data.path.includes('online')) {
                return state;
            }

            var pathParts = action.data.path.split('/');
            return {
                ...state,
                allUsers: {
                    ...state.allUsers,
                    [pathParts[1]]: {
                        ...state.allUsers[pathParts[1]],
                        online: action.data.data
                    }
                }
            };

        case chatActionTypes.SELECT_CHAT:
            let _fakeUserChatDialogues = {...state.fakeUserChatDialogues, }
            // set unread message count to zero
            _fakeUserChatDialogues[state.currentFakeUser.id] = _fakeUserChatDialogues[state.currentFakeUser.id].map(d=> ({...d, unread_messages_count: d._id===action.data.chatId?0:d.unread_messages_count}))
            return {
                ...state,
                currentChat: action.data.chatId,
                currentOpponent: action.data.opponent_id.filter(id => id !== state.currentFakeUser.external_id)[0],
                fakeUserChatDialogues: _fakeUserChatDialogues
            };
        case chatActionTypes.CHANGE_CHAT_MESSAGE:
            return {
                ...state,
                chatMessage: action.data
            };

        case chatActionTypes.SEND_CHAT_MESSAGE_REQUEST:
            return {
                ...state,
                chatMessage: "",
                loading: false
            };

        case chatActionTypes.SEND_CHAT_MESSAGE_FAILURE:
            return {
                ...state,
                error: {
                    ...state.error,
                    header: action.data.header && action.data.header !== '' ? action.data.header : '',
                    messages: action.data.errors && action.data.errors.length > 0 ? action.data.errors : [],
                    visible: true
                },
                loading: false
            };

        case chatActionTypes.SEND_CHAT_MESSAGE_SUCCESS:
            return {
                ...state,
                loading: false
            };

        case chatActionTypes.APPEND_RECIEVED_MESSAGE_CHAT_HISTORY:
            if(state.currentChat === action.data.dialogueId) {
                let _fakeUserChatDialogues = {...state.fakeUserChatDialogues, }
                _fakeUserChatDialogues[action.data.userId] = _fakeUserChatDialogues[action.data.userId].map(d=> ({...d, unread_messages_count: d._id===action.data.dialogueId?0:d.unread_messages_count}))
                return {
                    ...state,
                    chatMessage: '',
                    isMessageSend: !state.isMessageSend,
                    currentDialogueMessages : [...state.currentDialogueMessages ,action.data.message]    ,
                    allChats: {...state.allChats, [action.data.dialogueId]: [...(state.allChats[action.data.dialogueId] || []), action.data.message] },
                    fakeUserChatDialogues: _fakeUserChatDialogues
                }
            } else {
                let _fakeUserChatDialogues = {...state.fakeUserChatDialogues, }
                _fakeUserChatDialogues[action.data.userId] = _fakeUserChatDialogues[action.data.userId].map(d=> ({...d, unread_messages_count: d._id===action.data.dialogueId?parseInt(d.unread_messages_count) + 1:d.unread_messages_count}))
                return {...state,
                    fakeUserChatDialogues: _fakeUserChatDialogues
                }
            }


        case chatActionTypes.APPEND_CHAT_HISTORY:
         
            return {
                ...state,
                chatMessage: '',
                isMessageSend: !state.isMessageSend,
                  currentDialogueMessages : [...state.currentDialogueMessages ,action.data.message]    ,
                allChats: {...state.allChats, [action.data.dialogueId]: [...(state.allChats[action.data.dialogueId] || []), action.data.message] }
            }

        case chatActionTypes.NOTHING_APPEND: 
        return {...state} 

        case chatActionTypes.APPEND_RECIEVED_MESSAGE:
            const dialog_id = action.data.message.dialog_id
            playRingSound()
            // increment unread message count by 1
            const user_id = Object.entries(state.fakeUserChatDialogues).map(([k, v]) => v ?.some ?.(x => x._id === dialog_id) && k).reduce((a, b) => !!a ? a : b)
            let fakeUserChatDialogues = {...state.fakeUserChatDialogues, }
               
                if (user_id) {
                    fakeUserChatDialogues[user_id] = fakeUserChatDialogues[user_id].map(d => ({...d, unread_messages_count: d.unread_messages_count + dialog_id === d._id ? 1 : 0 }))
                }
                return {
                    ...state,
                    allChats: {
                        ...state.allChats,
                        [dialog_id]: [...(state.allChats[dialog_id] || []), action.data.message],
                        fakeUserChatDialogues: fakeUserChatDialogues
                    }
                }
            // let currentFakeUser_userId = localStorage.getItem('fakeUser_userId');    
             
            // console.log(action.data.userId,parseInt(currentFakeUser_userId) );
            // if(action.data.userId === parseInt( currentFakeUser_userId)){
            //     return {...state} ;
            // }else {
           
            //  }
            
        case chatActionTypes.UPDATE_FAKE_USER_DATA:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map(user => ({...user, external_id: action.data[user.id] }))
            }
        case fakeUsersActionTypes.UPDATE_LATEST_TIME_FAKE_USERS:
            return {
                ...state,
                currentFakeUsers: state.currentFakeUsers.map((item) => action.data.userId === item.id ? {...item, latestTime: moment()} : item),
            };
        case chatActionTypes.UPDATE_CHAT_DIALOGUE_LATEST_TIME:
            return {
                ...state,
                fakeUserChatDialogues: {...state.fakeUserChatDialogues,
                    [action.data.userId]:  _.map(state.fakeUserChatDialogues[action.data.userId] || [{_id:action.data.dialogueId, unread_messages_count: 0}],(item) => item._id === action.data.dialogueId ?
                        {...item, latestTime: moment()} : item)}
            }
        default:
            return state;
    }

}