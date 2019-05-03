require('./style.css')
let appOwner = require('./app.owner')
let appConfig = require('./app.config')
let chatService = require('./api.service.js')
let moduleName = componentName = 'meiChatCustomer'
let socket = io(appConfig.baseUrl, {transports: ['websocket']})

angular.module(moduleName, [chatService.name, 'ngFileUpload'])
    .component(componentName, {
        template: require('./index.html'),
        controller: Controller,
        controllerAs: 'mcc'
    });

function Controller(apiServiceCustomer, $scope, $timeout) {
    var self = this
    this.showInbox = false
    let owner = appOwner.owner

    apiServiceCustomer.getConversation({ owner: owner }, (res) => {
        if (!$.isEmptyObject(res)) {
            self.conver = res
            socket.emit('join_room', self.conver.id)
            self.user = res.Users[0]
            msg_history_scroll(500)
        } else {
            $timeout(() => {
                self.showInbox = true
                self.conver = {
                    Messages: [{
                        content: 'Xin chào! Tôi có thể giúp gì cho bạn?',
                        username: 'admin',
                        type: 'text',
                        sendAt: new Date()
                    }]
                }
                self.user = {}
            }, 2000)

        }
    })
    this.sendImgFile = (files) => {
        files.forEach((file, i) => {
            let type = file.type.substring(0, 5)
            let time = new Date()
            apiServiceCustomer.upload({
                type: type == 'image' ? 'img' : 'file',
                content: file.name,
                username: self.user.username,
                idUser: self.user.id,
                nameConversation: self.conver.name,
                idConversation: self.conver.id,
                path: appConfig.baseUrl + '/' + self.conver.name + '/' + time.getTime() + '_' + file.name,
                paththumb: type != 'image' ? '' : (appConfig.baseUrl + '/' + self.conver.name + '/' + time.getTime() + '_' + file.name),
                sendAt: time
            }, file, (res) => { })
        })
    }
    $('.write_msg_customer').keypress((e) => {
        if (e.which == 13) {
            excNewCustomer(() => {
                apiServiceCustomer.sendMessage({
                    content: $('.write_msg_customer').val(),
                    type: 'text',
                    idUser: self.user.id,
                    username: self.user.username,
                    idConversation: self.conver.id,
                    nameConversation: self.conver.name,
                    sendAt: new Date()
                }, (res) => {
                    e.preventDefault()
                    $('.write_msg_customer').val('')
                })
            })
        }
    })
    function excNewCustomer(cb) {
        if (!self.user.id)
            apiServiceCustomer.register({
                password: 'customer',
                owner: owner,
                role: 2
            }, (res) => {
                if (!$.isEmptyObject(res)) {
                    self.user = res
                    apiServiceCustomer.createConversation({ owner: owner }, (res) => {
                        if (res) {
                            self.conver = res
                            msg_history_scroll(500)
                            socket.emit('join_room', self.conver.id)
                            cb()
                        }
                    })
                }
            })
        else cb()
    }
    socket.on('sendMessage', (data) => {
        self.conver.Messages.push(data)
        $timeout(() => {
            msg_history_scroll(0)
        })
        if (data.idUser == self.user.id || $('.write_msg').is(':focus')) {
            seenMessage()
        } else {
            self.conver.newMess = true
        }
    })
    function seenMessage() {
        apiServiceCustomer.seenMessage({
            username: self.user.username,
            nameConversation: self.conver.name
        }, (res) => {
            if (res) {
                self.conver.newMess = false
            }
        })
    }
    function msg_history_scroll(timeout) {
        $timeout(() => {
            $('.msg_history').scrollTop($('.msg_history')[0].scrollHeight);
        }, timeout)
    }
    $scope.$watch(function() {return self.showInbox}, function(newValue, oldValue) {
        if(newValue) msg_history_scroll(0)
    })
};
