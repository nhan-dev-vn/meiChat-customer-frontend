let appConfig = require('./app.config')
const REGISTER = '/register'
const LOGIN = '/login'
const GET_LIST_CONVERSATION = '/conversation/list'
const GET_CONVERSATION = '/conversation'
const CREATE_CONVERSATION = '/conversation/new'
const POST_MESSAGE = '/message/new'
const SEEN_MESSAGE = '/message/seen'
const UPLOAD = '/upload'
const moduleName = 'apiServiceCustomer'
angular.module(moduleName, []).service(moduleName, apiService)

function apiService($http, Upload) {
    let self = this;
    this.URL = appConfig.baseUrl
    function doPost(URL, data, cb) {
        $http({
            method: 'POST',
            url: self.URL+URL,
            data: data
        }).then(function successCallback(response) {
            if (response.data.code != 200) {
                toastr.error(response.data.reason)
                cb();
            } else {
                cb(response.data.content)
            }
        }, function errorCallback(response) {
            toastr.error(response)
            cb();
        });
    }

    this.register = (data, cb) => {
        doPost(REGISTER, data, cb)
    }
    this.login = (data, cb) => {
        doPost(LOGIN, data, cb)
    }
    this.createConversation = function(data, cb) {
        doPost(CREATE_CONVERSATION, data, cb)
    }
    this.getConversation = function(data, cb) {
        doPost(GET_CONVERSATION, data, cb)
    }
    
    this.sendMessage = function(data, cb) {
        doPost(POST_MESSAGE, data, cb)
    }
    this.seenMessage = function(data, cb) {
        doPost(SEEN_MESSAGE, data, cb)
    }
    this.upload = (data, file, cb) => {
        Upload.upload({
            url: self.URL+UPLOAD,
            headers: {
                'Authorization': token
            },
            file: file,
            fields: data
        }).then(
            (response) => {
                if (response.data.code != 200) {
                    cb();
                } else {
                    cb(response.data.content);
                }
            },
            (error) => {
                if(error.config.file.size>50*1024*1024) 
                    toastr.error(file.name + ' is greater than 50MB');
                cb();
            });
    }
    return this;
}
module.exports.name = moduleName;