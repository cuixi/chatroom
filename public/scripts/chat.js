window.onload = function(){
	var loginModule = document.querySelector('.login_module');
	var chatRoom = document.querySelector('.chat_room');
	var chatMsg = document.querySelector('.chat_msg');
	var chatList = document.querySelector('.chat_list');
	var username = document.querySelector('.username');
	var login = document.querySelector('.login');
	var msg = document.querySelector('.msg');
	var send = document.querySelector('.send');

	var interface = {
		init: function(){
			var self = this;
			/**
			 * 用户登陆
			 */
			login.addEventListener('click', this.login);
			username.addEventListener('keyup', function(e){
				if(e.keyCode == 13){
					self.login();
				}
			});

			/**
			 * 发送消息
			 */
			send.addEventListener('click', this.send);
			msg.addEventListener('keyup', function(e){
				if(e.keyCode == 13){
					self.send();
				}
			});
		},
		login: function(){
			if(username.value){
				chat.login(username.value);
				username.value = '';
				loginModule.style.display = 'none';
				chatRoom.style.display = 'flex';
			}else{
				console.log('请输入用户名');
				username.focus();
			}
		},
		send: function(){
			if(msg.value){
				chat.sendMsg(msg.value);
				msg.value = '';
			}else{
				console.log('请输入聊天消息');
				msg.focus();
			}
		},
		// 滚动到聊天记录底部
		scrollToBottom: function(){
			var scrollHeight = chatMsg.scrollHeight;
			chatMsg.scrollTo(0, scrollHeight);
		},
		// 更新在线信息
		updateOnlineInfo: function(onlineInfo){
			var num = document.querySelector('.num');
			var tips = document.querySelector('.tips');
			var len = onlineInfo.onlineUsers.length;
			
			num.innerHTML = len;
			if(onlineInfo.joinUser){
				tips.innerHTML = '欢迎 ' + onlineInfo.joinUser.username + ' 加入聊天室';
			}else if(onlineInfo.logoutUser){
				tips.innerHTML = onlineInfo.logoutUser.username + ' 退出聊天室';
			}
			setTimeout(function(){
				tips.innerHTML = '';
			}, 5000);
		},
		/**
		 * 更新聊天消息
		 * @param  Array messages 消息数组
		 */
		updateMsg: function(messages, user){
			var msgList = '';
			var avatar = '';
			var username = '';
			var chat = '';
			var chatItem = '';
			
			/**
			 * 更新聊天列表dom
			 */
			for(var i=0; i<messages.length; i++){
				avatar = '<span class="avatar">头像</span>';
				username = '<p class="username">'+ messages[i].username +'</p>';
				chat = '<p class="chat">'+ messages[i].content +'</p>';
				chatItem = '<div class="content">'+ username + chat +'</div>';
				if(messages[i].uid == user.uid){
					msgList += '<li class="current">'+ chatItem + avatar +'</li>';
				}else{
					msgList += '<li>'+ avatar + chatItem +'</li>';
				}
			}
			chatList.innerHTML = msgList;
			this.scrollToBottom();
		}
	}
	

	var chat = {
		socket: null,
		user: {},
		onlineInfo: null,
		msgList: [],
		getUid: function(){
			var uid = new Date().getTime() + '' + Math.floor(Math.random()*1000);
			return uid;
		},
		login: function(username){
			var self = this;
			var uid = this.getUid();

			this.user = {
				uid: uid,
				username : username
			};
			// 连接socket服务
			this.socket = io.connect(config.domain +':'+ config.port);

			// 用户登陆
			this.socket.emit('login', this.user);
			this.socket.on('login', function(data){
				interface.updateOnlineInfo(data);
			});

			// 监听用户消息
			this.socket.on('message', function(data){
				self.msgList = data;
				interface.updateMsg(self.msgList, self.user);
			});

			this.socket.on('logout', function(data){
				interface.updateOnlineInfo(data);
			});
		},
		sendMsg: function(msg){
			var self = this;
			var msgObj = {
				uid: this.user.uid,
				username: this.user.username,
				content: msg
			};

			// 发送用户消息
			this.socket.emit('message', msgObj);
		}
	};


	interface.init();

}