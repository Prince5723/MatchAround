const { z } = require("zod");

// z schema for file uploads with image validation
const imageFileSchema = z.object({
    fieldname: z.string(),
    originalname: z.string(),
    encoding: z.string(),
    mimetype: z.string().refine(mimeType => mimeType.startsWith('image/'), {
        message: "Only image files are allowed",
    }),
    size: z.number(),
    path: z.string()
});

// zod schema for user
const userSchema = z.object({
    name: z.string(),
    college: z.string(),
    email: z.string().email("Invalid email address").includes("@cuchd.in"),
    interests: z.array(z.string()),
    displayPicture: imageFileSchema, 
    profilePics: z.array(imageFileSchema).max(4), 
});

module.exports = { userSchema };
