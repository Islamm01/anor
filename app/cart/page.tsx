// app/cart/page.tsx
// SARV — Cart page works for ALL users (guest + logged in)
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GuestCartClient from "@/components/cart/GuestCartClient";

export const metadata = { title: "Корзина — SARV" };

export default function CartPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <GuestCartClient />
      </main>
      <Footer />
    </>
  );
}
