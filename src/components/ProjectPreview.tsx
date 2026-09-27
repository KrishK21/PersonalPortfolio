export default function ProjectPreview({
  kind,
  small = false,
}: {
  kind: string;
  small?: boolean;
}) {
  return (
    <div
      className={`project-preview preview-${kind} ${small ? "preview-small" : ""}`}
      aria-label={`${kind === "resume" ? "Resume tailoring" : kind === "linkedout" ? "Job board" : kind === "wealth" ? "WealthPilot" : "Cloud pipeline"} interface illustration`}
    >
      <div className="preview-toolbar">
        <span className="window-dots">
          <i />
          <i />
          <i />
        </span>
        <span>
          {kind === "resume"
            ? "tailor / workspace"
            : kind === "linkedout"
              ? "linkedout / opportunities"
              : kind === "wealth"
                ? "wealthpilot / your goals"
                : "azure / restriction pipeline"}
        </span>
        <span>↗</span>
      </div>
      {kind === "wealth" ? (
        <div className="wealth-preview">
          <span className="micro-label">YOUR FINANCIAL COPILOT</span>
          <h4>
            Small moves.
            <br />
            Real progress.
          </h4>
          <div className="wealth-goals">
            <div>
              <span>01</span>
              <b>Find your perks</b>
            </div>
            <div>
              <span>02</span>
              <b>Build a streak</b>
            </div>
            <div>
              <span>03</span>
              <b>Grow together</b>
            </div>
          </div>
          <p>
            Connect the benefits you already have to the goals you care about.
          </p>
        </div>
      ) : kind === "resume" ? (
        <div className="resume-layout">
          <div className="preview-sidebar">
            <span className="preview-logo">t.</span>
            <span className="preview-nav-active">Workspace</span>
            <span>My experience</span>
            <span>Applications</span>
          </div>
          <div className="preview-content">
            <span className="micro-label">YOUR EXPERIENCE, REFRAMED</span>
            <h4>Make the connection.</h4>
            <div className="resume-papers">
              <div>
                <span className="micro-label">JOB DESCRIPTION</span>
                <b>Software engineer</b>
                <span className="paper-line" />
                <span className="paper-line short" />
                <div className="mini-tags">
                  <span>Python</span>
                  <span>Machine learning</span>
                </div>
                <span className="paper-line" />
                <span className="paper-line short" />
              </div>
              <span className="paper-arrow">↗</span>
              <div>
                <span className="micro-label">YOUR RESUME</span>
                <b>Relevant by design.</b>
                <p>
                  Trained PyTorch models for thermal object detection on drone
                  imagery.
                </p>
                <span className="truth-badge">
                  ✓ Grounded in your experience
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : kind === "linkedout" ? (
        <div className="jobs-preview">
          <div className="jobs-title">
            <b>
              LinkedOut<span>↗</span>
            </b>
            <span>Find your next thing.</span>
          </div>
          <div className="jobs-search">
            Search opportunities <span>⌕</span>
          </div>
          <div className="jobs-tabs">
            <span>All opportunities</span>
            <span>Engineering</span>
            <span>Recently posted</span>
          </div>
          {["Software engineer", "Backend developer", "ML engineer"].map(
            (title, i) => (
              <div className="job-preview-row" key={title}>
                <span className="job-symbol">{["↗", "◈", "⌘"][i]}</span>
                <div>
                  <b>{title}</b>
                  <small>Illustrative listing · Engineering</small>
                </div>
                <span className="job-status">Active</span>
              </div>
            ),
          )}
        </div>
      ) : (
        <div className="pipeline-preview">
          <span className="micro-label">RESTRICTION RECONCILIATION</span>
          <h4>Good data. Sound decisions.</h4>
          <div className="pipeline-flow">
            {["Source files", "Blob Storage", "SQL extract", "Reconcile"].map(
              (step, i) => (
                <div key={step}>
                  <span>0{i + 1}</span>
                  <b>{step}</b>
                  <i>↓</i>
                </div>
              ),
            )}
          </div>
          <div className="pipeline-outcomes">
            <span>+ Add new</span>
            <span>= Skip unchanged</span>
            <span>− Remove lifted</span>
          </div>
        </div>
      )}
      <span className="preview-caption">INTERFACE ILLUSTRATION</span>
    </div>
  );
}
