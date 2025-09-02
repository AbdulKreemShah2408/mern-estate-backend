import Listing from "../models/listing.model.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utils/error.js";

export const createListing = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(errorHandler(401, "Unauthorized"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(errorHandler(401, "Invalid or expired token"));
    }

    const listing = new Listing({
      ...req.body,
      userRef: decoded.id,
    });

    await listing.save();
    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      _id: listing._id,
      ...listing._doc,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteListing = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(errorHandler(401, "Unauthorized"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(errorHandler(401, "Invalid or expired token"));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    if (decoded.id !== listing.userRef.toString()) {
      return next(errorHandler(401, "You can only delete your own listings!"));
    }

    await Listing.findByIdAndDelete(req.params.id);
    res.status(200).json("Listing has been deleted");
  } catch (error) {
    next(error);
  }
};

export const updateListing = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return next(errorHandler(401, "Unauthorized"));

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return next(errorHandler(401, "Invalid or expired token"));
    }

    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing was not found!"));

    if (decoded.id !== listing.userRef.toString()) {
      return next(errorHandler(401, "You can only update your own listing"));
    }

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedListing);
  } catch (error) {
    next(error);
  }
};

export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing was not found!"));
    res.status(200).json(listing);
  } catch (error) {
    next(error);
  }
};

export const getListings = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 9;
    const startIndx = parseInt(req.query.startIndx) || 0;

    let offer = req.query.offer;
    if (offer === undefined || offer === "false") offer = { $in: [false, true] };

    let furnished = req.query.furnished;
    if (furnished === undefined || furnished === "false") furnished = { $in: [false, true] };

    let parking = req.query.parking;
    if (parking === undefined || parking === "false") parking = { $in: [false, true] };

    let type = req.query.type;
    if (type === undefined || type === "all") type = { $in: ["sale", "rent"] };

    const searchTerm = req.query.searchTerm || "";
    const sort = req.query.sort || "createdAt";
    const order = req.query.order || "desc";

    const listings = await Listing.find({
      name: { $regex: searchTerm, $options: "i" },
      offer,
      parking,
      furnished,
      type,
    })
      .sort({ [sort]: order })
      .limit(limit)
      .skip(startIndx);

    return res.status(200).json(listings);
  } catch (error) {
    next(error);
  }
};
