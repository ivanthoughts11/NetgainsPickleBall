import Link from "next/link";
import styles from "../payment-status.module.css";

export default async function BookingCancelPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className={`${styles.page} ${styles.cancelPage}`}>
      <div className={`${styles.glow} ${styles.glowTop}`} />
      <div className={`${styles.glow} ${styles.glowBottom}`} />

      <section className={styles.card}>
        <div className={styles.accent} />

        <div className={styles.content}>
          <div className={styles.iconCircle} aria-hidden="true">
            ×
          </div>

          <p className={styles.brand}>NET GAINS PICKLEBALL CLUB</p>

          <h1 className={styles.heading}>Payment Cancelled</h1>

          <p className={styles.description}>
            Your checkout was cancelled or interrupted. You can return to NET
            GAINS and try again when you're ready.
          </p>

          {reference && (
            <div className={styles.reference}>
              <p className={styles.referenceLabel}>Booking Reference</p>
              <p className={styles.referenceValue}>{reference}</p>
            </div>
          )}

          <div className={styles.note}>
            If you believe you were charged, please verify your payment status
            before attempting another payment.
          </div>

          <div className={styles.actions}>
            <Link href="/" className={styles.button}>
              Return to Homepage
            </Link>

            <Link
              href="/"
              className={`${styles.button} ${styles.secondaryButton}`}
            >
              Back to NET GAINS
            </Link>
          </div>

          <p className={styles.footer}>
            Need help? Contact NET GAINS Pickleball Club.
          </p>
        </div>
      </section>
    </main>
  );
}