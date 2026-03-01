const express = require('express')
const multer  = require('multer')
const path    = require('path')
const fs      = require('fs')

const app  = express()
const PORT = process.env.PORT || 4242

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(__dirname, 'uploads')
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR)

// Store uploaded videos with their original extension
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename:    (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, 'film' + ext)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.m4v']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowed.includes(ext)) cb(null, true)
    else cb(new Error('Only video files are allowed'))
  }
})

// Serve static files (html, css, font, uploads)
app.use(express.static(__dirname))
app.use('/uploads', express.static(UPLOADS_DIR))

// Upload endpoint
app.post('/upload', upload.single('video'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file received' })
  res.json({ ok: true, filename: req.file.filename })
})

// Current video status
app.get('/video-status', (req, res) => {
  const files = fs.readdirSync(UPLOADS_DIR).filter(f => /^film\.(mp4|mov|webm|m4v)$/i.test(f))
  if (files.length === 0) return res.json({ exists: false })
  res.json({ exists: true, filename: files[0] })
})

app.listen(PORT, () => {
  console.log(`LSV running at http://localhost:${PORT}`)
  console.log(`Upload panel:   http://localhost:${PORT}/admin.html`)
  console.log(`Film page:      http://localhost:${PORT}/film.html`)
})
