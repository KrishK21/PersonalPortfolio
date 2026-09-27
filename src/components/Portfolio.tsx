"use client";

import dynamic from "next/dynamic";
import {
  Component,
  type ErrorInfo,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { chapters, experience, profile, projects } from "@/lib/content";
import { chapterAt, chapterOpacity, projectAt } from "@/lib/journey.mjs";
import PortfolioIndex, { ProfileLinks } from "./PortfolioIndex";
import ProjectPreview from "./ProjectPreview";
import ExperienceDetails from "./ExperienceDetails";

const World = dynamic(() => import("./World"), { ssr: false });
type Modal = "index" | "experience" | number | null;

class SceneBoundary extends Component<
  { children: ReactNode; onError: () => void },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export default function Portfolio() {
  const journey = useRef<HTMLElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const dialog = useRef<HTMLDialogElement>(null);
  const lenis = useRef<Lenis | null>(null);
  const invalidate = useRef<(() => void) | null>(null);
  const motion = useRef({ progress: 0 });
  const lastChapter = useRef(0);
  const lastProject = useRef(0);
  const opener = useRef<HTMLElement | null>(null);
  const [chapter, setChapter] = useState(0);
  const [project, setProject] = useState(0);
  const [mode, setMode] = useState<"pending" | "cinematic" | "simple">(
    "pending",
  );
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState<Modal>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const simple = mode === "simple";

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const chooseMode = () => {
      setReducedMotion(preference.matches);
      setMode(preference.matches ? "simple" : "cinematic");
    };
    chooseMode();
    preference.addEventListener("change", chooseMode);
    return () => preference.removeEventListener("change", chooseMode);
  }, []);

  const failScene = useCallback(() => {
    setUnavailable(true);
    setChapter(0);
    setMode("simple");
  }, []);
  const sceneReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    if (mode !== "cinematic" || !journey.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const smooth = new Lenis({
      duration: 1.12,
      smoothWheel: true,
      syncTouch: false,
      anchors: false,
    });
    lenis.current = smooth;
    smooth.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => smooth.raf(time * 1000);
    gsap.ticker.add(tick);
    const trigger = ScrollTrigger.create({
      trigger: journey.current,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        motion.current.progress = p;
        root.current?.style.setProperty("--progress", `${p}`);
        root.current?.style.setProperty(
          "--portal",
          `${Math.sin(Math.PI * Math.max(0, Math.min(1, (p - 0.15) / 0.075))) * 0.65}`,
        );
        panels.current.forEach((panel, i) => {
          if (!panel) return;
          const opacity = chapterOpacity(p, i);
          panel.style.opacity = `${opacity}`;
          panel.style.transform = `translate3d(0, ${(1 - opacity) * 22}px, 0)`;
          panel.style.visibility = opacity < 0.015 ? "hidden" : "visible";
        });
        const nextChapter = chapterAt(p);
        const nextProject = projectAt(p);
        if (nextChapter !== lastChapter.current) {
          lastChapter.current = nextChapter;
          setChapter(nextChapter);
        }
        if (nextProject !== lastProject.current) {
          lastProject.current = nextProject;
          setProject(nextProject);
        }
        invalidate.current?.();
      },
    });
    ScrollTrigger.refresh();
    const onVisibility = () => {
      if (document.hidden) smooth.stop();
      else {
        smooth.start();
        invalidate.current?.();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      trigger.kill();
      gsap.ticker.remove(tick);
      smooth.destroy();
      lenis.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mode]);

  useEffect(() => {
    if (!dialog.current) return;
    if (modal !== null) {
      if (!dialog.current.open) {
        opener.current = document.activeElement as HTMLElement;
        dialog.current.showModal();
      }
      dialog.current.scrollTop = 0;
      lenis.current?.stop();
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.current.open) dialog.current.close();
      document.body.style.overflow = "";
      lenis.current?.start();
      opener.current?.focus({ preventScroll: true });
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modal]);

  const goTo = (progress: number) => {
    if (simple) {
      if (progress === 1)
        document
          .querySelector("#simple-portfolio .index-footer")
          ?.scrollIntoView({ behavior: "auto" });
      else if (progress > 0)
        document
          .getElementById(
            progress < 0.4
              ? "index-experience"
              : progress < 0.71
                ? "index-work"
                : "index-education",
          )
          ?.scrollIntoView({ behavior: "auto" });
      else window.scrollTo(0, 0);
      return;
    }
    const height =
      (journey.current?.offsetHeight ?? window.innerHeight) -
      window.innerHeight;
    if (lenis.current)
      lenis.current.scrollTo(progress * height, { duration: 0.85 });
    else window.scrollTo(0, progress * height);
  };

  const toggleMotion = () => {
    if (unavailable) return;
    window.scrollTo({ top: 0, behavior: "instant" });
    motion.current.progress = 0;
    lastChapter.current = 0;
    lastProject.current = 0;
    setChapter(0);
    setProject(0);
    setReady(false);
    root.current?.style.setProperty("--progress", "0");
    root.current?.style.setProperty("--portal", "0");
    setMode(simple ? "cinematic" : "simple");
  };

  const p = projects[project];
  return (
    <div
      ref={root}
      className={`portfolio ${simple ? "simple-mode" : ""} ${ready ? "scene-ready" : ""}`}
      data-chapter={chapter}
      data-mode={mode}
    >
      <a
        className="skip-link"
        href="#simple-portfolio"
        onClick={() => setMode("simple")}
      >
        Skip to portfolio content
      </a>
      <header className="site-header">
        <button
          className="wordmark"
          onClick={() => goTo(0)}
          aria-label="Krish Kanda, back to beginning"
        >
          kk<span>®</span>
        </button>
        <span className="header-edition">
          INDEPENDENT MIND.
          <br />
          ENGINEER BY PRACTICE.
        </span>
        <nav aria-label="Main navigation">
          <button
            className="nav-experience"
            onClick={() => goTo(0.285)}
            aria-current={chapter === 1 ? "page" : undefined}
          >
            Experience
          </button>
          <button
            className="nav-projects"
            onClick={() => goTo(0.47)}
            aria-current={chapter === 2 ? "page" : undefined}
          >
            Projects
          </button>
          <button
            className="nav-about"
            onClick={() => goTo(0.795)}
            aria-current={chapter === 3 ? "page" : undefined}
          >
            About
          </button>
          <button className="nav-contact" onClick={() => goTo(1)}>
            Contact <span>↗</span>
          </button>
        </nav>
        <button className="index-toggle" onClick={() => setModal("index")}>
          <span className="index-icon">
            <i />
            <i />
          </span>{" "}
          Index
        </button>
      </header>

      <main>
        <section
          className="journey"
          ref={journey}
          aria-label="Experience, projects, and background"
        >
          <div className="experience-stage">
            <div className="room-fallback" aria-hidden="true">
              <div className="fallback-ring" />
              <div className="fallback-desk">
                <div className="fallback-laptop">
                  <span>
                    ideas into
                    <br />
                    <b>impact.</b>
                  </span>
                </div>
              </div>
            </div>
            {mode === "cinematic" && (
              <div className="world" aria-hidden="true">
                <SceneBoundary onError={failScene}>
                  <World
                    motion={motion}
                    invalidateRef={invalidate}
                    onReady={sceneReady}
                    onError={failScene}
                  />
                </SceneBoundary>
              </div>
            )}
            <div className="portal-wash" aria-hidden="true" />

            <section
              ref={(el) => {
                panels.current[0] = el;
              }}
              className={`story-panel studio-panel ${chapter === 0 ? "panel-active" : ""}`}
              inert={!simple && chapter !== 0}
              aria-hidden={!simple && chapter !== 0}
            >
              <div className="studio-copy">
                <span className="eyebrow">
                  <span className="status-dot" /> SOFTWARE ENGINEER / VANCOUVER,
                  WA
                </span>
                <h1>
                  Krish
                  <br />
                  <span>Kanda</span>
                  <span className="name-period">.</span>
                </h1>
                <p>
                  I turn ideas into
                  <br />
                  things that <em>work.</em>
                </p>
                <div className="hero-actions">
                  <button className="pill-button" onClick={() => goTo(0.285)}>
                    View experience <span>↗</span>
                  </button>
                  <button className="text-button" onClick={() => goTo(0.47)}>
                    See projects <span>↗</span>
                  </button>
                </div>
              </div>
              <div className="studio-note">
                <span>AI. CLOUD. FULL STACK.</span>
                <p>
                  A little curiosity.
                  <br />A lot of building.
                </p>
              </div>
              <div className="studio-caption">
                <span className="tiny-cross">+</span>
                <span>
                  EVERYTHING STARTS
                  <br />
                  WITH AN IDEA.
                </span>
                <span className="caption-line" />
              </div>
            </section>

            <section
              ref={(el) => {
                panels.current[1] = el;
              }}
              className={`story-panel experience-panel ${chapter === 1 ? "panel-active" : ""}`}
              inert={chapter !== 1}
              aria-hidden={chapter !== 1}
            >
              <div className="chapter-copy career-copy">
                <span className="eyebrow">01 / PROFESSIONAL EXPERIENCE</span>
                <h2>
                  Built for
                  <br />
                  <em>the real world.</em>
                </h2>
                <div className="career-list">
                  {experience.map((job) => (
                    <article className="career-card" key={job.company}>
                      <div className="career-card-heading">
                        <h3>{job.company}</h3>
                        <span>{job.date}</span>
                      </div>
                      <h4>{job.role}</h4>
                      <p>{job.summary}</p>
                    </article>
                  ))}
                </div>
                <button
                  className="pill-button"
                  onClick={() => setModal("experience")}
                >
                  Full experience & results <span>↗</span>
                </button>
              </div>
              <span className="world-annotation">
                PRODUCTION PIPELINES / APPLIED MACHINE LEARNING
              </span>
            </section>

            <section
              ref={(el) => {
                panels.current[2] = el;
              }}
              className={`story-panel projects-panel ${chapter === 2 ? "panel-active" : ""}`}
              inert={chapter !== 2}
              aria-hidden={chapter !== 2}
            >
              <div className="chapter-copy project-copy" key={p.id}>
                <span className="eyebrow">
                  02 / PROJECTS{" "}
                  <span className="project-count">{p.number} — 03</span>
                </span>
                <span className="project-category">{p.category}</span>
                <h2>
                  {p.headline.split("\n").map((line, i) => (
                    <span key={line} className={i ? "subtle-heading" : ""}>
                      {line}
                      <br />
                    </span>
                  ))}
                </h2>
                <p>{p.description}</p>
                <div className="tags">
                  {p.stack.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <button
                  className="pill-button light-button"
                  onClick={() => setModal(project)}
                >
                  Inside {p.name} <span>↗</span>
                </button>
              </div>
              <div className="project-selector" aria-label="Choose a project">
                {projects.map((item, i) => (
                  <button
                    className={i === project ? "selected" : ""}
                    key={item.id}
                    onClick={() => goTo([0.47, 0.565, 0.655][i])}
                    aria-current={i === project ? "true" : undefined}
                  >
                    <span>0{i + 1}</span>
                    {item.name}
                    <span>↗</span>
                  </button>
                ))}
              </div>
              <span className="world-annotation">
                INTERFACE STUDIES / BUILT FROM REAL PROJECTS
              </span>
            </section>

            <section
              ref={(el) => {
                panels.current[3] = el;
              }}
              className={`story-panel about-panel ${chapter === 3 ? "panel-active" : ""}`}
              inert={chapter !== 3}
              aria-hidden={chapter !== 3}
            >
              <div className="chapter-copy">
                <span className="eyebrow">03 / ABOUT ME</span>
                <h2>
                  Curious by nature.
                  <br />
                  <em>Engineer by practice.</em>
                </h2>
                <p>
                  I’m Krish, a software engineer in Vancouver, WA. I work across
                  machine learning, cloud systems, and full stack applications.
                </p>
                <p>
                  I’m studying Computer Science with a Mathematics minor at
                  Washington State University, graduating in May 2027.
                </p>
                <div className="idea-facts">
                  <div>
                    <b>3.8 GPA</b>
                    <span>HONORS · WSU VANCOUVER</span>
                  </div>
                  <div>
                    <b>ACM Vice President</b>
                    <span>BUILDING THE CS COMMUNITY</span>
                  </div>
                </div>
                <button
                  className="text-button"
                  onClick={() => setModal("index")}
                >
                  Education, skills & more <span>↗</span>
                </button>
              </div>
              <span className="world-annotation">
                COMPUTER SCIENCE / MATHEMATICS / COMMUNITY
              </span>
            </section>

            <section
              ref={(el) => {
                panels.current[4] = el;
              }}
              className={`story-panel contact-panel ${chapter === 4 ? "panel-active" : ""}`}
              inert={chapter !== 4}
              aria-hidden={chapter !== 4}
            >
              <span className="eyebrow">
                <span className="status-dot" /> CONTACT
              </span>
              <h2>
                Your next idea.
                <br />
                <em>Let’s build it.</em>
              </h2>
              <p>
                Have a problem worth solving?
                <br />
                I’d love to hear about it.
              </p>
              <a className="pill-button" href={`mailto:${profile.email}`}>
                Let’s talk <span>↗</span>
              </a>
              <ProfileLinks />
              <span className="contact-location">
                VANCOUVER, WA · WILLING TO RELOCATE
              </span>
            </section>
          </div>
        </section>

        <div id="simple-portfolio" className="simple-content">
          {unavailable && (
            <p className="fallback-notice" role="status">
              The 3D view isn’t available in this browser. Your full portfolio
              is here.
            </p>
          )}
          <PortfolioIndex onProject={setModal} />
        </div>
      </main>

      {!simple && (
        <footer className="journey-footer">
          <button
            className="scroll-prompt"
            onClick={() => goTo(chapters[Math.min(chapter + 1, 4)].progress)}
          >
            <span className="scroll-arrow">↓</span>
            <span>
              {chapter === 4 ? "YOU’RE UP NEXT" : "SCROLL TO EXPLORE"}
            </span>
          </button>
          <nav className="chapter-nav" aria-label="Journey chapters">
            {chapters.map((item, i) => (
              <button
                key={item.name}
                onClick={() => goTo(item.progress)}
                aria-current={chapter === i ? "step" : undefined}
              >
                <span>0{i}</span>
                {item.name}
              </button>
            ))}
            <span className="chapter-progress" />
          </nav>
          <span className="footer-note">PORTFOLIO © 2026</span>
        </footer>
      )}
      <button
        className="motion-toggle"
        disabled={unavailable}
        onClick={toggleMotion}
        aria-pressed={!simple}
        aria-label={
          simple ? "Enable cinematic motion" : "Switch to simple portfolio view"
        }
      >
        <span className={`motion-symbol ${simple ? "paused" : ""}`} />
        {simple
          ? reducedMotion
            ? "Reduced motion"
            : "Simple view"
          : "Motion on"}
      </button>

      <dialog
        ref={dialog}
        className="detail-dialog"
        aria-labelledby="dialog-title"
        data-lenis-prevent
        onCancel={() => setModal(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setModal(null);
        }}
      >
        <div className="dialog-shell">
          <div className="dialog-top">
            <span id="dialog-title">
              {modal === "experience"
                ? "PROFESSIONAL EXPERIENCE"
                : modal === "index"
                  ? "THE INDEX / KRISH KANDA"
                  : typeof modal === "number"
                    ? projects[modal].name
                    : "Portfolio"}
            </span>
            <button
              autoFocus
              className="close-button"
              onClick={() => setModal(null)}
              aria-label="Close portfolio panel"
            >
              Close <span>×</span>
            </button>
          </div>
          {modal === "experience" ? (
            <div className="experience-dialog-content">
              <ExperienceDetails idPrefix="dialog-experience" />
            </div>
          ) : modal === "index" ? (
            <PortfolioIndex onProject={setModal} idPrefix="dialog-index" />
          ) : (
            typeof modal === "number" && (
              <article className="project-detail">
                <button
                  className="text-button"
                  onClick={() => setModal("index")}
                >
                  ← Back to index
                </button>
                <span className="eyebrow">
                  {projects[modal].category} / {projects[modal].date}
                </span>
                <h2>{projects[modal].name}</h2>
                <ProjectPreview kind={projects[modal].id} />
                <p>{projects[modal].detail}</p>
                <div className="tags">
                  {projects[modal].stack.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <blockquote>{projects[modal].takeaway}</blockquote>
                {projects[modal].id === "wealth" ? (
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
                ) : (
                  <a
                    className="text-button"
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Explore my GitHub profile ↗
                  </a>
                )}
              </article>
            )
          )}
        </div>
      </dialog>
      <noscript>
        <style>{`.world,.journey-footer,.motion-toggle,.site-header nav,.index-toggle,.studio-copy button{display:none!important}.journey{height:100svh!important}.simple-content{display:block!important}.story-panel:not(.studio-panel){display:none!important}`}</style>
      </noscript>
    </div>
  );
}
