import express from "express";
import  {getCustomers} from "./controller/dbquery.js";
import  {getAllCustomersWithoutPagination} from "./controller/dbqueryAll.js";
import cors from 'cors';
const app = express();

app.use(express.json());
app.use(cors());

app.get('/health' , (req , res)=>{
    res.json({
        message : "API is working"
    })
})


app.get("/search", getCustomers);
app.get("/searchall", getAllCustomersWithoutPagination);

app.listen(3000 , ()=>{
    console.log("Server is running at port 3000");
})