import express from "express";
import createHttpError from "http-errors";
import usersModel from "./model.js";
import accomModel from "../accomodation/model.js";
import q2m from "query-to-mongo";
import { createAccessToken } from "../../lib/auth/tools.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";
import { HostOnlyMiddleware } from "../../lib/auth/hostOnly.js";

const usersRouter = express.Router();

usersRouter.post("/register", async (req, res, next) => {
  try {
    const newUser = new usersModel(req.body);
    const { _id, role } = await newUser.save();
    const payload = { _id, role };
    const accessToken = await createAccessToken(payload);
    res.send({ accessToken });
  } catch (err) {
    next(err);
  }
});

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await usersModel.checkCredentials(email, password);
    if (user) {
      const payload = { _id: user._id, role: user.role };
      const accessToken = await createAccessToken(payload);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Please check your credentials are correct"));
    }
  } catch (err) {
    next(err);
  }
});

usersRouter.get(
  "/me/accomodation",
  JWTAuthMiddleware,
  HostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accom = await accomModel.find(
        { host: req.user._id },
        "-createdAt -updatedAt -__v -host"
      );
      if (accom.length === 0) {
        next(createHttpError(404, "This user has no posted accomodation."));
      }
      if (accom.length >= 1) {
        res.send(accom);
      }
    } catch (err) {}
  }
);

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const me = await usersModel.findById(req.user._id);
    res.send(me);
  } catch (err) {
    next(err);
  }
});

export default usersRouter;
