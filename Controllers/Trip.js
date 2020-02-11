const { Trip, createTripSchema, bookTripSchema } = require("../Models/Trip");

exports.createTrip = async (req, res) => {
  //1.validate data từ client
  const validationResult = createTripSchema.validate(req.body);
  if (validationResult.error)
    return res
      .status(422)
      .send({ message: "Validation fail!", data: validationResult.error });
  //2.check depatureTime( new Date(depatureTime)  < new Date() )
  if (new Date(req.body.depatureTime) < new Date())
    return res.status(400).send();
  try {
    //3. create new trip + save()
    const newTrip = await new Trip(req.body).save();
    //4.send back to client
    res.send(newTrip);
  } catch (e) {
    res.status(500).send();
  }
};

exports.getTrips = async (req, res) => {
  //limit= 10 và page = 1
  const {
    page = 1,
    limit = 4,
    departurePlace,
    arrivalPlace,
    departureTime,
    seats
  } = req.query;
  const skipItem = (+page - 1) * limit;

  try {
    const fromDate = new Date(departureTime);
    const toDate = new Date(departureTime);
    toDate.setDate(toDate.getDate() + 1);

    const trips = await Trip.find({
      departurePlace,
      arrivalPlace,
      departureTime: {
        $gte: fromDate,
        $lt: toDate
      },
      //greater than or equal
      seats: { $gte: +seats }
    })
      .skip(skipItem)
      .limit(+limit);
    res.send(trips);
  } catch (e) {
    res.status(500).send();
  }
};

exports.bookTrip = async (req, res) => {
  const validationResult = bookTripSchema.validate(req.body);
  if (validationResult.error)
    return res
      .status(422)
      .send({ message: "Validation fail!", data: validationResult.error });

  const {
    tripId,
    locationGetIn,
    locationGetOff,
    bookingSeats,
    note
  } = req.body;

  try {
    const existedTrip = await Trip.findById(tripId);

    if (!existedTrip)
      return res.status(400).send({ message: "Trip not found." });

    if (bookingSeats > existedTrip.seats)
      return res
        .status(400)
        .send({ message: "Available seats are not enough." });

    let passenger = {
      userId: req.userId,
      locationGetIn,
      locationGetOff,
      bookingSeats,
      note
    };

    existedTrip.passengers.push(passenger);
    existedTrip.seats = existedTrip.seats - bookingSeats;

    await existedTrip.save();

    res.send(existedTrip);
  } catch (e) {
    res.status(500).send(e);
  }
};
// module.exports = { createTrip,getTrips };
