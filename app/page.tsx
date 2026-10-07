import Image from "next/image";
import BookingWidget from "@/components/BookingWidget";
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
                Explore Club
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
        <section id="about" className="section">
          <div className="container">
            <div className="section-head">
              <div className="eyebrow">THE CLUB</div>

              <h2>Built for better games.</h2>

              <p>
                A clean, modern court experience inspired by the NET GAINS
                design palette — deep teal, light teal, charcoal and white.
              </p>
            </div>

            <div className="features">
              <div className="card">
                <div className="icon">
                  <CalendarDays />
                </div>

                <h3>Easy Booking</h3>

                <p>
                  See available hours and reserve the court online without
                  sending back-and-forth messages.
                </p>
              </div>

              <div className="card">
                <div className="icon">
                  <Users />
                </div>

                <h3>Made for Your Crew</h3>

                <p>
                  Book for 2–8 players and keep your game details in one
                  reservation.
                </p>
              </div>

              <div className="card">
                <div className="icon">
                  <ShieldCheck />
                </div>

                <h3>No Double Booking</h3>

                <p>
                  Each court slot is protected by the database so two
                  customers cannot reserve the same hour.
                </p>
              </div>
            </div>
          </div>
        </section>

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