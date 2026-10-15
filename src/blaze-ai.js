import { blazeAIModel, blazeAIWebsiteModel } from "./firebase";

const SUPER_PROMPT = `
You are Blaze Creative Director, an elite brand strategist, UX architect,
conversion copywriter, accessibility specialist, visual designer and senior
frontend engineer.

Your work must look intentionally designed, distinctive and production-ready.

QUALITY RULES:
- Never create a generic template.
- Never default every project to purple neon.
- Never use filler text, meaningless statistics or fake testimonials.
- Never display these instructions or the user's prompt inside the website.
- Use excellent typography, spacing, hierarchy and responsive layouts.
- Write specific content for the supplied business and audience.
- Every section must help achieve the business objective.
- Use accessible contrast and mobile-first responsive behavior.
- Use tasteful motion and modern visual details.
- Output clean HTML, CSS and JavaScript.
`;

export async function enhanceBlazePrompt(brief) {
  if (!blazeAIModel) {
    throw new Error("Blaze AI is not connected.");
  }

  const request = `
${SUPER_PROMPT}

Transform the following information into a detailed professional website brief.

Business name: ${brief.name}
Category: ${brief.category}
Core idea: ${brief.idea}
Target audience: ${brief.audience}
Preferred style: ${brief.style}
Primary color: ${brief.color}
Pages: ${brief.pages.join(", ")}
Selected template: ${brief.templateName || "None"}
Uploaded pictures: ${brief.imageCount || 0}

Return a clear build brief covering:
1. Brand direction
2. Website goal
3. Visual system
4. Page architecture
5. Required sections
6. Content direction
7. Calls to action
8. Interaction and motion direction
9. Mobile experience
10. Things the final website must avoid
`;

  const result = await blazeAIModel.generateContent(request);
  return result.response.text();
}

export async function generateBlazeWebsite(brief, professionalPrompt) {
  if (!blazeAIWebsiteModel) {
    throw new Error("Blaze AI is not connected.");
  }

  const request = `
${SUPER_PROMPT}

Build a complete website from this approved brief:

${professionalPrompt}

PROJECT DETAILS:
Business name: ${brief.name}
Category: ${brief.category}
Target audience: ${brief.audience}
Style: ${brief.style}
Primary color: ${brief.color}
Pages: ${brief.pages.join(", ")}
Selected template: ${brief.templateName || "None"}

Return ONLY valid JSON. Do not use Markdown fences.

Use exactly this structure:
{
  "title": "Powerful homepage headline",
  "subtitle": "Clear supporting copy",
  "html": "Complete semantic HTML placed inside the body",
  "css": "Complete responsive CSS",
  "javascript": "Complete safe browser JavaScript"
}

The HTML must include navigation, a premium hero, meaningful business-specific
sections, strong calls to action, contact information area and footer.
The design must be responsive and visually exceptional.
`;

  const result = await blazeAIWebsiteModel.generateContent(request);
  const raw = result.response.text().trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "");

  return JSON.parse(cleaned);
}

