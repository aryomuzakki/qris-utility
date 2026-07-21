export function Footer() {
  return (
    <footer className="border-t py-6 mt-auto">
      <div className="max-w-2xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400 space-y-1">
        <p>
          Made with <span className="text-red-500">❤️</span> by{" "}
          <a
            href="https://github.com/aryomuzakki"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            Aryo Muzakki
          </a>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          QRIS is a standardized QR Code payment system by Bank Indonesia
        </p>
      </div>
    </footer>
  );
}
