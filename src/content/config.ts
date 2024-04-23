import { z, defineCollection } from "astro:content";

const blogCollection = defineCollection({
	schema: ({ image }) => z.object({
		title: z
			.string()
			.max(100, "The title length must be less than or equal to 100 chars"),
		description: z.string(),
		tags: z.array(z.string()),
		author: z.string(),
		authorImage: z.string().optional(),
		authorTwitter: z.string(),
		date: z.date(),
		image: z.string().optional(),
		thumbnail: image().optional(),
		category: z.string(),
	}),
});

export const collections = {
	blog: blogCollection,
};
