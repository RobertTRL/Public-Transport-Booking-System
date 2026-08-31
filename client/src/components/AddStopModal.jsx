import { useState } from 'react';

const AddStopModal = ({ apiClient, onClose, onSuccess }) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name || !latitude || !longitude) {
      alert('Please complete all required fields.');
      return;
    }

    const payload = {
      name: name.trim(),
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    setIsSubmitting(true);
    try {
      await apiClient.post('/api/v1/provider/stops', payload);
      alert('Stop created successfully.');
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create stop.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-gray-800">Add New Bus Stop</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Stop Name</label>
            <input
              type="text"
              required
              placeholder="e.g. CBD Stage"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Latitude</label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. -1.286389"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Longitude</label>
            <input
              type="number"
              step="any"
              required
              placeholder="e.g. 36.817223"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isSubmitting ? 'Saving...' : 'Add Stop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStopModal;