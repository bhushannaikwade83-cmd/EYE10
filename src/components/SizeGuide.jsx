import { useState } from 'react'
import { X, Ruler } from 'lucide-react'
import './SizeGuide.css'

function SizeGuide() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="size-guide-trigger"
        onClick={() => setIsOpen(true)}
      >
        <Ruler size={18} />
        Size Guide
      </button>

      {isOpen && (
        <div className="size-guide-overlay" onClick={() => setIsOpen(false)}>
          <div className="size-guide-modal" onClick={(e) => e.stopPropagation()}>
            <div className="size-guide-header">
              <h2>
                <Ruler size={24} />
                Frame Size Guide
              </h2>
              <button
                className="size-guide-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="size-guide-content">
              <div className="size-guide-intro">
                <p>Finding the perfect frame size is essential for comfort and style. Use this guide to determine your ideal frame measurements.</p>
              </div>

              <div className="size-guide-measurements">
                <h3>Understanding Frame Measurements</h3>
                <div className="measurement-diagram">
                  <div className="frame-diagram">
                    <div className="frame-outline">
                      <div className="lens-area">
                        <span className="measurement-label">Lens Width</span>
                        <span className="measurement-value">50-60mm</span>
                      </div>
                      <div className="bridge-area">
                        <span className="measurement-label">Bridge</span>
                        <span className="measurement-value">14-20mm</span>
                      </div>
                      <div className="temple-area">
                        <span className="measurement-label">Temple</span>
                        <span className="measurement-value">135-150mm</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="size-guide-table">
                <h3>Frame Size Chart</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>Lens Width</th>
                      <th>Bridge Width</th>
                      <th>Temple Length</th>
                      <th>Fit</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Small</strong></td>
                      <td>48-52mm</td>
                      <td>14-16mm</td>
                      <td>135-140mm</td>
                      <td>Narrow faces</td>
                    </tr>
                    <tr>
                      <td><strong>Medium</strong></td>
                      <td>52-56mm</td>
                      <td>16-18mm</td>
                      <td>140-145mm</td>
                      <td>Average faces</td>
                    </tr>
                    <tr>
                      <td><strong>Large</strong></td>
                      <td>56-60mm</td>
                      <td>18-20mm</td>
                      <td>145-150mm</td>
                      <td>Wide faces</td>
                    </tr>
                    <tr>
                      <td><strong>Extra Large</strong></td>
                      <td>60mm+</td>
                      <td>20mm+</td>
                      <td>150mm+</td>
                      <td>Very wide faces</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="size-guide-tips">
                <h3>Tips for Choosing the Right Size</h3>
                <ul>
                  <li>Frames should sit comfortably on your nose without sliding</li>
                  <li>The frame width should match your face width</li>
                  <li>Temples should extend straight back without pressure</li>
                  <li>Visit our showroom for professional fitting assistance</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SizeGuide
