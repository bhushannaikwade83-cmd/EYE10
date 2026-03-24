import { Download } from 'lucide-react'
import './Brands.css'

function Brands() {
  const brands = [
    { id: 1, name: 'Ray-Ban', logo: 'RB' },
    { id: 2, name: 'Oakley', logo: 'OK' },
    { id: 3, name: 'Gucci', logo: 'GC' },
    { id: 4, name: 'Prada', logo: 'PR' },
    { id: 5, name: 'Versace', logo: 'VS' },
    { id: 6, name: 'Tom Ford', logo: 'TF' },
    { id: 7, name: 'Dior', logo: 'DR' },
    { id: 8, name: 'Chanel', logo: 'CH' },
    { id: 9, name: 'Armani', logo: 'AR' },
    { id: 10, name: 'Burberry', logo: 'BR' },
    { id: 11, name: 'Polo', logo: 'PL' },
    { id: 12, name: 'Hugo Boss', logo: 'HB' },
  ]

  return (
    <section id="brands" className="brands-section">
      <div className="container">
        <div className="section-header">
          <h2>Brands We Offer</h2>
          <p className="section-subtitle">Premium eyewear from world's leading brands</p>
        </div>

        <div className="brands-grid">
          {brands.map((brand) => (
            <div key={brand.id} className="brand-card">
              <div className="brand-logo">{brand.logo}</div>
              <div className="brand-name">{brand.name}</div>
              <button 
                className="brand-download"
                onClick={() => {
                  // In production, link to actual PDF files
                  // For now, show a toast notification
                  alert(`Downloading ${brand.name} catalogue...\n\nIn production, this would download the PDF file.`)
                }}
              >
                <Download size={16} />
                Catalogue
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Brands
