import Link from "next/link";
import styles from "../payment-status.module.css";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className={styles.page}>
      <div className={`${styles.glow} ${styles.glowTop}`} />
      <div className={`${styles.glow} ${styles.glowBottom}`} />

      <section className={styles.card}>
        <div className={styles.accent} />

        <div className={styles.content}>
          <div className={styles.iconCircle} aria-hidden="true">
            ✓
          </div>

          <p className={styles.brand}>NET GAINS PICKLEBALL CLUB</p>

          <h1 className={styles.heading}>Payment Successful!</h1>

          <p className={styles.description}>
            Thank you for booking with NET GAINS! Your checkout was completed.
            We look forward to seeing you on the court.
          </p>

          {reference && (
            <div className={styles.reference}>
              <p className={styles.referenceLabel}>Booking Reference</p>
              <p className={styles.referenceValue}>{reference}</p>
            </div>
          )}

          <div className={styles.note}>
            Please keep your booking reference for future inquiries. Your
            payment status is verified separately by our payment system.
          </div>

          <div className={styles.actions}>
            <Link href="/" className={styles.button}>
              Back to Homepage&nbsp; →
            </Link>
          </div>

          <p className={styles.footer}>
            Thank you for playing with NET GAINS.
          </p>
        </div>
      </section>
    </main>
  );
}