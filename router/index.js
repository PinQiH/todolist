const express = require("express")
const app = express.Router()
const admin = require("firebase-admin")

const db = admin.database()

//加上首頁路由
app.get("/", function (req, res) {
  db.ref("todos")
    .orderByChild("order")
    .once("value")
    .then(function (snapshot) {
      let data = []

      // 遍历 snapshot 并将数据放入数组中
      snapshot.forEach(function (childSnapshot) {
        let item = childSnapshot.val()
        item.id = childSnapshot.key // 如果需要保存 ID，可以把它作为属性添加到每个 item 中
        data.push(item)
      })

      // 渲染页面，传递已排序的数组
      res.render("index", {
        todolist: data,
      })
    })
    .catch(function (error) {
      console.error("Error fetching data:", error)
      res.status(500).send("Error fetching data")
    })
})

app.post("/create-item", function (req, res) {
  // 存取input欄位取得的值
  let item = req.body.item

  // 設定Firebase資料庫的路徑
  let todosRef = db.ref("todos")

  // 先取得目前資料庫中最大的順序
  todosRef
    .orderByChild("order")
    .limitToLast(1)
    .once("value")
    .then(function (snapshot) {
      let maxOrder = 0
      snapshot.forEach(function (childSnapshot) {
        // 取得目前最大的order值
        maxOrder = childSnapshot.val().order || 0
      })

      // 新的項目順序為當前最大順序加一
      let newOrder = maxOrder + 1

      // 設定新項目的參考路徑，並添加item和order
      let newItemRef = todosRef.push()
      return newItemRef.set({
        item: item,
        order: newOrder,
      })
    })
    .then(function () {
      // 使用一次性讀取來取得最新的數據快照，並重新導向首頁
      todosRef.once("value", function (snapshot) {
        res.redirect("/")
      })
    })
    .catch(function (error) {
      console.error("Error creating item:", error)
      res.status(500).send("Internal Server Error")
    })
})

app.post("/update-item", function (req, res) {
  // 取得前端傳來的id值和text值
  let _id = req.body.id
  let text = req.body.text

  //透過firebase資料庫的路徑取得todos下面的某一筆紀錄
  let dbRef = db.ref("todos/" + _id)

  //進行更新
  dbRef.update({
    item: text,
  })
})

app.post("/delete-item", function (req, res) {
  let id = req.body.id
  let dbRef = db.ref("todos/" + id)
  dbRef.remove()
})

app.post("/update-order-up", function (req, res) {
  // 取得前端傳來的id值
  let _id = req.body.id

  //透過firebase資料庫的路徑取得todos下面的某一筆紀錄
  let dbRef = db.ref("todos/" + _id)
  console.log(_id)

  // 取得當前的order值，並將其減1後更新
  dbRef
    .once("value")
    .then(function (snapshot) {
      let currentData = snapshot.val()
      let currentOrder = currentData.order
      let currentItem = currentData.item

      // 打印出order和item
      console.log(`Item: ${currentItem}, Current Order: ${currentOrder}`)

      // 檢查order值是否大於0，以避免負值
      if (currentOrder > 0) {
        return dbRef.update({
          order: currentOrder - 1,
        })
      } else {
        res.status(400).send("Order value is already at minimum")
        throw new Error("Order value is already at minimum")
      }
    })
    .then(() => {
      res.redirect("/") // 更新成功后重定向到首页
    })
    .catch((error) => {
      console.error("Error updating order:", error.message)
      res.status(500).send("Error updating order: " + error.message)
    })
})

app.post("/update-order-down", function (req, res) {
  // 取得前端傳來的id值
  let _id = req.body.id

  //透過firebase資料庫的路徑取得todos下面的某一筆紀錄
  let dbRef = db.ref("todos/" + _id)

  // 取得當前的order值，並將其加1後更新
  dbRef
    .once("value")
    .then(function (snapshot) {
      let currentOrder = snapshot.val().order

      // 将 order 值加 1 并更新
      return dbRef.update({
        order: currentOrder + 1,
      })
    })
    .then(() => {
      res.redirect("/") // 更新成功后重定向到首页
    })
    .catch((error) => {
      console.error("Error updating order:", error.message)
      res.status(500).send("Error updating order: " + error.message)
    })
})

module.exports = app
