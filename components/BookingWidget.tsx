"use client";

import { useEffect, useMemo, useState } from "react";

type Slot = {
  startTime: string;
  endTime: string;
  booked: boolean;
};

const rate = Number(
  process.env.NEXT_PUBLIC_HOURLY_RATE || 500
);

function getLocalDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(
    2,
    "0"
  );
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function BookingWidget() {
  const today = getLocalDate();

  const [date, setDate] = useState(today);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState("");

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
   * Load available slots whenever the date changes.
   */
  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsError("");
      setSelected([]);
      setMessage(null);

      try {
        const response = await fetch(
          `/api/bookings?date=${encodeURIComponent(date)}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Could not load available times."
          );
        }

        if (!cancelled) {
          setSlots(data.slots || []);
        }
      } catch (error) {
        console.error(
          "Could not load booking slots:",
          error
        );

        if (!cancelled) {
          setSlots([]);
          setSlotsError(
            error instanceof Error
              ? error.message
              : "Could not load available times."
          );
        }
      } finally {
        if (!cancelled) {
          setSlotsLoading(false);
        }
      }
    }

    loadSlots();

    return () => {
      cancelled = true;
    };
  }, [date]);

  /*
   * Update form fields.
   */
  const update = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  /*
   * Check if a slot is selected.
   */
  const isSelected = (slot: Slot) => {
    return selected.some(
      (s) => s.startTime === slot.startTime
    );
  };

  /*
   * Check whether selecting this slot
   * keeps the booking continuous.
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

    // Extend before current selection
    if (slot.endTime === first.startTime) {
      return true;
    }

    // Extend after current selection
    if (last.endTime === slot.startTime) {
      return true;
    }

    return false;
  };

  /*
   * Handle slot click.
   */
  const handleSlotClick = (slot: Slot) => {
    if (slot.booked || loading) {
      return;
    }

    setMessage(null);

    /*
     * Remove selected slot.
     */
    if (isSelected(slot)) {
      setSelected((current) =>
        current.filter(
          (s) => s.startTime !== slot.startTime
        )
      );

      return;
    }

    /*
     * First selection.
     */
    if (selected.length === 0) {
      setSelected([slot]);
      return;
    }

    /*
     * Only allow consecutive hours.
     */
    if (!canSelectSlot(slot)) {
      setMessage({
        ok: false,
        text: "Please select consecutive time slots.",
      });

      return;
    }

    setSelected((current) => [...current, slot]);
  };

  /*
   * Sort selected slots.
   */
  const sortedSelected = useMemo(() => {
    return [...selected].sort((a, b) =>
      a.startTime.localeCompare(b.startTime)
    );
  }, [selected]);

  /*
   * Booking start time.
   */
  const startTime =
    sortedSelected[0]?.startTime || null;

  /*
   * Booking end time.
   */
  const endTime =
    sortedSelected.length > 0
      ? sortedSelected[sortedSelected.length - 1]
          .endTime
      : null;

  /*
   * Number of hours.
   */
  const hours = selected.length;

  /*
   * Total price.
   */
  const total = hours * rate;

  const selectedLabel = useMemo(() => {
    if (!startTime || !endTime) {
      return "Choose a time";
    }

    return `${startTime} – ${endTime}`;
  }, [startTime, endTime]);

  /*
   * Submit booking and create PayMongo checkout.
   */
  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setMessage(null);

    if (
      selected.length === 0 ||
      !startTime ||
      !endTime
    ) {
      setMessage({
        ok: false,
        text: "Please select at least one available time slot.",
      });

      return;
    }

    setLoading(true);

    try {
      /*
       * STEP 1
       * Create PENDING booking.
       */
      const bookingResponse = await fetch(
        "/api/bookings",
        {
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
        }
      );

      const bookingData =
        await bookingResponse.json();

      if (!bookingResponse.ok) {
        setMessage({
          ok: false,
          text:
            bookingData.error ||
            "Could not create booking.",
        });

        setLoading(false);
        return;
      }

      const booking =
        bookingData.booking;

      /*
       * Make sure we received a booking ID.
       */
      if (!booking?.id) {
        throw new Error(
          "Booking was created but no booking ID was returned."
        );
      }

      /*
       * STEP 2
       * Create PayMongo Checkout Session.
       */
      const paymentResponse = await fetch(
        "/api/payments/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId: booking.id,
          }),
        }
      );

      const paymentData =
        await paymentResponse.json();

      if (!paymentResponse.ok) {
        setMessage({
          ok: false,
          text:
            paymentData.error ||
            "Could not start payment.",
        });

        setLoading(false);
        return;
      }

      /*
       * Make sure PayMongo returned
       * a checkout URL.
       */
      if (!paymentData.checkoutUrl) {
        throw new Error(
          "PayMongo did not return a checkout URL."
        );
      }

      /*
       * STEP 3
       * Redirect customer to PayMongo.
       */
      window.location.href =
        paymentData.checkoutUrl;
    } catch (error) {
      console.error(
        "Booking/payment error:",
        error
      );

      setMessage({
        ok: false,
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
      });

      setLoading(false);
    }
  }

  return (
    <div className="booking-shell">
      <div className="booking-grid">

        {/* =====================================
            LEFT SIDE - DATE & TIME
        ====================================== */}

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
              onChange={(e) =>
                setDate(e.target.value)
              }
            />
          </div>

          <div
            className="small"
            style={{
              margin: "10px 0 12px",
            }}
          >
            ₱{rate.toLocaleString()} / hour · 1
            court · 6:00 AM–10:00 PM
          </div>

          {/* =================================
              TIME SLOTS
          ================================== */}

          {slotsLoading ? (
            <div className="small">
              Loading available times...
            </div>
          ) : slotsError ? (
            <div className="notice error">
              <div>{slotsError}</div>

              <button
                type="button"
                className="btn"
                style={{
                  marginTop: "10px",
                }}
                onClick={() =>
                  setDate((current) => current)
                }
              >
                Try again
              </button>
            </div>
          ) : slots.length === 0 ? (
            <div className="notice error">
              No available time slots were returned
              for this date.
            </div>
          ) : (
            <div className="slots">
              {slots.map((slot) => {
                const active =
                  isSelected(slot);

                return (
                  <button
                    type="button"
                    key={slot.startTime}
                    disabled={
                      slot.booked || loading
                    }
                    className={`slot ${
                      slot.booked
                        ? "booked"
                        : ""
                    } ${
                      active
                        ? "selected"
                        : ""
                    }`}
                    onClick={() =>
                      handleSlotClick(slot)
                    }
                  >
                    <strong>
                      {slot.startTime}
                    </strong>

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
          )}

          {/* =================================
              SELECTION INFO
          ================================== */}

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
                  {hours}{" "}
                  {hours === 1
                    ? "hour"
                    : "hours"}
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

        {/* =====================================
            RIGHT SIDE - BOOKING FORM
        ====================================== */}

        <form onSubmit={submit}>
          <div className="calendar-title">
            Your booking details
          </div>

          {message && (
            <div
              className={`notice ${
                message.ok
                  ? "success"
                  : "error"
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
              value={
                form.customerName
              }
              onChange={update}
              placeholder="Juan Dela Cruz"
              disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <div className="field">
            <label>
              Number of players
            </label>

            <select
              name="players"
              value={form.players}
              onChange={update}
              disabled={loading}
            >
              {[2, 3, 4, 5, 6, 7, 8].map(
                (n) => (
                  <option
                    key={n}
                    value={n}
                  >
                    {n}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="field">
            <label>
              Notes (optional)
            </label>

            <textarea
              rows={3}
              name="notes"
              value={form.notes}
              onChange={update}
              placeholder="Any special request?"
              disabled={loading}
            />
          </div>

          {/* =================================
              SUMMARY
          ================================== */}

          <div className="summary">
            <div className="summary-row">
              <span>
                Selected time
              </span>

              <strong>
                {selectedLabel}
              </strong>
            </div>

            <div className="summary-row">
              <span>Duration</span>

              <strong>
                {hours}{" "}
                {hours === 1
                  ? "hour"
                  : "hours"}
              </strong>
            </div>

            <div className="summary-row">
              <span>Rate</span>

              <strong>
                ₱{rate.toLocaleString()} /
                hour
              </strong>
            </div>

            <div className="summary-row">
              <span>Total</span>

              <strong>
                ₱{total.toLocaleString()}
              </strong>
            </div>
          </div>

          {/* =================================
              PAYMENT BUTTON
          ================================== */}

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              width: "100%",
            }}
            disabled={
              loading ||
              selected.length === 0 ||
              slotsLoading
            }
          >
            {loading
              ? "Preparing payment..."
              : selected.length === 0
              ? "Select a Time"
              : `Continue to Payment — ₱${total.toLocaleString()}`}
          </button>

          <p className="small center">
            You will be redirected to PayMongo
            to complete your payment securely.
          </p>
        </form>
      </div>
    </div>
  );
}