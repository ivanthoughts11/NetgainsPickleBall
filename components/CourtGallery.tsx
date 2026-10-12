"use client";

import { useState } from "react";

const galleryItems = [
  {
    title: "The Court",
    category: "COURT VIEW",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFUXusK8lQ7CmH2K2N_o2jCG7wyCE6oNLoPm3R2QP6UxmJ9SsEcbmwnI8&s=10",
    alt: "Outdoor racket sports court",
  },
  {
    title: "Game On",
    category: "PLAY YOUR WAY",
    image:
      "https://www.macquarie.nsw.edu.au/wp-content/uploads/2025/11/Pickleball.jpg",
    alt: "Racket sports court ready for play",
  },
  {
    title: "Court Details",
    category: "BUILT FOR PLAY",
    image:
      "https://cdn.sanity.io/images/0vv8moc6/spectroscopy/907be56c4634101f270e856d52d3f4113533b172-5891x3927.jpg",
    alt: "Sports court and playing area",
  },
  {
    title: "Bring Your Crew",
    category: "PLAY TOGETHER",
    image:
      "https://whssignals.com/wp-content/uploads/2026/03/types-of-pickleball-rec-play.png",
    alt: "Racket sports equipment",
  },
  {
    title: "Find Your Rhythm",
    category: "STAY ACTIVE",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcoxJk1IIkgx3jR2kVWOM1rYNrcAqRXCwkEl_NfKZWy07c4CUMXPzGp_A&s=10",
    alt: "Outdoor sports playing area",
  },
  {
    title: "Your Next Match",
    category: "SEE YOU ON COURT",
    image:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuwURW4qXHPJHH57IMb6qNPlVBTL6OC_ZNmQiwNdOBTTFF6nF7xLj9j3w&s=10",
    alt: "Sports field and recreational space",
  },
];

export default function CourtGallery() {
  return (
    <section id="gallery" className="court-gallery">
      <div className="gallery-container">
        <div className="gallery-heading">
          <div>
            <span className="gallery-eyebrow">
              THE NET GAINS EXPERIENCE
            </span>

            <h2>
              Your court.
              <br />
              <span>Your community.</span>
            </h2>
          </div>

          {/* <p>
            Good games, great rallies, and better
            connections. Take a look around and
            get ready to play.
          </p> */}
        </div>

        <div className="gallery-grid">
  {galleryItems.map((item, index) => (
    <a
      className="gallery-card"
      href={item.image}
      key={item.title}
      aria-label={`View larger image: ${item.title}`}
      data-gallery-index={index}
      onClick={(event) => {
        event.preventDefault();

        const lightbox = document.getElementById("gallery-lightbox");
        const lightboxImage = document.getElementById(
          "gallery-lightbox-image"
        ) as HTMLImageElement | null;

        if (lightbox && lightboxImage) {
          lightboxImage.src = item.image;
          lightboxImage.alt = item.alt;
          lightbox.classList.add("is-open");
          document.body.style.overflow = "hidden";
        }
      }}
    >
      <img
        src={item.image}
        alt={item.alt}
        loading="lazy"
      />

      <div className="gallery-overlay">
        <span>{item.category}</span>
        <h3>{item.title}</h3>
        <div className="gallery-arrow">⤢</div>
      </div>
    </a>
  ))}
</div>

        {/* <div className="gallery-footer">
          <p>READY TO MAKE YOUR NEXT MOVE?</p>

          <a href="#booking" className="gallery-cta">
            Book Your Court <span>↗</span>
          </a>
        </div> */}
      </div>
      <div
  id="gallery-lightbox"
  className="gallery-lightbox"
  onClick={(event) => {
    if (event.target === event.currentTarget) {
      event.currentTarget.classList.remove("is-open");
      document.body.style.overflow = "";
    }
  }}
>
  <button
    type="button"
    className="lightbox-close"
    aria-label="Close image"
    onClick={() => {
      document.getElementById("gallery-lightbox")?.classList.remove("is-open");
      document.body.style.overflow = "";
    }}
  >
    &times;
  </button>

<img
  id="gallery-lightbox-image"
  className="lightbox-image"
  src={undefined}
  alt=""
/>
</div>
    </section>
  );
}
