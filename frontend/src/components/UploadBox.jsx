import { Upload } from "lucide-react";

function UploadBox({ handleImageUpload }) {
    return (
        <label className="upload-box">
            <Upload size={32} />

            <span>Upload plant image</span>

            <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
            />
        </label>
    );
}

export default UploadBox;