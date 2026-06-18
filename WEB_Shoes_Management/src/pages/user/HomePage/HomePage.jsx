import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { productService } from '~/services/user/productService'
import { HeroSection } from '~/pages/user/HomePage/HeroSection'
import { ProductSection } from '~/components/user/ProductSection'

export const HomePage = () => {
  const [data, setData] = useState({ flashSale: [], topSelling: [], latest: [] })

  useEffect(() => {
    productService.getHomepageProducts().then(res => {
      setData(res)
    })
  }, [])

  const sectionVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <main className="app-container px-4">
        <HeroSection />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ProductSection
            title="Săn Sale Chớp Nhoáng"
            products={data.flashSale}
            icon="zap"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ProductSection
            title="Sản Phẩm Bán Chạy"
            products={data.topSelling}
            icon="trending"
          />
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
        >
          <ProductSection
            title="Sản Phẩm Mới"
            products={data.latest}
            icon="clock"
          />
        </motion.div>
      </main>

    </div>
  )
}