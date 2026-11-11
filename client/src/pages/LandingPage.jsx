import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import AppIcon from "../components/AppIcon";

const features = [
  {
    number: "01",
    icon: "grid",
    title: "Projects with purpose",
    description:
      "Give every idea a shared home for decisions, progress, and the people moving it forward.",
    label: "PROJECT SPACES",
  },
  {
    number: "02",
    icon: "notes",
    title: "Everything in its place",
    description:
      "Keep notes, files, and project context together, so the important details stay close to the work.",
    label: "NOTES & FILES",
  },
  {
    number: "03",
    icon: "sparkle",
    title: "A little help from AI",
    description:
      "Turn a blank page into a first draft, explore ideas, and keep momentum when you need a nudge.",
    label: "AI WORKSPACE",
  },
];

export default function LandingPage() {
  const { theme } = useTheme();

  return (
    <main className="cs-home" data-theme={theme}>
      <header className="cs-home-nav">
        <Link className="cs-home-brand" to="/" aria-label="CollabSphere home">
          <span className="cs-home-brand-mark">C</span>
          <span>CollabSphere</span>
        </Link>

        <nav className="cs-home-links" aria-label="Main navigation">
          <a href="#approach">Our approach</a>
          <a href="#workspace">The workspace</a>
        </nav>

        <div className="cs-home-actions">
          <Link className="cs-home-signin" to="/login">
            Sign in
          </Link>
          <Link className="cs-home-nav-cta" to="/register">
            Get started <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </header>

      <section className="cs-home-hero">
        <div className="cs-home-hero-copy">
          <span className="cs-home-eyebrow">
            <i aria-hidden="true" />
            A BETTER PLACE TO BUILD TOGETHER
          </span>
          <h1>
            Good ideas
            <br />
            <em>grow together.</em>
          </h1>
          <p>
            Bring your people, projects, and possibilities into one
            thoughtful workspace. Less scattered. More in sync.
          </p>
          <div className="cs-home-hero-actions">
            <Link className="cs-home-primary" to="/register">
              Create your workspace <span aria-hidden="true">↗</span>
            </Link>
            <a className="cs-home-text-link" href="#workspace">
              Take a look around <span aria-hidden="true">↓</span>
            </a>
          </div>
          <div className="cs-home-trust-line">
            <span className="cs-home-avatar-stack" aria-hidden="true">
              <i>J</i><i>M</i><i>A</i><b>+</b>
            </span>
            <span>A little more clarity for your next big thing.</span>
          </div>
        </div>

        <div className="cs-home-visual" aria-label="Preview of the CollabSphere workspace">
          <div className="cs-home-visual-wash" />
          <div className="cs-home-note-card">
            <div className="cs-home-note-top">
              <span className="cs-home-note-icon">✳</span>
              <span>FIELD NOTES · 04</span>
              <span className="cs-home-note-more">•••</span>
            </div>
            <h2>Make space<br />for the good work.</h2>
            <p>A shared place for the details that make a great idea real.</p>
            <div className="cs-home-note-rule" />
            <div className="cs-home-note-author">
              <span className="cs-home-author-avatar">S</span>
              <span><b>Studio team</b><small>Updated just now</small></span>
              <span className="cs-home-note-check">✓</span>
            </div>
          </div>

          <div className="cs-home-project-card">
            <div className="cs-home-project-top">
              <span className="cs-home-project-dot" />
              <span>YOUR WORKSPACE</span>
              <span className="cs-home-project-menu">•••</span>
            </div>
            <h3>Spring collection</h3>
            <p>Make it meaningful, make it together.</p>
            <div className="cs-home-progress">
              <span><b>Project pulse</b><small>In a good place</small></span>
              <span className="cs-home-progress-ring">72%</span>
            </div>
            <div className="cs-home-project-footer">
              <span className="cs-home-mini-avatars"><i>A</i><i>J</i><i>M</i></span>
              <span>3 collaborators</span>
              <span className="cs-home-arrow">↗</span>
            </div>
          </div>

          <div className="cs-home-floating-tag">
            <span>✦</span>
            <span><b>All in one place</b><small>Ideas · files · people</small></span>
          </div>
          <span className="cs-home-visual-caption">A little more room to think.</span>
        </div>
      </section>

      <section className="cs-home-ribbon" aria-label="Workspace features">
        <span>MADE FOR THE WHOLE JOURNEY</span>
        <i>✳</i><b>Projects</b>
        <i>✳</i><b>Notes</b>
        <i>✳</i><b>Files</b>
        <i>✳</i><b>AI, when you need it</b>
      </section>

      <section className="cs-home-intro" id="approach">
        <div>
          <span className="cs-home-eyebrow">A CALMER WAY TO COLLABORATE</span>
          <h2>
            The best work isn’t
            <br />
            done in <em>more tabs.</em>
          </h2>
        </div>
        <p>
          It happens when everyone has the context, tools, and space to
          do their best thinking. CollabSphere brings the moving parts
          together, so your team can stay focused on what matters.
        </p>
      </section>

      <section className="cs-home-features" id="workspace">
        <div className="cs-home-feature-heading">
          <span className="cs-home-eyebrow">ONE CONNECTED WORKSPACE</span>
          <a href="#get-started">Explore the workspace <span aria-hidden="true">↗</span></a>
        </div>
        <div className="cs-home-feature-grid">
          {features.map((feature) => (
            <article className="cs-home-feature-card" key={feature.number}>
              <div className="cs-home-feature-top">
                <span className="cs-home-feature-icon">
                  <AppIcon name={feature.icon} size={19} />
                </span>
                <span>{feature.number}</span>
              </div>
              <span className="cs-home-feature-label">{feature.label}</span>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <span className="cs-home-feature-arrow" aria-hidden="true">↗</span>
            </article>
          ))}
        </div>
      </section>

      <section className="cs-home-cta" id="get-started">
        <div className="cs-home-cta-orbit" aria-hidden="true">✳</div>
        <span className="cs-home-eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>
        <h2>Make room for<br /><em>what’s next.</em></h2>
        <p>Bring your next idea into focus, one shared workspace at a time.</p>
        <Link className="cs-home-primary" to="/register">
          Start building together <span aria-hidden="true">↗</span>
        </Link>
      </section>

      <footer className="cs-home-footer">
        <Link className="cs-home-brand" to="/" aria-label="CollabSphere home">
          <span className="cs-home-brand-mark">C</span>
          <span>CollabSphere</span>
        </Link>
        <span>Thoughtful work, done together.</span>
        <Link to="/login">Sign in <span aria-hidden="true">↗</span></Link>
      </footer>
    </main>
  );
}
