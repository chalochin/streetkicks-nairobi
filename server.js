require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/streetkicks.html'));
});

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/streetkicks')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

const shoeSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: String
});

const Shoe = mongoose.model('Shoe', shoeSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

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
    if (shoe && shoe.image) {
      const filePath = `.${shoe.image}`;
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete shoe' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});