
import React, {Component, useEffect, useState} from "react";
import {
  Button,
  Checkbox,
  Dimmer,
  Divider,
  Form,
  Grid,
  Header,
  Icon,
  Label,
  List,
  Loader,
  Popup,
  Segment,
} from "semantic-ui-react";
import Modal from 'react-modal';
import ErrorMessage from "../errorMessage";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import AddNewPhoto from "../imageUpload/addNewPhoto";
import ChatUsers from "../chat/userList";
import ChatBoxContent from "../imageUpload/chatBoxContent";
import _ from 'lodash';
import moment from 'moment';
import {useReactiveVar} from "@apollo/client";
import Notes from "../chat/notes";

// *************************************

//    FAKE USERS COMPONENT 

// *************************************    

const FakeUserListItem = ({
  item,
  allPreparedChats,
  currentFakeUser,
  selectChatFakeUser,
  changeFakeUserOnlineStatus,
  workerId,
  usersList,
  closeUsersList,
  openUsersList,
  getAllDialogue,
  messageReceiveListener,
  chatDialogues
}) => {
  const [totalUsersHasUnreadMessage, setTotalUsersHasUnreadMessage] = useState(0);
  const isActive = currentFakeUser.id === item.id;

  useEffect(() => {
    if(chatDialogues) {
      setTotalUsersHasUnreadMessage(_.filter(chatDialogues,
          (chatDialogue) => chatDialogue.unread_messages_count > 0).length)
    }
  },[chatDialogues])
  const showUsers = (id)=>{
     selectChatFakeUser(id);
      // getAllDialogue(currentFakeUser.id);
  
  }
  useEffect(() => {
    let unSubscribingRoom
    if(item.id) {
      messageReceiveListener(item.id).then((e) => unSubscribingRoom=e);
    }
    return () => {
      if(unSubscribingRoom) {
        unSubscribingRoom.unsubscribe();
      }
    }
  }, [item.id])
  return (
    <List.Item active={isActive} onClick={()=>showUsers(item.id)}>
      {
        <List.Content floated="right">
          <Link to={"/workers/" + workerId + "/fakeUsers/edit/" + item.id}>
            <Icon link name="pencil" size="large" color="blue" />
          </Link>
        </List.Content>
      }
      {
        <List.Content floated="right">
          <Popup
            trigger={
              <Icon
                link
                name="chat"
                size="large"
                color={usersList && isActive ? "yellow" : "blue"}
                onClick={(e) => {
                  usersList && isActive ? closeUsersList() : openUsersList();
                }}
              />
            }
            content="Start new chat"
            position="left center"
          />
        </List.Content>
      }
      {/* user online status is handled with QuickBlox https://docs.quickblox.com/docs/js-chat-user-presence */}
      <List.Content floated="right">
        <Checkbox
          slider
          checked={item.online}
          onChange={(e) => {
            e.stopPropagation();
            changeFakeUserOnlineStatus(item.id, !item.online);
          }}
        />
      </List.Content>
      <List.Content floated="right">
        <Label color={totalUsersHasUnreadMessage > 0 ? "yellow" : "grey"}>
          {totalUsersHasUnreadMessage}
        </Label>
      </List.Content>
      <List.Content>
        <List.Header>
          {item.name} {item.username}
        </List.Header>
      </List.Content>
    </List.Item>
  );
};

/*************************************** 
 
*           CHAT INDOX ITEM 

 ***************************************/

const ChatInboxItem = ({
  dialogue,
  allUsers,
  selectChat,
  currentChat,
  workerId,
  item,
  moderatorId
}) => {
 
  const user = allUsers[dialogue.friendId];
  const currentUnreadMessages = dialogue.unread_messages_count;
  const active = currentChat == dialogue._id;
  const locationdata = user?.location?.split(",");
  let  params = {
    chat_dialog_id: dialogue._id,
    sort_desc: 'date_sent',
    limit: 100,
    skip: 0
  };
  
  // selectChat(dialogue._id, dialogue.occupants_ids);
  
  if (!user) return <List.Item active={active}>Loading user data...</List.Item>;
  const clickHandler = () => selectChat(dialogue._id, dialogue.occupants_ids);
  return (
    <List.Item active={active} onClick={clickHandler}>
      {
        <List.Content floated="right">
          <Link to={"/users/edit/" + item.friendId}>
            <Icon link name="pencil" size="large" color="blue" />
          </Link>
        </List.Content>
      }
      <List.Content>
        <List.Content floated="right">
          <Label color={currentUnreadMessages > 0 ? "yellow" : "grey"}>
            {currentUnreadMessages}
          </Label>
        </List.Content>

        <List.Header>
          {dialogue.name ?  dialogue.name : "No name found"}
        </List.Header>
        <List.Content floated="left" style={{ color: "rgba(0, 0, 0, .7)" }}>
          {user.location ? (
            <>
              Lat:{locationdata && locationdata[0]}
              <br />
              Lon:{locationdata && locationdata[1]}
            </>
          ) : (
            ""
          )}
        </List.Content>
      </List.Content>
    </List.Item>
  );
};

/************************************************************
 
* Display data from chat.fakeUserChatDialogues[currentlySelectedFakeUser]

 *************************************************************/
const ChatInboxList = ({
  allUsers,
  selectChat,
  currentChat,
  workerId,
  chatDialogues = [],
  userId
}) => {
  return (
    <List divided relaxed selection>
      {chatDialogues.map((dialogue,i) => (
        <ChatInboxItem
          workerId={workerId}
          item={dialogue}
          currentChat={currentChat}
          key={dialogue._id}
          selectChat={selectChat}
          dialogue={dialogue}
          allUsers={allUsers}
          moderatorId={userId}
        />
      ))}
    </List>
  );
};

/****************************************
 * 
 * DISPLAY ALL MESSAGE AGAINST A OPPONENT 
 * 
 ****************************************/

const MessageBox = ({ currentChat, opponent, fakeUserId,session }) => {
  const [messages, setMessages] = useState([])
  const messagesEndRef = React.useRef(null)
  const [videoUrl, setVideoUrl] = useState('')
  const [showVideoModal, setShowVideoModal] = useState(false)
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messagesEndRef])
  React.useEffect(()=>{
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  },[messages, scrollToBottom]);
  React.useEffect(()=>{
    setMessages(_.sortBy(currentChat, (item) => new moment(item.created_at)));
  },[currentChat]);

  const showVideo = (url) => {
    setVideoUrl(url);
    setShowVideoModal(true);
  }
  const user = opponent;
  return (
    <>
    <Segment
      style={{ maxHeight: "400px", height: "400px", overflowX: "scroll"  }}
      color="teal"
      id="parentContaier"
    >
      <Grid columns={2}>
        {_.map(messages, (value) => {
            const date = new Date(value.created_at);
            const popUp = (
              <Popup
              
                trigger={
                  <Segment
                    tertiary
                    size="tiny"
                    style={{
                      background:
                          value.recipient_id !== opponent?.user_id 
                          ? value.recipient_id === null ? "#dcddde" : "#00b5ad"
                          : "#dcddde",
                    }}
                  >
                    <ChatBoxContent
                        showVideo={showVideo}
                        content={value.message || value.recieved_message}
                        height={"100px"}
                        recipient_id={value?.recipient_id}
                        user_id={opponent?.user_id}/>
                    <Divider hidden fitted />
                    {(value.ir && (
                      <Header
                        icon={<Icon corner size="mini" name="check" />}
                        disabled
                        sub
                        floated="right"
                        content={date.toLocaleString()}
                      />
                    )) || (
                      <Header
                        disabled
                        sub
                        floated="right"
                        content={date.toLocaleString()}
                      />
                    )}
                  </Segment>
                }
                content={user && user.name ? user.name : "Undefined"}
                basic
                mouseEnterDelay={1000}
                on="hover"
                size={"mini"}
                // position='bottom right'
              />
            );
            if (
              value.recipient_id == opponent?.user_id ||
              !!value.recieved_message
            ) {
              // const user = this.props.chat.allUsers[currentChat.userId];
          
              return (
                <Grid.Row
                  textAlign={value.url ? "center" : "left"}
                  key={value.id}
                >
                  <Grid.Column>{popUp}</Grid.Column>
                  <Grid.Column></Grid.Column>
                </Grid.Row>
              );
            } else {
          
              // const user = this.props.chat.allFakeUsers[value.id];
              const user = opponent;
              return (
                <Grid.Row
                  textAlign={value.url ? "center" : "left"}
                  key={value.id}
                >
                  <Grid.Column></Grid.Column>
                  <Grid.Column>{popUp}</Grid.Column>
                </Grid.Row>
              );
            }
          })}
      </Grid>
      <div style={{ float: "left", clear: "both" }} />
      <div ref={messagesEndRef}/>
    </Segment>
      <Modal
          isOpen={showVideoModal}
          onRequestClose={() => setShowVideoModal(false)}
          style={{ overlay: {
                    zIndex:2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems:'center'
                  },
                  content:{
                    display: 'flex',
                    position: "relative"
                  }}}
          // contentLabel="Example Modal"
          shouldCloseOnOverlayClick={true}
      >
        <video  controls>
          <source src={videoUrl} />
        </video>
      </Modal>
    </>
  );
};


/************************************
 * 
 *  MAIN CLASS COMPONENT WORKER DASHBOARD 
 * 
 ************************************/

export default class WorkerDashboard extends Component {
  messagesEnd = null;

  state = { usersList: false };

  // scrollToBottom = () => {
  //   if (this.messagesEnd) {
  //     this.messagesEnd.scrollIntoView({ behavior: "smooth" });
  //   }
  // };
  onStartNewChat = (fakeUserId, realUserId) => {
    this.props.startNewChat(fakeUserId, realUserId);
    this.closeUsersList();
  };

  onUpload = (image) => {
    this.props.onSendAttachment(
      this.props.chat.currentChat,
      image,
      this.props.chat.currentFakeUser.id
    );
  };

  openUsersList = () => {
    this.setState({ usersList: true });
  };

  closeUsersList = () => {
    this.setState({ usersList: false });
  };

  componentDidMount() {
    this.props.getWorkerFakeUsers(
      this.props.session.userDetails.id ||
        this.props.session.userDetails.user_id
    );
  }

  componentDidUpdate(prevProps) {
   
     // GET ALL THE CHAT USERS AGAINST A SPECIFIC FAKE USERS
    if (this.props.chat.currentFakeUser.id !== prevProps.chat.currentFakeUser.id){
        
          if(this.props.chat.currentFakeUser.id){
            this.props.getAllDialogue( this.props.chat.currentFakeUser.id);
          }
      
    }
   
    if (this.props.chat.allFakeUsers !== prevProps.chat.allFakeUsers) {
       this.props.updateFakeUsers();
      // console.log("i am running");
      // this.props.selectChat( this.props.chat.currentChat, this.props.chat.currentOpponent)
    }

    //  if (prevProps.isMessageSend !== this.props.isMessageSend) {
    //   // this.props.updateFakeUsers();
    //   console.log("i am running",this.props.chat.currentChat, this.props.chat.currentOpponent);
    //    this.props.selectChat( this.props.chat.currentChat, this.props.chat.currentOpponent)
    // }
   
    // this.scrollToBottom();
      

   }

   // SEND MESSAGES 
  handleMessageSend = () => {
    this.props.sendTextMessage(
        this.props.chat.currentChat,
        this.props.chat.chatMessage,
        this.props.chat.currentFakeUser.id
    );
  };

  componentWillReceiveProps(prevProps) {
    if (this.props.chat.allFakeUsers !== prevProps.chat.allFakeUsers) {
      this.props.updateFakeUsers();
    }
    
  }

  render() {
    const workerId =
      this.props.session.userDetails.id ||
      this.props.session.userDetails.user_id;

    const chats = Object.entries(this.props.chat.allChats)
      .filter(
        ([key, value]) =>
          this.props.chat.currentFakeUser.external_id &&
          key.includes(this.props.chat.currentFakeUser.external_id) &&
          key.split("___").length === 2
      )
      .map(([key, value]) => {
        const chatParts = key.split("___");
        const userId =
          chatParts[0] !== this.props.chat.currentFakeUser.external_id
            ? chatParts[0]
            : chatParts[1];
        return {
          fakeUserId: this.props.chat.currentFakeUser.external_id,
          chatId: key,
          userId: userId,
          history: value.history,
          notes: value.notes,
        };
      });

     
    
    const allPreparedChats = Object.entries(this.props.chat.allChats)
      .filter(
        ([key, value]) => key.split("___").length === 2 && key.includes("x0x")
      )
      .map(([key, value]) => {
        const chatParts = key.split("___");
        const userId = !chatParts[0].includes("x0x")
          ? chatParts[0]
          : chatParts[1];
        const fakeUserId = chatParts[0].includes("x0x")
          ? chatParts[0]
          : chatParts[1];
        return {
          fakeUserId: fakeUserId,
          chatId: key,
          userId: userId,
          history: value.history,
        };
      });
     
      
    const currentChat = chats.find(
      (item, index) => item.chatId === this.props.chat.currentChat
    );

    
    if (currentChat) {
      let unreadMessages = currentChat.history
        ? Object.entries(currentChat.history)
            .filter(
              ([key, value]) =>
                !value.ir &&
                value.uid !== this.props.chat.currentFakeUser.external_id
            )
            .map(([key, value]) => key)
        : [];

      if (unreadMessages && unreadMessages.length > 0) {
        this.props.readChatMessages(
          this.props.chat.currentFakeUser.external_id,
          currentChat.chatId,
          [unreadMessages[0]]
        );
        
      }
    
    }

    
    const currentFakeUser = this.props.chat.currentFakeUsers.find(
      (item, index) => item.id === this.props.chat.currentFakeUser.id
    );

    const currentRealUser =
      currentChat && this.props.chat.allUsers[currentChat.userId];

    const currentFakeUsers = this.props.chat.currentFakeUsers;
    const chatUsers = {
      ...this.props.users,
      users: this.props.users.users.filter((user) => user.roles.length === 0),
    };

    

    const currentChatDialogues =
      this.props.chat.fakeUserChatDialogues[
        currentFakeUser && currentFakeUser.id
      ];

     const currentChatId = this.props.chat.currentChat;
  
    const opponent = (
      this.props.chat.fakeUserChatDialogues[
        currentFakeUser && currentFakeUser.id
      ] || []
    ).find((x) => x._id === currentChatId);
    
    const currentChatMessages = (this.props.chat.allChats || {})[
      this.props.chat.currentChat
    ];

    return (
      <div>
        <Dimmer.Dimmable dimmed={this.props.chat.loading}>
          <Dimmer active={this.props.chat.loading} inverted>
            <Loader>Loading</Loader>
          </Dimmer>
          {this.props.chat.error && this.props.chat.error.visible && (
            <ErrorMessage
              error={this.props.chat.error}
              hideError={this.props.hideError}
            />
          )}
          <Grid columns={2} stretched>
            <Grid.Row>
              <Grid.Column width={6} floated="right">
                <Segment style={{ padding: 0}}>
                  <Grid columns={2} style={{ height: "100%", margin: 0}}>
                    <Grid.Column
                      width={8}
                      style={{ height: "100%", overflowY: "scroll" }}
                    >
                      <Header content="Moderators (fake users)" />
                      <List divided relaxed selection verticalAlign="middle">
                        {_.sortBy(currentFakeUsers, (item) => item.latestTime).reverse().map((item, index) => (
                          <FakeUserListItem
                            messageReceiveListener={this.props.messageReceiveListener}
                            currentFakeUser={this.props.chat.currentFakeUser}
                            allPreparedChats={allPreparedChats}
                            workerId={workerId}
                            item={item}
                            key={index}
                            selectChatFakeUser={this.props.selectChatFakeUser}
                            usersList={this.state.usersList}
                            closeUsersList={this.closeUsersList}
                            openUsersList={this.openUsersList}
                            changeFakeUserOnlineStatus={
                              this.props.changeFakeUserOnlineStatus
                            }
                            getAllDialogue=  {this.props.getAllDialogue}
                            chatDialogues={this.props.chat.fakeUserChatDialogues[item.id]}
                          />
                        ))}
                      </List>
                      {/* {false && (
                        <Grid>
                          <Grid.Column textAlign="center">
                            <Link
                              to={"/workers/" + workerId + "/fakeUsers/new"}
                            >
                              <Button circular icon="add" positive />
                            </Link>
                          </Grid.Column>

                        </Grid>
                      )} */}
                    </Grid.Column>
                    <Grid.Column
                      width={8}
                      style={{ height: "100%", overflowY: "scroll" }}
                    >
                      <Header content="Users" />
                      <ChatInboxList
                        currentChat={this.props.chat.currentChat}
                        allUsers={this.props.chat.usersCache}
                        chatDialogues={_.sortBy(currentChatDialogues, (item) => item.latestTime).reverse()}
                        selectChat={this.props.selectChat}
                        workerId={workerId}
                        userId={currentFakeUser?.id}
                      />

                      <List divided relaxed selection>
                        {chats.map((item, index) => {
                     
                          const user = this.props.chat.allUsers[item.userId];
                          const currentUnreadMessages = allPreparedChats
                            .filter((c, index) => c.chatId === item.chatId)
                            .reduce((acc, uc) => {
                              if (!uc.history) {
                                return acc;
                              }
                              return (
                                acc +
                                Object.entries(uc.history).filter(
                                  ([key, value]) =>
                                    !value.ir && value.uid !== item.fakeUserId
                                ).length
                              );
                            }, 0);
                          return (
                            <List.Item
                              key={index}
                              onClick={(e) => {
                                this.props.selectChat(item.chatId);
                              }}
                              active={
                                this.props.chat.currentChat &&
                                this.props.chat.currentChat === item.chatId
                              }
                            >
                              {
                                <List.Content floated="right">
                                  <Link
                                    target="_blank"
                                    to={"/users/edit/" + item.userId}
                                  >
                                    <Icon
                                      link
                                      name="pencil"
                                      size="large"
                                      color="blue"
                                    />
                                  </Link>
                                </List.Content>
                              }
                              <List.Content floated="right">
                                <Icon
                                  name="circle"
                                  size="tiny"
                                  color={
                                    user && user.online ? "green" : "yellow"
                                  }
                                  corner
                                />
                              </List.Content>
                              <List.Content floated="right">
                                <Label
                                  color={
                                    currentUnreadMessages > 0
                                      ? "yellow"
                                      : "grey"
                                  }
                                >
                                  {currentUnreadMessages}
                                </Label>
                              </List.Content>
                              <List.Content>
                                <List.Header>
                                  {JSON.stringify(item)}
                                  {user && user.username
                                    ? user.display_name || user.username
                                    : "Undefined"}
                                </List.Header>
                                {user &&
                                  user.filters &&
                                  user.filters.location &&
                                  user.filters.location.lat &&
                                  user.filters.location.lon && (
                                    <List.Description>
                                      {"Lat:" + user.filters.location.lat}
                                    </List.Description>
                                  )}
                                {user &&
                                  user.filters &&
                                  user.filters.location &&
                                  user.filters.location.lat &&
                                  user.filters.location.lon && (
                                    <List.Description>
                                      {"Lon: " + user.filters.location.lon}
                                    </List.Description>
                                  )}
                              </List.Content>
                            </List.Item>
                          );
                        })}
                      </List>
                    </Grid.Column>
                  </Grid>
                </Segment>
              </Grid.Column>
               <Grid.Column width={10}>
                {this.state.usersList && currentFakeUser && (
                  
                  <div style={{height: "calc(100vh - 70px)", display: "flex", flexDirection:"column"}}>
                    <div>
                      <Button
                          icon="close"
                          onClick={(e) => this.closeUsersList()}
                      />
                    </div>
                    <ChatUsers
                      fakeUserId={this.props.chat.currentFakeUser.id}
                      startNewChat={this.onStartNewChat}
                      chat={this.props.chat}
                      users={chatUsers}
                      getUsersList={this.props.getUsersList}
                      hideError={this.props.hideError}
                      sortUsersList={this.props.sortUsersList}
                      onSearchValueChange={this.props.onSearchValueChange}
                      searchUsersList={this.props.searchUsersList}
                    />
                  </div>
                )}
                {!this.state.usersList  && (
                  <MessageBox
                    currentChat={currentChatMessages}
                    opponent={opponent}
                    fakeUserId={this.props.chat.currentFakeUser.id}
                    session = {this.props.session}
                  />
                )}
               {!this.state.usersList && currentChatId && (
                   <>
                    <div style={{display:"flex"}}>
                     <Notes
                      id={currentChatId}
                      value={opponent ? opponent.moderatorNote : ''}
                      saveValue={(roomId, content, callback) => this.props.createNotes(roomId, content, false, callback)}
                    />
                     <Notes
                         id={currentChatId}
                         value={opponent ? opponent.userNote : ''}
                         saveValue={(roomId, content, callback) => this.props.createNotes(roomId, content, true, callback)}
                     />
                    </div>
                     <Divider hidden/>
                   </>
               )}
               {!this.state.usersList && (
                  <Grid columns={2}>
                    <Grid.Column>
                      <Form reply>
                      {this.props.chat.chatMessage.length < 50 && 
                        (<span style={{color: "#D8000C", backgroundColor: "#FFBABA"}}
                        >Message should be minimum 50 characters long!</span>)
                      }
                        <Form.TextArea
                          rows={5}
                          maxLength="150"
                          minLength="50"
                          value={this.props.chat.chatMessage}
                          onChange={this.props.changeChatMessage}
                          disabled={!this.props.chat.currentChat}
                        />
                        <Divider hidden />
                        <Grid textAlign="center">
                          <Button
                            content="Send"
                            primary
                            onClick={this.handleMessageSend}
                            disabled={
                              !this.props.chat.currentChat ||
                              this.props.chat.chatMessage === "" ||
                              this.props.chat.chatMessage?.length < 50 
                            }
                          />
                        </Grid>
                      </Form>
                    </Grid.Column>
                    <Grid.Column>
                      <AddNewPhoto
                        folder={
                          currentFakeUser
                            ? currentFakeUser.external_id
                            : "images"
                        }
                        disabled={!this.props.chat.currentChat}
                        height={"100px"}
                        header={"Send image"}
                        onUpload={this.onUpload}
                        // onAdd={(url) => {
                        //   this.props.sendChatMessage(
                        //     this.props.chat.currentChat,
                        //     currentFakeUser.name,
                        //     currentFakeUser.external_id,
                        //     currentRealUser.fcmToken,
                        //     "image",
                        //     url
                        //   );
                        // }}
                      />
                    </Grid.Column>
                  </Grid>
                )} 
              </Grid.Column> 
            </Grid.Row>
          </Grid>
        </Dimmer.Dimmable>
      </div>
    );
  }
}

WorkerDashboard.propTypes = {
  chat: PropTypes.shape({
    loading: PropTypes.bool,
    error: PropTypes.shape({
      visible: PropTypes.bool,
    }),
  }).isRequired,
  session: PropTypes.shape({
    userDetails: PropTypes.shape({
      id: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
};