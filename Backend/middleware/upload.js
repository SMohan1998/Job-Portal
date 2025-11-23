import multer from "multer";
import path from "path";
import fs from "fs";

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = "uploads";

    if (file.fieldname === "profilePicture") folder = "uploads/profiles";
    if (file.fieldname === "logo") folder = "uploads/company";
    if (file.fieldname === "resume") folder = "uploads/applications";

    // ensure folder exists
    fs.mkdirSync(folder, { recursive: true });

    cb(null, folder);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

export default upload;
