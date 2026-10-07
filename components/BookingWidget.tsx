"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = {
  startTime: string;
  endTime: string;
  booked: boolean;
};

const rate = Number(process.env.NEXT_PUBLIC_HOURLY_RATE || 500);

export default function BookingWidget() {
  const today = new Date().toISOString().slice(0, 10);

  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selected, setSelected] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    customerName: "",
    email: "",
    phone: "",
    players: "2",
    notes: "",
  });

  /*
   * Load available slots whenever the date changes
   */
  useEffect(() => {
    setSelected([]);
    setMessage(null);

    fetch(`/api/bookings?date=${date}`)
      .then((r) => r.json())
      .then((d) => setSlots(d.slots || []));
  }, [date]);

  const update = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  /*
   * Check if a slot is currently selected
   */
  const isSelected = (slot: Slot) => {
    return selected.some((s) => s.startTime === slot.startTime);
  };

  /*
   * Check whether selecting this slot would keep
   * the booking continuous.
   */
  const canSelectSlot = (slot: Slot) => {
    if (selected.length === 0) {
      return true;
    }

    const sorted = [...selected].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );

    const first = sorted[0];
    const last = sorted[sorted.length - 1];

    // Allow extending before the current selection
    if (slot.endTime === first.startTime) {
      return true;
    }

    // Allow extending after the current selection
    if (last.endTime === slot.startTime) {
      return true;
    }

    return false;
  };

  /*
   * Handle slot click
   */
  const handleSlotClick = (slot: Slot) => {
    if (slot.booked) return;

    setMessage(null);

    // If already selected, remove it
    if (isSelected(slot)) {
      const newSelected = selected.filter(
        (s) => s.startTime !== slot.startTime
      );

      setSelected(newSelected);
      return;
    }

    // First selection
    if (selected.length === 0) {
      setSelected([slot]);
      return;
    }

    // Only allow continuous booking
    if (!canSelectSlot(slot)) {
      setMessage({
        ok: false,
        text: "Please select consecutive time slots.",
      });

      return;
    }

    setSelected([...selected, slot]);
  };

  /*
   * Sort selected slots by start time
   */
  const sortedSelected = useMemo(() => {
    return [...selected].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [selected]);

  /*
   * Booking start time
   */
  const startTime = sortedSelected[0]?.startTime || null;

  /*
   * Booking end time
   */
  const endTime =
    sortedSelected.length > 0
      ? sortedSelected[sortedSelected.length - 1].endTime
      : null;

  /*
   * Number of hours
   */
  const hours = selected.length;

  /*
   * Total price
   */
  const total = hours * rate;

  const selectedLabel = useMemo(() => {
    if (!startTime || !endTime) {
      return "Choose a time";
    }

    return `${startTime} – ${endTime}`;
  }, [startTime, endTime]);

  /*
   * Submit booking
   */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setMessage(null);

    if (selected.length === 0 || !startTime || !endTime) {
      setMessage({
        ok: false,
        text: "Please select at least one available time slot.",
      });

      return;
    }

    setLoading(true);

    try {
      const r = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          date,
          startTime,
          endTime,
          hours,
        }),
      });

      const d = await r.json();

      if (!r.ok) {
        setMessage({
          ok: false,
          text: d.error || "Booking failed.",
        });

        setLoading(false);
        return;
      }

      setMessage({
        ok: true,
        text: `Booking confirmed! Reference: ${d.booking.reference}`,
      });

      setForm({
        customerName: "",
        email: "",
        phone: "",
        players: "2",
        notes: "",
      });

      setSelected([]);

      fetch(`/api/bookings?date=${date}`)
        .then((r) => r.json())
        .then((d) => setSlots(d.slots || []));
    } catch {
      setMessage({
        ok: false,
        text: "Something went wrong. Please try again.",
      });
    }

    setLoading(false);
  }

  return (
    <div className="booking-shell">
      <div className="booking-grid">

        {/* LEFT SIDE */}
        <div>
          <div className="calendar-title">
            Choose your date & time
          </div>

          <div className="field">
            <label>Date</label>

            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div
            className="small"
            style={{ margin: "10px 0 12px" }}
          >
            ₱{rate.toLocaleString()} / hour · 1 court ·
            6:00 AM–10:00 PM
          </div>

          {/* SLOTS */}
          <div className="slots">
            {slots.map((slot) => {
              const active = isSelected(slot);

              return (
                <button
                  type="button"
                  key={slot.startTime}
                  disabled={slot.booked}
                  className={`slot ${
                    slot.booked ? "booked" : ""
                  } ${active ? "selected" : ""}`}
                  onClick={() => handleSlotClick(slot)}
                >
                  <strong>{slot.startTime}</strong>

                  <br />

                  <span className="small">
                    {slot.booked
                      ? "Booked"
                      : active
                      ? "Selected"
                      : `₱${rate.toLocaleString()}`}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SELECTION INFO */}
          {selected.length > 0 && (
            <div
              className="selection-info"
              style={{
                marginTop: "15px",
                padding: "14px",
                borderRadius: "10px",
              }}
            >
              <div className="summary-row">
                <span>Selected</span>

                <strong>
                  {selectedLabel}
                </strong>
              </div>

              <div className="summary-row">
                <span>Duration</span>

                <strong>
                  {hours} {hours === 1 ? "hour" : "hours"}
                </strong>
              </div>

              <div className="summary-row">
                <span>Total</span>

                <strong>
                  ₱{total.toLocaleString()}
                </strong>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDE */}
        <form onSubmit={submit}>
          <div className="calendar-title">
            Your booking details
          </div>

          {message && (
            <div
              className={`notice ${
                message.ok ? "success" : "error"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="field">
            <label>Full name</label>

            <input
              required
              name="customerName"
              value={form.customerName}
              onChange={update}
              placeholder="Juan Dela Cruz"
            />
          </div>

          <div className="field">
            <label>Email</label>

            <input
              required
              type="email"
              name="email"
              value={form.email}
              onChange={update}
              placeholder="juan@email.com"
            />
          </div>

          <div className="field">
            <label>Mobile number</label>

            <input
              required
              name="phone"
              value={form.phone}
              onChange={update}
              placeholder="09XXXXXXXXX"
            />
          </div>

          <div className="field">
            <label>Number of players</label>

            <select
              name="players"
              value={form.players}
              onChange={update}
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Notes (optional)</label>

            <textarea
              rows={3}
              name="notes"
              value={form.notes}
              onChange={update}
              placeholder="Any special request?"
            />
          </div>

          {/* SUMMARY */}
          <div className="summary">
            <div className="summary-row">
              <span>Selected time</span>

              <strong>
                {selectedLabel}
              </strong>
            </div>

            <div className="summary-row">
              <span>Duration</span>

              <strong>
                {hours} {hours === 1 ? "hour" : "hours"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Rate</span>

              <strong>
                ₱{rate.toLocaleString()} / hour
              </strong>
            </div>

            <div className="summary-row">
              <span>Total</span>

              <strong>
                ₱{total.toLocaleString()}
              </strong>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%" }}
            disabled={loading || selected.length === 0}
          >
            {loading ? "Booking..." : "Reserve Court"}
          </button>

          <p className="small center">
            You can connect GCash/Maya/PayMongo later.
            This starter keeps payment status ready in
            the database.
          </p>
        </form>
      </div>
    </div>
  );
}

