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
      select: "email -_id",
    });
    res.send(accom);
  } catch (err) {
    next(err);
  }
});

accomRouter.get("/:id", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const accom = await accomModel.findById(req.params.id).populate({
      path: "host",
      select: "email -_id",
    });
    if (accom) {
      res.send(accom);
    } else {
      next(
        createHttpError(404, `Accomodation with ID ${req.params.id} not found.`)
      );
    }
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

accomRouter.put(
  "/:id",
  JWTAuthMiddleware,
  HostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accom = await accomModel.findOne({ _id: req.params.id });

      if (accom) {
        if (req.user._id === accom.host.toString()) {
          await accomModel.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
          });
          res.status(204).send();
        } else {
          next(
            createHttpError(
              403,
              "You are not authorized to carry out this action."
            )
          );
        }
      } else {
        next(
          createHttpError(
            404,
            `Accomodation with ID ${req.params.id} not found.`
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

accomRouter.delete(
  "/:id",
  JWTAuthMiddleware,
  HostOnlyMiddleware,
  async (req, res, next) => {
    try {
      const accom = await accomModel.findOne({ _id: req.params.id });
      if (accom) {
        if (req.user._id === accom.host.toString()) {
          const deletedAccom = await accomModel.findByIdAndDelete(
            req.params.id
          );
          if (deletedAccom) {
            res.status(204).send();
          } else {
            next(
              createHttpError(
                404,
                `Accomodation not found with ID ${req.params.id}`
              )
            );
          }
        }
      } else {
        next(
          createHttpError(
            403,
            `You are not authorized to carry out this action.`
          )
        );
      }
    } catch (err) {
      next(err);
    }
  }
);

export default accomRouter;
