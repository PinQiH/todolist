//建立入口檔案

//載入express套件
const express = require('express');

//初始一個 express服務
const app = express();

//載入EJS樣版引擎套件
const engine = require('ejs-locals');

//設定ejs為樣版引擎
app.engine('ejs', engine);
app.set('views', './views');
app.set('view engine', 'ejs');

//載入firebase模組
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// firebase 初始化
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://todolist-ce39e-default-rtdb.firebaseio.com"
});

//middleware
app.use(express.urlencoded({
    extended: false
}));

//加上express內建的static middleware
app.use(express.static('public/css'));
app.use(express.static('public/img'));
app.use(express.static('public/js'));

//解析JSON物件
app.use(express.json())

const indexRouter = require("./router/index");
app.use("/", indexRouter);

//監聽 3000 port
app.listen(3000);