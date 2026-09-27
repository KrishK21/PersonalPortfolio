import { profile, projects, skills } from "@/lib/content";
import ProjectPreview from "./ProjectPreview";
import ExperienceDetails from "./ExperienceDetails";

export function ProfileLinks() {
  return (
    <div className="profile-links">
      <a href={`mailto:${profile.email}`}>
        Email me <span>↗</span>
      </a>
      <a href={profile.github} target="_blank" rel="noreferrer">
        GitHub <span>↗</span>
      </a>
      <a href={profile.linkedin} target="_blank" rel="noreferrer">
        LinkedIn <span>↗</span>
      </a>
    </div>
  );
}

export default function PortfolioIndex({
  onProject,
  idPrefix = "index",
}: {
  onProject: (index: number) => void;
  idPrefix?: string;
}) {
  return (
    <div className="portfolio-index">
      <header className="index-intro">
        <span className="eyebrow">THE PORTFOLIO / AT A GLANCE</span>
        <h2>
          Curiosity.
          <br />
          With a commit history.
        </h2>
        <p>
          I’m Krish, a software engineer in Vancouver, WA. I build across AI,
          cloud infrastructure, and full stack applications, with a focus on
          making useful things work in the real world.
        </p>
        <ProfileLinks />
      </header>
      <ExperienceDetails idPrefix={`${idPrefix}-experience`} />
      <section aria-labelledby={`${idPrefix}-work`}>
        <div className="index-section-head">
          <span>02 / PROJECTS</span>
          <h3 id={`${idPrefix}-work`}>Built with purpose.</h3>
        </div>
        <div className="index-projects">
          {projects.map((project, index) => (
            <article key={project.id}>
              <button
                className="index-project-button"
                onClick={() => onProject(index)}
                aria-label={`Read about ${project.name}`}
              >
                <ProjectPreview kind={project.id} small />
                <div className="index-project-title">
                  <h4>{project.name}</h4>
                  <span>↗</span>
                </div>
              </button>
              <p>{project.description}</p>
              <div className="tags">
                {project.stack.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="index-win" aria-labelledby={`${idPrefix}-win`}>
        <span className="eyebrow">1ST PLACE / HUSKYHACK PHASE 1</span>
        <h3 id={`${idPrefix}-win`}>WealthPilot</h3>
        <p>
          An AI financial copilot that connects bank perks to personal goals
          through ML driven suggestions, streaks, and community. Built with
          Jason Pham.
        </p>
        <div className="tags">
          <span>Next.js</span>
          <span>React</span>
          <span>Gemini</span>
          <span>Plaid / Amex / Chase APIs</span>
        </div>
        <div className="profile-links">
          <a
            href="https://devpost.com/software/futurefinance"
            target="_blank"
            rel="noreferrer"
          >
            View on Devpost ↗
          </a>
          <a
            href="https://sans-baggy-16082428.figma.site"
            target="_blank"
            rel="noreferrer"
          >
            Live demo ↗
          </a>
        </div>
      </section>
      <section aria-labelledby={`${idPrefix}-skills`}>
        <div className="index-section-head">
          <span>03 / TOOLKIT</span>
          <h3 id={`${idPrefix}-skills`}>The tools behind the work.</h3>
        </div>
        {skills.map((skill) => (
          <div className="skill-entry" key={skill.name}>
            <h4>{skill.name}</h4>
            <p>{skill.values}</p>
          </div>
        ))}
      </section>
      <section aria-labelledby={`${idPrefix}-education`}>
        <div className="index-section-head">
          <span>04 / EDUCATION & COMMUNITY</span>
          <h3 id={`${idPrefix}-education`}>Always a student.</h3>
        </div>
        <div className="education-grid">
          <article>
            <span className="eyebrow">MAY 2027</span>
            <h4>Washington State University</h4>
            <p>B.S. Computer Science, Mathematics minor. Vancouver campus.</p>
            <span className="education-note">
              Honors · 3.8 GPA · ACM Vice President
            </span>
          </article>
          <article>
            <span className="eyebrow">2027–2029 / ADMITTED</span>
            <h4>University of Texas at Austin</h4>
            <p>
              M.S. Computer Science, specializing in machine learning and AI.
            </p>
          </article>
        </div>
      </section>
      <footer className="index-footer">
        <span className="eyebrow">LET’S BUILD SOMETHING USEFUL</span>
        <a href={`mailto:${profile.email}`}>{profile.email} ↗</a>
        <span>Vancouver, WA · Willing to relocate · US citizen</span>
      </footer>
    </div>
  );
}
