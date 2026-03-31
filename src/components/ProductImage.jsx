import { useResolvedMediaUrl } from '../hooks/useResolvedMediaUrl'

const DEFAULT_PH = 'https://via.placeholder.com/300x200?text=EYE10'

/**
 * Product listing / cart image helper.
 */
export function ProductImage({
  src,
  alt = '',
  className = '',
  placeholder = DEFAULT_PH,
  ...rest
}) {
  const { url, loading } = useResolvedMediaUrl(src || '')
  const display = loading && !url ? placeholder : url || placeholder
  return <img src={display} alt={alt} className={className} {...rest} />
}
