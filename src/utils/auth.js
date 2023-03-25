import {Base64} from 'js-base64';
import _ from 'lodash';

export function setToken(token) {
    localStorage.setItem('token', token);
}

export function getToken() {
    return localStorage.token;
}


export function removeToken() {
    localStorage.removeItem('token');
}

export function setUserInfo(userInfo) {
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export function getUserInfo() {
    return JSON.parse(localStorage.userInfo);
}


export function removeUserInfo() {
    localStorage.removeItem('userInfo');
}

export function isAuthenticated() {
    return typeof localStorage.token !== 'undefined' && localStorage.token.length > 0;
}

export function getUserDetails() {
    if (!isAuthenticated()) {
        return null;
    }
    return getUserInfo();
}

export function isAllowedRole(roles, details) {
    return _.find(roles,(role) => details?.privileges.includes(role) );
}