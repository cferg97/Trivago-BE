import express from "express";
import createHttpError from "http-errors";
import usersModel from "./model.js";
import q2m from "query-to-mongo";
import { createAccessToken } from "../../lib/auth/tools.js";
import { JWTAuthMiddleware } from "../../lib/auth/jwtAuth.js";

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

usersRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
    try{
        const me = await usersModel.findById(req.user._id)
        res.send(me)
    }catch(err){
        next(err)
    }
})

export default usersRouter;
