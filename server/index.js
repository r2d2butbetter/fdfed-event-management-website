import express from 'express';

const app = express()

app.use(express.json());

app.get('/test', (req, res) => {
    console.log("Test successful");
    res.send("You've tested the route");
});

app.listen(3000, () => {
    console.log("App is listening at http://localhost:3000")
});
