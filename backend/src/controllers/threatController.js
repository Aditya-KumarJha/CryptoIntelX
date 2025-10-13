const Address = require('../models/addressModel');
const Enrichment = require('../models/enrichmentModel');
const Extraction = require('../models/extractionModel');

// GET /api/threat/overview
const getOverview = async (req, res) => {
  try {
    const [totalAddresses, highRiskCount, last24hExtractions, activeCategories] = await Promise.all([
      Address.countDocuments({}),
      Address.countDocuments({ risk_score: { $gte: 80 } }),
      Extraction.countDocuments({ extracted_at: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Enrichment.distinct('category', { category: { $ne: null } }).then((arr) => arr.length),
    ]);

    res.json({
      success: true,
      data: {
        totalAddresses,
        highRiskCount,
        last24hExtractions,
        activeCategories,
      },
    });
  } catch (err) {
    console.error('Threat overview error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/threat/recent?limit=20
const getRecent = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);

    // Join Address -> latest_enrichment_id to get category/source
    const results = await Address.aggregate([
      { $sort: { risk_score: -1, updatedAt: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'enrichments',
          localField: 'latest_enrichment_id',
          foreignField: '_id',
          as: 'enrichment',
        },
      },
      { $unwind: { path: '$enrichment', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          address: '$canonical_address',
          coin: 1,
          risk: '$risk_score',
          lastSeen: '$last_seen_ts',
          category: '$enrichment.category',
          source: '$enrichment.source',
        },
      },
    ]);

    res.json({ success: true, data: results });
  } catch (err) {
    console.error('Threat recent error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/threat/categories
const getCategories = async (req, res) => {
  try {
    const data = await Enrichment.aggregate([
      { $match: { category: { $ne: null } } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $project: { _id: 0, name: '$_id', value: '$count' } },
    ]);
    res.json({ success: true, data });
  } catch (err) {
    console.error('Threat categories error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/threat/trend?days=42
const getTrend = async (req, res) => {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 42, 180);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // Group extractions per day
    const raw = await Extraction.aggregate([
      { $match: { extracted_at: { $gte: since } } },
      {
        $group: {
          _id: {
            y: { $year: '$extracted_at' },
            m: { $month: '$extracted_at' },
            d: { $dayOfMonth: '$extracted_at' },
          },
          detections: { $sum: 1 },
        },
      },
      { $sort: { '_id.y': 1, '_id.m': 1, '_id.d': 1 } },
    ]);

    const data = raw.map((r) => ({
      date: `${r._id.y}-${String(r._id.m).padStart(2, '0')}-${String(r._id.d).padStart(2, '0')}`,
      detections: r.detections,
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Threat trend error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getOverview, getRecent, getCategories, getTrend };
