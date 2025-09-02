import Listing from "../models/listing.model.js";
import jwt from "jsonwebtoken";
import errorHandler from "../utils/error.js";

// Create a new listing
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

    // Validate incoming fields
    const allowedFields = [
      "name", "description", "address", "type",
      "bedrooms", "bathrooms", "regularPrice", 
      "discountPrice", "offer", "parking", "furnished", "imageUrls"
    ];
    const data = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) data[field] = req.body[field];
    });

    const listing = new Listing({
      ...data,
      userRef: decoded.id,
    });

    await listing.save();

    return res.status(201).json({
      success: true,
      message: "Listing created successfully",
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// Delete a listing
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

    res.status(200).json({
      success: true,
      message: "Listing has been deleted"
    });
  } catch (error) {
    next(error);
  }
};

// Update a listing
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
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    if (decoded.id !== listing.userRef.toString()) {
      return next(errorHandler(401, "You can only update your own listing"));
    }

    // Only allow certain fields to be updated
    const allowedFields = [
      "name", "description", "address", "type",
      "bedrooms", "bathrooms", "regularPrice", 
      "discountPrice", "offer", "parking", "furnished", "imageUrls"
    ];
    const updates = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const updatedListing = await Listing.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Listing updated successfully",
      data: updatedListing
    });
  } catch (error) {
    next(error);
  }
};

// Get a single listing
export const getListing = async (req, res, next) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return next(errorHandler(404, "Listing not found!"));

    res.status(200).json({
      success: true,
      data: listing
    });
  } catch (error) {
    next(error);
  }
};

// Get multiple listings with filters
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

    return res.status(200).json({
      success: true,
      data: listings
    });
  } catch (error) {
    next(error);
  }
};
