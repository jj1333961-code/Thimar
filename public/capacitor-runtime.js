(function () {
  var isNative = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform())
  document.documentElement.classList.toggle('is-native-app', isNative)

  function announceNetwork() {
    document.documentElement.classList.toggle('is-offline', !navigator.onLine)
    window.dispatchEvent(new CustomEvent('thimar:network', { detail: { online: navigator.onLine } }))
  }

  window.addEventListener('online', announceNetwork)
  window.addEventListener('offline', announceNetwork)
  announceNetwork()

  if ('serviceWorker' in navigator && !isNative) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(function () {})
    })
  }

  if (isNative) {
    document.addEventListener('click', function (event) {
      var link = event.target.closest && event.target.closest('a[href]')
      if (!link) return
      var href = link.getAttribute('href') || ''
      if (/^https?:\/\//i.test(href) && new URL(href).origin !== location.origin) {
        event.preventDefault()
        if (window.Capacitor.Plugins && window.Capacitor.Plugins.Browser) {
          window.Capacitor.Plugins.Browser.open({ url: href })
        } else {
          window.open(href, '_blank', 'noopener,noreferrer')
        }
      }
    })
  }
})()
