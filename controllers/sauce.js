const Sauce = require("../models/Sauce");
const fs = require("fs");

// sauce

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  sauce
    .save()
    .then(() =>
      res.status(201).json({ message: "Nouvelle Sauce Enregistrée !" })
    )
    .catch((error) => res.status(400).json({ error }));
};

// modifier les sauces

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file
    ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  Sauce.updateOne(
    { _id: req.params.id },
    { ...sauceObject, _id: req.params.id }
  )
    .then(() => res.status(200).json({ message: "Objet modifié !" }))
    .catch((error) => res.status(400).json({ error }));
};

// supprimer les sauces

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then((sauce) => {
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      Sauce.deleteOne({ _id: req.params.id })
        .then(() => res.status(200).json({ message: "Objet supprimé !" }))
        .catch((error) => res.status(400).json({ error }));
    });
  });
};

// trouver une sauce

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => res.status(404).json({ error }));
};

// toutes les sauce

exports.getAllSauce = (req, res, next) => {
  Sauce.find()
    .then((sauce) => {
      res.status(200).json(sauce);
    })
    .catch((error) => res.status(400).json({ error }));
};

// liké/disliké une sauce

exports.likeSauce = (req, res, next) => {
  const userId = req.body.userId;
  if (req.body.like === -1) {
    const userId = req.body.userId;

    Sauce.updateOne({ _id: req.params.id }, { $inc: { dislikes: 1 } })
      .then(() => res.status(200).json({ message: " Sauce aimée !" }))
      .catch((error) => res.status(400).json({ error }));

    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersDisliked: userId } }
    )
      .then(() =>
        res.status(200).json({
          message: " Sauce non aimée !",
        })
      )
      .catch((error) => res.status(400).json({ error }));
  }

  if (req.body.like === 1) {
    Sauce.updateOne(
      { _id: req.params.id },
      { $push: { usersLiked: userId }, $inc: { likes: 1 } }
    )
      .then(() => res.status(200).json({ message: " Sauce aimée !" }))
      .catch((error) => res.status(400).json({ error }));
  }

  if (req.body.like === 0) {
    const sauceId = req.params.id;
    Sauce.findOne({ _id: req.params.id })
      .then((sauce) => {
        if (sauce.usersLiked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersLiked: userId }, $inc: { likes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Like retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
        if (sauce.usersDisliked.includes(userId)) {
          Sauce.updateOne(
            { _id: sauceId },
            { $pull: { usersDisliked: userId }, $inc: { dislikes: -1 } }
          )
            .then(() => res.status(200).json({ message: "Dislike retiré !" }))
            .catch((error) => res.status(400).json({ error }));
        }
      })
      .catch((error) => res.status(404).json({ error }));
  }
};
