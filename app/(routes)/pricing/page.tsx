import React from 'react'
import { PricingTable } from '@clerk/nextjs'
const Pricing = () => {
  return (
     <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 1rem' }}>
        <h2 className='font-bold text-2xl my-6 text-center'>Pricing</h2>
      <PricingTable />
    </div>
  )
}

export default Pricing