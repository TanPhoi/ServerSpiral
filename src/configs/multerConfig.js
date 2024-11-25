const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cấu hình Multer để lưu tệp vào thư mục tĩnh
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'public/uploads'; // Thư mục để lưu ảnh
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Tạo thư mục nếu chưa có
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Tạo tên tệp với timestamp để tránh trùng lặp
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Khởi tạo Multer middleware để xử lý tệp ảnh
const upload = multer({ storage }).array('files'); // 'files' là tên field của form data

module.exports = upload;
