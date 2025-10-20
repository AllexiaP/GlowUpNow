import React from 'react'

export default function SiteFooter(){
  return (
    <footer className="site-footer p-4 mt-4">
      <div className="container">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="fw-bold">GlowUpNow</div>
            <div className="small">Home salon & spa services, on demand.</div>
          </div>
          <div className="small">© {new Date().getFullYear()} GlowUpNow. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
