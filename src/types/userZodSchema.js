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
    path: z.string().min(1, "DP cannot be empty"),
});

// zod schema for user
const userSchema = z.object({
    name: z.string(),
    college: z.string(),
    email: z.string()
        .email("Invalid email address")
        .refine(email => email.endsWith("@cuchd.in"), {
            message: "Email must end with @cuchd.in"
        }),
    interests: z.array(z.string()),
    displayPicture: imageFileSchema,
    bio: z.string(),
    age: z.number(),
    profilePics: z.array(imageFileSchema).max(4),
});

module.exports = { userSchema };
