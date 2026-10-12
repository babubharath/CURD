var express = require("express")
var mysql = require("mysql")
var app = express()
app.use(express.json())

const con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "curd"
})
con.connect((err) =>{
    if(err){
        console.log(err)
    }else{
        console.log("connected")
    }
})

app.post('/post',(req,res)=>{
    const id = req.body.id;
    const name = req.body.name;
    const mark= req.body.mark;

    con.query('insert into mytable values(?,?,?)', [id, name, mark], (err, result) => {
        if(err){
            console.log(err)
        }else{
            res.send("Data inserted successfully")
        }
    })
})

app.get('/fetch',(req,res) =>{
    con.query('select * from mytable',(err,result,fileds)=>{
        if(err){
            console.log(err)
            return res.status(500).send("Error fetching data");
        }else{
            res.send(result)
        }
    })
})

app.get('/fetchbyid/:id',(req,res) => {
    const id = req.params.id;
    con.query('select * from mytable where id = ?', [id], (err,result) => {
        if(err){
            console.log(err)
            return res.status(500).send("Error fetching data");
        }else{
            res.send(result)
        }
    })
})

app.put('/update/:id',(req,res) => {
    const id = req.params.id;
    const name = req.body.name;
    const mark = req.body.mark;

    con.query('update mytable set name = ?, mark = ? where id = ?', [name, mark, id], (err, result) => {
        if(err){
            console.log(err)
            return res.status(500).send("Error updating data");
        }else{
            if(result.affectedRows === 0){
                return res.status(404).send("Data not found");
            }
            res.send("Data updated successfully")
        }
    })
})

app.delete('/delete/:id',(req,res) => {
    const id = req.params.id;
    con.query('delete from mytable where id = ?', [id] ,(err,result) => {
        if(err){
            console.log(err)
            return res.status(500).send("Error deleting data");
        }else{
            if(result.affectedRows === 0){
                return res.status(404).send("Data not found");
            }
            res.send("Data deleted successfully")
        }
    })

})

app.patch('/updatesep/:id', (req, res) => {
    const id = req.params.id;
    const { mark } = req.body;

    con.query('UPDATE mytable SET mark = ? WHERE id = ?',[mark, id],(err, result) => {
            if (err) {
                return res.status(500).send(err.message);
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Record not found");
            }

            res.send("Data updated successfully");
        }
    )
})

app.listen(3000, (err) => {
    if(err){    
        console.log(err)
    }else{
    console.log("server is running on port 3000")
    }
})