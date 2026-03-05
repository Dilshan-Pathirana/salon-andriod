import fs from 'fs'
import path from 'path'

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file)
    try {
      filelist = walkSync(dirFile, filelist)
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBUSY') filelist = [...filelist, dirFile]
      else throw err
    }
  })
  return filelist
}

const files = walkSync('e:/new-web/salon-andriod/web/src')
  .filter(f => f.endsWith('.tsx') || f.endsWith('.ts'))

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8')
  
  const replacements = [
    [/text-luxury-white/g, 'text-slate-900'],
    [/text-luxury-muted/g, 'text-slate-500'],
    [/text-luxury-champagne/g, 'text-blue-600'],
    [/text-luxury-gold/g, 'text-blue-600'],
    [/bg-luxury-black/g, 'bg-white'],
    [/bg-luxury-green\/[0-9]+/g, 'bg-white shadow-sm'],
    [/bg-luxury-green/g, 'bg-white shadow-sm'],
    [/bg-luxury-gold/g, 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors'],
    [/border-luxury-brown\/[0-9]+/g, 'border-slate-200'],
    [/border-luxury-brown/g, 'border-slate-200'],
    [/font-playfair/g, 'font-sans font-semibold tracking-tight'],
    [/text-luxury-black/g, 'text-white'],
    [/border-white\/10/g, 'border-slate-200/60'],
    [/bg-black\/30/g, 'bg-white/80'],
    [/text-emerald-200/g, 'text-slate-600'],
    [/text-emerald-400/g, 'text-blue-600'],
    [/border-emerald-500\/30/g, 'border-blue-200'],
    [/bg-emerald-500\/10/g, 'bg-blue-50'],
    [/bg-emerald-500\/20/g, 'bg-blue-100'],
    [/text-teal-200/g, 'text-slate-600'],
    // other specific glass-card logic
    [/glass-card/g, 'bg-white border border-slate-200 shadow-sm rounded-xl'],
    [/bg-white\/\[0\.03\]/g, 'bg-slate-50'],
    [/bg-white\/\[0\.08\]/g, 'bg-slate-100'],
    [/border-white\/5/g, 'border-slate-100']
  ]

  let newContent = content
  replacements.forEach(([regex, replacement]) => {
    newContent = newContent.replace(regex, replacement)
  })

  // Additionally fix SVG stroke/fills if any
  newContent = newContent.replace(/stroke="rgba\(194,173,144,1\)"/g, 'stroke="#2563eb"')
  newContent = newContent.replace(/fill="rgba\(194,173,144,1\)"/g, 'fill="#2563eb"')

  if (content !== newContent) {
    fs.writeFileSync(file, newContent)
  }
})
console.log('UI theme replacements completed.')
