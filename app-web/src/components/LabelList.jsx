const LabelList = ({ imageId, labelStore, className }) => {
  const labels = labelStore.getLabelsForImage(imageId);

  const handleTextChange = (labelId, newText) => {
    labelStore.updateLabelInImage(imageId, labelId, { text: newText });
  };

  const handleDelete = (labelId) => {
    labelStore.deleteLabelFromImage(imageId, labelId);
  };

  return (
    <div className={`${className} bg-white rounded-lg shadow-md p-4`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Labels</h2>
      <div className="space-y-2">
        {labels.length === 0 && (
          <p className="text-gray-500 text-center py-4">No labels yet</p>
        )}
        {labels.map((label) => (
          <div
            key={label.id}
            className="p-3 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <input
                type="text"
                value={label.text || ""}
                onChange={(e) => handleTextChange(label.id, e.target.value)}
                placeholder="Enter label text"
                className="flex-1 text-sm font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-blue-300 rounded px-2 py-1"
              />
              <button
                onClick={() => handleDelete(label.id)}
                className="inline-flex items-center justify-center w-6 h-6 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                title="Delete label"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelList;
