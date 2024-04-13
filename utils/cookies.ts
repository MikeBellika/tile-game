export function setCookie(
  name: string | number,
  value: string | number,
  days: number,
) {
  var expires = ""
  if (days) {
    var date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/"
}
export function getCookie(name: string) {
  var nameEQ = name + "="
  var ca = document.cookie.split(";")
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) == " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length)
  }
}
export function removeCookie(name: string): void {
  document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
}
