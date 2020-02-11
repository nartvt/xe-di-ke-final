const mongoose = require("mongoose");

const Joi = require("joi");
const tripSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    departurePlace: String,
    arrivalPlace: String,
    departureTime: Date,
    seats: Number,
    fee: Number,
    passengers: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        locationGetIn: String,
        locationGetOff: String,
        paymentStatus: {
          type: Boolean,
          default: false
        },
        bookingSeats: Number,
        note: String
      }
    ]
  },
  {
    timestamps: true
  }
);

const Trip = mongoose.model("Trip", tripSchema);

const createTripSchema = Joi.object({
  driverId: Joi.string().required(),
  departurePlace: Joi.string().required(),
  arrivalPlace: Joi.string().required(),
  departureTime: Joi.date().required(),
  seats: Joi.number().required(),
  fee: Joi.number().required(),
  passengers: Joi.array().items(
    Joi.object({
      userId: Joi.string().required(),
      locationGetIn: Joi.string().required(),
      locationGetOff: Joi.string().required(),
      paymentStatus: Joi.boolean(),
      bookingSeats: Joi.number().required(),
      notes: Joi.string()
    })
  )
});

const bookTripSchema = Joi.object({
  tripId: Joi.string().required(),
  locationGetIn: Joi.string().required(),
  locationGetOff: Joi.string().required(),
  bookingSeats: Joi.number().required(),
  note: Joi.string()
});

module.exports = { Trip, createTripSchema, bookTripSchema };
