import React from 'react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { Coffee, Utensils, Star, MapPin, Instagram, Facebook, Twitter, ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const navigate = useNavigate();

  const featuredItems = [
    {
      id: 1,
      name: "Signature Sunset Latte",
      description: "A creamy blend of espresso and vanilla with a hint of cinnamon.",
      price: "₱120",
      image: "https://picsum.photos/seed/latte/400/300"
    },
    {
      id: 2,
      name: "Bulan Boulevard Pasta",
      description: "Fresh seafood pasta inspired by the coastal breeze of Sorsogon.",
      price: "₱245",
      image: "https://picsum.photos/seed/pasta/400/300"
    },
    {
      id: 3,
      name: "Golden Hour Muffin",
      description: "Warm, buttery muffin with a molten chocolate center.",
      price: "₱85",
      image: "https://picsum.photos/seed/muffin/400/300"
    }
  ];

  const testimonials = [
    {
      name: "Maria Santos",
      role: "Local Foodie",
      text: "The best place to watch the sunset in Bulan while enjoying a world-class cup of coffee.",
      stars: 5
    },
    {
      name: "Juan Dela Cruz",
      role: "Digital Nomad",
      text: "Great ambiance, fast wifi, and even better food. My go-to workspace in Sorsogon.",
      stars: 5
    }
  ];

  return (
    <div className="flex flex-col gap-20 -mt-8">
      {/* Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden rounded-3xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://picsum.photos/seed/sunset/1920/1080" 
            alt="Sunset at Bulan Boulevard" 
            className="h-full w-full object-cover brightness-50"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-transparent to-transparent opacity-80" />
        </div>

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="mb-4 inline-block rounded-full bg-rose-500/20 px-4 py-1 text-sm font-semibold tracking-wider text-rose-300 backdrop-blur-md">
              ESTABLISHED 2024
            </span>
            <h1 className="mb-6 text-5xl font-black tracking-tight md:text-7xl lg:text-8xl">
              Where <span className="text-orange-400">Sunset</span> Meets <span className="text-rose-400">Flavor</span>
            </h1>
            <p className="mb-10 text-lg text-stone-200 md:text-xl">
              Experience the perfect blend of artisanal coffee and coastal cuisine at Bulan's premier seaside cafe.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  onClick={() => navigate('/menu')}
                  className="h-14 bg-rose-600 px-8 text-lg font-bold hover:bg-rose-700"
                >
                  Order Now <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 border-white/30 bg-white/10 px-8 text-lg font-bold text-white backdrop-blur-md hover:bg-white/20"
                >
                  Explore Menu
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-600">
              <Coffee className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Artisanal Coffee</h3>
            <p className="text-stone-500">Expertly roasted beans brewed to perfection by our master baristas.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Utensils className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Coastal Cuisine</h3>
            <p className="text-stone-500">Fresh, locally-sourced ingredients inspired by the Sorsogon coastline.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-600">
              <MapPin className="h-8 w-8" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Prime Location</h3>
            <p className="text-stone-500">Located right at Zone 2 Boulevard, offering the best views in town.</p>
          </div>
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-stone-900 -mx-4 px-4 py-24 text-white">
        <div className="container mx-auto">
          <div className="mb-16 flex flex-col items-end justify-between gap-4 md:flex-row">
            <div className="max-w-xl">
              <h2 className="mb-4 text-4xl font-bold md:text-5xl">Our Best Sellers</h2>
              <p className="text-stone-400">Hand-picked favorites that our customers keep coming back for.</p>
            </div>
            <Button variant="link" className="text-orange-400 hover:text-orange-300" onClick={() => navigate('/menu')}>
              View Full Menu <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {featuredItems.map((item) => (
              <motion.div 
                key={item.id}
                whileHover={{ y: -10 }}
                className="group relative overflow-hidden rounded-3xl bg-stone-800"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-6">
                  <div className="mb-2 flex items-center justify-between">
                    <h4 className="text-xl font-bold">{item.name}</h4>
                    <span className="text-orange-400 font-bold">{item.price}</span>
                  </div>
                  <p className="text-sm text-stone-400">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-12">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Locals</h2>
          <p className="text-stone-500">Don't just take our word for it.</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {testimonials.map((t, i) => (
            <div key={i} className="rounded-3xl bg-stone-50 p-8 border border-stone-100">
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-lg italic text-stone-700 mb-6">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-stone-200" />
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-stone-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 mb-20">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-rose-600 to-orange-500 p-12 text-center text-white md:p-24">
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="mb-6 text-4xl font-black md:text-6xl">Ready for a Taste?</h2>
            <p className="mb-10 text-lg text-rose-100">
              Join us at the boulevard or order online for a quick and easy pickup.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button 
                size="lg" 
                onClick={() => navigate('/menu')}
                className="h-14 bg-white text-rose-600 font-bold hover:bg-stone-100"
              >
                Order Online Now
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="h-14 border-white text-white font-bold hover:bg-white/10"
              >
                Find Our Location
              </Button>
            </div>
          </div>
          {/* Decorative circles */}
          <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        </div>
      </section>
    </div>
  );
}
