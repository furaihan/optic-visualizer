import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'fs'
import { join, sep } from 'path'

const skillsDir = 'node_modules'

function findSkillFiles(dir) {
  const entries = []
  try {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      if (stat.isDirectory()) {
        entries.push(...findSkillFiles(fullPath))
      } else if (entry === 'SKILL.md' && fullPath.includes(`${sep}skills${sep}`)) {
        entries.push(fullPath)
      }
    }
  } catch { /* ignore permission errors */ }
  return entries
}

const allSkills = findSkillFiles(skillsDir)

for (const src of allSkills) {
  // Extract the path segment after "skills/" and before "/SKILL.md"
  const normalized = src.replace(/\\/g, '/')
  const match = normalized.match(/skills\/(.+?)\/SKILL\.md$/)
  if (!match) continue

  const rawName = match[1]
  // Flatten name: replace path separators with hyphens
  const flatName = rawName.replace(/\//g, '-')
  // Skip names that don't match opencode's regex
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(flatName)) continue

  const content = readFileSync(src, 'utf-8')

  // Update the name field in frontmatter to match the flattened directory name
  const updated = content.replace(
    /^---\nname: .+\n/,
    `---\nname: ${flatName}\n`
  )

  const destDir = `.agents/skills/${flatName}`
  if (!existsSync(destDir)) mkdirSync(destDir, { recursive: true })
  writeFileSync(`${destDir}/SKILL.md`, updated, 'utf-8')
  console.log(`  ✓ ${rawName} -> ${flatName}`)
}

console.log(`\nSynced ${allSkills.length} skills to .agents/skills/`)
