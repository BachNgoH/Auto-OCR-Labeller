import { useState } from "react";
import ImageLabeler from "./components/ImageLabeler";
import LabelList from "./components/LabelList";

function App() {
  const [labels, setLabels] = useState([]);
  const [currentImage, setCurrentImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCurrentImage(URL.createObjectURL(file));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Image Labeling Tool
        </h1>
        <label className="block">
          <span className="sr-only">Choose image</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </header>

      <main className="flex gap-4 flex-col lg:flex-row">
        <ImageLabeler
          image={currentImage}
          labels={labels}
          setLabels={setLabels}
          className="flex-1"
        />
        <LabelList
          labels={labels}
          setLabels={setLabels}
          className="w-full lg:w-80"
        />
      </main>
    </div>
  );
}

export default App;
