import {getToken} from "./auth";

export const baseUrl = process.env.NODE_ENV === 'development' ? "https://api.i69app.com" : 'https://api.i69app.com';
const apiHost = baseUrl + "/api";
export class Api {
    static addAuthorizationHeader(headers) {
        var newHeaders = Object.assign({}, headers);
        newHeaders["Authorization"] = `Token ${getToken()}`;
        return newHeaders;
    }

    static login(credentials) {
        var request = new Request(apiHost + "/auth/token-login/", {
            method: "POST",
            headers: new Headers(Api.defaultHeaders),
            body: JSON.stringify(credentials),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static signUp(params) {
        var request = new Request(apiHost + "/worker/signup/", {
            method: "POST",
            headers: new Headers(Api.defaultHeaders),
            body: JSON.stringify(params),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static applyInvitationKey(key) {
        var request = new Request(apiHost + `/worker/invitation/${key}/`, {
            method: "GET",
            headers: new Headers(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static createUser(user) {
        var request = new Request(apiHost + "/user/", {
            method: "POST",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify(user),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static blockUser(uid) {
        var request = new Request(apiHost + "/user/" + uid + "/", {
            method: "PATCH",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify({is_blocked: true}),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static unblockUser(uid) {
        var request = new Request(apiHost + "/user/" + uid + "/", {
            method: "PATCH",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify({is_blocked: false}),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static updateUser(uid, user) {
        var request = new Request(apiHost + `/user/${uid}/`, {
            method: "PATCH",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify(user),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static removeUser(uid) {
        var request = new Request(apiHost + "/user/" + uid, {
            method: "DELETE",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static removeUserReports(uid) {
        var request = new Request(apiHost + "/user/" + uid + "/reports/", {
            method: "DELETE",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static getUser(uid) {
        var request = new Request(apiHost + "/user/" + uid, {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static getUserDetails(uid) {
        var request = new Request(apiHost + `/user/${uid}/`, {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static getUsers(limit, offset, ordered, orderedField) {
        let path = apiHost + "/user/";
        // limit=25offset=0&ordered=1&field=sign_up
        let fields = [];
        if (typeof limit !== "undefined" && limit !== 0) {
            fields.push({key: "limit", value: limit});
        }
        if (typeof offset !== "undefined" && offset !== 0) {
            fields.push({key: "offset", value: offset});
        }
        if (typeof ordered !== "undefined" && ordered !== 0) {
            fields.push({key: "field", value: orderedField});
            fields.push({key: "ordered", value: ordered});
        }
        if (fields.length !== 0) {
            var query = fields.map((i) => i.key + "=" + i.value).join("&");
            path += "?" + query;
        }
        const request = new Request(path, {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static searchUsers(value) {
        var path = apiHost + "/user/";
        if (value && value.length > 0) {
            path += "?search=" + value;
        } else {
            return new Error("filter not defined");
        }
        var request = new Request(path, {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static generateInvitation(params) {
        var request = new Request(apiHost + "/worker/invitation/", {
            method: "POST",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify(params),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static createFakeUser(user) {
        var request = new Request(apiHost + "/user/", {
            method: "POST",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            body: JSON.stringify(user),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static updateFakeUser(uid, user) {
        return this.updateUser(uid, user.data);

        // var request = new Request(apiHost + '/internal/fakeUsers/' + uid + "/details", {
        //     method: 'PUT',
        //     headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        //     body: JSON.stringify(user)
        // });

        // return fetch(request).then(response => {
        //     return response;
        // }).catch(error => {
        //     return error;
        // });
    }

    static getFakeUser(uid) {
        return this.getUser(uid);
        // var request = new Request(apiHost + '/internal/fakeUsers/' + uid + '/details', {
        //     method: 'GET',
        //     headers: Api.addAuthorizationHeader(Api.defaultHeaders)
        // });

        // return fetch(request).then(response => {
        //     return response;
        // }).catch(error => {
        //     return error;
        // });
    }

    static getFakeUsersPresets() {
        var request = new Request(apiHost + "/", {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static getWorkerFakeUsers(id) {
        var request = new Request(apiHost + "/worker/" + id + "/", {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static changeFakeUserOnlineStatus(uid, online) {
        var request = new Request(
            apiHost + "/internal/fakeUsers" + uid + "/online",
            {
                method: "PUT",
                headers: Api.addAuthorizationHeader(Api.defaultHeaders),
                body: JSON.stringify({online: online}),
            }
        );

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static sendChatMessage(
        chatId,
        fromName,
        fromUserId,
        recipientToken,
        type,
        message
    ) {
        const chatMessage = {
            from_name: fromName,
            from_user_id: fromUserId,
            recipient_token: recipientToken,
            type: type,
            message: message,
        };
        const request = new Request(
            apiHost + "/internal/chats/" + chatId + "/send",
            {
                method: "PUT",
                headers: Api.addAuthorizationHeader(Api.defaultHeaders),
                body: JSON.stringify(chatMessage),
            }
        );

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static saveChatNotes(chatId, notes) {
        const message = {
            notes: notes,
        };
        const request = new Request(
            apiHost + "/internal/chats/" + chatId + "/notes",
            {
                method: "PUT",
                headers: Api.addAuthorizationHeader(Api.defaultHeaders),
                body: JSON.stringify(message),
            }
        );

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    // static startNewChat(fakeUserId, realUserId) {
    //     const message = {
    //         fake_user_id: fakeUserId,
    //         real_user_id: realUserId,
    //     };
    //     const request = new Request(apiHost + "/internal/chats/new", {
    //         method: "POST",
    //         headers: Api.addAuthorizationHeader(Api.defaultHeaders),
    //         body: JSON.stringify(message),
    //     });
    //
    //     return fetch(request)
    //         .then((response) => {
    //             return response;
    //         })
    //         .catch((error) => {
    //             return error;
    //         });
    // }

    static readChatMessages(uid, chatId, messages) {
        const chatMessage = {
            user_id: uid,
            messages: messages,
        };
        const request = new Request(
            apiHost + "/internal/chats/" + chatId + "/read",
            {
                method: "PUT",
                headers: Api.addAuthorizationHeader(Api.defaultHeaders),
                body: JSON.stringify(chatMessage),
            }
        );

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static getWorkers() {
        var request = new Request(apiHost + "/worker/", {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static deleteWorker(id) {
        var request = new Request(apiHost + "/internal/workers/" + id, {
            method: "DELETE",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }

    static likeUsers(user_id, friend_id) {
        var request = new Request(apiHost + `/user/${user_id}/like/${friend_id}/`, {
            method: "POST",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });
        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((err) => err);
    }

    static uploadAvatarPhoto(user_id, params) {
        const formData = new FormData();
        formData.append("photo", params.file);
        var request = new Request(apiHost + `/user/${user_id}/photo/`, {
            method: "POST",
            headers: Api.addAuthorizationHeader({}),
            body: formData,
        });
        return fetch(request)
            .then((response) => {
                return response.json();
            })
            .then((json) => json)
            .catch((err) => err);
    }

    static removeAvatarPhoto(userId, image) {
        var request = new Request(apiHost + `/user/${userId}/photo/`, {
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
            method: "DELETE",
            body: JSON.stringify({id: image.id}),
        });
        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((err) => err);
    }

    static getCurrentUserInfo(token) {
        const request = new Request(apiHost + `/user/${token}`, {
            method: "GET",
            headers: Api.addAuthorizationHeader(Api.defaultHeaders),
        });

        return fetch(request)
            .then((response) => {
                return response;
            })
            .catch((error) => {
                return error;
            });
    }


    static uploadImage = async(image) => {
        const formData = new FormData();
        const token = parseInt(new Date().getDate() * 33333333/222);
        formData.append("token", "" + token);
        formData.append("image", image);
        const request = new Request(baseUrl + '/chat/image_upload', {
            method: "POST",
            headers: Api.addAuthorizationHeader({}),
            body: formData,
        });

        const response = await fetch(request)
        return response.json();
    }
}

Api.defaultHeaders = {
    "Content-Type": "application/json",
};
