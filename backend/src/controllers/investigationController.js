const Address = require('../models/addressModel');
const Enrichment = require('../models/enrichmentModel');
const Extraction = require('../models/extractionModel');

// GET /api/investigations/search
// Query params: q, category, coin, minRisk, maxRisk, source, from, to, page, limit
const searchInvestigations = async (req, res) => {
  try {
    const {
      q = '',
      category,
      coin,
      minRisk = 0,
      maxRisk = 100,
      source,
      from,
      to,
      page = 1,
      limit = 25,
    } = req.query;

    const pg = Math.max(parseInt(page, 10) || 1, 1);
    const lim = Math.min(Math.max(parseInt(limit, 10) || 25, 1), 200);

    const match = {
      risk_score: { $gte: Number(minRisk), $lte: Number(maxRisk) },
    };
    if (coin) match.coin = coin;
    if (from || to) {
      match.last_seen_ts = {};
      if (from) match.last_seen_ts.$gte = new Date(from);
      if (to) match.last_seen_ts.$lte = new Date(to);
    }
    if (q) {
      match.canonical_address = { $regex: q, $options: 'i' };
    }

    const pipeline = [
      { $match: match },
      {
        $lookup: {
          from: 'enrichments',
          localField: 'latest_enrichment_id',
          foreignField: '_id',
          as: 'enrichment',
        },
      },
      { $unwind: { path: '$enrichment', preserveNullAndEmptyArrays: true } },
    ];
    if (category) {
      pipeline.push({ $match: { 'enrichment.category': category } });
    }
    if (source) {
      pipeline.push({ $match: { 'enrichment.source': { $regex: source, $options: 'i' } } });
    }

    pipeline.push(
      {
        $project: {
          _id: 0,
            address: '$canonical_address',
            coin: 1,
            risk: '$risk_score',
            lastSeen: '$last_seen_ts',
            category: '$enrichment.category',
            source: '$enrichment.source',
            txCount: '$enrichment.tx_count',
            counterparty_count: '$enrichment.counterparty_count',
        }
      },
      { $sort: { risk: -1, lastSeen: -1 } },
      { $skip: (pg - 1) * lim },
      { $limit: lim }
    );

    const [records, total] = await Promise.all([
      Address.aggregate(pipeline),
      Address.countDocuments(match),
    ]);

    res.json({ success: true, data: records, pagination: { page: pg, limit: lim, total } });
  } catch (err) {
    console.error('Investigation search error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { searchInvestigations };
