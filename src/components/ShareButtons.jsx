import { Share2, Facebook, Twitter, Linkedin, Mail, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'
import './ShareButtons.css'

function ShareButtons({ product, url }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = url || window.location.href
  const shareText = product 
    ? `Check out ${product.name} at EYE10 - ${product.description?.substring(0, 100)}...`
    : 'Check out EYE10 - Premium Eyewear Collection'

  const shareToFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareToLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      '_blank',
      'width=600,height=400'
    )
  }

  const shareViaEmail = () => {
    window.location.href = `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const shareViaNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name || 'EYE10 - Premium Eyewear',
          text: shareText,
          url: shareUrl,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <div className="share-buttons">
      <button onClick={shareViaNative} className="share-btn share-native" title="Share">
        <Share2 size={18} />
        <span>Share</span>
      </button>
      <button onClick={shareToFacebook} className="share-btn share-facebook" title="Share on Facebook">
        <Facebook size={18} />
      </button>
      <button onClick={shareToTwitter} className="share-btn share-twitter" title="Share on Twitter">
        <Twitter size={18} />
      </button>
      <button onClick={shareToLinkedIn} className="share-btn share-linkedin" title="Share on LinkedIn">
        <Linkedin size={18} />
      </button>
      <button onClick={shareViaEmail} className="share-btn share-email" title="Share via Email">
        <Mail size={18} />
      </button>
      <button 
        onClick={copyToClipboard} 
        className={`share-btn share-copy ${copied ? 'copied' : ''}`} 
        title="Copy link"
      >
        {copied ? <Check size={18} /> : <Copy size={18} />}
      </button>
    </div>
  )
}

export default ShareButtons
