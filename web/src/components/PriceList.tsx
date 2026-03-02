import React from 'react'
import { motion } from 'framer-motion'
const categories = [
  {
    name: 'Hair',
    items: [
      {
        name: 'Precision Haircut',
        price: 45,
        desc: 'Tailored cut, wash, and style',
      },
      {
        name: 'Executive Cut',
        price: 60,
        desc: 'Includes scalp massage and hot towel',
      },
      {
        name: 'Buzz Cut',
        price: 25,
        desc: 'One length all over, line up',
      },
    ],
  },
  {
    name: 'Beard',
    items: [
      {
        name: 'Hot Towel Shave',
        price: 35,
        desc: 'Traditional straight razor shave',
      },
      {
        name: 'Beard Sculpting',
        price: 30,
        desc: 'Trim, shape, and condition',
      },
      {
        name: 'Line Up',
        price: 15,
        desc: 'Crisp edges with straight razor',
      },
    ],
  },
  {
    name: 'Premium',
    items: [
      {
        name: 'The Full Experience',
        price: 95,
        desc: 'Executive cut, hot towel shave, facial',
      },
      {
        name: "Groom's Package",
        price: 120,
        desc: 'Complete detailing for the special day',
      },
    ],
  },
]
export function PriceList() {
  return (
    <div className="px-6 py-8">
      <motion.h2
        initial={{
          opacity: 0,
        }}
        whileInView={{
          opacity: 1,
        }}
        viewport={{
          once: true,
        }}
        className="font-playfair text-2xl text-slate-800 mb-10 text-center"
      >
        Services & Pricing
      </motion.h2>

      <div className="space-y-12">
        {categories.map((category, catIdx) => (
          <div key={category.name}>
            <motion.h3
              initial={{
                opacity: 0,
                x: -10,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.1,
              }}
              className="font-inter text-xs tracking-widest text-emerald-600 uppercase mb-6"
            >
              {category.name}
            </motion.h3>

            <div className="space-y-6">
              {category.items.map((item, idx) => (
                <motion.div
                  key={item.name}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: 0.1 + idx * 0.1,
                  }}
                  className="flex flex-col border-b border-teal-100/30 pb-4"
                >
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-inter text-slate-800 text-base">
                      {item.name}
                    </span>
                    <span className="font-playfair text-emerald-500 text-lg">
                      ${item.price}
                    </span>
                  </div>
                  <span className="font-inter text-slate-400 text-sm font-light">
                    {item.desc}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

