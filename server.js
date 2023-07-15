const Cache = require('node-cache')
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const port = process.env.PORT || 3000;
const path = require("path")
var bodyParser = require('body-parser');
const NodeCache = require('node-cache'),
Mcache = new NodeCache({stdTTL:900});

var randomCheckList = []
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    var randomNumber;
    do {
         randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (randomCheckList.includes(randomNumber)); // 檢查數字是否已存在於列表中
    randomCheckList.push(randomNumber)
    return randomNumber;
}


app.use(bodyParser.json())
// 配置静态文件目录
app.use(express.static('./build'));

app.get('/', (req, res) => {
    Mcache.flushAll
    res.sendFile('index.html', { root: './build' });
});
app.get('/share', (req, res) => {
    res.sendFile('index.html', { root: './build' });
});

app.post("/share/getcode", (req, res) => { 
    console.log("[send]",req.body)
    
    const text = req.body.text,
        rantxt = `${getRandomInt(100000, 999999)}`;
 
    var obj = { "text": text, "useTimesRemain": 3 }
    Mcache.set(rantxt, obj)
    console.log(rantxt)
    res.send(JSON.stringify({"success": true,"rantxt": rantxt}))
    res.end()
})

app.post("/get/text", (req, res) => {
    var uid = req.body.uid
    res.send(JSON.stringify({
        text:Mcache.get(uid)
    }))
})

app.post("/delete/uid", (req, res) => {

})

app.post("/query/uid", (req, res) => {
    var uid = String(req.body.uid)
    res.send(JSON.stringify({
        status:Mcache.get(uid)
    }))
    res.end()

})

app.listen(port, () => {
    console.log('Server is running on port 3000');
});
