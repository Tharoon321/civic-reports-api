const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB connection
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/civicreports';
mongoose.connect(mongoURI);

// Issue Schema
const IssueSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  title: String,
  category: String,
  location: String,
  description: String,
  priority: String,
  status: { type: String, default: 'Pending' },
  dateReported: { type: Date, default: Date.now },
  reportedBy: String,
  photo: String,
  department: String,
  coordinates: {
    lat: Number,
    lng: Number
  }
});

const Issue = mongoose.model('Issue', IssueSchema);

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 Civic Reports API is running!',
    version: '1.0.0',
    status: 'Active',
    endpoints: [
      'GET /api/issues - Get all issues',
      'POST /api/issues - Create new issue',
      'PUT /api/issues/:id - Update issue',
      'GET /api/stats - Get statistics'
    ]
  });
});

// Get all issues
app.get('/api/issues', async (req, res) => {
  try {
    const issues = await Issue.find().sort({ dateReported: -1 });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new issue
app.post('/api/issues', async (req, res) => {
  try {
    const issueCount = await Issue.countDocuments();
    const issueId = `CIV${String(issueCount + 1).padStart(3, '0')}`;
    
    const issue = new Issue({
      ...req.body,
      id: issueId
    });
    
    await issue.save();
    res.status(201).json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update issue
app.put('/api/issues/:id', async (req, res) => {
  try {
    const issue = await Issue.findOneAndUpdate(
      { id: req.params.id }, 
      req.body, 
      { new: true }
    );
    if (!issue) {
      return res.status(404).json({ error: 'Issue not found' });
    }
    res.json(issue);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const total = await Issue.countDocuments();
    const pending = await Issue.countDocuments({ status: 'Pending' });
    const inProgress = await Issue.countDocuments({ status: 'In Progress' });
    const resolved = await Issue.countDocuments({ status: 'Resolved' });
    
    res.json({
      totalReports: total,
      pending: pending,
      inProgress: inProgress,
      resolved: resolved,
      averageResolutionTime: "5.2 days"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issues by category
app.get('/api/issues/category/:category', async (req, res) => {
  try {
    const issues = await Issue.find({ category: req.params.category });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get issues by status
app.get('/api/issues/status/:status', async (req, res) => {
  try {
    const issues = await Issue.find({ status: req.params.status });
    res.json(issues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`🚀 Civic Reports API running on port ${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️ Database: ${mongoURI}`);
});
