//監聽程式

//點擊清單項目時加入checked標記
var list = document.querySelector('ul');
list.addEventListener('click', function (ev) {
    if (ev.target.tagName === 'LI') {
        ev.target.classList.toggle('checked');
    }
}, false);


document.addEventListener('click', function (e) {
    //原有的文字
    let originalText = e.target.parentElement.parentElement.querySelector(".item-text");

    // 取得清單項目的id
    let dataId = e.target.getAttribute("data-id");

    //監聽Edit(編輯)按鈕的click事件
    if (e.target.classList.contains("edit-me")) {
        // 提示使用者輸入新的待辦事項，把舊有的文字顯示在修改框
        let userInput = prompt("請修改待辦事項", originalText.innerHTML);

        if (userInput !== null) {
            // 發送POST請求到後端的/update-item路由，將新的待辦事項和id傳遞給後端
            axios.post('/update-item', {
                id: dataId,
                text: userInput
            }).then(function (response) {
                console.log(response.data); // 這裡可以處理後端回傳的資料
                // 進行一些更新前端顯示的處理
            }).then(function () {
                originalText.innerHTML = userInput;
            }).catch(function (error) {
                console.log(error);
            });
        };
    };

    //監聽Delete(刪除)按鈕的click事件
    if (e.target.classList.contains("delete-me")) {
        if (confirm("確定要刪除這筆資料嗎 ? [" + originalText.innerHTML + "]")) {
            axios.post('/delete-item', {
                id: dataId
            }).then(function () {
                //把被指定的firebase路徑下資料全部刪除
                e.target.parentElement.parentElement.remove();
            }).catch(err => {
                console.log(err);
            });
        };
    };
});

