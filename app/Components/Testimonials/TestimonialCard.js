import { Star, Quote } from "lucide-react";

export default function TestimonialCard({ testimonial }) {
  return (
    <div className="h-full min-h-[380px] bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-stone-200 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col">
      {/* Quote Icon */}
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center">
          <Quote className="text-stone-400" size={20} />
        </div>
      </div>

      {/* Content - Fixed height with flex grow */}
      <div className="flex-grow">
        <p className="text-stone-800 mb-6 leading-relaxed italic text-sm md:text-base line-clamp-5">
          &quot;{testimonial.text}&quot;
        </p>

        {/* Rating */}
        <div className="flex mb-6">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={18}
              className={`${
                i < testimonial.rating
                  ? "fill-stone-900 text-stone-900"
                  : "fill-stone-200 text-stone-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Author - Fixed at bottom */}
      <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
        <div
          className={`w-12 h-12 rounded-full ${testimonial.avatarColor} flex items-center justify-center text-xl flex-shrink-0`}
        >
          {testimonial.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-stone-900 text-sm md:text-base truncate">
            {testimonial.name}
          </div>
          <div className="text-stone-600 text-xs md:text-sm truncate">
            {testimonial.title}
          </div>
        </div>
      </div>
    </div>
  );
}


