import Location from "./locationModel.js"

export const searchLocation = async (req, res) => {
  try {
    const  city  = req.query.city;
    if (!city) {
      return res.status(400).json({
        message: "City is required"
      });
    }

    const searchCity=city.trim();

    const locations = await Location.find({
     city: { 
        $regex: `^\\s*${searchCity}`,
        $options: "i" 
        }
    });

    if (locations.length === 0) {
      return res.status(404).json({
        message: "No location found"
      });
    }

    return res.status(200).json({
      success: true,
      data: locations
    });

  } catch (error) {
    return res.status(500).json({
      message: "Error fetching locations",
      error: error.message
    });
  }
};