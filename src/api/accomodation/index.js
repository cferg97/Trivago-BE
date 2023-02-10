import express from "express";
import createHttpError from "http-errors";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { HostOnlyMiddleware } from "../../lib/auth/hostOnly.js";
import accomModel from "./model.js";

const accomRouter = express.Router();

accomRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accom = await accomModel.find({}).populate({
      path: "host",
      select: ["email", {_id: 0}]
    });
    res.send(accom);
  } catch (err) {
    next(err);
  }
});

accomRouter.post(
  "/",
  JWTAuthMiddleware,
  HostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const newAccom = new accomModel({ ...req.body, host: req.user._id });
      const { _id } = await newAccom.save();
      res.status(201).send({ id: _id });
    } catch (err) {
      next(err);
    }
  }
);

export default accomRouter;
