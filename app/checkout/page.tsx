// app/checkout/page.tsx
// Anjir — Checkout page works for ALL users, no login required
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import GuestCheckoutForm from "@/components/checkout/GuestCheckoutForm";

export const metadata = { title: "Оформление заказа" };

export default function CheckoutPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-5">
          <div className="mb-8">
            <h1 className="text-[28px] font-black text-black tracking-tight">Оформление заказа</h1>
            <p className="text-[13px] text-black/40 mt-1">
              Заполните данные — мы свяжемся с вами для подтверждения
            </p>
          </div>
          <GuestCheckoutForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
