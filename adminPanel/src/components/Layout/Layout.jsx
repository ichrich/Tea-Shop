import React from 'react'
import { Outlet } from 'react-router-dom'
import './Layout.css'
import Header from '../Header/Header'

const Layout = () => {
  return (
    <div className='Layout'>
      <Header />
      <div className='Layout_bgText' aria-hidden='true'>
        <div className='Layout_bgTextInner'>TEA CONTROL</div>
      </div>
      <div className='Layout_container'>
        <main className='Layout_main'>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
