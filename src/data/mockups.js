// Our own pictures (public/assets/mockups): one object on a plain ground, shown with screenshots
// of the studio's real projects. No stock photos. Each comes in two widths.
const SERVICES = ["web", "app", "crm", "social", "content", "wordpress", "stack", "edit", "shoot", "handling", "search", "ai", "answer", "ads", "reach", "idea"];

const set = (name, widths) => ({
  src: `/assets/mockups/${name}-${widths[1]}.webp`,
  srcSet: widths.map((w) => `/assets/mockups/${name}-${w}.webp ${w}w`).join(", "),
});

// By a service's `visual`; a service without a picture of its own gets the mark.
export const serviceMockup = (visual) => set(SERVICES.includes(visual) ? visual : "project", [700, 1400]);
export const heroMockup = (name) => set(`home-${name}`, [500, 1000]);
export const PROJECT_FALLBACK = "/assets/mockups/project-1400.webp"; // a project whose picture is missing
