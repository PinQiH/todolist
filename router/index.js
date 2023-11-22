const express = require("express");
const app = express.Router();
const admin = require("firebase-admin");

const db = admin.database();

//加上首頁路由
app.get('/', function (req, res) {
    db.ref('todos').once('value')
        .then(function (snapshot) {
            let data = snapshot.val();
            //當進入index時就會讀取
            res.render('index', {
                //資料庫的資料存在變數todolist裡面
                "todolist": data
            });
        });
});

app.post('/create-item', function (req, res) {
    //存取input欄位取得的值
    let item = req.body.item;

    //設定Firebase資料庫的路徑，並且使用push來新增資料
    let itemRef = db.ref('todos').push();

    //讓firebase的todos裡面產生一個item欄位
    itemRef.set({ "item": item })
        //確認是否存入資料庫中
        .then(function () {
            //使用once來取得資料庫的即時快照
            db.ref('todos').once('value', function (snapshot) {
                //自動轉址回到首頁
                res.redirect('/');
            })
        });
});

app.post('/update-item', function (req, res) {
    // 取得前端傳來的id值和text值
    let _id = req.body.id;
    let text = req.body.text;

    //透過firebase資料庫的路徑取得todos下面的某一筆紀錄
    let dbRef = db.ref('todos/' + _id);

    //進行更新
    dbRef.update({
        item: text
    });
});

app.post('/delete-item', function (req, res) {
    let id = req.body.id;
    let dbRef = db.ref('todos/' + id);
    dbRef.remove();
});

module.exports = app;