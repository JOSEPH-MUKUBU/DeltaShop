import { Container } from "./Container";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <Container className="py-8 text-sm text-slate-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} DeltaShop</span>
          <span className="text-slate-500">MERN • React • Express • MongoDB</span>
        </div>
      </Container>
    </footer>
  );
}

