import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    cb(null, file.mimetype === 'application/pdf');
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

export const uploadSingle = upload.single('document');
