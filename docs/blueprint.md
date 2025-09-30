# **App Name**: Review Router

## Core Features:

- Review Form: Landing page form for users to submit reviews, including star ratings. Captures user feedback, but redirects some users to the business's Google review page based on criteria defined in the settings.
- Review Router Logic: Evaluates the user's review (specifically, the star rating) against a business-defined threshold. If the review meets the threshold (e.g., 4 stars or higher), redirects the user to the business's Google review page via a configurable URL. If the review is below the threshold, allows the user to submit the review via form.
- Business Owner Signup/Login: Authentication system for business owners to create accounts and securely access their dashboards and settings.
- Dashboard Metrics: Presents key review metrics (average rating, review count, distribution of ratings) in a visually appealing format. Displays user reviews.
- Business Settings: Allows business owners to configure the star rating threshold for Google review redirection, and set the Google review page URL.
- Profile Management: Enables business owners to manage their account information (email, password, etc.).

## Style Guidelines:

- Primary color: Deep purple (#673AB7) for a modern, trustworthy feel.
- Background color: Very light purple (#F3E5F5).
- Accent color: Blue (#3F51B5) for interactive elements and calls to action.
- Headline font: 'Space Grotesk' sans-serif for headlines, for a computerized, techy look. Body font: 'Inter' sans-serif, for a modern, machined look.
- Use a set of consistent, modern icons throughout the application.
- Implement a clean, intuitive layout with a focus on usability. The dashboard should be well-organized and easy to navigate.
- Incorporate subtle animations for a polished user experience. For example, use animations for loading indicators and transitions.