const portNum = 11111;
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const connection = mysql.createPool({
    host: 'localhost',
    user: 'testuser',
    password: 'Pass_1234',
    database: 'sampleDB'
});

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get("/",async(req,res)=>{
    let send_data;
    let q = req.query;
    switch(q.op){
        case 'get':{
            send_data = "a";
            break;
        }
        case 'ping':{
            send_data = "pong";
            break;
        }
        case 'login':{
            send_data = await UserLogin(q.id,q.password);
        }
    }
    console.log(send_data);
    res.status(200).send(send_data);
});

app.post("/",(req,res)=>{
    let send_data = null;
    let q = req.body;
    switch(q.op){
        case 'update':{
            send_data = UpdateData(q.table,q.id,q.data);
            break;
        }
        case 'regist':{
            send_data = RegistData(q.table,q.data);
        }
    }
    console.log(send_data);
    res.status(200).send(send_data);
});

app.listen(portNum);

console.log(`using port ${portNum}`);

async function UserLogin(id,pass){
    let isMatch;
    const [res,error] = await connection.query(`SELECT * FROM playerdata WHERE player_id = '${id}'`)
    .catch(()=>{
        if(error)throw error;
    });
    console.log(res[0].password);
    isMatch=(res[0].password==pass);
    console.log(isMatch+"0");
    console.log(isMatch+"1");
    return (isMatch)?"successLogin":"AuthError";
}

async function RegistData(table,dataobj){
    let dataAry = dataobj.split(',');
    let keys="",values="";
    for(let ele of dataAry){
        ele = ele.split('=');
        keys += `${ele[0]},`
        values += `'${ele[1]}',`;
    }
    keys += "regist_date";
    values += `'${GetToday()}'`;
    const [res,error] = await connection.query(`INSERT INTO ${table}(${keys}) VALUES (${values})`)
    .catch(()=>{
        if(error)throw error;
    });
    console.log(res);
    return 'success!';
}

function UpdateData(table,targetId,dataobj){
    connection.query(`UPDATE ${table} SET ${dataobj} WHERE player_id='${targetId}'`,(error,res)=>{
        if(error)throw error;
        console.log(res);
    });
    return 'success!';
}

function GetToday(){
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
}
