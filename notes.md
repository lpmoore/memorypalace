# Memory Palace Project Notes

## Project Summary

We are building a **Memory Palace application**. The goal is for a user to input something they want to remember, associate it with a visual palace, and then add rooms and items with memorable, exaggerated imagery to solidify the memory.

So far, we have successfully:

- Set up a Next.js 14 project using TypeScript and Tailwind CSS.
- Built the main application layout, including a header, footer, and a styled home page with a dark, thematic feel.
- Created the "New Memory" page and a form that allows a user to input text and choose how to represent their palace.
- Implemented a feature to generate a palace image by calling an external API, with a fallback to a second provider.

## Image Caching Issue: RESOLVED ✅

**Root Cause:** The issue was caused by using the deprecated `source.unsplash.com` API, which was returning 503 errors and had inherent caching issues. Additionally, the Next.js API route lacked proper dynamic configuration.

**Solution:**
1. Switched to Pexels as the primary image provider
2. Added Next.js dynamic route configuration (`export const dynamic = 'force-dynamic'` and `export const revalidate = 0`)
3. Implemented random page selection to ensure image variety
4. Set up `.env.local` with Pexels API key

**Result:** Image generation now works reliably. Multiple clicks on "Generate Image" return different images as expected, with proper `Cache-Control: no-store, must-revalidate` headers.

## Punch List: Next Steps

Despite the caching issue, we can continue building the rest of the application's logic. Here is a list of what's next:

- [ ] **Implement File Upload:** Code the logic to allow a user to upload their own image from their computer.
- [ ] **Handle Form Submission:**
  - Save the memory description and the selected image (URL or uploaded file).
  - Navigate the user to the next step: adding rooms to their palace.
- [ ] **Build the Palace Editor:**
  - Create the main UI where the user sees their palace image.
  - Develop the functionality to add, name, and place "rooms" on the image.
- [ ] **Build the Room Editor:**
  - Within a room, develop the functionality to add "items."
  - For each item, create the UI for the user to write their descriptive, memorable association.
- [ ] **Implement Exaggerated Imagery AI:**
  - Integrate with a language model API to take a user's association and generate a more vivid, exaggerated version of it.
- [ ] **Set Up Data Persistence:**
  - Choose and implement a database solution (e.g., local storage for simplicity, or a cloud database for a more robust application) to save and load the user's memory palaces.
- [ ] **Create a User Dashboard:**
  - Build a page where users can see and select from all the memory palaces they've created.
