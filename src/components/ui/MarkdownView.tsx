interface Props {
  text: string
}

const renderInline = (s: string) =>
  s
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

export const MarkdownView = ({ text }: Props) => {
  const lines = text.split('\n')
  const elements: React.ReactNode[] = []
  let listItems: { ordered: boolean; content: string }[] = []
  let ordered = false
  let key = 0

  const flushList = () => {
    if (listItems.length === 0) return
    const Tag = listItems[0].ordered ? 'ol' : 'ul'
    elements.push(
      <Tag key={key++}>
        {listItems.map((item, i) => (
          <li key={i} dangerouslySetInnerHTML={{ __html: renderInline(item.content) }} />
        ))}
      </Tag>
    )
    listItems = []
  }

  for (const raw of lines) {
    const line = raw.trimEnd()

    if (/^### (.+)/.test(line)) {
      flushList()
      elements.push(<h3 key={key++} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(4)) }} />)
    } else if (/^## (.+)/.test(line)) {
      flushList()
      elements.push(<h2 key={key++} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(3)) }} />)
    } else if (/^# (.+)/.test(line)) {
      flushList()
      elements.push(<h1 key={key++} dangerouslySetInnerHTML={{ __html: renderInline(line.slice(2)) }} />)
    } else if (/^---+$/.test(line)) {
      flushList()
      elements.push(<hr key={key++} />)
    } else if (/^\d+\. (.+)/.test(line)) {
      const match = line.match(/^\d+\. (.+)/)!
      if (listItems.length > 0 && !ordered) flushList()
      ordered = true
      listItems.push({ ordered: true, content: match[1] })
    } else if (/^- (.+)/.test(line)) {
      if (listItems.length > 0 && ordered) flushList()
      ordered = false
      listItems.push({ ordered: false, content: line.slice(2) })
    } else if (line.trim() === '') {
      flushList()
    } else {
      flushList()
      elements.push(<p key={key++} dangerouslySetInnerHTML={{ __html: renderInline(line) }} />)
    }
  }
  flushList()

  return <div className="markdown-view">{elements}</div>
}
