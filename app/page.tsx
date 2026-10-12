import Image from "next/image";
import BookingWidget from "@/components/BookingWidget";
import CourtGallery from "@/components/CourtGallery";
import {
  CalendarDays,
  MapPin,
  Users,
  ShieldCheck,
} from "lucide-react";

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="container nav-inner">
          <a className="brand" href="#top">
            <div className="brand-mark">NG</div>

            <div>
              NET <span>GAINS</span>
              <small
                style={{
                  display: "block",
                  fontSize: 8,
                  letterSpacing: 2,
                }}
              >
                PICKLEBALL CLUB
              </small>
            </div>
          </a>

          <nav className="nav-links">
            <a href="#book">Book Court</a>
            <a href="#about">About</a>
            <a href="#gallery">Gallery</a>
            <a href="#contact">Contact</a>
          </nav>

          <a className="btn btn-primary" href="#book">
            Book Now
          </a>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="container hero">
          <div>
            <div className="eyebrow">● Cebu's court for your next game</div>

            <h1>
              PLAY.
              <br />
              <span>CONNECT.</span>
              <br />
              GROW.
            </h1>

            <p>
              Reserve the NET GAINS pickleball court in seconds. Pick your
              date, choose an open hour, and get your game on.
            </p>

            <div className="actions">
              <a className="btn btn-primary" href="#book">
                Book a Court
              </a>

              <a className="btn btn-ghost" href="#about">
                Discover NET GAINS
              </a>
            </div>
          </div>

          <div className="hero-image">
            <Image
              src="/net-gains-reference.png"
              alt="NET GAINS Pickleball Club court design"
              fill
              priority
            />

            {/* <div className="image-label">
              
            </div> */}
          </div>
        </section>

        {/* About Section */}
       <section id="about" className="section about-section">
  <div className="container">
    <div className="about-hero">
      <div className="about-intro">
        <div className="eyebrow">THE NET GAINS EXPERIENCE</div>

        <h2>
          Built for better games.
          <br />
          <span>Made for your people.</span>
        </h2>

        <p>
          More than just a place to play. NET GAINS brings people
          together through friendly competition, unforgettable rallies,
          and a shared love for the game.
        </p>

        <a href="#book" className="about-button">
          Get on the Court <span>↗</span>
        </a>
      </div>

      <div className="about-visual">
        <div className="about-visual-top">
          <span>YOUR NEXT GAME STARTS HERE</span>
          <span className="about-ng-mark">NG.</span>
        </div>

        <div className="about-court-art" aria-hidden="true">
          <div className="court-line court-line-outer" />
          <div className="court-line court-line-middle" />
          <div className="court-line court-line-left" />
          <div className="court-line court-line-right" />
          <div className="court-net" />
          <div className="court-center-circle" />
        </div>

        <div className="about-visual-bottom">
          <div>
            <span className="about-mini-label">THE GAME</span>
            <h3>Play. Connect. Grow.</h3>
          </div>
          <span className="about-visual-arrow">↗</span>
        </div>
      </div>
    </div>

    <div className="about-divider">
      <span>WHY PLAY AT NET GAINS?</span>
      <span className="about-divider-line" />
      <span>01 — 03</span>
    </div>

    <div className="features about-features">
      <div className="card about-card">
        <div className="about-card-top">
          <div className="icon">
            <CalendarDays />
          </div>
          <span className="about-card-index">01</span>
        </div>

        <h3>Easy Booking</h3>

        <p>
          Find an available time, reserve your slot online,
          and spend less time planning and more time playing.
        </p>

        <a href="#book" className="about-card-link">
          Reserve your game <span>↗</span>
        </a>
      </div>

      <div className="card about-card">
        <div className="about-card-top">
          <div className="icon">
            <Users />
          </div>
          <span className="about-card-index">02</span>
        </div>

        <h3>Bring Your Crew</h3>

        <p>
          Rally your friends, challenge your teammates,
          and turn every match into a chance to connect.
        </p>

        <a href="#book" className="about-card-link">
          Plan your next match <span>↗</span>
        </a>
      </div>

      <div className="card about-card">
        <div className="about-card-top">
          <div className="icon">
            <ShieldCheck />
          </div>
          <span className="about-card-index">03</span>
        </div>

        <h3>Play with Confidence</h3>

        <p>
          Organized reservations help keep your chosen court
          time clear and avoid overlapping bookings.
        </p>

        <a href="#book" className="about-card-link">
          Find your time <span>↗</span>
        </a>
      </div>
    </div>

  </div>
</section>

         {/* Court Gallery */}

  <CourtGallery />

        {/* Booking Section */}
        <section
          id="book"
          className="section"
          style={{ paddingTop: 20 }}
        >
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">ONLINE RESERVATION</div>

              <h2>Book your court.</h2>

              <p>
                One court. One clean schedule. Choose an available slot
                below.
              </p>
            </div>

            <BookingWidget />
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="section">
          <div className="container">
            <div
              className="card"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 30,
              }}
            >
              <div>
                <div className="eyebrow">FIND US</div>

                <h2 style={{ fontFamily: "Outfit" }}>
                  NET GAINS Pickleball Club
                </h2>

                <p className="muted">
                  Add your exact venue address, Facebook/Instagram links,
                  and contact number here before launch.
                </p>
              </div>

              <div>
                <p>
                  <MapPin
                    size={17}
                    style={{ verticalAlign: "middle" }}
                  />{" "}
                  Venue address
                </p>

                <p>📞 09XX XXX XXXX</p>

                <p>✉️ hello@netgains.ph</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <div className="brand">
              NET <span>GAINS</span>
            </div>

            <p className="muted">PLAY. CONNECT. GROW.</p>
          </div>

          <div className="muted">
            © 2026 NET GAINS Pickleball Club. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
}