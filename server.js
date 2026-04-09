const express = require('express');
const app = express();
const PORT = 3000;
// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/streetkicks')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Middleware
app.use(express.json());
// Middleware
app.use(express.json());

// Route
app.get('/api/shoes', async (req, res) => {
    res.json({ message: "Shoes endpoint working 👟" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
// ✅ Fix 1: Add error handling to all routes so the server doesn't crash silently
app.get('/api/shoes', async (req, res) => {
  try {
    const shoes = await Shoe.find();
    res.json(shoes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shoes' });
  }
});

app.post('/api/shoes', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';
    const shoe = new Shoe({ name, category, price, image });
    await shoe.save();
    res.json(shoe);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save shoe' });
  }
});

app.delete('/api/shoes/:id', async (req, res) => {
  try {
    const shoe = await Shoe.findByIdAndDelete(req.params.id);
    // ✅ Fix 2: Check file exists before unlinking to avoid crash
    if (shoe && shoe.image) {
      const filePath = `.${shoe.image}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shoe' });
  }
});