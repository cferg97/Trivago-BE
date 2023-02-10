import createHttpError from "http-errors";

export const HostOnlyMiddleware = (req, res, next) => {
  if (req.user.role === "Host") {
    next();
  } else {
    next(
      createHttpError(403, "You are not authorized to carry out this action")
    );
  }
};
