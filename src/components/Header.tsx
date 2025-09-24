import Link from "next/link";

export default function Header() {
    return (
        <header className="sticky top-0 z-50 bg-white border-b">
            <div className="container mx-auto px-4 flex justify-between items-center h-14">
                <Link href="/" className="text-xl font-bold tracking-tight">
                    RoleSim
                </Link>
                <nav className="flex items-center gap-6">
                    <Link
                        href="#"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        GitHub
                    </Link>
                    <Link
                        href="/admin/ingest"
                        className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                        Admin
                    </Link>
                </nav>
            </div>
        </header>
    );
}
