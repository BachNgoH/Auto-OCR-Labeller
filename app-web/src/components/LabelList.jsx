const LabelList = ({ labels, setLabels, className }) => {
  const handleVerify = (labelId) => {
    setLabels((prev) =>
      prev.map((label) =>
        label.id === labelId ? { ...label, verified: true } : label
      )
    );
  };

  const handleDelete = (labelId) => {
    setLabels((prev) => prev.filter((label) => label.id !== labelId));
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
            className={`p-3 rounded-lg border ${
              label.verified
                ? "border-green-200 bg-green-50"
                : "border-yellow-200 bg-yellow-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">
                {label.text || "Loading..."}
              </span>
              <div className="flex gap-2">
                {!label.verified && (
                  <button
                    onClick={() => handleVerify(label.id)}
                    className="px-3 py-1 text-sm font-medium text-green-700 bg-green-100 
                             rounded hover:bg-green-200 transition-colors"
                  >
                    Verify
                  </button>
                )}
                <button
                  onClick={() => handleDelete(label.id)}
                  className="px-3 py-1 text-sm font-medium text-red-700 bg-red-100 
                           rounded hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LabelList;
