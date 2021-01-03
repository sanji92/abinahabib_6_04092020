const express = require("express");

const bodyParser = require("body-parser"); 
const mongoose = require("mongoose");
const cors = require("cors");
const { expressShield } = require("node-shield");
const helmet = require("helmet");
const sauceRoutes = require("./routes/sauce");
const userRoutes = require("./routes/user");
const path = require("path");

const app = express();

mongoose
  .connect(
    "mongodb+srv://!!!:!!!!@cluster0.pqztm.mongodb.net/<backend>?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"));

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

app.use(
  expressShield({
    errorHandler: (shieldError, req, res, next) => {
      console.error(shieldError);
      res.sendStatus(400);
    },
  })
);

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/files", express.static(path.join(__dirname, "files")));
app.use("/api/sauces", sauceRoutes);
app.use("/api/auth", userRoutes);

module.exports = app;
