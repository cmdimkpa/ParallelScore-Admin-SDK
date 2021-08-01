/*
    Platform SDK: A JavaScript Library for connecting to the core platform
    and performing the most common activities.

    Version 1.5.0 (March 2021)

    Author: Monty Dimkpa, ParallelScore
*/

const axios = require('axios');
const _ = require('lodash');
const sleep = require('util').promisify(setTimeout);
const FormData = require('form-data');
const fs = require('fs');

const BaseProfileMap = {
    user_id : null,
    userdata : null
}

const loadBalancerHost = (n=6) => {
  let m = Math.floor(Math.random()*n) + 1;
  return `https://pscore-sandbox-${m}.herokuapp.com`;
}

const baseHeaders = {
    options : {
        'Content-Type' : 'application/json'
    }
}

const baseNetworkResponse = {
    code : 503,
    message : 'Service Unavailable',
    data : {}
}

const randomIntegerBetween = (a, b) => {
    return parseInt(a + Math.random()*(b - a))
}

class QueryStringBuilder {
    constructor (map, keysOnly=false){
        this.map = map;
        this.keysOnly = keysOnly;
    }
    getMap (){
        return this.map;
    }
    newMap (map){
        this.map = map;
    }
    setKeysOnly (boolean){
        this.keysOnly = boolean;
    }
    generateQueryString (){
        let queryTokens = [];
        _.forEach(_.keys(this.map), (key) => {
            queryTokens.push(this.keysOnly ? `${key}` : `${key}=${this.map[key]}`);
        })
        let queryString = queryTokens.join('&');
        return (this.keysOnly ? '/' : '?') + queryString;
    }
}

class NetworkService {
    constructor (url, method, payload={}, retryDelay=2000, maxRetries=10){
        this.url = url;
        this.method = method;
        this.payload = payload;
        this.retryDelay = retryDelay;
        this.maxRetries = maxRetries;
    }
    setNetworkServiceParams (url, method, payload={}){
        this.url = url;
        this.method = method;
        this.payload = payload;
    }
    async call (){
        let response;
        for (let retries=0;retries < this.maxRetries;retries++){
            if (this.method === 'get'){
                response = await axios.get(this.url, baseHeaders)
                .then((resp) => resp.data).catch((err) => err.response.data)
            }
            if (this.method === 'post'){
                response = await axios.post(this.url, this.payload, baseHeaders)
                .then((resp) => resp.data).catch((err) => err.response.data)
            }
            if (this.method === 'formdata'){
                let config = {
                    method: 'post',
                    url: this.url,
                    headers: { 
                      ...this.payload.getHeaders()
                    },
                    data : this.payload
                  };
                response = await axios(config)
                .then((resp) => resp.data).catch((err) => err.response.data)
            }
            if (this.method === 'put'){
                response = await axios.put(this.url, this.payload, baseHeaders)
                .then((resp) => resp.data).catch((err) => err.response.data)
            }
            if (this.method === 'delete'){
                response = await axios.delete(this.url, this.payload, baseHeaders)
                .then((resp) => resp.data).catch((err) => err.response.data)
            }
            if (!response){
                await sleep(this.retryDelay);
            } else {
                if (response.code){
                    if (response.toString()[0] === '5'){
                        await sleep(this.retryDelay);
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
        return response ? response : baseNetworkResponse;
    }
}

class ProfileReader extends QueryStringBuilder {
    constructor (username, app, ADMIN_TOKEN, profileMap=BaseProfileMap){
        super(profileMap, true);
        this.username = username;
        this.app = app;
        this.ADMIN_TOKEN = ADMIN_TOKEN;
        this.PageReadToken;
        this.profileURL;
    }
    updateProfileApp (app){
        this.app = app;
    }
    updateProfileUsername (username){
        this.username = username;
    }
    updateAdminToken (ADMIN_TOKEN){
        this.ADMIN_TOKEN = ADMIN_TOKEN;
    }
    async newPageReadToken (){
        let exchangeURL = `${loadBalancerHost()}/utils/tokenExchange?adminToken=${this.ADMIN_TOKEN}`;
        let network = new NetworkService(exchangeURL, 'get');
        let response = await network.call();
        this.PageReadToken = response.data;
        return this.PageReadToken;
    }
    updateProfileURL (){
        let resourceQueryString = this.generateQueryString();
        this.newMap({ app : this.app });
        this.setKeysOnly(false);
        let appQueryString = this.generateQueryString();
        if (resourceQueryString  === appQueryString){
            this.newMap(BaseProfileMap);
            this.setKeysOnly(true);
            resourceQueryString = this.generateQueryString();
        }
        this.profileURL = `${loadBalancerHost()}/utils/inspect/${this.PageReadToken}/${this.username}${resourceQueryString}${appQueryString}`;
    }
    async readProfile (){
        this.updateProfileURL();
        let network = new NetworkService(this.profileURL, 'get');
        return await network.call();
    }
}

class TokenGenerator extends ProfileReader {
    constructor(username, app, ADMIN_TOKEN){
        super(username, app, ADMIN_TOKEN);
        this.currentToken;
        this.token_cache = [0];
    }
    flushCache (){
        this.token_cache = [0];
        this.currentToken;
    }
    async generateNewToken (){
        await this.newPageReadToken()
        let response = await this.readProfile();
        if (response.code === 200){
            let current_nonce_base = response.data.userdata.current_nonce_base;
            let candidate = 0;
            while (this.token_cache.indexOf(candidate) !== -1){
                candidate = randomIntegerBetween(3,8) * randomIntegerBetween(20,45) * current_nonce_base;
            }
            this.token_cache.push(candidate);
            this.currentToken = candidate;
            return this.currentToken;
        }
    }
    async newSession (username, app){
        this.updateProfileApp(app);
        this.updateProfileUsername(username);
        this.flushCache()
        return await this.generateNewToken();
    }
}

class PlatformConnection extends TokenGenerator {
    constructor (app, username, ADMIN_TOKEN) {
        super(username, app, ADMIN_TOKEN);
        this.profile;
    }
    async updateSession (username, app){
        return await this.newSession(username, app);
    }
    async signup (firstName, lastName, password, source='platform', role='user'){
        let url = `${loadBalancerHost()}/signup/form?app=${this.app}`;
        let network = new NetworkService(url, 'post', {
            username : this.username,
            first_name : firstName,
            last_name : lastName,
            password : password,
            source : source,
            role : role
        })
        let response = await network.call();
        if (response instanceof Object) this.profile = response;
        return response;
    }
    async login (password){
        let url = `${loadBalancerHost()}/login/user?app=${this.app}`;
        let network = new NetworkService(url, 'post', {
            username : this.username,
            password : password
        })
        let response = await network.call();
        if (response.code === 200) this.profile = response.data.profile; 
        return response;
    }
    async logout (){
        let url = `${loadBalancerHost()}/logout/${this.profile.username}/${this.profile.user_id}?app=${this.app}`;
        let network = new NetworkService(url, 'put')
        return await network.call();
    }
    async changePassword (password, newPassword){
        let url = `${loadBalancerHost()}/profile/changePassword/${this.profile.username}?app=${this.app}`;
        let network = new NetworkService(url, 'put', {
            password : password,
            new_password : newPassword
        })
        return await network.call();
    }
    async viewProfile (reload=false){
        if (reload){
            await this.newPageReadToken();
            this.profile = (await this.readProfile()).data;
        }
        return this.profile;
    }
    async uploadDocuments (targetBucketCode, virtualLocation, virtualCategory, virtualIdentifier, docKey, doc, filePaths=[]){
        if (targetBucketCode && virtualLocation && virtualCategory && virtualIdentifier && docKey && doc){
            let url = `${loadBalancerHost()}/utils/upload/${targetBucketCode}/noAuth/${this.profile.user_id}?app=${this.app}`;
            let upload_json = {}
            upload_json[docKey] = doc;
            var fdata = new FormData();
            fdata.append('upload_json', JSON.stringify(upload_json));
            fdata.append('location', virtualLocation);
            fdata.append('category', virtualCategory);
            fdata.append('about', virtualIdentifier);
            fdata.append('insecure', 'true');
            if (filePaths.length > 0){
                _.forEach(filePaths, (path) => {
                    fdata.append(path.split('/').splice(-1)[0], fs.createReadStream(path));
                })
            }
            let network = new NetworkService(url, 'formdata', fdata)
            return await network.call();
        }
    }
    async downloadDocuments (){
        let url = 'http://54.198.118.116:4100/clipboard/get';
        let constraints = {
            context : this.app,
            serial : this.profile.user_id
        }
        let network = new NetworkService(url, 'post', {constraints : constraints})
        return await network.call();
    }
}

module.exports = {
    QueryStringBuilder : QueryStringBuilder,
    NetworkService : NetworkService,
    ProfileReader : ProfileReader,
    TokenGenerator : TokenGenerator,
    PlatformConnection : PlatformConnection
}
