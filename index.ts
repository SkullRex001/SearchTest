import express from "express";
import  {getCustomers} from "./controller/dbquery.js";
const app = express();

app.use(express.json());

app.get('/health' , (req , res)=>{
    res.json({
        message : "API is working"
    })
})


app.get("/search", getCustomers);

app.listen(3000 , ()=>{
    console.log("Server is running at port 3000");
})