// Only immutable, content-hashed source masters belong to this namespace.
export const generatedMasterId = /^schedsnap\/images\/(mascots|pixel-mascots|goofy-mascots|doodle-mascots)\/masters\/[a-z0-9_-]+-[a-f0-9]{16}$/i;
export const generatedMasterUrl = /^https:\/\/res\.cloudinary\.com\/[a-z0-9_-]+\/image\/upload\/(?:v\d+\/)?schedsnap\/images\/(mascots|pixel-mascots|goofy-mascots|doodle-mascots)\/masters\/[a-z0-9_-]+-[a-f0-9]{16}\.png$/i;
