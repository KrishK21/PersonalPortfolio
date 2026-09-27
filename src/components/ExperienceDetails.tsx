import { experience, impact } from "@/lib/content";

export default function ExperienceDetails({
  idPrefix = "experience",
}: {
  idPrefix?: string;
}) {
  return (
    <section
      id={idPrefix}
      className="experience-details"
      aria-labelledby={`${idPrefix}-title`}
    >
      <div className="index-section-head">
        <span>PROFESSIONAL EXPERIENCE</span>
        <h3 id={`${idPrefix}-title`}>Software in the real world.</h3>
      </div>
      {experience.map((job) => (
        <article className="experience-entry" key={job.company}>
          <div>
            <span className="eyebrow">{job.date}</span>
            <h4>{job.company}</h4>
            <span>{job.location}</span>
          </div>
          <div>
            <h5>{job.role}</h5>
            <p>{job.text}</p>
            <small>{job.stack}</small>
          </div>
        </article>
      ))}
      <div className="impact-row">
        {impact.map((stat) => (
          <div key={stat.value}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
