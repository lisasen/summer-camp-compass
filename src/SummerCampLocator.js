import React, { useState } from "react";

const SummerCampLocator = () => {
  const [zipCode, setZipCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [camps, setCamps] = useState([]);
  const [error, setError] = useState("");

  const fetchCamps = async () => {
    if (!/^[0-9]{5}$/.test(zipCode)) {
      setError("Please enter a valid 5-digit zip code.");
      return;
    }

    setError("");
    setLoading(true);
    setCamps([]);

    try {
      const geocodeResponse = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=YOUR_GOOGLE_API_KEY`
      );
      const geocodeData = await geocodeResponse.json();

      if (!geocodeData.results || geocodeData.results.length === 0) {
        throw new Error("Invalid zip code. Please try again.");
      }

      const { lat, lng } = geocodeData.results[0].geometry.location;

      const placesResponse = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=16093&type=campground&key=YOUR_GOOGLE_API_KEY`
      );
      const placesData = await placesResponse.json();

      if (!placesData.results || placesData.results.length === 0) {
        setCamps([]);
        setError("No camps found near this zip code.");
        return;
      }

      setCamps(
        placesData.results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          link: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        }))
      );
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Summer Camp Locator</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter your zip code"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2"
        />
      </div>
      <button
        onClick={fetchCamps}
        disabled={loading}
        className="w-full bg-blue-500 text-white rounded py-2 hover:bg-blue-600"
      >
        {loading ? "Loading..." : "Find Camps"}
      </button>
      {error && <p className="text-red-500 mt-4">{error}</p>}
      <div className="mt-6">
        {camps.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {camps.map((camp) => (
              <div key={camp.id} className="p-4 border rounded">
                <h2 className="text-lg font-semibold">{camp.name}</h2>
                <p>{camp.address}</p>
                <a
                  href={camp.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  Visit Website
                </a>
              </div>
            ))}
          </div>
        ) : (
          !loading && <p className="text-gray-500">No camps found.</p>
        )}
      </div>
    </div>
  );
};

export default SummerCampLocator;