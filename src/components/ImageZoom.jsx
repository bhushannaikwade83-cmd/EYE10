import { useState, useRef, useEffect } from 'react'
import { ZoomIn, ZoomOut, X } from 'lucide-react'
import './ImageZoom.css'

function ImageZoom({ src, alt }) {
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const imageRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    if (isZoomed) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isZoomed])

  const handleImageClick = () => {
    setIsZoomed(true)
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleClose = () => {
    setIsZoomed(false)
    setZoomLevel(1)
    setPosition({ x: 0, y: 0 })
  }

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.5, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.5, 0.5))
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isZoomed) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isZoomed, isDragging, dragStart, zoomLevel])

  return (
    <>
      <div className="image-zoom-container" onClick={handleImageClick}>
        <img
          src={src}
          alt={alt}
          className="zoomable-image"
          loading="lazy"
        />
        <div className="zoom-hint">
          <ZoomIn size={20} />
          <span>Click to zoom</span>
        </div>
      </div>

      {isZoomed && (
        <div className="zoom-overlay" onClick={handleClose}>
          <div
            className="zoom-content"
            onClick={(e) => e.stopPropagation()}
            ref={containerRef}
          >
            <div className="zoom-controls">
              <button onClick={handleZoomIn} className="zoom-btn" title="Zoom In">
                <ZoomIn size={20} />
              </button>
              <button onClick={handleZoomOut} className="zoom-btn" title="Zoom Out">
                <ZoomOut size={20} />
              </button>
              <button onClick={handleClose} className="zoom-btn close-btn" title="Close">
                <X size={20} />
              </button>
            </div>
            <div
              className="zoom-image-wrapper"
              onMouseDown={handleMouseDown}
              style={{ cursor: zoomLevel > 1 ? 'grab' : 'default' }}
            >
              <img
                ref={imageRef}
                src={src}
                alt={alt}
                className="zoomed-image"
                style={{
                  transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                  cursor: isDragging ? 'grabbing' : zoomLevel > 1 ? 'grab' : 'default',
                }}
              />
            </div>
            <div className="zoom-info">
              Zoom: {Math.round(zoomLevel * 100)}% | Click and drag to move
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ImageZoom
