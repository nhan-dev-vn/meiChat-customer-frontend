require('./style.css')
let appInfo = require('./app.info')
let appConfig = require('./app.config')
let chatService = require('./api.service.js')
let moduleName = componentName = 'meiChatCustomer'
let socket = io(appConfig.baseUrl)

angular.module(moduleName, [chatService.name, 'ngFileUpload'])
    .component(componentName, {
        template: require('./index.html'),
        controller: Controller,
        controllerAs: 'mcc'
    });

function Controller(apiServiceCustomer, $scope, $element, $timeout) {
    var self = this
    this.showInbox = false
    let owner = appInfo.owner
    $timeout(()=> {
        apiServiceCustomer.getConversation({ owner: owner }, (res) => {
            if (!$.isEmptyObject(res)) {
                self.conver = res
                socket.emit('join_room', self.conver.id)
                self.user = res.Users[0]
                msg_history_scroll(500)
            } else {
                self.showInbox = true
                console.log($('.write_msg_customer'))
                self.conver = {
                    Messages: [{
                        content: 'Xin chào! Tôi có thể giúp gì cho bạn?',
                        username: 'admin',
                        type: 'text',
                        sendAt: new Date()
                    }]
                }
                self.user = {}
            }
        })
    }, 2000)
    
    $('.write_msg_customer').keypress((e) => {
        console.log('fawe')
        if (e.which == 13) {
            excNewCustomer(() => {
                apiServiceCustomer.sendMessage(token, {
                    content: $('.write_msg_customer').val(),
                    type: 'text',
                    idUser: self.user.id,
                    username: self.user.username,
                    idConversation: self.curConver.id,
                    nameConversation: self.curConver.name,
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
        cb()
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
        apiService.seenMessage({
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
    $('.container').draggable({
        start: function () {
            $(this).css("bottom", "auto");
            $(this).css("right", "auto");
        },
        containment: 'window',
        cursor: 'move'
    })
};
