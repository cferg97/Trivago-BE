import mongoose from "mongoose";

const { Schema, model } = mongoose;

const accomodationSchema = new Schema(
  {
    name: { type: String, required: true },
    host: [{ type: Schema.Types.ObjectId, ref: "users", required: true }],
    description: { type: String, required: true },
    maxGuests: { type: Number, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export default model("accomodation", accomodationSchema);
