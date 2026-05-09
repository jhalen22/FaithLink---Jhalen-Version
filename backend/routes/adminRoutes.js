const express = require("express");
const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Event = require("../models/Event");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/admin/dashboard
// Returns all counts, recent records, and sacrament analytics in one round trip.
// All database queries run in parallel via Promise.all for efficiency.
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const [
      totalBookings,
      pendingBookings,
      approvedBookings,
      rejectedBookings,
      pendingDonations,
      verifiedDonations,
      rejectedDonations,
      totalParishioners,
      totalEvents,
      recentBookings,
      recentDonations,
      sacramentAgg,
    ] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: "pending" }),
      Booking.countDocuments({ status: "approved" }),
      Booking.countDocuments({ status: "rejected" }),
      Donation.countDocuments({ status: "pending" }),
      Donation.countDocuments({ status: "verified" }),
      Donation.countDocuments({ status: "rejected" }),
      User.countDocuments({ role: "parishioner" }),
      Event.countDocuments(),
      Booking.find()
        .populate("parishioner", "fullName")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("sacramentType preferredDate status parishioner"),
      Donation.find()
        .populate("parishioner", "fullName")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("amount purpose status parishioner createdAt"),
      // Group bookings by sacramentType for the Sacrament Summary analytics section
      Booking.aggregate([
        { $group: { _id: "$sacramentType", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({
      counts: {
        totalBookings,
        pendingBookings,
        approvedBookings,
        rejectedBookings,
        pendingDonations,
        verifiedDonations,
        rejectedDonations,
        totalParishioners,
        totalEvents,
      },
      recentBookings,
      recentDonations,
      // Normalise aggregation output to { label, count } objects
      sacramentSummary: sacramentAgg.map((s) => ({
        label: s._id,
        count: s.count,
      })),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
});

// GET /api/admin/trends
// Four MongoDB aggregations that reveal time-based patterns (Trend Analysis).
// All pipelines run in parallel via Promise.all.
router.get("/trends", protect, adminOnly, async (req, res) => {
  try {
    const [
      bookingsPerMonthRaw,
      donationsPerMonthRaw,
      activeBookingDaysRaw,
      massIntentionsPerMonthRaw,
    ] = await Promise.all([

      // 1. Total bookings grouped by year + month (chronological order)
      Booking.aggregate([
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // 2. Donations grouped by year + month; also sums the peso amount per period
      Donation.aggregate([
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count:       { $sum: 1 },
            totalAmount: { $sum: "$amount" },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),

      // 3. Booking count grouped by day of week (1=Sun … 7=Sat), top 5 busiest
      Booking.aggregate([
        {
          $group: {
            _id:   { $dayOfWeek: "$createdAt" },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),

      // 4. Mass Intentions only, grouped by year + month
      Booking.aggregate([
        { $match: { sacramentType: "Mass Intentions" } },
        {
          $group: {
            _id: {
              year:  { $year:  "$createdAt" },
              month: { $month: "$createdAt" },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } },
      ]),
    ]);

    // Flatten MongoDB _id wrappers into plain objects for easy frontend consumption
    const normaliseMonthly = (rows) =>
      rows.map((r) => ({ year: r._id.year, month: r._id.month, count: r.count, totalAmount: r.totalAmount ?? null }));

    res.json({
      bookingsPerMonth:       normaliseMonthly(bookingsPerMonthRaw),
      donationsPerMonth:      normaliseMonthly(donationsPerMonthRaw),
      activeBookingDays:      activeBookingDaysRaw.map((r) => ({ dayOfWeek: r._id, count: r.count })),
      massIntentionsPerMonth: normaliseMonthly(massIntentionsPerMonthRaw),
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to load trend data",
      error: error.message,
    });
  }
});

module.exports = router;
