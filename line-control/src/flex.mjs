const ICONS = { green: '🟢', yellow: '🟡', red: '🔴', blue: '🔵' };
const LABELS = { green: '正常', yellow: '停滞', red: '停止/失敗', blue: 'あなた待ち' };

function postback(label, repository, command) {
  const data = new URLSearchParams({ repository, command }).toString();
  return {
    type: 'button',
    style: command === 'continue' ? 'primary' : 'secondary',
    height: 'sm',
    action: { type: 'postback', label, data, displayText: `${repository} ${label}` }
  };
}

function projectBubble(project) {
  const age = project.ageMinutes == null ? '不明' : `${project.ageMinutes}分前`;
  return {
    type: 'bubble',
    size: 'micro',
    body: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        { type: 'text', text: `${ICONS[project.signal] || '⚪'} ${project.name}`, weight: 'bold', size: 'md', wrap: true },
        { type: 'text', text: `${LABELS[project.signal] || project.signal} / ${project.reason || ''}`, size: 'xs', color: '#888888', wrap: true },
        { type: 'text', text: `最終活動 ${age}  PR ${project.openPrs ?? '-'}  Issue ${project.openIssues ?? '-'}`, size: 'xs', color: '#888888', wrap: true }
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'sm',
      contents: [
        postback('▶ 進めて', project.fullName, 'continue'),
        postback('↻ 再開', project.fullName, 'resume'),
        postback('🔧 再実行', project.fullName, 'retry_failed')
      ]
    }
  };
}

export function buildDashboardMessages(data) {
  const counts = data.counts || {};
  const overall = (counts.red || 0) ? '🔴' : (counts.blue || 0) ? '🔵' : (counts.yellow || 0) ? '🟡' : '🟢';
  const messages = [{
    type: 'text',
    text: `${overall} AI PROJECT CONTROL\n🟢 ${counts.green || 0}  🟡 ${counts.yellow || 0}  🔴 ${counts.red || 0}  🔵 ${counts.blue || 0}\n全 ${data.repositories.length} repositories`
  }];

  const chunkSize = 10;
  for (let i = 0; i < data.repositories.length; i += chunkSize) {
    messages.push({
      type: 'flex',
      altText: `AI PROJECT CONTROL ${i + 1}-${Math.min(i + chunkSize, data.repositories.length)}`,
      contents: { type: 'carousel', contents: data.repositories.slice(i, i + chunkSize).map(projectBubble) }
    });
  }
  return messages.slice(0, 5);
}

export function isDashboardRequest(event) {
  if (event.type === 'message' && event.message?.type === 'text') {
    return /^(管制盤|状態|一覧|status|dashboard)$/i.test(event.message.text.trim());
  }
  if (event.type === 'postback') {
    const params = new URLSearchParams(event.postback?.data || '');
    return params.get('command') === 'dashboard';
  }
  return false;
}
