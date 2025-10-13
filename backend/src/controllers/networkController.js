const networkService = require('../services/networkService');

const expand = async (req, res) => {
  try {
  const { address, limit = 200, minRisk = 0, depth = 1 } = req.body;
    if (!address) return res.status(400).json({ message: 'address is required' });

  const data = await networkService.expandNeighbors({ address, limit: parseInt(limit, 10), minRisk: parseFloat(minRisk), depth: parseInt(depth, 10) });
    res.status(200).json({ success: true, ...data });
  } catch (err) {
    console.error('Network expand error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const summary = async (req, res) => {
  try {
    const { address } = req.params;
    if (!address) return res.status(400).json({ message: 'address is required' });

    const data = await networkService.getSummary({ address });
    if (!data) return res.status(404).json({ message: 'Address not found' });
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Network summary error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { expand, summary };
