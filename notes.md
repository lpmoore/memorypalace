# Memory Palace Project Notes

## Project Summary

We are building a **Memory Palace application**. The goal is for a user to input something they want to remember, associate it with a visual palace, and then add rooms and items with memorable, exaggerated imagery to solidify the memory.

So far, we have successfully:

- Set up a Next.js 14 project using TypeScript and Tailwind CSS.
- Built the main application layout, including a header, footer, and a styled home page with a dark, thematic feel.
- Created the "New Memory" page and a form that allows a user to input text and choose how to represent their palace.
- Implemented a feature to generate a palace image by calling an external API, with a fallback to a second provider.

## Image Caching Issue: Troubleshooting Steps Taken

The primary blocker has been an aggressive and unusual caching issue where the application repeatedly serves the same generated image. Here are the steps we've taken to resolve it:

1. **Initial Diagnosis:** We identified that both the browser and the Next.js server can cache data, causing stale responses.
2. **Client-Side Cache Busting:** We added a unique timestamp (`&t=${Date.now()}`) to the URL of the request made from the form to our backend API. This should have forced the browser to treat every request as unique, but it did not solve the issue.
3. **Server-Side Next.js Cache Busting:** We used the standard Next.js approach to prevent a specific API route from being cached by adding `export const revalidate = 0;` to the file. This tells Next.js to treat the route as fully dynamic. This also did not solve the issue.
4. **Upstream Provider Cache Busting:** We then targeted the `fetch` call _inside_ our API route that calls the Unsplash service.
   - We first added the `{ cache: "no-store" }` option, which explicitly tells the server not to cache the result of this specific `fetch`. This did not work.
   - As a final, brute-force attempt, we added a unique timestamp directly to the Unsplash URL (`...&t=${Date.now()}`). This makes every single request to the Unsplash server itself unique.

**Conclusion:** The fact that none of these standard and aggressive cache-busting techniques have worked is highly unusual and points to a caching layer outside of the application's control, possibly within the development environment or a network proxy. I have exhausted all available software-level solutions for this specific problem.

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
