import { client, clientUpload } from './client'
import { gql } from "@apollo/client";
import _ from 'lodash';
import {baseUrl} from "./api";

export class ChatApi {
    static getHistoryWithDialogue = async (moderatorId, dialogue_id) => {
        const response = await client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                  messages(id:${dialogue_id}, moderatorId:"${moderatorId}", last:100) {
                    edges {
                      node {
                        id
                        content
                        timestamp
                        roomId{
                          id
                          name
                        }
                        userId {
                          id
                          username
                        }
                        read
                      }
                    }
                  }
                }
            `
        })
        return _.map(response.data.messages.edges, (item) => ({
                id:item.node.id,
                created_at: item.node.timestamp,
                recipient_id:item.node.userId.id,
                message: item.node.userId.id !== moderatorId ?  item.node.content : '',
                url: '',
                ir: item.node.read,
                recieved_message: item.node.userId.id === moderatorId ?  item.node.content : ''
            })
        )
    }
    static listChatDialogue = (id, external_id, callback) => {
        client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                  rooms {
                    edges {
                      node {
                        messageSet(last:100){
                          edges{
                            node{
                              timestamp
                            }
                          }
                        }
                        id
                        notesSet {
                          edges {
                            node {
                              content
                              forRealUser
                            }
                          }
                        }
                        name
                        unread
                        userId {
                          id
                          username
                          fullName
                        }
                        target {
                          id
                          username
                          fullName
                        }
                      }
                    }
                  }
                }
            `
        })
        .then(result => {
            const dialoguesData = _.map(
                _.filter(result.data?.rooms?.edges,
                (room) => room.node.userId.id === id || room.node.target.id===id),
                    (room) => {
                    console.log("room.node.notesSet", room.node.notesSet);
                    const moderatorNote = _.find(room.node.notesSet.edges, (item) => !item.node.forRealUser);
                    const userNote = _.find(room.node.notesSet.edges, (item) => item.node.forRealUser);
                    return {
                        _id: room.node.id,
                        name: room.node.userId.id === id ? room.node.target.fullName : room.node.userId.fullName,
                        unread_messages_count: room.node.unread,
                        occupants_ids: [],
                        friendId: room.node.userId.id === id ? room.node.target.id : room.node.userId.id,
                        user_id: id,
                        latestTime: '',
                        moderatorNote:moderatorNote ? moderatorNote.node.content : '',
                        userNote:userNote ? userNote.node.content : '',
                    }}
            )
            callback(null, {
                    items: dialoguesData
                }
            )
        })
        .catch(err => console.log(err))
    }
    static createDialogue = (fakeUserId, userName, callback) => {
        client.mutate({
            mutation: gql`
                mutation {
                    createChat( moderatorId: "${fakeUserId}", userName: "${userName}" ) {
                        room {
                            id
                            notesSet {
                              edges {
                                node {
                                  content
                                  forRealUser
                                }
                              }
                            }
                            name
                            userId{
                                username
                                id
                                fullName
                            }
                            target
                            {
                                username
                                id
                                fullName
                            }
                        }
                    }
                }
            `
        })
            .then(result => {
                const moderatorNote = _.find(result.data.createChat.room.notesSet.edges, (item) => !item.node.forRealUser);
                const userNote = _.find(result.data.createChat.room.notesSet.edges, (item) => item.node.forRealUser);

                const dialoguesData = {
                    _id: result.data.createChat.room.id,
                    name: result.data.createChat.room.userId.id === fakeUserId ? result.data.createChat.room.target.fullName : result.data.createChat.room.userId.fullName,
                    unread_messages_count: 0,
                    occupants_ids: [],
                    friendId: result.data.createChat.room.userId.id === fakeUserId ? result.data.createChat.room.target.id : result.data.createChat.room.userId.id,
                    user_id: fakeUserId,
                    latestTime: '',
                    moderatorNote:moderatorNote ? moderatorNote.node.content : '',
                    userNote:userNote ? userNote.node.content : '',
                }
                callback(null, dialoguesData)
            })
            .catch(err => console.log(err))
    }

    static sendTextMessage = async(dialogue_id, text, id) => {
        const response = await client.mutate({
            mutation: gql`
                mutation {
                  sendMessage(moderatorId: "${id}", messageStr: "${text}", roomId: ${dialogue_id}) {
                    message {
                      id
                      timestamp
                      roomId {
                        lastModified
                      }
                      userId {
                        id
                        username
                      }
                      content
                      timestamp
                      read
                    }
                  }
                }
            `
        })
        return {
            id:response.data.sendMessage.message.id,
            created_at: response.data.sendMessage.message.timestamp,
            recipient_id:response.data.sendMessage.message.userId.id,
            message: response.data.sendMessage.message.userId.id !== id ?  response.data.sendMessage.message.content : '',
            url: '',
            ir: response.data.sendMessage.message.read,
            recieved_message: response.data.sendMessage.message.userId.id === id ?  response.data.sendMessage.message.content : ''
        }
    }

    static sendNotification = async(userId) => {
        return await client.mutate({
            mutation: gql`
                mutation {
                  sendNotification(userId: "${userId}", notificationSetting: "STLIKE") {
                    sent
                  }
                }
            `
        })
    }
    static addMessageReceiveListener = async(token, id) => {
        const observerRoom = await client.subscribe({
            query: gql`
            subscription {
                onNewMessage(token:"${token}", moderatorId: "${id}"){
                    message{
                      id
                      roomId {
                        id
                      }
                      userId {
                        id
                        username
                      }
                      content
                      timestamp
                      read
                    }
                }
              }
        `
        })
        return observerRoom;
    }

    static getMessagesStatisticsWorker = async (month) => {
        return await client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                  messagesStatistics(month:${month}){
                    day
                    sentCount
                    receivedCount
                  }
                }
            `
        })
    }

    static getMessagesStatistics = async (workerId, month) => {
        return await client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                  messagesStatistics(workerId:"${workerId}",month:${month}){
                    day
                    sentCount
                    receivedCount
                  }
                }
            `
        })
    }
    static sameDayMessagesStatistics = async (workerId) => {
        return await client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                    sameDayMessagesStatistics(workerId:"${workerId}"){
                        sentCount
                        receivedCount
                        hour
                    }  
                }
            `
        })
    }

    static createNotes = async(roomId, content, forRealUser) => {
        return await client.mutate({
            mutation: gql`
                mutation {
                  createNotes(roomId: ${roomId}, content: "${content}", forRealUser: ${forRealUser}) {
                    notes {
                      id
                      content
                      roomId {
                        userId {
                          username
                          email
                          id
                        }
                      }
                    }
                  }
                }
            `
        })
    }

    static getStories = async (moderatorId) => {
        const response = await client.query({
            query: gql`
                query{
                  allUserStories(user_Id:"${moderatorId}"){
                    edges{
                      node{
                        id
                        file
                      }
                    }
                  }
                }
            `
        })
        return _.map(response.data.allUserStories.edges, (item) => ({
            file: baseUrl + "/media/" + item.node.file,
            id: item.node.id,
        }));
    }
    static getMoments = async (moderatorId) => {
        const response = await client.query({
            query: gql`
                query{
                  allUserMoments(user_Id:"${moderatorId}"){
                    edges{
                      node{
                        id
                        file
                        pk
                      }
                    }
                  }
                }
            `
        })
        return _.map(response.data.allUserMoments.edges, (item) => ({
            file: baseUrl + "/media/" + item.node.file,
            id: item.node.pk,
        }));
    }

    static moderatorsInQueue = async (workerId) => {
        return await client.query({
            fetchPolicy: "no-cache",
            query: gql`
                query{
                  moderatorsInQueue{
                    isAssigned
                    moderator{
                      username
                    }
                  }
                }
            `
        })
    }
    static uploadStory = async(moderatorId,image) => {
        const response = await clientUpload.mutate({
            mutation: gql`
                mutation ($file: Upload!, $moderatorId: String) 
                { 
                  insertStory(file: $file, moderatorId: $moderatorId) { 
                    story {
                        file 
                        createdDate
                        id 
                    } 
                  } 
                }
            `,
            variables:{
                file:image,
                moderatorId
            }
        },)
        return {
            id: response.data.insertStory.story.id,
            file: baseUrl + "/media/" + response.data.insertStory.story.file
        }
    }

    static uploadMoment = async(moderatorId,image) => {
        const response = await clientUpload.mutate({
            mutation: gql`
                mutation ($file: Upload!, $detail: String!, $userField: String!, $moderatorId: String) {
                    insertMoment(Title: "Moment", file: $file, momentDescription: $detail, user: $userField, moderatorId: $moderatorId) {
                        moment {
                            file 
                            id
                            pk
                        }
                    }
                }
            `,
            variables:{
                file:image,
                detail: "",
                userField: moderatorId,
                moderatorId
            }
        },)
        return {
            id: response.data.insertMoment.moment.pk,
            file: baseUrl + "/media/" + response.data.insertMoment.moment.file
        }
    }

    static removeMoment = async(id) => {
        const response =  await client.mutate({
            mutation: gql`
                mutation {
                  deleteMoment(id: ${id}) {
                    moment {
                      id
                      momentDescription
                    }
                  }
                }

            `
        })
        return response;
    }
}

