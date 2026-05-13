const express = require("express");
const Booking = require("../models/Booking");
const Donation = require("../models/Donation");
const User = require("../models/User");
const Event = require("../models/Event");
const Stream = require("../models/Stream");
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
// (Trend Analysis).
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

// GET /api/admin/reports/summary
// Returns high-level counts used in the Reports page stats row.
router.get("/reports/summary", protect, adminOnly, async (req, res) => {
  try {
    const months = await Booking.aggregate([
      {
        $group: {
          _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        },
      },
    ]);
    res.json({
      availableReports: 6,
      monthsOfBookingData: months.length,
      exportFormats: ["PDF", "CSV"],
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load report summary", error: error.message });
  }
});

// GET /api/admin/reports/:reportType
// Returns detailed rows for a specific report type.
router.get("/reports/:reportType", protect, adminOnly, async (req, res) => {
  const { reportType } = req.params;
  try {
    let data = [];

    if (reportType === "sacrament-bookings") {
      const raw = await Booking.find()
        .populate("parishioner", "fullName")
        .sort({ createdAt: -1 })
        .select("sacramentType preferredDate preferredTime status createdAt parishioner");
      data = raw.map((b) => ({
        parishioner: b.parishioner?.fullName ?? "—",
        sacramentType: b.sacramentType,
        preferredDate: b.preferredDate
          ? new Date(b.preferredDate).toLocaleDateString("en-PH")
          : "—",
        preferredTime: b.preferredTime,
        status: b.status,
        submittedOn: new Date(b.createdAt).toLocaleDateString("en-PH"),
      }));
    } else if (reportType === "donations") {
      const raw = await Donation.find()
        .populate("parishioner", "fullName")
        .sort({ createdAt: -1 })
        .select("amount purpose method status createdAt parishioner");
      data = raw.map((d) => ({
        parishioner: d.parishioner?.fullName ?? "—",
        amount: `₱${Number(d.amount ?? 0).toLocaleString("en-PH")}`,
        purpose: d.purpose,
        method: d.method,
        status: d.status,
        submittedOn: new Date(d.createdAt).toLocaleDateString("en-PH"),
      }));
    } else if (reportType === "parishioners") {
      const raw = await User.find({ role: "parishioner" })
        .sort({ createdAt: -1 })
        .select("fullName email createdAt");
      data = raw.map((u) => ({
        fullName: u.fullName,
        email: u.email,
        registeredOn: new Date(u.createdAt).toLocaleDateString("en-PH"),
      }));
    } else if (reportType === "livestream") {
      let raw = [];
      try {
        raw = await Stream.find()
          .sort({ createdAt: -1 })
          .select("title status totalViews peakViewerCount replayViews streamDurationSeconds createdAt");
      } catch (_) {
        raw = [];
      }
      data = raw.map((s) => ({
        title: s.title,
        status: s.status,
        totalViews: s.totalViews ?? 0,
        peakViewers: s.peakViewerCount ?? 0,
        replayViews: s.replayViews ?? 0,
        durationSeconds: s.streamDurationSeconds ?? 0,
        date: new Date(s.createdAt).toLocaleDateString("en-PH"),
      }));
    } else if (reportType === "mass-intentions") {
      const raw = await Booking.find({ sacramentType: "Mass Intentions" })
        .populate("parishioner", "fullName")
        .sort({ createdAt: -1 })
        .select("preferredDate preferredTime status intentionStatus createdAt parishioner message");
      data = raw.map((b) => ({
        parishioner: b.parishioner?.fullName ?? "—",
        preferredDate: b.preferredDate
          ? new Date(b.preferredDate).toLocaleDateString("en-PH")
          : "—",
        preferredTime: b.preferredTime,
        status: b.status,
        intentionStatus: b.intentionStatus,
        message: b.message ?? "",
        submittedOn: new Date(b.createdAt).toLocaleDateString("en-PH"),
      }));
    } else if (reportType === "annual") {
      const year = new Date().getFullYear();
      const yearStart = new Date(year, 0, 1);
      const [
        totalBookings,
        totalDonations,
        totalParishioners,
        totalMassIntentions,
        donationAgg,
        streamCount,
      ] = await Promise.all([
        Booking.countDocuments({ createdAt: { $gte: yearStart } }),
        Donation.countDocuments({ createdAt: { $gte: yearStart } }),
        User.countDocuments({ role: "parishioner" }),
        Booking.countDocuments({
          sacramentType: "Mass Intentions",
          createdAt: { $gte: yearStart },
        }),
        Donation.aggregate([
          { $match: { createdAt: { $gte: yearStart } } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        Stream.countDocuments().catch(() => 0),
      ]);
      const totalDonationAmount = donationAgg[0]?.total ?? 0;
      data = [
        { metric: "Year", value: String(year) },
        { metric: "Total Sacrament Bookings", value: String(totalBookings) },
        { metric: "Total Donations Submitted", value: String(totalDonations) },
        {
          metric: "Total Donation Amount",
          value: `₱${Number(totalDonationAmount).toLocaleString("en-PH")}`,
        },
        { metric: "Total Mass Intentions", value: String(totalMassIntentions) },
        { metric: "Registered Parishioners", value: String(totalParishioners) },
        { metric: "Live Streams", value: String(streamCount) },
      ];
    } else {
      return res.status(400).json({ message: "Unknown report type" });
    }

    res.json({ reportType, data });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
});

module.exports = router;
