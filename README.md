## The experience
Scrolling controls one continuous, reversible camera journey. Chapter navigation and project controls jump to readable stops. The Index opens the complete portfolio in a keyboard-accessible dialog.

## Stack and structure

Next.js App Router, TypeScript, React, React Three Fiber, Three.js, GSAP ScrollTrigger, and Lenis. The build exports static HTML, CSS, JavaScript, and fonts. No backend, API keys, or runtime CDN requests are required.

| File                                   | Purpose                                                         |
| -------------------------------------- | --------------------------------------------------------------- |
| `src/lib/content.ts`                   | Profile, project facts, links, experience, and skills           |
| `src/lib/journey.mjs`                  | Chapter timing and separate desktop/mobile camera keyframes     |
| `src/components/World.tsx`             | One WebGL environment with reusable screens, text, and geometry |
| `src/lib/screen-textures.ts`           | Locally generated project interface illustrations               |
| `src/components/Portfolio.tsx`         | Scroll controller, navigation, dialogs, and fallback behavior   |
| `src/components/ExperienceDetails.tsx` | Shared professional experience details and results              |
| `src/components/PortfolioIndex.tsx`    | Complete readable portfolio and education                       |
| `src/app/globals.css`                  | Responsive typography, layout, and presentation                 |

The interface illustrations are explicitly labeled. They are not screenshots of production products. Portfolio claims and education details come from the original repository, including its UT Austin admission entry. No testimonials, revenue claims, generated portraits, or invented project links were added.

## Accessibility and performance

The Motion control switches between the cinematic experience and a conventional portfolio. System reduced-motion preference selects the simple view automatically. A rendering error or WebGL context loss also falls back to the readable portfolio. The full content is present in server-rendered HTML and remains available with JavaScript disabled or when printing.

Inactive overlays are inert. Dialogs support Escape, focus containment, and focus return. Contact, GitHub, LinkedIn, Devpost, and demo links retain real destinations.

The 3D bundle loads separately. Rendering is on demand, with no idle render loop. Repeated keys and convergence objects are instanced. Offstage scenes are hidden. Mobile uses a lower pixel ratio, fewer objects, no shadow map, and its own camera composition. Fonts and 3D text data are hosted locally.

## Asset credits

DM Sans and IBM Plex Mono are packaged through Fontsource under their respective Open Font Licenses. Helvetiker Bold comes from the Three.js examples. Its license is embedded in `src/lib/helvetiker-bold.json` and included at `public/fonts/HELVETIKER-LICENSE.txt`. All scene objects and interface illustrations are created in code.
