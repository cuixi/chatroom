const express = require('express');
const bodyParser = require('body-parser');
const hbs = require('express-handlebars');
const websocket = require('socket.io');
const http = require('http');
const path = require('path');
const config = require('./config');
const app = express();



/**
 * 中间件处理
 */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname + '/public')));

app.set('views', path.join(__dirname + '/views'));
app.engine('html', hbs());
app.set('view engine', '.html');


/**
 * 路由处理
 */
app.get('/', function(req, res){
	res.render('index');
});



const server = http.createServer(app);

server.listen(config.port, '0.0.0.0', function(err){
	if(err){
		console.log(err);
		return false;
	}
	console.log('启动成功，listen on ' + config.port);
});


/**
 * 启动socket服务
 */
const io = websocket(server);

let onlineUsers = [];
let messages = [];
let room = 'test';

io.on('connection', function(socket){
	let user = '';
	
	/**
	 * 监听用户登陆
	 */
	socket.on('login', function(data){
		user = data;
		onlineUsers.push(data);
		socket.join(room);
		io.sockets.emit('login', {onlineUsers: onlineUsers, joinUser: data});
		if(messages.length > 0){
			io.sockets.in(room).emit('message', messages);
		}
	});

	/**
	 * 监听发送消息
	 */
	socket.on('message', function(data){
		messages.push(data);
		io.sockets.in(room).emit('message', messages);
	});

	/**
	 * 监听用户退出
	 */
	socket.on('disconnect', function(){
		var index = onlineUsers.indexOf(user);
		onlineUsers.splice(index, 1);
		io.sockets.in(room).emit('logout', {onlineUsers: onlineUsers, logoutUser: user});
	});


});





