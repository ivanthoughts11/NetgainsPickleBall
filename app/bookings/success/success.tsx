import Link from "next/link";

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ reference?: string }>;
}) {
  const { reference } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mb-4 text-5xl">✅</div>

        <h1 className="text-2xl font-bold text-gray-900">
          Payment Return Successful!
        </h1>

        <p className="mt-3 text-gray-600">
          Thank you for booking with NET GAINS Pickleball Club.
        </p>

        {reference && (
          <p className="mt-4 break-all text-sm text-gray-500">
            Booking Reference: {reference}
          </p>
        )}

        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-black px-6 py-3 font-semibold text-white hover:bg-gray-800"
        >
          Back to Homepage
        </Link>
      </div>
    </main>
  );
}