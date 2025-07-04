const mysql =require("mysql2/promise");

async function initDb(){
  try{
    const connection =await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password:'Faruq@11148',
    database: 'temp',
});

console.log("connected to db");
return connection;
} catch(err){
    console.err("connection failed!");
}
}

module.exports=initDb();