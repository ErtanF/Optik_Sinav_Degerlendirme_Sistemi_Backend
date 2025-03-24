import School from "../models/school.js";

/**
 * Süperadmin tarafından okul ekleme (admin olmadan)
 */
export const addSchool = async (req, res, next) => {
    try {
        const { name, city, address } = req.body;

        // Aynı isimde okul olup olmadığını kontrol et
        const existingSchool = await School.findOne({ name });
        if (existingSchool) {
            return res.status(400).json({
                success: false,
                message: "School already exists"
            });
        }

        // Okulu oluştur, ancak admin olmadan
        const newSchool = await School.create({
            name,
            city,
            address,
            admin: null, // Henüz admin atanmamış
            teachers: []
        });

        res.status(201).json({
            success: true,
            message: "School added successfully, please assign an admin later.",
            data: newSchool
        });

    } catch (error) {
        next(error);
    }
};

export const getAllSchools = async (req, res, next) => {
    try {
      const schools = await School.find({}).sort({ name: 1 });
      
      res.status(200).json({
        success: true,
        data: schools
      });
    } catch (error) {
      next(error);
    }
  };
