const Case = require('../models/caseModel');
const ExportModel = require('../models/exportModel');

const createCase = async (req, res) => {
  try {
    const { title, address_ids = [], snapshot_ids = [], notes = '' } = req.body;
    const newCase = await Case.create({ title, owner_id: req.user ? req.user._id : null, address_ids, snapshot_ids, notes });
    res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    console.error('Create case error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// List cases for current user (or all if admin in future)
const listCases = async (req, res) => {
  try {
    const query = {};
    if (req.user) {
      query.owner_id = req.user._id;
    }
    const cases = await Case.find(query).sort({ updatedAt: -1 }).lean();
    res.json({ success: true, data: cases });
  } catch (err) {
    console.error('List cases error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update case status or notes
const updateCaseStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const updates = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    updates.updatedAt = new Date();
    const updated = await Case.findOneAndUpdate({ _id: id, owner_id: req.user ? req.user._id : null }, { $set: updates }, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Case not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update case error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get single case with derived progress metrics
const getCase = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Case.findOne({ _id: id, owner_id: req.user ? req.user._id : null }).lean();
    if (!doc) return res.status(404).json({ success: false, message: 'Case not found' });
    // simple progress heuristic: status mapping plus potential future tasks
    const progress = doc.status === 'closed' ? 100 : doc.status === 'in_progress' ? 60 : 20;
    res.json({ success: true, data: { ...doc, progress } });
  } catch (err) {
    console.error('Get case error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const exportSnapshot = async (req, res) => {
  try {
    const { snapshot_ids = [], redaction = true, reason = '' } = req.body;
    // generate export PDF from snapshot ids (addresses)
    const { buildExportHtml } = require('../templates/exportTemplate');
    const { NetworkNode, NetworkEdge } = require('../models/networkModel');
    // find nodes by address
    const nodes = await NetworkNode.find({ address: { $in: snapshot_ids } }).lean();
    // find edges between these nodes
    const nodeIds = nodes.map(n => n._id);
    const edges = await NetworkEdge.find({ $or: [{ from: { $in: nodeIds } }, { to: { $in: nodeIds } }] }).lean();

    const html = buildExportHtml({ title: `Snapshot export`, nodes, edges, exportedAt: new Date() });

    // generate PDF: try puppeteer if available, else fallback to PDFKit
    const fs = require('fs');
    const path = require('path');
    const exportsDir = path.resolve(__dirname, '..', '..', 'exports');
    if (!fs.existsSync(exportsDir)) fs.mkdirSync(exportsDir, { recursive: true });
    const filename = `export-${Date.now()}.pdf`;
    const filepath = path.join(exportsDir, filename);

    let usedPuppeteer = false;
    try {
      // try to require puppeteer (may not be installed in constrained environments)
      const puppeteer = require('puppeteer');
      usedPuppeteer = true;
      const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
        await page.pdf({ path: filepath, format: 'A4', printBackground: true });
      } finally {
        await browser.close();
      }
    } catch (pe) {
      // puppeteer not available or failed — fallback to PDFKit with nicer tables
      const PDFDocument = require('pdfkit');
      const doc = new PDFDocument({ size: 'A4', margin: 40, autoFirstPage: false });
      const stream = fs.createWriteStream(filepath);
      doc.pipe(stream);

      // helper to add a page with header
      const addPageWithHeader = (title) => {
        doc.addPage();
        doc.fillColor('#333').fontSize(18).text(title, { align: 'left' });
        doc.moveDown(0.3);
        doc.fontSize(10).fillColor('#666').text(`Exported at: ${new Date().toISOString()}`, { align: 'left' });
        doc.moveDown(0.6);
      };

      // helper to render a table
      const renderTable = (headers, rows, columnWidths) => {
        const startX = doc.x;
        const startY = doc.y;
        const rowHeight = 18;
        // header
        doc.fontSize(10).fillColor('#fff');
        let x = startX;
        doc.save();
        doc.rect(x - 2, startY - 4, columnWidths.reduce((a, b) => a + b, 0) + (headers.length - 1) * 6 + 4, rowHeight + 6).fill('#333');
        doc.fillColor('#fff');
        for (let i = 0; i < headers.length; i++) {
          doc.text(headers[i], x + 4, startY, { width: columnWidths[i] - 8, continued: false });
          x += columnWidths[i] + 6;
        }
        doc.moveDown();
        doc.fillColor('#000');

        // rows
        let y = startY + rowHeight + 6;
        for (const row of rows) {
          // page break handling
          if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
            y = doc.y;
          }
          x = startX;
          for (let i = 0; i < row.length; i++) {
            doc.fontSize(10).text(String(row[i] ?? ''), x + 4, y, { width: columnWidths[i] - 8 });
            x += columnWidths[i] + 6;
          }
          y += rowHeight;
        }

        doc.moveTo(startX, y + 6);
        doc.y = y + 6;
      };

      // Build nodes table rows
      addPageWithHeader('Snapshot export');
      doc.moveDown(0.2);
      doc.fontSize(12).fillColor('#000').text('Nodes', { underline: false });
      doc.moveDown(0.3);
      const nodeHeaders = ['Address', 'Label', 'Type', 'Risk'];
      const nodeColumnWidths = [220, 120, 80, 60];
      const nodeRows = nodes.map(n => [n.address, n.label || '', n.type || '', n.risk_score ?? '']);
      renderTable(nodeHeaders, nodeRows, nodeColumnWidths);

      // Edges table
      doc.moveDown(0.6);
      doc.fontSize(12).text('Edges');
      doc.moveDown(0.3);
      const edgeHeaders = ['From', 'To', 'Relation', 'Tx Count', 'Total Value'];
      const edgeColumnWidths = [140, 140, 100, 60, 80];
      const edgeRows = edges.map(e => [e.from_address || e.from, e.to_address || e.to, e.relation || '', e.tx_count ?? '', e.total_value ?? '']);
      renderTable(edgeHeaders, edgeRows, edgeColumnWidths);

      doc.end();
      // wait for stream to finish
      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });
    }

  // Build an absolute URL so the frontend can fetch it directly regardless of frontend origin/config
  const fileUrl = `${req.protocol}://${req.get('host')}/exports/${filename}`;

  const exportDoc = await ExportModel.create({ created_by: req.user ? req.user._id : null, snapshot_ids, redaction, reason, status: 'ready', file_path: fileUrl });
  res.status(200).json({ success: true, data: exportDoc });
  } catch (err) {
    console.error('Export error', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createCase, listCases, updateCaseStatus, getCase, exportSnapshot };
