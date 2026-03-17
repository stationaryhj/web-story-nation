const CDN_IMAGE_URL = 'https://d2gimcyf1gz7jq.cloudfront.net/'
const CDN_LEGACY_URL = 'https://d287ta38o0t5x8.cloudfront.net/'
const DEFAULT_IMAGE_URL = '/images/placeholders/default-character.jpg'

export function getImageUri(url: string | undefined | null): string {
  if (!url) return DEFAULT_IMAGE_URL

  try {
    if (url.indexOf('kr/') > -1) {
      return url.replace('kr/', CDN_LEGACY_URL)
    } else if (url.indexOf('image/') > -1) {
      return CDN_IMAGE_URL + url
    } else if (url.indexOf('promotion/') > -1) {
      return CDN_LEGACY_URL + url
    }
    return url
  } catch (error) {
    return DEFAULT_IMAGE_URL
  }
}
