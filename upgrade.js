(() => {
  const key = 'oppo-canton-140-v2';
  const dialog = document.querySelector('#dialog');
  const form = document.querySelector('#form');
  const title = document.querySelector('.sheet h2');
  let editingId = null;

  const noteField = document.createElement('div');
  noteField.className = 'field';
  noteField.innerHTML = '<label>自由备注</label><textarea name="note" placeholder="客户性格、价格反馈、同行品牌、下次聊天话题……"></textarea>';
  form.querySelector('.remark-box').before(noteField);

  document.querySelector('.cancel').addEventListener('click', (event) => {
    event.preventDefault();
    dialog.close();
  }, true);

  function persist() {
    localStorage.setItem(key, JSON.stringify(window.leads));
  }

  function populate(lead) {
    [...form.elements].forEach((element) => {
      if (!element.name) return;
      if (element.type === 'checkbox') element.checked = (lead.industry || []).includes(element.value);
      else if (element.type === 'radio') element.checked = String(lead.intent) === element.value;
      else if (element.type !== 'file') element.value = lead[element.name] || '';
    });
  }

  function installEditButtons() {
    document.querySelectorAll('.lead').forEach((card) => {
      const remark = card.querySelector('.remark')?.textContent;
      const lead = window.leads.find((item) => item.remark === remark);
      if (!lead) return;
      if (!card.querySelector('.registered-date')) {
        const registered = document.createElement('div');
        registered.className = 'registered-date';
        registered.style.cssText = 'margin-top:6px;font-size:11px;color:#64746c';
        registered.textContent = `登记日期：${lead.date || '早期记录'}`;
        card.querySelector('.meta')?.after(registered);
      }
      if (card.querySelector('.edit-lead')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'edit-lead';
      button.textContent = '修改资料';
      button.addEventListener('click', () => {
        editingId = lead.remark;
        title.textContent = '修改客户资料';
        populate(lead);
        dialog.showModal();
      });
      card.append(button);
    });
  }

  form.addEventListener('submit', (event) => {
    if (!editingId) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const data = new FormData(form);
    const updated = Object.fromEntries(data);
    updated.industry = data.getAll('industry');
    updated.country = (updated.country || '').trim();
    updated.remark = `140.${(updated.country || '地区').toUpperCase()}-${(updated.name || '姓名').trim()}`;
    const index = window.leads.findIndex((item) => item.remark === editingId);
    if (index >= 0) window.leads[index] = { ...window.leads[index], ...updated };
    persist();
    dialog.close();
    location.reload();
  }, true);

  document.querySelector('#openForm').addEventListener('click', () => {
    editingId = null;
    title.textContent = '记录 140 新客户';
  }, true);

  new MutationObserver(installEditButtons).observe(document.querySelector('#leads'), { childList: true });
  installEditButtons();
})();
