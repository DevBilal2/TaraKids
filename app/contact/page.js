"use client";
import { useState } from "react";
import { Phone, Mail, MapPin, Instagram, Facebook, Send, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [status, setStatus] = useState("idle");
  const [formData, setFormData] = useState({ name: "", email: "", phone: "", message: "" });

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("loading");

    const body = new FormData();
    body.append("access_key", process.env.NEXT_PUBLIC_WEB3FORMS_KEY || "");
    body.append("name", formData.name);
    body.append("email", formData.email);
    body.append("phone", formData.phone);
    body.append("message", formData.message);
    body.append("subject", "New Enquiry — Tara Kids");

    try {
      const res = await fetch("https://api.web3forms.com/submit", { method: "POST", body });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero strip */}
      <div className="border-b border-stone-100 bg-stone-50 px-6 py-16 text-center sm:px-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-stone-400">
          Tara Kids · Premium Children&apos;s Fashion
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
          Let&apos;s Connect
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-stone-500">
          For orders, custom designs, wedding &amp; function wear enquiries, or
          wholesale — we&apos;re here to help.
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-16 sm:px-8 xl:px-0">
        <div className="grid gap-16 lg:grid-cols-[1fr_380px]">

          {/* ── Form ── */}
          <div>
            <p className="mb-8 text-sm font-bold uppercase tracking-[0.2em] text-stone-700">
              Send us a message
            </p>

            {status === "success" ? (
              <div className="flex flex-col items-center justify-center gap-5 rounded-3xl border border-stone-100 bg-stone-50 py-24 text-center">
                <CheckCircle size={36} className="text-stone-800" strokeWidth={1.5} />
                <div>
                  <p className="text-lg font-semibold tracking-tight text-stone-900">
                    Thank you for reaching out
                  </p>
                  <p className="mt-1 text-sm text-stone-500">
                    Our team will get back to you within 24 hours.
                  </p>
                </div>
                <button
                  onClick={() => setStatus("idle")}
                  className="mt-2 text-xs font-semibold uppercase tracking-widest text-stone-500 underline underline-offset-4 hover:text-stone-900"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-7">
                <div className="grid gap-7 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Aisha Khan"
                      className="w-full border-0 border-b-2 border-stone-300 bg-transparent pb-3 pt-1 text-sm font-medium text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-900"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-700">
                      Phone <span className="normal-case font-normal text-stone-400">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+92 328 4114902"
                      className="w-full border-0 border-b-2 border-stone-300 bg-transparent pb-3 pt-1 text-sm font-medium text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full border-0 border-b-2 border-stone-300 bg-transparent pb-3 pt-1 text-sm font-medium text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-900"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-[0.15em] text-stone-700">
                    Your Enquiry
                  </label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about the occasion, age of the child, preferred style, or any custom requirements..."
                    className="w-full resize-none border-0 border-b-2 border-stone-300 bg-transparent pb-3 pt-1 text-sm font-medium text-stone-900 placeholder-stone-400 outline-none transition-colors focus:border-stone-900"
                  />
                </div>

                {status === "error" && (
                  <p className="text-xs text-red-500">
                    Something went wrong. Please email us directly at tarakidswearofficial@gmail.com
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-2.5 rounded-full bg-stone-900 px-10 py-3.5 text-sm font-semibold tracking-widest text-white uppercase transition-colors hover:bg-black disabled:opacity-50"
                  >
                    <Send size={14} aria-hidden="true" />
                    {status === "loading" ? "Sending…" : "Send Enquiry"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="space-y-10">
            <div>
              <p className="mb-6 text-sm font-bold uppercase tracking-[0.2em] text-stone-700">
                Reach us directly
              </p>
              <div className="space-y-6">
                <a
                  href="tel:+923284114902"
                  className="group flex items-start gap-4"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white transition-colors group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white text-stone-700">
                    <Phone size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-600">WhatsApp / Phone</p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900">+92 328 4114902</p>
                  </div>
                </a>

                <a
                  href="mailto:tarakidswearofficial@gmail.com"
                  className="group flex items-start gap-4"
                >
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white transition-colors group-hover:border-stone-900 group-hover:bg-stone-900 group-hover:text-white text-stone-700">
                    <Mail size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-600">Email</p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900 break-all">tarakidswearofficial@gmail.com</p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-700">
                    <MapPin size={15} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-stone-600">Location</p>
                    <p className="mt-0.5 text-sm font-semibold text-stone-900">Lahore, Pakistan</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px w-full bg-stone-200" />

            {/* Social */}
            <div>
              <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-stone-700">
                Follow the brand
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  <Instagram size={16} strokeWidth={1.8} aria-hidden />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 text-stone-700 transition-all hover:border-stone-900 hover:bg-stone-900 hover:text-white"
                >
                  <Facebook size={16} strokeWidth={1.8} aria-hidden />
                </a>
              </div>
            </div>

            {/* Brand note */}
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-6">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-stone-700">
                Specialising in
              </p>
              <ul className="mt-3 space-y-2 text-sm font-medium text-stone-700">
                <li>· Wedding &amp; Nikah wear for children</li>
                <li>· Eid &amp; function outfits</li>
                <li>· Custom &amp; bulk orders</li>
                <li>· Wholesale for retailers</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
