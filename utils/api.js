// const BASE_URL = 'http://8.141.106.120:8000/'
const BASE_URL = 'http://192.168.10.118:8000/'
// const BASE_URL = 'http://192.168.0.109:8000/'

// 日期格式：YYYY-MM-DD
function formatDate(date) {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
}

// 日期时间格式：YYYY-MM-DD HH:mm:ss
function formatDateTime(date) {
    const h = String(date.getHours()).padStart(2, '0')
    const min = String(date.getMinutes()).padStart(2, '0')
    const s = String(date.getSeconds()).padStart(2, '0')
    const result = `${formatDate(date)} ${h}:${min}:${s}`
    return result
}

function formatLocation(loc) {
    if (!loc) return ''
    const arr = loc.split('@@@@@@')
    return `${arr[0]}${arr[1]}${arr[2]}`
}

// 导出
module.exports = {
    BASE_URL,
    formatDate,
    formatDateTime,
    formatLocation
}